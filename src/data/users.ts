import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

export interface TestUser {
  username: string;
  role: 'Trader' | 'Approver';
}

export interface InvalidUser {
  username: string;
  password: string;
}

export interface UsersData {
  trader: TestUser;
  approver: TestUser;
  invalidUser: InvalidUser;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usersPath = path.resolve(__dirname, './templates/users.json');
export const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8')) as UsersData;
