import { BeforeAll, AfterAll, Before, After, Status } from '@cucumber/cucumber';
import { chromium, Browser } from '@playwright/test';
import { CustomWorld } from './world';
import { config } from './env';
import * as fs from 'fs';

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
});

AfterAll(async function () {
  if (browser) {
    await browser.close();
  }
});
