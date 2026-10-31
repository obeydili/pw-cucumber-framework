import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url'; // Required if using Option 2

// Define the strict contract for our environment configuration
export interface AppConfig {
  env: string;
  baseUrl: string;
  validUser: string;
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
const baseUrl = process.env.BASE_URL;
const validUser = process.env.VALID_USERNAME || '';
const validPassword = process.env.VALID_PASSWORD || '';

if (!baseUrl) {
  throw new Error(`CRITICAL: BASE_URL is missing in env/.env.${env}`);
}

export const config: AppConfig = {
  env,
  baseUrl,
  validUser,
  validPassword 
};
