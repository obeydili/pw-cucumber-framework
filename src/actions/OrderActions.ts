import { Page } from '@playwright/test';
import { OrdersPage } from '../pages/OrdersPage';
import { OrderTicketPage } from '../pages/OrderTicketPage';

// 1. The Strict Interface for our Test Data
export interface OrderPayload {
  symbol: string;
  side: string;
  quantity: number;
  limitPrice: number | string;
  clientOrderId?: string; // Optional, injected by the DataFactory
}

export class OrderActions {
  constructor(private readonly page: Page) {}

  // The 'data' parameter will be the JSON object we generate from our DataFactory!
  // Replaced Record<string, any> with our strict interface
  async placeOrder(data: OrderPayload): Promise<string> {
    const ordersPage = new OrdersPage(this.page);
    const ticketPage = new OrderTicketPage(this.page);

    // 1. Go to the page
    await ordersPage.navigate();

    // 2. Click the 'New order' link!
    await ordersPage.clickNewOrder();

    // 3. Fill the ticket using the dynamic data
    // (We convert numbers to strings because Playwright's .fill() expects strings)
    await ticketPage.fillOrderTicket(
      data.symbol,
      data.side,
      data.quantity.toString(),
      data.limitPrice.toString(),
    );

    // 4. Submit the order
    await ticketPage.submitOrder();

    // 5. Wait for the app to redirect us to the Details page
    await this.page.waitForURL(/\/orders\/ORD-.*/);

    // 6. Extract the real ID and strip any query parameters
    const url = this.page.url();
    const rawId = url.split('/').pop() || ''; // "ORD-1013?created=1"
    const realId = rawId.split('?')[0]; // "ORD-1013"

    // 7. Return the real ID instead of the one from the DataFactory!
    return realId!;
  }
}
