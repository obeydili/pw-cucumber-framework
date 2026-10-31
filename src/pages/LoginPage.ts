import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // No constructor needed! BasePage gives us 'this.page' automatically.

  async navigate() {
    await this.page.goto('/login');
  }

  // Use Getters with the 'return' keyword!
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
    // Encapsulating the locator inside the POM!
    return this.page.getByText('Invalid username or password.');
  }

  async login(username: string, password: string) {
    // Look how clean this is! 🚫 No CSS!
    await this.username.fill(username);
    await this.password.fill(password);
    await this.signIn.click();
  }
}
