import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/world';
import { OrdersPage } from '../../pages/OrdersPage';
import { config } from '../../support/env';

Given('I navigate to the orders page', async function (this: CustomWorld) {
  const ordersPage = new OrdersPage(this.page);
  await ordersPage.navigate(); // Pure POM boundary!
});
