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
  throw new Error(
    (data && typeof data.message === 'string' && data.message.trim()) ||
      fallback,
  );
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

export async function loginCustomerAccount({ email, password }) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      ...authHeaders(''),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  });
  const data = await parseJson(response);
  if (!response.ok) {
    throwApiError(data, 'เข้าสู่ระบบไม่สำเร็จ');
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

export async function updateCustomerBilling(billing, token = getCustomerToken()) {
  const response = await fetch('/api/auth/update-billing', {
    method: 'PUT',
    headers: {
      ...authHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ billing }),
    cache: 'no-store',
  });
  const data = await parseJson(response);
  if (!response.ok) {
    throwApiError(data, 'อัปเดตข้อมูลบัญชีไม่สำเร็จ');
  }
  return data?.customer ?? null;
}
