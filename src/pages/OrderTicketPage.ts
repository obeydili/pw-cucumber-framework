import { BasePage } from './BasePage';

export class OrderTicketPage extends BasePage {
  get symbolSelect() {
    return this.page.getByLabel('Symbol');
  }

  get quantityInput() {
    return this.page.getByLabel('Quantity');
  }

  get limitPriceInput() {
    return this.page.getByLabel('Limit Price');
  }

  get submitButton() {
    return this.page.getByRole('button', { name: 'Submit' });
  }

  async fillOrderTicket(symbol: string, side: string, qty: string, price: string) {
    await this.symbolSelect.selectOption(symbol);
    // exact, so "Buy" doesn't also match a longer label.
    await this.page.getByLabel(side, { exact: true }).check();
    await this.quantityInput.fill(qty);
    await this.limitPriceInput.fill(price);
  }

  async submitOrder() {
    await this.submitButton.click();
  }
}
