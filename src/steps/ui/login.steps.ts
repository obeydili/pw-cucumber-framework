import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/world';
import { LoginPage } from '../../pages/LoginPage';
import { AuthActions } from '../../actions/AuthActions';
import { config } from '../../support/env';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

Given('I navigate to the login page', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.navigate();
});

When('I login with valid credentials', async function (this: CustomWorld) {
  const auth = new AuthActions(this.page);
  // Blocker 1 FIXED: No more hardcoded credentials!
  await auth.loginAs(config.validUser, config.validPassword);
});

When(
  'I login with username {string} and password {string}',
  async function (this: CustomWorld, user: string, pass: string) {
    const auth = new AuthActions(this.page);
    await auth.loginAs(user, pass);
  },
);

When('I login with invalid credentials', async function (this: CustomWorld) {
  const auth = new AuthActions(this.page);
  //  Read directly from the Data Layer (users.json)
  const usersPath = path.resolve(__dirname, '../../data/templates/users.json');
  const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));

  //  Use the specific persona!
  const hackerUser = usersData.invalidUser.username;
  const hackerPass = usersData.invalidUser.password;
  await auth.loginAs(hackerUser, hackerPass);
});

Then('I should see an error message', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  // We expect the exact error message element to be visible!
  await expect(loginPage.errorMessage).toBeVisible();
});

Then('I should be redirected to the orders page', async function (this: CustomWorld) {
  // A simple Playwright assertion to verify the UI actually moved!
  await expect(this.page).toHaveURL(/.*orders.*/);
});

Then('I should be on the orders page', async function (this: CustomWorld) {
  // ASSERTION: Verify we didn't get kicked back to the login screen!
  await expect(this.page).toHaveURL(/.*orders.*/);
});
