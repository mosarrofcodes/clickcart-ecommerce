const isLive = process.env.SSLCOMMERZ_IS_LIVE === "true";

const GATEWAY_URL = isLive
  ? "https://securepay.sslcommerz.com"
  : "https://sandbox.sslcommerz.com";

const INIT_URL = `${GATEWAY_URL}/gwprocess/v4/process.php`;
const VALIDATE_URL = `${GATEWAY_URL}/validator/api/validationserver.php`;
const VERIFY_URL = `${GATEWAY_URL}/merchant/merAPIGateway.php`;

function getStoreConfig() {
  const storeId = process.env.SSLCOMMERZ_STORE_ID;
  const storePasswd = process.env.SSLCOMMERZ_STORE_PASSWD;
  if (!storeId || !storePasswd) {
    throw new Error("SSLCOMMERZ_STORE_ID and SSLCOMMERZ_STORE_PASSWD must be set");
  }
  return { storeId, storePasswd };
}

export interface SslInitPayload {
  total_amount: number;
  currency: string;
  tran_id: string;
  success_url: string;
  fail_url: string;
  cancel_url: string;
  ipn_url: string;
  product_name: string;
  product_category: string;
  product_profile: string;
  cus_name: string;
  cus_email: string;
  cus_add1: string;
  cus_city: string;
  cus_state: string;
  cus_postcode: string;
  cus_country: string;
  cus_phone: string;
  ship_name?: string;
  ship_add1?: string;
  ship_city?: string;
  ship_state?: string;
  ship_postcode?: string;
  ship_country?: string;
}

export interface SslInitResponse {
  status: "SUCCESS" | "FAILED" | "CANCELLED";
  failedreason?: string;
  sessionkey?: string;
  GatewayPageURL?: string;
  redirectGatewayURL?: string;
  directPaymentURL?: string;
  checoutPageURL?: string;
}

export interface SslValidationResponse {
  status: "VALID" | "INVALID" | "FAILED";
  tran_date?: string;
  tran_id?: string;
  val_id?: string;
  amount?: number;
  currency?: string;
  store_amount?: number;
  bank_tran_id?: string;
  card_type?: string;
  card_no?: string;
  card_issuer?: string;
  card_brand?: string;
  failedreason?: string;
  transaction_info?: Record<string, unknown>;
}

export interface SslVerifyResponse {
  APIConnect: string;
  status: string;
  tran_date?: string;
  tran_id?: string;
  val_id?: string;
  amount?: number;
  currency?: string;
  store_amount?: number;
  bank_tran_id?: string;
  card_type?: string;
  card_no?: string;
  card_issuer?: string;
  card_brand?: string;
  status_details?: string;
  error?: string;
}

export async function initSslSession(
  payload: SslInitPayload,
): Promise<SslInitResponse> {
  const { storeId, storePasswd } = getStoreConfig();

  const formData = new URLSearchParams();
  formData.append("store_id", storeId);
  formData.append("store_passwd", storePasswd);
  formData.append("total_amount", String(payload.total_amount));
  formData.append("currency", payload.currency);
  formData.append("tran_id", payload.tran_id);
  formData.append("success_url", payload.success_url);
  formData.append("fail_url", payload.fail_url);
  formData.append("cancel_url", payload.cancel_url);
  formData.append("ipn_url", payload.ipn_url);
  formData.append("product_name", payload.product_name);
  formData.append("product_category", payload.product_category);
  formData.append("product_profile", payload.product_profile);
  formData.append("cus_name", payload.cus_name);
  formData.append("cus_email", payload.cus_email);
  formData.append("cus_add1", payload.cus_add1);
  formData.append("cus_city", payload.cus_city);
  formData.append("cus_state", payload.cus_state);
  formData.append("cus_postcode", payload.cus_postcode);
  formData.append("cus_country", payload.cus_country);
  formData.append("cus_phone", payload.cus_phone);

  if (payload.ship_name) formData.append("ship_name", payload.ship_name);
  if (payload.ship_add1) formData.append("ship_add1", payload.ship_add1);
  if (payload.ship_city) formData.append("ship_city", payload.ship_city);
  if (payload.ship_state) formData.append("ship_state", payload.ship_state);
  if (payload.ship_postcode) formData.append("ship_postcode", payload.ship_postcode);
  if (payload.ship_country) formData.append("ship_country", payload.ship_country);

  const res = await fetch(INIT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });

  if (!res.ok) {
    throw new Error(`SSLCommerz init failed: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<SslInitResponse>;
}

export async function validateSslSession(
  sessionKey: string,
  amount: number,
  tranId: string,
): Promise<SslValidationResponse> {
  const { storeId, storePasswd } = getStoreConfig();

  const url = new URL(VALIDATE_URL);
  url.searchParams.set("store_id", storeId);
  url.searchParams.set("store_passwd", storePasswd);
  url.searchParams.set("sessionkey", sessionKey);
  url.searchParams.set("amount", String(amount));
  url.searchParams.set("tran_id", tranId);

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error(`SSLCommerz validation failed: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<SslValidationResponse>;
}

export async function verifySslPayment(
  valId: string,
  amount: number,
  tranId: string,
): Promise<SslVerifyResponse> {
  const { storeId, storePasswd } = getStoreConfig();

  const url = new URL(VERIFY_URL);
  url.searchParams.set("store_id", storeId);
  url.searchParams.set("store_passwd", storePasswd);
  url.searchParams.set("validation_id", valId);
  url.searchParams.set("amount", String(amount));
  url.searchParams.set("tran_id", tranId);

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error(`SSLCommerz verify failed: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<SslVerifyResponse>;
}
