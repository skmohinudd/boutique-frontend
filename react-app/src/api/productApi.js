import { environment } from "../config/environment";import { createApiClient } from "./apiClient";const client=createApiClient(environment.api.productServiceUrl);
export async function getProducts({q="",category="",page=0,size=20}={}){const params={page,size};if(q.trim())params.q=q.trim();if(category&&category!=="all")params.category=category;return (await client.get("/api/v1/products",{params})).data;}
export async function getCategories(){return (await client.get("/api/v1/products/categories")).data;}
export async function getProductById(id){if(!id)throw new Error("Product ID is required.");return (await client.get(`/api/v1/products/${encodeURIComponent(id)}`)).data;}
export async function createProduct(data){if(!data)throw new Error("Product data is required.");return (await client.post("/api/v1/products",data)).data;}
