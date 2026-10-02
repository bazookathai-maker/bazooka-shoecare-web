const TOKEN_KEY = 'bazooka_customer_token';

export function getCustomerToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setCustomerToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Ignore storage failures
  }
}

export function clearCustomerToken() {
  setCustomerToken('');
}

export function authHeaders(token = getCustomerToken()) {
  const headers = {
    Accept: 'application/json',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function throwApiError(data, fallback) {
  const err = new Error(
    (data && typeof data.message === 'string' && data.message.trim()) ||
      fallback,
  );
  if (data && typeof data.code === 'string') err.code = data.code;
  if (data && typeof data.linkTicket === 'string') err.linkTicket = data.linkTicket;
  if (data && typeof data.email === 'string') err.email = data.email;
  throw err;
}

/** Headers for same-origin state-changing auth calls (checked by the server). */
function sameOriginJsonHeaders() {
  return {
    ...authHeaders(''),
    'Content-Type': 'application/json',
    'X-Bazooka-Auth': '1',
  };
}

export async function registerCustomerAccount({
  email,
  password,
  firstName,
  lastName,
}) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      ...authHeaders(''),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, firstName, lastName }),
    cache: 'no-store',
  });
  const data = await parseJson(response);
  if (!response.ok) {
    throwApiError(data, 'สมัครบัญชีไม่สำเร็จ');
  }
  return data;
}

export async function loginCustomerAccount({ email, password, googleLinkTicket }) {
  const body = { email, password };
  if (googleLinkTicket) body.googleLinkTicket = googleLinkTicket;
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: sameOriginJsonHeaders(),
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const data = await parseJson(response);
  if (!response.ok) {
    throwApiError(data, 'เข้าสู่ระบบไม่สำเร็จ');
  }
  return data;
}

/** WordPress lost-password page; returns '' when unavailable so no dead link is shown. */
export async function fetchPasswordResetUrl() {
  try {
    const response = await fetch('/api/auth/password-reset', {
      method: 'GET',
      headers: authHeaders(''),
    });
    const data = await parseJson(response);
    const url = response.ok && typeof data?.url === 'string' ? data.url : '';
    return /^https:\/\//.test(url) ? url : '';
  } catch {
    return '';
  }
}

/** Fetch GIS client id + a fresh single-use nonce (sets an HttpOnly cookie). */
export async function fetchGoogleSignInConfig() {
  const response = await fetch('/api/auth/google-config', {
    method: 'GET',
    headers: authHeaders(''),
    credentials: 'same-origin',
    cache: 'no-store',
  });
  const data = await parseJson(response);
  if (!response.ok) {
    throwApiError(data, 'โหลดการตั้งค่า Google ไม่สำเร็จ');
  }
  return {
    enabled: Boolean(data?.enabled && data?.clientId && data?.nonce),
    clientId: data?.clientId || '',
    nonce: data?.nonce || '',
  };
}

export async function loginWithGoogleCredential(credential) {
  const response = await fetch('/api/auth/google', {
    method: 'POST',
    headers: sameOriginJsonHeaders(),
    credentials: 'same-origin',
    body: JSON.stringify({ credential }),
    cache: 'no-store',
  });
  const data = await parseJson(response);
  if (!response.ok) {
    throwApiError(data, 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ');
  }
  return data;
}

export async function fetchCustomerProfile(token = getCustomerToken()) {
  const response = await fetch('/api/auth/me', {
    method: 'GET',
    headers: authHeaders(token),
    cache: 'no-store',
  });
  const data = await parseJson(response);
  if (!response.ok) {
    throwApiError(data, 'โหลดข้อมูลบัญชีไม่สำเร็จ');
  }
  return data?.customer ?? null;
}

export async function fetchCustomerOrders(token = getCustomerToken()) {
  const response = await fetch('/api/auth/orders', {
    method: 'GET',
    headers: authHeaders(token),
    cache: 'no-store',
  });
  const data = await parseJson(response);
  if (!response.ok) {
    throwApiError(data, 'โหลดประวัติคำสั่งซื้อไม่สำเร็จ');
  }
  return Array.isArray(data?.orders) ? data.orders : [];
}

/** Save name / phone / address for the signed-in customer (Woo billing + shipping). */
export async function updateCustomerProfile(address, token = getCustomerToken()) {
  const response = await fetch('/api/auth/profile', {
    method: 'PUT',
    headers: {
      ...authHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ address }),
    cache: 'no-store',
  });
  const data = await parseJson(response);
  if (!response.ok) {
    throwApiError(data, 'บันทึกข้อมูลบัญชีไม่สำเร็จ');
  }
  return data?.customer ?? null;
}
