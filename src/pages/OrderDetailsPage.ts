import { BasePage } from './BasePage';

export class OrderDetailsPage extends BasePage {
  get orderStatus() {
    return this.page.getByTestId('order-status');
  }
}
