import { formatThaiProvince } from '../data/thaiWooStates';

const CART_ADDRESS_OWNER_KEY = 'bazooka_cart_address_owner';

export const emptyAddressForm = {
  firstName: '',
  lastName: '',
  phone: '',
  addressLine: '',
  province: '',
  district: '',
  subdistrict: '',
  street: '',
  postalCode: '',
  addressNote: '',
};

function splitAddress2Parts(address2) {
  return String(address2 || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Map Woo billing/shipping (address_2 = "ถนน…, แขวง, note") back to form fields. */
export function formFromWooAddresses(billing, shipping) {
  const bill = billing || {};
  const ship = shipping || bill;
  const address2Parts = splitAddress2Parts(ship.address_2 || bill.address_2);
  const street = address2Parts.find((part) => part.startsWith('ถนน')) || '';
  const remaining = address2Parts.filter((part) => part !== street);
  const subdistrict = remaining[0] || '';
  const addressNote = remaining.slice(1).join(', ');
  const stateCode = ship.state || bill.state || '';
  const province = formatThaiProvince(stateCode);

  return {
    firstName: String(bill.first_name || ship.first_name || '').trim(),
    lastName: String(bill.last_name || ship.last_name || '').trim(),
    email: String(bill.email || '').trim(),
    phone: String(bill.phone || ship.phone || '').trim(),
    addressLine: String(ship.address_1 || bill.address_1 || '').trim(),
    province,
    district: String(ship.city || bill.city || '').trim(),
    subdistrict,
    street: street.replace(/^ถนน/, ''),
    postalCode: String(ship.postcode || bill.postcode || '').trim(),
    addressNote,
  };
}

/** Saved profile of the signed-in customer → form fields (shipping preferred). */
export function formFromCustomerProfile(customer) {
  if (!customer) return { ...emptyAddressForm, email: '' };
  const billing = customer.billing || {};
  const shipping = customer.shipping?.address_1 ? customer.shipping : billing;
  const form = formFromWooAddresses(billing, shipping);
  return {
    ...form,
    firstName: form.firstName || String(customer.first_name || '').trim(),
    lastName: form.lastName || String(customer.last_name || '').trim(),
    email: String(customer.email || '').trim(),
  };
}

/**
 * The Store API cart keeps the last address sent to it. Remember which identity
 * sent it so checkout never pre-fills one account's address for another
 * (e.g. after logout on a shared browser).
 */
export function getCartAddressOwner() {
  try {
    return localStorage.getItem(CART_ADDRESS_OWNER_KEY) || '';
  } catch {
    return '';
  }
}

export function setCartAddressOwner(owner) {
  try {
    if (owner) localStorage.setItem(CART_ADDRESS_OWNER_KEY, owner);
    else localStorage.removeItem(CART_ADDRESS_OWNER_KEY);
  } catch {
    // Ignore storage failures
  }
}
