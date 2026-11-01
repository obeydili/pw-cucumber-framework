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

  // NEW: The API Login Method!
  async apiLogin(username: string, password: string): Promise<string> {
    // Spin up a quick, temporary API context just for logging in
    const apiContext = await request.newContext({ baseURL: config.baseUrl });

    try {
      const response = await apiContext.post('/api/auth/login', {
        data: { username, password },
      });

      if (!response.ok()) {
        throw new Error(`API Login failed: ${response.status()}`);
      }

      const body = await response.json();
      return body.token; // Extract and return the Bearer token!
    } finally {
      //Always dispose of the temporary context to prevent memory leaks!
      await apiContext.dispose();
    }
  }
}
