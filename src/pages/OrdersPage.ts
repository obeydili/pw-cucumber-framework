import { BasePage } from './BasePage';

export class OrdersPage extends BasePage {
  async navigate() {
    await this.page.goto('/orders');
  }

  // The Magic Filter Method!
  async viewOrder(orderId: string) {
    // 1. Find all rows
    // 2. Filter using an EXACT text match so '123' never matches '1234'
    // const row = this.page.getByRole('row').filter({ hasText: orderId });
    const row = this.page.getByRole('row').filter({
      has: this.page.getByText(orderId, { exact: true }),
    });

    // 3. Click the View button in that specific row
    await row.getByRole('button', { name: 'View' }).click();
  }
}
