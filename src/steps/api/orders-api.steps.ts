import { Given, When, Then } from '@cucumber/cucumber';
import { expect, APIResponse } from '@playwright/test';
import { CustomWorld } from '../../support/world';
import { DataFactory } from '../../data/dataFactory';

When('I create a valid order via API', async function (this: CustomWorld) {
  const data = DataFactory.getOrderData('order.limit-buy');

  const response = await this.ordersApi.createOrder(data);

  this.scenarioData['lastResponse'] = response;
});

// The trailing {} captures the reason phrase ("Created", "Forbidden") so the Gherkin reads naturally.
Then(
  'the API response should be {int} {}',
  async function (this: CustomWorld, expectedStatus: number, statusText: string) {
    const response = this.scenarioData['lastResponse'] as APIResponse;

    // Only the status code is asserted: the reason phrase is optional in HTTP and many servers omit it.
    expect(response.status()).toBe(expectedStatus);
  },
);

When('I retrieve the created order via API', async function (this: CustomWorld) {
  const createResponse = this.scenarioData['lastResponse'] as APIResponse;
  const createBody = await createResponse.json();
  const orderId = createBody.id;

  const getResponse = await this.ordersApi.getOrder(orderId);

  this.scenarioData['getResponse'] = getResponse;
  this.scenarioData['targetOrderId'] = orderId;
});

Then('the retrieved order details should be correct', async function (this: CustomWorld) {
  const getResponse = this.scenarioData['getResponse'] as APIResponse;
  const expectedOrderId = this.scenarioData['targetOrderId'] as string;

  await expect(getResponse).toBeOK();

  const getBody = await getResponse.json();
  expect(getBody.id).toBe(expectedOrderId);
  expect(getBody.status).toBe('Pending Approval');
});

When('I attempt to create an order with invalid data via API', async function (this: CustomWorld) {
  const badData = DataFactory.getOrderData('order.limit-buy', { quantity: -500 });
  const response = await this.ordersApi.createOrder(badData);

  this.scenarioData['lastResponse'] = response;
});

Then(
  'the API response body should contain the invalid quantity error',
  async function (this: CustomWorld) {
    const response = this.scenarioData['lastResponse'] as APIResponse;
    const body = await response.json();
    expect(body.error).toBe('Validation failed.');
    expect(body.details.quantity).toContain('Quantity must be a whole number');
  },
);

Given('I have an existing order created via API', async function (this: CustomWorld) {
  const data = DataFactory.getOrderData('order.limit-sell');
  const response = await this.ordersApi.createOrder(data);

  // Fail in the Given step if the setup itself broke, not later in an unrelated assertion.
  await expect(response).toBeOK();

  const body = await response.json();
  expect(body.status).toBe('Pending Approval');

  this.scenarioData['targetOrderId'] = body.id;
});

When('I attempt to approve the order via API', async function (this: CustomWorld) {
  const orderId = this.scenarioData['targetOrderId'] as string;

  const response = await this.ordersApi.approveOrder(orderId);

  this.scenarioData['lastResponse'] = response;
});

Then(
  'the API response body should contain the forbidden error',
  async function (this: CustomWorld) {
    const response = this.scenarioData['lastResponse'] as APIResponse;
    const body = await response.json();

    expect(body.error).toBe('Only a approver can do this.');
  },
);
