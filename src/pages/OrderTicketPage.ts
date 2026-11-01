import { BasePage } from './BasePage';

export class OrderTicketPage extends BasePage {
  // Using Playwright's Web First Locators (No CSS!)
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

  // A complete business action to fill out the whole ticket!
  async fillOrderTicket(symbol: string, side: string, qty: string, price: string) {
    await this.symbolSelect.selectOption(symbol);
    // We use { exact: true } so "Buy" doesn't accidentally match a longer word.
    await this.page.getByLabel(side, { exact: true }).check();
    await this.quantityInput.fill(qty);
    await this.limitPriceInput.fill(price);
  }

  async submitOrder() {
    await this.submitButton.click();
  }
}
