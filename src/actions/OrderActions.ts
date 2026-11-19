import { Page } from '@playwright/test';
import { OrdersPage } from '../pages/OrdersPage';
import { OrderTicketPage } from '../pages/OrderTicketPage';

export interface OrderPayload {
  symbol: string;
  side: string;
  quantity: number;
  limitPrice: number | string;
  clientOrderId?: string;
}

export class OrderActions {
  constructor(private readonly page: Page) {}

  // Returns the id the app assigned (ORD-n), not the clientOrderId from the data.
  async placeOrder(data: OrderPayload): Promise<string> {
    const ordersPage = new OrdersPage(this.page);
    const ticketPage = new OrderTicketPage(this.page);

    await ordersPage.navigate();

    await ordersPage.clickNewOrder();

    await ticketPage.fillOrderTicket(
      data.symbol,
      data.side,
      data.quantity.toString(),
      data.limitPrice.toString(),
    );

    await ticketPage.submitOrder();

    await this.page.waitForURL(/\/orders\/ORD-.*/);

    const url = this.page.url();
    const rawId = url.split('/').pop() || ''; // e.g. ORD-1013?created=1
    const realId = rawId.split('?')[0];

    return realId!;
  }
}
