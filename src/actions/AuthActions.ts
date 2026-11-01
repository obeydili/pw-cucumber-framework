import { Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

export class AuthActions {
  constructor(private readonly page: Page) {}

  async loginAs(username: string, password: string) {
    const loginPage = new LoginPage(this.page);
    // REMOVED await loginPage.navigate(); to prevent double-loading!
    await loginPage.login(username, password);
  }
}
