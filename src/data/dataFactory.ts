import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { OrderPayload } from '../actions/OrderActions';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DataFactory {
  /**
   * Loads a JSON template, injects a unique clientOrderId, and applies any specific overrides you want for the test.
   */
  static getOrderData(
    templateName: string,
    overrides: Partial<Record<keyof OrderPayload, unknown>> = {},
  ): OrderPayload {
    const templatePath = path.resolve(__dirname, `templates/${templateName}.json`);

    if (!fs.existsSync(templatePath)) {
      throw new Error(`CRITICAL: Test data template not found at ${templatePath}`);
    }

    const rawData = fs.readFileSync(templatePath, 'utf8');
    const baseData = JSON.parse(rawData);

    // clientOrderId must be unique: the API answers 409 on a duplicate.
    const uniqueId = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return {
      ...baseData,
      clientOrderId: uniqueId,
      ...overrides,
    };
  }
}
