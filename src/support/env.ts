import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { usersData } from '../data/users';

export interface AppConfig {
  env: string;
  baseUrl: string;
  validUser: string;
  approverUser: string;
  validPassword: string;
  isHeadless: boolean;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = process.env.ENV || 'dev';

// Resolved from this file, not process.cwd(), so it works from any working directory.
const envPath = path.resolve(__dirname, `../../env/.env.${env}`);

// Variables already set in the shell (e.g. CI secrets) win over the file.
dotenv.config({ path: envPath });

const baseUrl = process.env.BASE_URL;
const validPassword = process.env.VALID_PASSWORD;
const validUser = usersData.trader?.username;
const approverUser = usersData.approver?.username;
const isHeadless = process.env.HEADLESS !== 'false';

// Fail fast with a clear message instead of a confusing login failure mid-run.
if (!baseUrl) throw new Error(`CRITICAL: BASE_URL is missing in env/.env.${env}`);
if (!validPassword) throw new Error(`CRITICAL: VALID_PASSWORD is missing in env/.env.${env}`);
if (!validUser) throw new Error(`CRITICAL: trader username is missing in users.json`);
if (!approverUser) throw new Error(`CRITICAL: approver username is missing in users.json`);

export const config: AppConfig = {
  env,
  baseUrl,
  validUser,
  approverUser,
  validPassword,
  isHeadless,
};
