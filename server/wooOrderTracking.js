/**
 * Customer-facing order status labels + shipment tracking (Advanced Shipment
 * Tracking plugin) for WooCommerce orders. Server-only.
 */

import { resolveWooSiteOrigin } from './wooCreateOrder.js';

const TRACKING_META_KEY = '_wc_shipment_tracking_items';
const SENSITIVE_PLACEHOLDER = /^\[SENSITIVE]$/i;

/** Matches the store's status names (incl. custom preparing / shipped / delivered). */
export const ORDER_STATUS_LABELS = {
  pending: 'รอการชำระเงิน',
  processing: 'ชำระเงินแล้ว · กำลังเตรียมสินค้า',
  preparing: 'กำลังเตรียมสินค้า',
  'on-hold': 'รอตรวจสอบการชำระเงิน',
  shipped: 'จัดส่งแล้ว',
  completed: 'จัดส่งแล้ว',
  delivered: 'จัดส่งสำเร็จ',
  cancelled: 'ยกเลิก',
  refunded: 'คืนเงินแล้ว',
  failed: 'ชำระเงินไม่สำเร็จ',
  'checkout-draft': 'รอการชำระเงิน',
};

export function wooOrderStatusLabel(status) {
  const key = String(status || '').trim().toLowerCase();
  return ORDER_STATUS_LABELS[key] || key;
}

function cleanEnvValue(value) {
  const raw = String(value || '').trim();
  if (!raw || SENSITIVE_PLACEHOLDER.test(raw)) return '';
  return raw;
}

function safeHttpsUrl(value) {
  try {
    const url = new URL(String(value || '').trim());
    return url.protocol === 'https:' ? url.toString() : '';
  } catch {
    return '';
  }
}

function trackingItemsFromMeta(order) {
  const row = (Array.isArray(order?.meta_data) ? order.meta_data : []).find(
    (item) => item?.key === TRACKING_META_KEY,
  );
  return Array.isArray(row?.value) ? row.value : [];
}

function mapMetaItem(item) {
  return {
    provider: String(
      item?.custom_tracking_provider || item?.tracking_provider || '',
    ).trim(),
    number: String(item?.tracking_number || '').trim(),
    link: safeHttpsUrl(item?.custom_tracking_link),
  };
}

function mapRestItem(item) {
  return {
    provider: String(item?.tracking_provider || '').trim(),
    number: String(item?.tracking_number || '').trim(),
    link: safeHttpsUrl(item?.tracking_link),
  };
}

/**
 * Tracking entries the shop added in WooCommerce. The AST REST endpoint gives
 * carrier display names + tracking links; raw order meta is the fallback.
 */
export async function getWooOrderShipmentTrackings(order) {
  const metaItems = trackingItemsFromMeta(order);
  if (!metaItems.length) return [];

  const fallback = metaItems.map(mapMetaItem).filter((t) => t.number);
  const siteOrigin = resolveWooSiteOrigin(cleanEnvValue(process.env.WOOCOMMERCE_URL));
  const key = cleanEnvValue(process.env.WOOCOMMERCE_CONSUMER_KEY);
  const secret = cleanEnvValue(process.env.WOOCOMMERCE_CONSUMER_SECRET);
  if (!siteOrigin || !key || !secret) return fallback;

  try {
    const response = await fetch(
      `${siteOrigin}/wp-json/wc-shipment-tracking/v3/orders/${encodeURIComponent(order.id)}/shipment-trackings`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`,
        },
        cache: 'no-store',
      },
    );
    if (!response.ok) return fallback;
    const data = await response.json();
    const rows = (Array.isArray(data) ? data : [])
      .map(mapRestItem)
      .filter((t) => t.number);
    return rows.length ? rows : fallback;
  } catch {
    return fallback;
  }
}
