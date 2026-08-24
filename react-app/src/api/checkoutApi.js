import { environment } from "../config/environment";
import { createApiClient } from "./apiClient";
const client = createApiClient(environment.api.checkoutServiceUrl);
export async function createCheckout({
  userId,
  cardLast4 = "4242",
  idempotencyKey,
}) {
  if (!userId) throw new Error("Your account profile is not ready yet.");
  return (
    await client.post("/api/v1/checkouts", {
      userId,
      idempotencyKey: idempotencyKey || `web-checkout-${crypto.randomUUID()}`,
      cardLast4,
    })
  ).data;
}
