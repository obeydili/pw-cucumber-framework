import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { OrderPayload } from '../actions/OrderActions';

// Recreate __dirname for modern ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DataFactory {
  /**
   * Loads a JSON template, injects a unique clientOrderId, and applies any specific overrides you want for the test.
   */
  static getOrderData(templateName: string, overrides: Partial<Record<keyof OrderPayload, unknown>> = {}): OrderPayload {
    // 1. Resolve the path firmly relative to THIS exact file! (No more process.cwd())
    const templatePath = path.resolve(__dirname, `templates/${templateName}.json`);

    if (!fs.existsSync(templatePath)) {
      throw new Error(`CRITICAL: Test data template not found at ${templatePath}`);
    }

    // 2. Read and parse the raw JSON file
    const rawData = fs.readFileSync(templatePath, 'utf8');
    const baseData = JSON.parse(rawData);

    // 3. Generate a perfectly unique ID so we never get a 409 Conflict!
    const uniqueId = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 4. Merge it all together: Base Data <- Unique ID <- Custom Overrides
    return {
      ...baseData,
      clientOrderId: uniqueId,
      ...overrides,
    };
  }
}
