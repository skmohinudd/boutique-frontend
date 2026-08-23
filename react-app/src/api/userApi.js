import { environment } from "../config/environment";
import { createApiClient } from "./apiClient";

const client = createApiClient(environment.api.userServiceUrl);

export async function getUser(id) {
  return (await client.get(`/api/v1/users/${encodeURIComponent(id)}`)).data;
}

export async function createUser(payload) {
  return (await client.post("/api/v1/users", payload)).data;
}

export async function updateUser(id, payload) {
  return (await client.put(`/api/v1/users/${encodeURIComponent(id)}`, payload)).data;
}

export async function createDemoUser() {
  const token = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return createUser({
    email: `local-${token}@boutique.local`,
    firstName: "Local",
    lastName: "Shopper",
    phoneNumber: "9999999999",
    cognitoSub: `local-${token}`,
  });
}

