import { Given, When } from '@cucumber/cucumber';
import { CustomWorld } from '../../support/world';
import { DataFactory } from '../../data/dataFactory';
import { OrderActions } from '../../actions/OrderActions';
import { OrdersApi } from '../../api/OrdersApi';
import { expect } from '@playwright/test';

Given('I have placed a new limit buy order', async function (this: CustomWorld) {
  const data = DataFactory.getOrderData('order.limit-buy');
  const orderActions = new OrderActions(this.page);

  // 1. Trader places the order in the UI
  const generatedId = await orderActions.placeOrder(data);

  // 2. Save the real ID for the API to use!
  this.scenarioData['lastOrderId'] = generatedId;
});

When('the order is approved via API', async function (this: CustomWorld) {
  const orderId = this.scenarioData['lastOrderId'] as string;

  // 1. Grab the Approver's API Context out of the dictionary we made in hooks.ts!
  const approverContext = this.apiContexts['approver'];

  // 2. Wrap it in our API Actions class
  const approverApi = new OrdersApi(approverContext);

  // 3. The Approver instantly approves the order on the backend!
  const response = await approverApi.approveOrder(orderId);
  
  // Strict status and body assertions!
  await expect(response).toBeOK(); // Fails loud with logs!
  
});

When('I reload the page', async function (this: CustomWorld) {
  // Playwright magic to instantly refresh the UI!
  await this.page.reload();
});
