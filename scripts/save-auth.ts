import { chromium } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { config } from '../src/support/env'; // We use this for the baseURL!

// 1. The reusable function
async function saveSession(username: string, password: string, fileName: string) {
  console.log(`Saving session for ${fileName}...`);

  // We can run this headless because we don't need to watch it
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ baseURL: config.baseUrl });
  const page = await context.newPage();

  // 2. Log in using our Page Object!
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login(username, password);

  // 3. PROOF OF SUCCESS: Wait for the network and UI to navigate to the orders page
  await page.waitForURL('**/orders');

  // 4. Save the cookies and local storage to the auth/ folder
  await context.storageState({ path: `auth/${fileName}.json` });

  await browser.close();
  console.log(`✅ Successfully saved auth/${fileName}.json`);
}

// 5. Run the script for both roles
async function main() {
  // Hardcoding these here is acceptable because this is a one-off utility script, not a test!
  await saveSession('trader1', config.validPassword, 'trader');
  await saveSession('approver1', config.validPassword, 'approver');
}

main().catch(console.error);
