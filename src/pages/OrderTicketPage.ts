import { BasePage } from './BasePage';

export class OrderTicketPage extends BasePage {
  // Using Playwright's Web First Locators (No CSS!)
  get symbolInput() {
    return this.page.getByLabel('Symbol');
  }

  get sideSelect() {
    return this.page.getByLabel('Side');
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
    await this.symbolInput.fill(symbol);
    await this.sideSelect.selectOption(side);
    await this.quantityInput.fill(qty);
    await this.limitPriceInput.fill(price);
  }
}
