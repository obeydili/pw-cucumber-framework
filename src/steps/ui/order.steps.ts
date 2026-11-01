import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/world';
import { DataFactory } from '../../data/dataFactory';
import { OrderActions } from '../../actions/OrderActions';
import { OrdersPage } from '../../pages/OrdersPage';
import { OrderDetailsPage } from '../../pages/OrderDetailsPage';
import { OrderTicketPage } from '../../pages/OrderTicketPage';

// --- POSITIVE SCENARIO ---
Given('I navigate to the orders page', async function (this: CustomWorld) {
  const ordersPage = new OrdersPage(this.page);
  await ordersPage.navigate();
});

When('I place a limit {string} order', async function (this: CustomWorld, side: string) {
  // 1. Dynamically select the template based on the Gherkin string (buy/sell)
  const templateName = `order.limit-${side.toLowerCase()}`;

  // 2. The DataFactory generates unique data for this exact test
  const data = DataFactory.getOrderData(templateName);

  // 3. The Action layer takes over and does the heavy lifting
  const orderActions = new OrderActions(this.page);
  const generatedId = await orderActions.placeOrder(data);

  // 4. Save the generated ID into our World state so the 'Then' step can find it!
  this.scenarioData['lastOrderId'] = generatedId;
});

Then('I should see the order in the orders list', async function (this: CustomWorld) {
  const ordersPage = new OrdersPage(this.page);

  // Pull the dynamically generated ID out of our World state
  const lastOrderId = this.scenarioData['lastOrderId'] as string;

  // As the Muallim hinted: Navigate back to the Orders list to verify it's there
  await ordersPage.navigate();

  // FIX 1: Pure Explicit Assertion! No clicking allowed here!
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
    // Assert the exact status on the details page
    await expect(detailsPage.orderStatus).toHaveText(expectedStatus);
  },
);

// --- NEGATIVE SCENARIO ---

When('I attempt to place an order with no price', async function (this: CustomWorld) {
  // We use the factory, but override the price to be empty!
  const data = DataFactory.getOrderData('order.limit-buy', { limitPrice: '' });
  const ordersPage = new OrdersPage(this.page);
  const ticketPage = new OrderTicketPage(this.page);

  // For a negative UI state test, we do the specific actions manually
  await ordersPage.navigate();
  await ordersPage.clickNewOrder();
  // FIX 2: Use data.limitPrice instead of a hardcoded ''
  await ticketPage.fillOrderTicket(
    data.symbol,
    data.side,
    data.quantity.toString(),
    data.limitPrice as string,
  );
});

Then('the submit button should be disabled', async function (this: CustomWorld) {
  const ticketPage = new OrderTicketPage(this.page);
  // Playwright strictly checks if the button has the 'disabled' attribute!
  await expect(ticketPage.submitButton).toBeDisabled();
});
