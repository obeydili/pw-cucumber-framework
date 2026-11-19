import { Page } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /** Opens a path relative to the context's baseURL. */
  protected async open(path: string): Promise<void> {
    await this.page.goto(path);
  }
}
