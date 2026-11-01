import { request, APIRequestContext } from '@playwright/test';
import { config } from '../support/env';

export class ApiClient {
  /**
   * Creates an isolated APIRequestContext injected with the Bearer token.
   */
  static async create(token: string): Promise<APIRequestContext> {
    return await request.newContext({
      baseURL: config.baseUrl,
      extraHTTPHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  }
}
