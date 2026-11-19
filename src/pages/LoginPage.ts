import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  async navigate() {
    await this.open('/login');
  }

  get username() {
    return this.page.getByLabel('Username');
  }

  get password() {
    return this.page.getByLabel('Password');
  }

  get signIn() {
    return this.page.getByRole('button', { name: 'Sign in' });
  }

  get errorMessage() {
    return this.page.getByText('Invalid username or password.');
  }

  async login(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.signIn.click();
  }
}
