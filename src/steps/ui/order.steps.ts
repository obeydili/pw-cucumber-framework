import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/world';
import { DataFactory } from '../../data/dataFactory';
import { OrderActions } from '../../actions/OrderActions';
import { OrdersPage } from '../../pages/OrdersPage';
import { OrderDetailsPage } from '../../pages/OrderDetailsPage';
import { OrderTicketPage } from '../../pages/OrderTicketPage';

Given('I navigate to the orders page', async function (this: CustomWorld) {
  const ordersPage = new OrdersPage(this.page);
  await ordersPage.navigate();
});

When('I place a limit {string} order', async function (this: CustomWorld, side: string) {
  const templateName = `order.limit-${side.toLowerCase()}`;

  const data = DataFactory.getOrderData(templateName);

  const orderActions = new OrderActions(this.page);
  const generatedId = await orderActions.placeOrder(data);

  this.scenarioData['lastOrderId'] = generatedId;
});

Then('I should see the order in the orders list', async function (this: CustomWorld) {
  const ordersPage = new OrdersPage(this.page);

  const lastOrderId = this.scenarioData['lastOrderId'] as string;

  // Load the list again so the row comes from the server, not from the post-submit redirect.
  await ordersPage.navigate();

  await expect(ordersPage.getOrderRow(lastOrderId)).toBeVisible();
});

When('I view the order details', async function (this: CustomWorld) {
  const ordersPage = new OrdersPage(this.page);
  const lastOrderId = this.scenarioData['lastOrderId'] as string;

  await ordersPage.viewOrder(lastOrderId);
});

Then(
  'the order status should be {string}',
  async function (this: CustomWorld, expectedStatus: string) {
    const detailsPage = new OrderDetailsPage(this.page);
    await expect(detailsPage.orderStatus).toHaveText(expectedStatus);
  },
);

When('I attempt to place an order with no price', async function (this: CustomWorld) {
  const data = DataFactory.getOrderData('order.limit-buy', { limitPrice: '' });
  const ordersPage = new OrdersPage(this.page);
  const ticketPage = new OrderTicketPage(this.page);

  // Fill the ticket step by step (not OrderActions.placeOrder) because the form must stay unsubmitted.
  await ordersPage.navigate();
  await ordersPage.clickNewOrder();
  await ticketPage.fillOrderTicket(
    data.symbol,
    data.side,
    data.quantity.toString(),
    data.limitPrice as string,
  );
});

Then('the submit button should be disabled', async function (this: CustomWorld) {
  const ticketPage = new OrderTicketPage(this.page);
  await expect(ticketPage.submitButton).toBeDisabled();
});
