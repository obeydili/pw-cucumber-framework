import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url'; // Required if using Option 2

// Define the strict contract for our environment configuration
export interface AppConfig {
  env: string;
  baseUrl: string;
  validUser: string;
  approverUser: string;
  validPassword: string;
}

// 1. Determine the environment (default to 'dev' if not provided)
const env = process.env.ENV || 'dev';

// 2. Build the path to the correct .env file

// --- OPTION 1: process.cwd() (Simpler, assumes command is run from project root) ---
//const envPath = path.resolve(process.cwd(), `env/.env.${env}`);

// --- OPTION 2: import.meta.url (Robust, calculates relative to this exact file) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, `../../env/.env.${env}`);

// 3. Load the variables from that file into process.env
dotenv.config({ path: envPath });

// 4. Extract what we need and fail fast if it's missing!
// Extract without the || '' fallback! Let them be undefined if missing.
const baseUrl = process.env.BASE_URL;
const validUser = process.env.VALID_USERNAME;
const approverUser = process.env.APPROVER_USERNAME; 
const validPassword = process.env.VALID_PASSWORD;

// Fail fast for EVERY required variable!
if (!baseUrl) {
  throw new Error(`CRITICAL: BASE_URL is missing in env/.env.${env}`);
}
if (!validUser) {
  throw new Error(`CRITICAL: VALID_USERNAME is missing in env/.env.${env}`);
}
if (!approverUser) {
  throw new Error(`CRITICAL: APPROVER_USERNAME is missing in env/.env.${env}`);
}
if (!validPassword) {
  throw new Error(`CRITICAL: VALID_PASSWORD is missing in env/.env.${env}`);
}

// Export safely, knowing TypeScript is happy because we proved they aren't undefined!
export const config: AppConfig = {
  env,
  baseUrl,
  validUser,
  approverUser,
  validPassword,
};
