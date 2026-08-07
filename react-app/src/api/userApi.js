import { environment } from "../config/environment";import { createApiClient } from "./apiClient";const client=createApiClient(environment.api.userServiceUrl);
export async function getUser(id){return (await client.get(`/api/v1/users/${encodeURIComponent(id)}`)).data;}
export async function createDemoUser(){const token=`${Date.now()}-${Math.random().toString(16).slice(2)}`;return (await client.post("/api/v1/users",{email:`local-${token}@boutique.local`,firstName:"Local",lastName:"Shopper",phoneNumber:"9999999999",cognitoSub:`local-${token}`})).data;}
