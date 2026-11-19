import { Given, When } from '@cucumber/cucumber';
import { CustomWorld } from '../../support/world';
import { DataFactory } from '../../data/dataFactory';
import { OrderActions } from '../../actions/OrderActions';
import { OrdersApi } from '../../api/OrdersApi';
import { expect } from '@playwright/test';

Given('I have placed a new limit buy order', async function (this: CustomWorld) {
  const data = DataFactory.getOrderData('order.limit-buy');
  const orderActions = new OrderActions(this.page);

  const generatedId = await orderActions.placeOrder(data);

  this.scenarioData['lastOrderId'] = generatedId;
});

When('the order is approved via API', async function (this: CustomWorld) {
  const orderId = this.scenarioData['lastOrderId'] as string;

  // Created in hooks.ts for @hybrid scenarios.
  const approverContext = this.apiContexts['approver'];

  const approverApi = new OrdersApi(approverContext);

  const response = await approverApi.approveOrder(orderId);

  await expect(response).toBeOK();
});

When('I reload the page', async function (this: CustomWorld) {
  await this.page.reload();
});
