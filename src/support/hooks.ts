import { BeforeAll, AfterAll, Before, After, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, Browser } from '@playwright/test';
import { CustomWorld } from './world';
import { config } from './env';
import { AuthActions } from '../actions/AuthActions';
import { ApiClient } from '../api/ApiClient';
import { OrdersApi } from '../api/OrdersApi';
import * as fs from 'fs';

// Give UI tests up to 10 seconds per step!
setDefaultTimeout(10 * 1000);

let browser: Browser;

BeforeAll(async function () {
  // Check the environment variable. Default to 'false' (visible) for local debugging,
  // but if CI passes HEADLESS='true', it runs silently in the background!
  const isHeadless = process.env.HEADLESS === 'true';
  browser = await chromium.launch({ headless: isHeadless });
});

Before(async function (this: CustomWorld, scenario) {
  this.browser = browser;
  // 1. Check the Cucumber tags for this specific scenario
  const tags = scenario.pickle.tags.map((tag) => tag.name);

  // 2. Determine if we need to inject a saved session
  let storageState: string | undefined = undefined;
  if (tags.includes('@as-trader')) {
    storageState = 'auth/trader.json';
  } else if (tags.includes('@as-approver')) {
    storageState = 'auth/approver.json';
  }

  // ADD THIS SAFETY CHECK:
  if (storageState && !fs.existsSync(storageState)) {
    throw new Error(
      `CRITICAL: Session file not found at ${storageState}. Please run 'npm run auth:save' first!`,
    );
  }
  // 3. Launch the context with the base URL AND the injected cookies (if any)
  this.context = await this.browser.newContext({
    baseURL: config.baseUrl,
    storageState: storageState,
  });

  this.page = await this.context.newPage();
  // --- API SETUP ---
  // If the scenario requires API access, initialize this.api!
  if (tags.includes('@api')) {
    const authActions = new AuthActions();
    let token = '';

    // Fetch the correct token based on the role
    if (tags.includes('@as-trader')) {
      token = await authActions.apiLogin(config.validUser, config.validPassword);
    } else if (tags.includes('@as-approver')) {
      token = await authActions.apiLogin(config.approverUser, config.validPassword);
    }

    if (token) {
      // Build our strict ApiClient using the token!
      this.api = await ApiClient.create(token);
      // Instantiate our wrapper so step definitions can use it instantly!
      this.ordersApi = new OrdersApi(this.api);
    }
  }
});

After(async function (this: CustomWorld, scenario) {
  if (scenario.result?.status === Status.FAILED) {
    // SAFE SCREENSHOT: Only try to take a screenshot if this.page successfully initialized!
    if (this.page) {
      const image = await this.page.screenshot();
      this.attach(image, 'image/png');
    }
  }

  // SAFE TEARDOWN: Use optional chaining (?.) so it doesn't crash if they are undefined
  await this.page?.close();
  await this.context?.close();
  // Clean up the API Context!
  await this.api?.dispose();
});

AfterAll(async function () {
  if (browser) {
    await browser.close();
  }
});
