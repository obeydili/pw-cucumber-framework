import { APIRequestContext } from '@playwright/test';
import { OrderPayload } from '../actions/OrderActions';

export class OrdersApi {
  constructor(private readonly request: APIRequestContext) {}

  // POST /api/orders
  async createOrder(data: OrderPayload) {
    return await this.request.post('/api/orders', {
      data: data,
    });
  }

  // GET /api/orders/:id
  async getOrder(orderId: string) {
    return await this.request.get(`/api/orders/${orderId}`);
  }

  // POST /api/orders/:id/approve
  async approveOrder(orderId: string) {
    return await this.request.post(`/api/orders/${orderId}/approve`);
  }
}
