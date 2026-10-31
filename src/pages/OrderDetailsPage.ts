import { BasePage } from './BasePage';

export class OrderDetailsPage extends BasePage {
  // Using getByTestId for elements that don't have good visual labels
  get orderStatus() {
    return this.page.getByTestId('order-status');
  }
}
