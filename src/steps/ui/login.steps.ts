import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/world';
import { LoginPage } from '../../pages/LoginPage';
import { config } from '../../support/env'; // <-- Import our config!

Given('I navigate to the login page', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.navigate();
});

When('I login with valid credentials', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  // Blocker 1 FIXED: No more hardcoded credentials!
  await loginPage.login(config.validUser, config.validPassword);
});

When(
  'I login with username {string} and password {string}',
  async function (this: CustomWorld, user: string, pass: string) {
    const loginPage = new LoginPage(this.page);
    await loginPage.login(user, pass);
  },
);

Then('I should see an error message', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  // Blocker 2 FIXED: No locators leaked! We just ask the POM for the element.
  await expect(loginPage.errorMessage).toBeVisible();
});

Then('I should be redirected to the orders page', async function (this: CustomWorld) {
  // A simple Playwright assertion to verify the UI actually moved!
  await expect(this.page).toHaveURL(/.*orders.*/);
});
