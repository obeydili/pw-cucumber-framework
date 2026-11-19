import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { LoginPage } from '../src/pages/LoginPage';
import { config } from '../src/support/env';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function saveSession(username: string, password: string, fileName: string) {
  console.log(`Saving session for ${fileName}...`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ baseURL: config.baseUrl });
  const page = await context.newPage();

  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login(username, password);

  // The redirect to /orders proves the login worked before the session is saved.
  await page.waitForURL('**/orders');

  await context.storageState({ path: `auth/${fileName}.json` });

  await browser.close();
  console.log(`✅ Successfully saved auth/${fileName}.json`);
}

async function main() {
  const usersPath = path.resolve(__dirname, '../src/data/templates/users.json');
  const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));

  await saveSession(usersData.trader.username, config.validPassword, 'trader');
  await saveSession(usersData.approver.username, config.validPassword, 'approver');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
