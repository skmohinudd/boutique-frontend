import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

function createProxy(target, prefix) {
  return {
    target,
    changeOrigin: true,
    rewrite: (path) => path.replace(new RegExp(`^${prefix}`), ""),
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],

    server: {
      host: "0.0.0.0",
      port: 5173,

      proxy: {
        "/product-api": createProxy(
          env.VITE_PRODUCT_SERVICE_TARGET || "http://localhost:8080",
          "/product-api",
        ),

        "/inventory-api": createProxy(
          env.VITE_INVENTORY_SERVICE_TARGET || "http://localhost:8081",
          "/inventory-api",
        ),

        "/user-api": createProxy(
          env.VITE_USER_SERVICE_TARGET || "http://localhost:8082",
          "/user-api",
        ),

        "/cart-api": createProxy(
          env.VITE_CART_SERVICE_TARGET || "http://localhost:8083",
          "/cart-api",
        ),

        "/checkout-api": createProxy(
          env.VITE_CHECKOUT_SERVICE_TARGET || "http://localhost:8086",
          "/checkout-api",
        ),

        "/payment-api": createProxy(
          env.VITE_PAYMENT_SERVICE_TARGET || "http://localhost:8085",
          "/payment-api",
        ),
      },
    },
  };
});
