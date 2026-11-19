import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, APIRequestContext } from '@playwright/test';
import { OrdersApi } from '../api/OrdersApi';

export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  api!: APIRequestContext;
  ordersApi!: OrdersApi;

  // One API context per role, for scenarios that need more than one (e.g. @hybrid).
  apiContexts!: Record<string, APIRequestContext>;

  // Values passed between steps of one scenario.
  scenarioData: Record<string, unknown>;

  constructor(options: IWorldOptions) {
    super(options);
    this.scenarioData = {};
    this.apiContexts = {};
  }
}

setWorldConstructor(CustomWorld);
