import { Given, When, Then } from '@cucumber/cucumber';
import { expect, APIResponse } from '@playwright/test';
import { CustomWorld } from '../../support/world';
import { DataFactory } from '../../data/dataFactory';

// --- HAPPY PATH ---

When('I create a valid order via API', async function (this: CustomWorld) {
  const data = DataFactory.getOrderData('order.limit-buy');

  // Notice how clean this is? We just use this.ordersApi!
  const response = await this.ordersApi.createOrder(data);

  // Put the response in our "backpack"
  this.scenarioData['lastResponse'] = response;
});

// We use {} as a wildcard to capture "Created", "Bad Request", or "Forbidden"
Then(
  'the API response should be {int} {}',
  async function (this: CustomWorld, expectedStatus: number, statusText: string) {
    const response = this.scenarioData['lastResponse'] as APIResponse;

    // Assert ONLY the number. Ignore statusText in code, just keep it for Gherkin readability, because Modern servers often completely drop the statusText (like "Created") to save bandwidth!
    expect(response.status()).toBe(expectedStatus);
  },
);

// ACTION: Makes the network call and saves the result!
When('I retrieve the created order via API', async function (this: CustomWorld) {
  const createResponse = this.scenarioData['lastResponse'] as APIResponse;
  const createBody = await createResponse.json();
  const orderId = createBody.id;

  // Make the GET call
  const getResponse = await this.ordersApi.getOrder(orderId);

  // Save BOTH the response and the ID we expect to see
  this.scenarioData['getResponse'] = getResponse;
  this.scenarioData['targetOrderId'] = orderId;
});

// ASSERTION: Pure validation, zero network calls!
Then('the retrieved order details should be correct', async function (this: CustomWorld) {
  const getResponse = this.scenarioData['getResponse'] as APIResponse;
  const expectedOrderId = this.scenarioData['targetOrderId'] as string;

  await expect(getResponse).toBeOK();

  const getBody = await getResponse.json();
  expect(getBody.id).toBe(expectedOrderId);
  expect(getBody.status).toBe('Pending Approval');
});

// --- VALIDATION PATH (400) ---

When('I attempt to create an order with invalid data via API', async function (this: CustomWorld) {
  // Override with bad data (Negative quantity!)
  const badData = DataFactory.getOrderData('order.limit-buy', { quantity: -500 });
  const response = await this.ordersApi.createOrder(badData);

  this.scenarioData['lastResponse'] = response;
});

// THE NEW ASSERTION FOR THE 400 ERROR!
Then(
  'the API response body should contain the invalid quantity error',
  async function (this: CustomWorld) {
    const response = this.scenarioData['lastResponse'] as APIResponse;
    const body = await response.json();
    // Assert the exact error structure sent back by Trade Desk Lite!
    expect(body.error).toBe('Validation failed.');
    expect(body.details.quantity).toContain('Quantity must be a whole number');
  },
);

// --- SECURITY PATH (403) ---

Given('I have an existing order created via API', async function (this: CustomWorld) {
  const data = DataFactory.getOrderData('order.limit-sell');
  const response = await this.ordersApi.createOrder(data);

  // THE FIX: Prove the setup actually worked before continuing!
  await expect(response).toBeOK(); // Upgraded to Playwright's native checker!

  const body = await response.json();
  // FIX: Prove the body is correct before we move on!
  expect(body.status).toBe('Pending Approval');

  // Save the specific ID into the backpack for the next step
  this.scenarioData['targetOrderId'] = body.id;
});

When('I attempt to approve the order via API', async function (this: CustomWorld) {
  const orderId = this.scenarioData['targetOrderId'] as string;

  // The Trader tries to hit the Approve endpoint...
  const response = await this.ordersApi.approveOrder(orderId);

  // Save the response so the generic {int} step can assert it!
  this.scenarioData['lastResponse'] = response;
});

Then(
  'the API response body should contain the forbidden error',
  async function (this: CustomWorld) {
    const response = this.scenarioData['lastResponse'] as APIResponse;
    const body = await response.json();

    // Assert the exact error structure and string from the backend!
    expect(body.error).toBe('Only a approver can do this.');
  },
);
