/**
 * Omise PromptPay create endpoint — DISABLED.
 * Online checkout uses xendit_gateway + WooCommerce payment_url instead.
 */
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  res.statusCode = 410;
  res.end(
    JSON.stringify({
      message:
        'Omise PromptPay ถูกปิดแล้ว — ใช้ xendit_gateway ผ่าน WooCommerce payment_url',
    }),
  );
}
