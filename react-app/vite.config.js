import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

function createProxy(target, prefix) {
  return {
    target,
    changeOrigin: true,
    secure: true,
    rewrite: (path) => path.replace(new RegExp(`^${prefix}`), ""),
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const awsDevApi = "https://api.needystuff.in";

  return {
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port: 5173,
      proxy: {
        "/product-api": createProxy(env.VITE_PRODUCT_SERVICE_TARGET || awsDevApi, "/product-api"),
        "/inventory-api": createProxy(env.VITE_INVENTORY_SERVICE_TARGET || awsDevApi, "/inventory-api"),
        "/user-api": createProxy(env.VITE_USER_SERVICE_TARGET || awsDevApi, "/user-api"),
        "/cart-api": createProxy(env.VITE_CART_SERVICE_TARGET || awsDevApi, "/cart-api"),
        "/order-api": createProxy(env.VITE_ORDER_SERVICE_TARGET || awsDevApi, "/order-api"),
        "/payment-api": createProxy(env.VITE_PAYMENT_SERVICE_TARGET || awsDevApi, "/payment-api"),
        "/checkout-api": createProxy(env.VITE_CHECKOUT_SERVICE_TARGET || awsDevApi, "/checkout-api"),
        "/shipping-api": createProxy(env.VITE_SHIPPING_SERVICE_TARGET || awsDevApi, "/shipping-api"),
      },
    },
  };
});
