import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url'; // Required if using Option 2

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the strict contract for our environment configuration
export interface AppConfig {
  env: string;
  baseUrl: string;
  validUser: string;
  approverUser: string;
  validPassword: string;
  isHeadless: boolean;
}

// 1. Determine the environment (default to 'dev' if not provided)
const env = process.env.ENV || 'dev';

// 2. Build the path to the correct .env file

// --- OPTION 1: process.cwd() (Simpler, assumes command is run from project root) ---
//const envPath = path.resolve(process.cwd(), `env/.env.${env}`);

// --- OPTION 2: import.meta.url (Robust, calculates relative to this exact file) ---
const envPath = path.resolve(__dirname, `../../env/.env.${env}`);

// 3. Load the variables from that file into process.env
dotenv.config({ path: envPath });

// Load users from the JSON file!
const usersPath = path.resolve(__dirname, '../data/templates/users.json');
const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));

// 4. Extract what we need and fail fast if it's missing!
// Extract without the || '' fallback! Let them be undefined if missing.
// Extract them to variables first!
const baseUrl = process.env.BASE_URL;
const validPassword = process.env.VALID_PASSWORD;
const validUser = usersData.trader?.username;
const approverUser = usersData.approver?.username;
const isHeadless = process.env.HEADLESS === 'true';

// FIX: The Fail-Fast Gauntlet!
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
  isHeadless
};
