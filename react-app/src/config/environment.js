function clean(value){return String(value||"").trim().replace(/\/+$/,"");}
function text(value,fallback){const v=clean(value);return v||fallback;}
function number(value,fallback){const n=Number(value);return Number.isFinite(n)?n:fallback;}
function bool(value,fallback=false){if(value===undefined||value===null||value==="")return fallback;return String(value).toLowerCase()==="true";}
export const environment=Object.freeze({
 app:Object.freeze({name:import.meta.env.VITE_APP_NAME||"Boutique",environment:import.meta.env.VITE_APP_ENV||"local"}),
 api:Object.freeze({productServiceUrl:text(import.meta.env.VITE_PRODUCT_API_URL,"http://localhost:8080"),inventoryServiceUrl:text(import.meta.env.VITE_INVENTORY_API_URL,"http://localhost:8081"),userServiceUrl:text(import.meta.env.VITE_USER_API_URL,"http://localhost:8082"),cartServiceUrl:text(import.meta.env.VITE_CART_API_URL,"http://localhost:8083"),checkoutServiceUrl:text(import.meta.env.VITE_CHECKOUT_API_URL,"http://localhost:8086"),paymentServiceUrl:text(import.meta.env.VITE_PAYMENT_API_URL,"http://localhost:8085"),timeoutMs:number(import.meta.env.VITE_API_TIMEOUT_MS,10000)}),
 development:Object.freeze({cardLast4:import.meta.env.VITE_DEMO_CARD_LAST4||"4242"}),
 commerce:Object.freeze({defaultCurrency:import.meta.env.VITE_DEFAULT_CURRENCY||"INR"}),
 auth:Object.freeze({mode:import.meta.env.VITE_AUTH_MODE||"local",region:import.meta.env.VITE_COGNITO_REGION||"",userPoolId:import.meta.env.VITE_COGNITO_USER_POOL_ID||"",clientId:import.meta.env.VITE_COGNITO_CLIENT_ID||""}),
 features:Object.freeze({advertisements:bool(import.meta.env.VITE_ENABLE_ADVERTISEMENTS,false),recommendations:false,currency:bool(import.meta.env.VITE_ENABLE_CURRENCY,false),assistant:bool(import.meta.env.VITE_ENABLE_ASSISTANT,false)})
});
