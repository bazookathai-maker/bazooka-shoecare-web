/**
 * In-memory checkout draft. It survives a TH/EN route change because it lives
 * outside the page component, and it is cleared on logout, account switch,
 * and after an order is handed to payment.
 * Nothing here is written to localStorage.
 */

const EMPTY = { owner: '', form: null, paymentMethod: '', touched: [] };

let draft = { ...EMPTY };

export function readCheckoutDraft(owner) {
  if (!owner || draft.owner !== owner || !draft.form) return null;
  return {
    form: { ...draft.form },
    paymentMethod: draft.paymentMethod,
    touched: [...draft.touched],
  };
}

export function writeCheckoutDraft(owner, { form, paymentMethod = '', touched = [] } = {}) {
  if (!owner || !form) return;
  draft = {
    owner,
    form: { ...form },
    paymentMethod: typeof paymentMethod === 'string' ? paymentMethod : '',
    touched: [...touched],
  };
}

export function clearCheckoutDraft() {
  draft = { ...EMPTY };
}
