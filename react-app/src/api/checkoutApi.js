import { v4 as uuidv4 } from "uuid";

import { environment } from "../config/environment";
import { createApiClient } from "./apiClient";

const checkoutClient = createApiClient(
  environment.api.checkoutServiceUrl,
);

export async function createCheckout({
  userId,
  cardLast4 = "4242",
}) {
  if (!userId) {
    throw new Error("A development user ID is required.");
  }

  const response = await checkoutClient.post(
    "/api/v1/checkouts",
    {
      userId,
      idempotencyKey: `web-checkout-${uuidv4()}`,
      cardLast4,
    },
  );

  return response.data;
}
