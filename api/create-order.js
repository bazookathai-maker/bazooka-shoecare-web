import {
  createWooCommerceOrder,
  readJsonBody,
} from '../server/wooCreateOrder.js';
import {
  requireSessionCustomer,
  saveCustomerAddressesFromOrder,
} from '../server/wooCustomerAuth.js';

function setCors(res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
}

/**
 * Vercel serverless: POST /api/create-order
 * Secrets stay on the server (WOOCOMMERCE_* env vars).
 */
export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ message: 'Method Not Allowed' }));
    return;
  }

  try {
    // Members only: the order owner comes from the verified session, never the body.
    const { session, customer } = await requireSessionCustomer(req);
    const payload = await readJsonBody(req);
    delete payload.customer_id;
    // Only Stripe PromptPay is accepted from this storefront.
    const method = String(payload.paymentMethod || payload.payment_method || '').trim();
    if (method !== 'stripe_promptpay') {
      res.statusCode = 400;
      res.end(
        JSON.stringify({
          message:
            'วิธีชำระเงินไม่ถูกต้อง — รองรับเฉพาะพร้อมเพย์ผ่าน Stripe (stripe_promptpay)',
        }),
      );
      return;
    }
    const saveAddressToProfile = payload.saveAddressToProfile === true;
    delete payload.saveAddressToProfile;
    payload.customer_id = Number(customer.id);
    if (payload.billing && typeof payload.billing === 'object' && !payload.billing.email) {
      payload.billing.email = String(customer.email || '').trim();
    }
    const result = await createWooCommerceOrder(payload);
    if (saveAddressToProfile) {
      try {
        await saveCustomerAddressesFromOrder(session, payload.shipping);
      } catch (profileErr) {
        // Saving the profile must never block a created order.
        console.warn('[create-order] profile address not saved', {
          status: profileErr?.status,
        });
      }
    }
    res.statusCode = 200;
    res.end(JSON.stringify(result));
  } catch (err) {
    const status = Number(err?.status) || 500;
    res.statusCode = status;
    res.end(
      JSON.stringify({
        message:
          err instanceof Error ? err.message : 'สร้างคำสั่งซื้อไม่สำเร็จ',
        code: err?.data?.code || undefined,
      }),
    );
  }
}
