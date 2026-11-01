import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, APIRequestContext } from '@playwright/test';
import { OrdersApi } from '../api/OrdersApi';

// 1. Define our Custom World class extending Cucumber's default World
export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  api!: APIRequestContext;
  ordersApi!: OrdersApi;

  // A dictionary to hold multiple roles at once!
  apiContexts!: Record<string, APIRequestContext>;

  // Add a dictionary to hold any dynamic data between steps
  scenarioData: Record<string, unknown>;

  constructor(options: IWorldOptions) {
    super(options);
    // Initialize it as an empty object for every new scenario
    this.scenarioData = {};
    this.apiContexts = {}; 
  }
}

// 2. Tell Cucumber to use our CustomWorld instead of the default one
setWorldConstructor(CustomWorld);
