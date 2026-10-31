import { BeforeAll, AfterAll, Before, After, Status } from '@cucumber/cucumber';
import { chromium, Browser } from '@playwright/test';
import { CustomWorld } from './world';
import { config } from './env';

let browser: Browser;

BeforeAll(async function () {
  // Check the environment variable. Default to 'false' (visible) for local debugging,
  // but if CI passes HEADLESS='true', it runs silently in the background!
  const isHeadless = process.env.HEADLESS === 'true';
  browser = await chromium.launch({ headless: isHeadless });
});

Before(async function (this: CustomWorld) {
  this.browser = browser;
  this.context = await this.browser.newContext({ baseURL: config.baseUrl });
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
