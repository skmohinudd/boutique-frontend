#!/usr/bin/env bash
set -u
set -o pipefail

# Boutique Frontend DEV Revive
# Purpose:
# - Normalize frontend DEV configuration
# - Prevent deployed DEV builds from falling back to localhost
# - Keep Vite local proxies for npm run dev
# - Harden API client defaults
# - Add DEV API URLs + bundle validation to GitHub Actions
# - Build and validate the deployable bundle
#
# This script DOES NOT git commit, git push, upload to S3, or invalidate CloudFront.

ROOT="${1:-$(pwd)}"

if [[ -d "$ROOT/react-app" ]]; then
  REPO="$ROOT"
elif [[ -d "$ROOT/boutique-frontend/react-app" ]]; then
  REPO="$ROOT/boutique-frontend"
else
  echo "ERROR: Could not find react-app."
  echo "Run from boutique-frontend root, or pass the repository path:"
  echo "  bash revive-frontend-dev.sh /c/boutique-project/Projects/boutique-frontend"
  exit 1
fi

APP="$REPO/react-app"
WORKFLOW="$REPO/.github/workflows/frontend-deploy.yml"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$REPO/.frontend-dev-revive-backup-$STAMP"

echo "Repository : $REPO"
echo "React app  : $APP"
echo "Backup     : $BACKUP"

mkdir -p "$BACKUP/react-app/src/config" "$BACKUP/react-app/src/api" "$BACKUP/.github/workflows"

backup_if_exists() {
  local src="$1"
  local dst="$2"
  if [[ -f "$src" ]]; then
    mkdir -p "$(dirname "$dst")"
    cp "$src" "$dst"
  fi
}

backup_if_exists "$APP/.env" "$BACKUP/react-app/.env"
backup_if_exists "$APP/.env.example" "$BACKUP/react-app/.env.example"
backup_if_exists "$APP/vite.config.js" "$BACKUP/react-app/vite.config.js"
backup_if_exists "$APP/src/config/environment.js" "$BACKUP/react-app/src/config/environment.js"
backup_if_exists "$APP/src/api/apiClient.js" "$BACKUP/react-app/src/api/apiClient.js"
backup_if_exists "$APP/src/App.jsx" "$BACKUP/react-app/src/App.jsx"
backup_if_exists "$WORKFLOW" "$BACKUP/.github/workflows/frontend-deploy.yml"

echo
echo "==> Writing local DEV environment"

cat > "$APP/.env" <<'EOF'
VITE_APP_NAME=Boutique
VITE_APP_ENV=dev

# Local Vite development routes. vite.config.js proxies these to local services.
VITE_PRODUCT_API_URL=/product-api
VITE_INVENTORY_API_URL=/inventory-api
VITE_USER_API_URL=/user-api
VITE_CART_API_URL=/cart-api
VITE_CHECKOUT_API_URL=/checkout-api
VITE_PAYMENT_API_URL=/payment-api

VITE_API_TIMEOUT_MS=10000
VITE_DEFAULT_CURRENCY=USD
VITE_DEMO_CARD_LAST4=4242

VITE_ENABLE_ADVERTISEMENTS=true
VITE_ENABLE_RECOMMENDATIONS=false
VITE_ENABLE_CURRENCY=false
VITE_ENABLE_ASSISTANT=false
EOF

cat > "$APP/.env.example" <<'EOF'
VITE_APP_NAME=Boutique
VITE_APP_ENV=dev

VITE_PRODUCT_API_URL=/product-api
VITE_INVENTORY_API_URL=/inventory-api
VITE_USER_API_URL=/user-api
VITE_CART_API_URL=/cart-api
VITE_CHECKOUT_API_URL=/checkout-api
VITE_PAYMENT_API_URL=/payment-api

VITE_API_TIMEOUT_MS=10000
VITE_DEFAULT_CURRENCY=USD
VITE_DEMO_CARD_LAST4=4242

VITE_ENABLE_ADVERTISEMENTS=true
VITE_ENABLE_RECOMMENDATIONS=false
VITE_ENABLE_CURRENCY=false
VITE_ENABLE_ASSISTANT=false
EOF

echo "==> Writing environment.js"

cat > "$APP/src/config/environment.js" <<'EOF'
function clean(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function number(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function bool(value, fallback = false) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return String(value).toLowerCase() === "true";
}

function apiUrl(value, localFallback, serviceName) {
  const configured = clean(value);

  if (configured) {
    return configured;
  }

  // Vite's PROD flag means "optimized build", not that our AWS environment is PROD.
  // Any deployed build (DEV/QA/PROD) must receive an explicit backend URL.
  if (import.meta.env.PROD) {
    throw new Error(
      `${serviceName} API URL is missing from the deployed build configuration.`,
    );
  }

  return localFallback;
}

export const environment = Object.freeze({
  app: Object.freeze({
    name: import.meta.env.VITE_APP_NAME || "Boutique",
    environment: import.meta.env.VITE_APP_ENV || "dev",
  }),

  api: Object.freeze({
    productServiceUrl: apiUrl(
      import.meta.env.VITE_PRODUCT_API_URL,
      "/product-api",
      "Product",
    ),

    inventoryServiceUrl: apiUrl(
      import.meta.env.VITE_INVENTORY_API_URL,
      "/inventory-api",
      "Inventory",
    ),

    userServiceUrl: apiUrl(
      import.meta.env.VITE_USER_API_URL,
      "/user-api",
      "User",
    ),

    cartServiceUrl: apiUrl(
      import.meta.env.VITE_CART_API_URL,
      "/cart-api",
      "Cart",
    ),

    checkoutServiceUrl: apiUrl(
      import.meta.env.VITE_CHECKOUT_API_URL,
      "/checkout-api",
      "Checkout",
    ),

    paymentServiceUrl: apiUrl(
      import.meta.env.VITE_PAYMENT_API_URL,
      "/payment-api",
      "Payment",
    ),

    timeoutMs: number(import.meta.env.VITE_API_TIMEOUT_MS, 10000),
  }),

  development: Object.freeze({
    cardLast4: import.meta.env.VITE_DEMO_CARD_LAST4 || "4242",
  }),

  commerce: Object.freeze({
    defaultCurrency: import.meta.env.VITE_DEFAULT_CURRENCY || "USD",
  }),

  auth: Object.freeze({
    mode: import.meta.env.VITE_AUTH_MODE || "local",
    region: import.meta.env.VITE_COGNITO_REGION || "",
    userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || "",
    clientId: import.meta.env.VITE_COGNITO_CLIENT_ID || "",
  }),

  features: Object.freeze({
    advertisements: bool(
      import.meta.env.VITE_ENABLE_ADVERTISEMENTS,
      false,
    ),
    recommendations: bool(
      import.meta.env.VITE_ENABLE_RECOMMENDATIONS,
      false,
    ),
    currency: bool(
      import.meta.env.VITE_ENABLE_CURRENCY,
      false,
    ),
    assistant: bool(
      import.meta.env.VITE_ENABLE_ASSISTANT,
      false,
    ),
  }),
});
EOF

echo "==> Writing Vite local proxy configuration"

cat > "$APP/vite.config.js" <<'EOF'
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
EOF

echo "==> Hardening API client"

cat > "$APP/src/api/apiClient.js" <<'EOF'
import axios from "axios";
import { environment } from "../config/environment";

function createApiError(error) {
  const status = error.response?.status ?? null;
  const responseData = error.response?.data;

  const message =
    responseData?.detail ||
    responseData?.message ||
    responseData?.error ||
    error.message ||
    "An unexpected API error occurred.";

  const apiError = new Error(message);

  apiError.name = "ApiError";
  apiError.status = status;
  apiError.data = responseData;
  apiError.originalError = error;

  return apiError;
}

export function createApiClient(baseURL) {
  if (!baseURL) {
    throw new Error("API client baseURL is required.");
  }

  const apiClient = axios.create({
    baseURL,
    timeout: environment.api.timeoutMs,
    headers: {
      Accept: "application/json",
    },
  });

  apiClient.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(createApiError(error)),
  );

  return apiClient;
}
EOF

echo "==> Removing currently unused route imports"

if [[ -f "$APP/src/App.jsx" ]]; then
  sed -i '/import SignupPage from "\.\/pages\/SignupPage";/d' "$APP/src/App.jsx"
  sed -i '/import LoginPage from "\.\/pages\/LoginPage";/d' "$APP/src/App.jsx"
fi

echo "==> Writing DEV deployment workflow"

mkdir -p "$(dirname "$WORKFLOW")"

cat > "$WORKFLOW" <<'EOF'
name: Deploy Boutique Frontend DEV

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  id-token: write

env:
  AWS_REGION: us-east-1
  S3_BUCKET: boutique-dev-frontend
  CLOUDFRONT_DISTRIBUTION_ID: E3SF8B4MHWNVIT
  APP_DIR: react-app

  # AWS environment = DEV.
  # Vite still performs an optimized build when npm run build is executed.
  VITE_APP_NAME: Boutique
  VITE_APP_ENV: dev

  # All browser API traffic enters through the shared DEV ALB hostname.
  VITE_PRODUCT_API_URL: https://api.needystuff.in
  VITE_INVENTORY_API_URL: https://api.needystuff.in
  VITE_USER_API_URL: https://api.needystuff.in
  VITE_CART_API_URL: https://api.needystuff.in
  VITE_CHECKOUT_API_URL: https://api.needystuff.in
  VITE_PAYMENT_API_URL: https://api.needystuff.in

  VITE_API_TIMEOUT_MS: "10000"
  VITE_DEFAULT_CURRENCY: USD
  VITE_DEMO_CARD_LAST4: "4242"

  VITE_ENABLE_ADVERTISEMENTS: "true"
  VITE_ENABLE_RECOMMENDATIONS: "false"
  VITE_ENABLE_CURRENCY: "false"
  VITE_ENABLE_ASSISTANT: "false"

jobs:
  deploy:
    runs-on: self-hosted

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Show runner information
        run: |
          echo "Runner name: $RUNNER_NAME"
          echo "Runner OS: $RUNNER_OS"
          echo "Runner arch: $RUNNER_ARCH"
          hostname
          whoami
          pwd

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: npm
          cache-dependency-path: react-app/package-lock.json

      - name: Install dependencies
        working-directory: react-app
        run: npm ci

      - name: Lint frontend
        working-directory: react-app
        run: npm run lint

      - name: SonarQube Scan
        uses: SonarSource/sonarqube-scan-action@v6
        with:
          projectBaseDir: react-app
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}

      - name: SonarQube Quality Gate
        uses: SonarSource/sonarqube-quality-gate-action@v1
        with:
          scanMetadataReportFile: react-app/.scannerwork/report-task.txt
        timeout-minutes: 5
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}

      - name: Trivy filesystem security scan
        run: trivy --config trivy.yaml fs react-app

      - name: Build DEV frontend
        working-directory: react-app
        run: npm run build

      - name: Validate DEV bundle
        working-directory: react-app
        run: |
          test -f dist/index.html
          test -d dist/assets

          if grep -R -E 'http://localhost:808[0-9]' dist/; then
            echo "ERROR: localhost backend URL found in deployable DEV bundle."
            exit 1
          fi

          for proxy in \
            /product-api \
            /inventory-api \
            /user-api \
            /cart-api \
            /checkout-api \
            /payment-api
          do
            if grep -R "$proxy" dist/; then
              echo "ERROR: local Vite proxy $proxy found in deployable DEV bundle."
              exit 1
            fi
          done

          if ! grep -R "api.needystuff.in" dist/ >/dev/null; then
            echo "ERROR: DEV API hostname was not compiled into the bundle."
            exit 1
          fi

          echo "DEV frontend bundle validation passed."

      - name: Authenticate to AWS using OIDC
        uses: aws-actions/configure-aws-credentials@v5
        with:
          role-to-assume: arn:aws:iam::663130434910:role/BoutiqueFrontendDeployRole
          aws-region: ${{ env.AWS_REGION }}

      - name: Verify AWS identity
        run: aws sts get-caller-identity

      - name: Upload hashed assets
        working-directory: react-app
        run: |
          aws s3 sync dist/assets/ \
            s3://${S3_BUCKET}/assets/ \
            --delete \
            --cache-control "public,max-age=31536000,immutable"

      - name: Upload static files
        working-directory: react-app
        run: |
          aws s3 sync dist/ \
            s3://${S3_BUCKET}/ \
            --delete \
            --exclude "assets/*"

      - name: Upload index.html with no-cache
        working-directory: react-app
        run: |
          aws s3 cp dist/index.html \
            s3://${S3_BUCKET}/index.html \
            --cache-control "no-cache,no-store,must-revalidate" \
            --content-type "text/html"

      - name: Verify deployed index.html
        working-directory: react-app
        run: |
          LOCAL_JS=$(grep -oE 'assets/index-[^"]+\.js' dist/index.html | head -1)
          REMOTE_JS=$(aws s3 cp s3://${S3_BUCKET}/index.html - \
            | grep -oE 'assets/index-[^"]+\.js' \
            | head -1)

          echo "Local bundle:  $LOCAL_JS"
          echo "Remote bundle: $REMOTE_JS"

          test "$LOCAL_JS" = "$REMOTE_JS"

      - name: Invalidate CloudFront
        run: |
          INVALIDATION_ID=$(aws cloudfront create-invalidation \
            --distribution-id "${CLOUDFRONT_DISTRIBUTION_ID}" \
            --paths "/*" \
            --query 'Invalidation.Id' \
            --output text)

          echo "Invalidation ID: $INVALIDATION_ID"

          aws cloudfront wait invalidation-completed \
            --distribution-id "${CLOUDFRONT_DISTRIBUTION_ID}" \
            --id "${INVALIDATION_ID}"

      - name: Verify website
        run: |
          STATUS=$(curl \
            -s \
            -o /tmp/site.html \
            -w "%{http_code}" \
            https://needystuff.in/)

          echo "HTTP status: $STATUS"
          test "$STATUS" = "200"
          grep -q '<div id="root">' /tmp/site.html

          echo "Boutique DEV frontend deployment successful."
EOF

echo
echo "==> Checking tooling"

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js is not installed."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm is not installed."
  exit 1
fi

echo "Node: $(node --version)"
echo "npm : $(npm --version)"

echo
echo "==> Installing exact dependencies from package-lock.json"
(
  cd "$APP" &&
  npm ci
) || {
  echo "ERROR: npm ci failed."
  exit 1
}

echo
echo "==> Running lint"
(
  cd "$APP" &&
  npm run lint
) || {
  echo "ERROR: lint failed. Fix reported source issues before deployment."
  exit 1
}

echo
echo "==> Building deployable DEV bundle"

(
  cd "$APP" &&

  VITE_APP_NAME="Boutique" \
  VITE_APP_ENV="dev" \
  VITE_PRODUCT_API_URL="https://api.needystuff.in" \
  VITE_INVENTORY_API_URL="https://api.needystuff.in" \
  VITE_USER_API_URL="https://api.needystuff.in" \
  VITE_CART_API_URL="https://api.needystuff.in" \
  VITE_CHECKOUT_API_URL="https://api.needystuff.in" \
  VITE_PAYMENT_API_URL="https://api.needystuff.in" \
  VITE_API_TIMEOUT_MS="10000" \
  VITE_DEFAULT_CURRENCY="USD" \
  VITE_DEMO_CARD_LAST4="4242" \
  VITE_ENABLE_ADVERTISEMENTS="true" \
  VITE_ENABLE_RECOMMENDATIONS="false" \
  VITE_ENABLE_CURRENCY="false" \
  VITE_ENABLE_ASSISTANT="false" \
  npm run build
) || {
  echo "ERROR: DEV bundle build failed."
  exit 1
}

echo
echo "==> Validating deployable DEV bundle"

if grep -R -E 'http://localhost:808[0-9]' "$APP/dist/" >/dev/null 2>&1; then
  echo "ERROR: localhost backend URL exists in dist/."
  exit 1
fi

for proxy in \
  /product-api \
  /inventory-api \
  /user-api \
  /cart-api \
  /checkout-api \
  /payment-api
do
  if grep -R "$proxy" "$APP/dist/" >/dev/null 2>&1; then
    echo "ERROR: local Vite proxy $proxy exists in dist/."
    exit 1
  fi
done

if ! grep -R "api.needystuff.in" "$APP/dist/" >/dev/null 2>&1; then
  echo "ERROR: api.needystuff.in is missing from dist/."
  exit 1
fi

echo
echo "============================================================"
echo "FRONTEND DEV REVIVE COMPLETED"
echo "============================================================"
echo "AWS environment        : DEV"
echo "Frontend               : https://needystuff.in"
echo "Shared API             : https://api.needystuff.in"
echo "Product API            : /api/v1/products"
echo "Inventory API          : /api/v1/inventory"
echo "User API               : /api/v1/users"
echo "Cart API               : /api/v1/carts"
echo "Checkout API           : /api/v1/checkouts"
echo "Payment API            : /api/v1/payments"
echo
echo "Backups are at:"
echo "  $BACKUP"
echo
echo "NO git commit/push or AWS deployment was performed."
echo
echo "Next:"
echo "  cd \"$REPO\""
echo "  git diff"
echo "  git status"
