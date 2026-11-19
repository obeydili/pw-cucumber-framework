import { BeforeAll, AfterAll, Before, After, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, Browser } from '@playwright/test';
import { CustomWorld } from './world';
import { config } from './env';
import { AuthActions } from '../actions/AuthActions';
import { ApiClient } from '../api/ApiClient';
import { OrdersApi } from '../api/OrdersApi';
import * as fs from 'fs';

setDefaultTimeout(10 * 1000);

let browser: Browser;

BeforeAll(async function () {
  // Headless unless HEADLESS=false.
  browser = await chromium.launch({ headless: config.isHeadless });
});

Before(async function (this: CustomWorld, scenario) {
  this.browser = browser;
  const tags = scenario.pickle.tags.map((tag) => tag.name);

  const isApiOnly = tags.includes('@api');
  const isHybrid = tags.includes('@hybrid');

  // Browser context for UI and hybrid scenarios.
  if (!isApiOnly || isHybrid) {
    // A role tag reuses the saved session from scripts/save-auth.ts instead of logging in through the UI.
    let storageState: string | undefined = undefined;
    if (tags.includes('@as-trader')) {
      storageState = 'auth/trader.json';
    } else if (tags.includes('@as-approver')) {
      storageState = 'auth/approver.json';
    }

    if (storageState && !fs.existsSync(storageState)) {
      throw new Error(
        `CRITICAL: Session file not found at ${storageState}. Please run 'npm run auth:save' first!`,
      );
    }
    this.context = await this.browser.newContext({
      baseURL: config.baseUrl,
      storageState: storageState,
    });

    this.page = await this.context.newPage();
  }

  // API contexts for API and hybrid scenarios.
  if (isApiOnly || isHybrid) {
    const authActions = new AuthActions();

    // Hybrid: the trader acts in the UI (saved session) and the approver acts over the API.
    if (isHybrid) {
      const approverToken = await authActions.apiLogin(config.approverUser, config.validPassword);
      this.apiContexts['approver'] = await ApiClient.create(approverToken);
    } else {
      let token = '';
      if (tags.includes('@as-trader')) {
        token = await authActions.apiLogin(config.validUser, config.validPassword);
      } else if (tags.includes('@as-approver')) {
        token = await authActions.apiLogin(config.approverUser, config.validPassword);
      } else {
        throw new Error(`CRITICAL: API test missing role tag.`);
      }
      this.api = await ApiClient.create(token);
      this.ordersApi = new OrdersApi(this.api);
    }
  }
});

After(async function (this: CustomWorld, scenario) {
  if (scenario.result?.status === Status.FAILED) {
    // API-only scenarios have no page.
    if (this.page) {
      const image = await this.page.screenshot();
      this.attach(image, 'image/png');
    }
  }

  // Optional chaining: each scenario type creates only some of these.
  await this.page?.close();
  await this.context?.close();
  await this.api?.dispose();

  for (const ctx of Object.values(this.apiContexts)) {
    await ctx.dispose();
  }
});

AfterAll(async function () {
  if (browser) {
    await browser.close();
  }
});
