import { environment } from "../config/environment";
import { createApiClient } from "./apiClient";

const client = createApiClient(environment.api.orderServiceUrl);

export async function getOrder(orderId) {
  return (await client.get(`/api/v1/orders/${encodeURIComponent(orderId)}`)).data;
}

