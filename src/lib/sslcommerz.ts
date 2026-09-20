import { createHash } from "crypto";

const isLive = process.env.SSLCOMMERZ_IS_LIVE === "true";

const GATEWAY_URL = isLive
  ? "https://securepay.sslcommerz.com"
  : "https://sandbox.sslcommerz.com";

const INIT_URL = `${GATEWAY_URL}/gwprocess/v4/api.php`;
const VALIDATE_URL = `${GATEWAY_URL}/validator/api/validationserverAPI.php`;
const VERIFY_URL = `${GATEWAY_URL}/validator/api/validationserverAPI.php`;

function getStoreConfig() {
  const storeId = process.env.SSLCOMMERZ_STORE_ID;
  const storePasswd = process.env.SSLCOMMERZ_STORE_PASSWD;
  if (!storeId || !storePasswd) {
    throw new Error("SSLCOMMERZ_STORE_ID and SSLCOMMERZ_STORE_PASSWD must be set");
  }
  return { storeId, storePasswd };
}

/** Generates a unique SSLCommerz tran_id (alphanumeric, <= 30 chars). */
export function generateTranId(): string {
  const now = new Date();
  const ymd = [
    String(now.getFullYear()).slice(2),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const time = now.getTime().toString(36).slice(-4).toUpperCase();
  return `CC${ymd}${time}${rand}`;
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
  payment_method?: string;
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
  if (payload.payment_method)
    formData.append("payment_method", payload.payment_method);

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

/** Verifies a transaction against a session key (Direct API flow). */
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

/**
 * Verifies a completed payment using the gateway `val_id` (Order Validation API).
 * This is the authoritative check used in the success callback and IPN.
 */
export async function verifySslPayment(
  valId: string,
  amount: number,
  tranId: string,
): Promise<SslVerifyResponse> {
  const { storeId, storePasswd } = getStoreConfig();

  const url = new URL(VERIFY_URL);
  url.searchParams.set("val_id", String(valId));
  url.searchParams.set("store_id", storeId);
  url.searchParams.set("store_passwd", storePasswd);
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error(`SSLCommerz verify failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as SslVerifyResponse;

  // Cross-check the gateway echo against the expected transaction.
  if (data.tran_id && data.tran_id !== tranId) {
    return { ...data, APIConnect: "INVALID", status: "INVALID" };
  }

  return data;
}

type VerifySignatureResult = {
  valid: boolean;
  method: "sha2" | "md5" | "none";
};

/**
 * Verifies the IPN signature SSLCommerz includes (verify_key / verify_sign /
 * verify_sign_sha2). SHA2 is preferred; MD5 is accepted when sent alone.
 */
export function verifyIpnSignature(
  form: URLSearchParams,
): VerifySignatureResult {
  const { storePasswd } = getStoreConfig();
  const verifyKey = form.get("verify_key");
  if (!verifyKey) {
    return { valid: false, method: "none" };
  }

  const keys = verifyKey.split(",").map((k) => k.trim()).filter(Boolean);
  if (keys.length === 0) return { valid: false, method: "none" };

  const values = keys.map((key) => form.get(key) ?? "");
  const signatureStr = values.join("&");

  const md5 = createHash("md5").update(signatureStr).digest("hex");
  const salt = createHash("sha256").update(String(storePasswd)).digest("hex");
  const sha2 = createHash("sha256").update(`${salt}${signatureStr}`).digest("hex");

  const sha2Match = form.get("verify_sign_sha2") === sha2;
  const md5Match = form.get("verify_sign") === md5;
  const hasSha2 = Boolean(form.get("verify_sign_sha2"));

  if (sha2Match) return { valid: true, method: "sha2" };
  if (!hasSha2 && md5Match) return { valid: true, method: "md5" };
  return { valid: false, method: hasSha2 ? "sha2" : "md5" };
}