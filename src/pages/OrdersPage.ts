import { BasePage } from './BasePage';

export class OrdersPage extends BasePage {
  get newOrderButton() {
    return this.page.locator('main').getByRole('link', { name: 'New order' });
  }

  // 1. Expose the row locator for assertions
  getOrderRow(orderId: string) {
    return this.page.getByRole('row').filter({
      has: this.page.getByText(orderId, { exact: true }),
    });
  }

  async navigate() {
    await this.page.goto('/orders');
  }

  async clickNewOrder() {
    await this.newOrderButton.click();
  }

  // The Magic Filter Method!
  async viewOrder(orderId: string) {
    await this.getOrderRow(orderId).getByRole('link', { name: 'View' }).click();
  }
}
