import { Page, request } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { config } from '../support/env';

export class AuthActions {
  constructor(private readonly page?: Page) {}

  async loginAs(username: string, password: string) {
    if (!this.page) throw new Error('Page is required for UI login');
    const loginPage = new LoginPage(this.page);
    await loginPage.login(username, password);
  }

  async apiLogin(username: string, password: string): Promise<string> {
    const apiContext = await request.newContext({ baseURL: config.baseUrl });

    try {
      const response = await apiContext.post('/api/auth/login', {
        data: { username, password },
      });

      if (!response.ok()) {
        throw new Error(`API Login failed: ${response.status()}`);
      }

      const body = await response.json();
      return body.token;
    } finally {
      await apiContext.dispose();
    }
  }
}
