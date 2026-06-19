const STORAGE_KEY = 'bazooka_orders';

export const ORDER_STATUS_STEPS = [
  { id: 'received', label: 'รับคำสั่งซื้อแล้ว' },
  { id: 'preparing', label: 'กำลังเตรียมสินค้า' },
  { id: 'shipped', label: 'จัดส่งแล้ว' },
  { id: 'completed', label: 'สำเร็จ' },
];

export const DEFAULT_ORDER_STATUS = 'received';

export const PAYMENT_LABELS = {
  bank: 'โอนเงินผ่านธนาคาร',
  promptpay: 'คิวอาร์ พร้อมเพย์',
  cod: 'เก็บเงินปลายทาง',
};

function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '');
}

function formatDatePart(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

export function getAllOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function generateOrderId(date = new Date()) {
  const orders = getAllOrders();
  const datePart = formatDatePart(date);
  const prefix = `BZK-${datePart}-`;
  const sameDayCount = orders.filter((order) => order.id?.startsWith(prefix)).length;
  const sequence = String(sameDayCount + 1).padStart(4, '0');
  return `${prefix}${sequence}`;
}

export function saveOrder(order) {
  const orders = getAllOrders();
  orders.unshift(order);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  return order;
}

export function getOrderById(orderId) {
  const trimmedId = String(orderId || '').trim();
  if (!trimmedId) return null;
  return getAllOrders().find((order) => order.id === trimmedId) ?? null;
}

export function findOrderByIdAndPhone(orderId, phone) {
  const trimmedId = String(orderId || '').trim();
  const normalizedPhone = normalizePhone(phone);
  if (!trimmedId || !normalizedPhone) return null;

  return (
    getAllOrders().find(
      (order) =>
        order.id === trimmedId &&
        normalizePhone(order.customer?.phone) === normalizedPhone,
    ) ?? null
  );
}

export function getStatusStepIndex(statusId) {
  const index = ORDER_STATUS_STEPS.findIndex((step) => step.id === statusId);
  return index >= 0 ? index : 0;
}

export function createOrderFromCheckout({ payload, payment, items, total }) {
  const createdAt = new Date();

  return {
    id: generateOrderId(createdAt),
    status: DEFAULT_ORDER_STATUS,
    createdAt: createdAt.toISOString(),
    customer: payload.customer,
    address: payload.address,
    note: payload.note,
    payment,
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
    })),
    total,
  };
}
