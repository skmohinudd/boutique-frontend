import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
function proxy(envName,fallback,prefix){return{target:process.env[envName]||fallback,changeOrigin:true,rewrite:path=>path.replace(new RegExp(`^${prefix}`),"")};}
export default defineConfig({plugins:[react()],server:{host:"0.0.0.0",port:5173,proxy:{
 "/product-api":proxy("VITE_PRODUCT_SERVICE_TARGET","http://localhost:8080","/product-api"),
 "/inventory-api":proxy("VITE_INVENTORY_SERVICE_TARGET","http://localhost:8081","/inventory-api"),
 "/user-api":proxy("VITE_USER_SERVICE_TARGET","http://localhost:8082","/user-api"),
 "/cart-api":proxy("VITE_CART_SERVICE_TARGET","http://localhost:8083","/cart-api"),
 "/checkout-api":proxy("VITE_CHECKOUT_SERVICE_TARGET","http://localhost:8086","/checkout-api"),
 "/payment-api":proxy("VITE_PAYMENT_SERVICE_TARGET","http://localhost:8085","/payment-api"),
}}});
