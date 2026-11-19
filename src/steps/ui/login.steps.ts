import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/world';
import { LoginPage } from '../../pages/LoginPage';
import { AuthActions } from '../../actions/AuthActions';
import { config } from '../../support/env';
import { usersData } from '../../data/users';

Given('I navigate to the login page', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.navigate();
});

When('I login with valid credentials', async function (this: CustomWorld) {
  const auth = new AuthActions(this.page);
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

  const hackerUser = usersData.invalidUser.username;
  const hackerPass = usersData.invalidUser.password;
  await auth.loginAs(hackerUser, hackerPass);
});

Then('I should see an error message', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await expect(loginPage.errorMessage).toBeVisible();
});

Then('I should be redirected to the orders page', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/.*orders.*/);
});

Then('I should be on the orders page', async function (this: CustomWorld) {
  // A missing or expired session would redirect to /login instead.
  await expect(this.page).toHaveURL(/.*orders.*/);
});
