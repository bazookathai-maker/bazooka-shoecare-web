import { useRef, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useLocale } from '../i18n/LocaleContext';
import './AddToCartButton.css';

export default function AddToCartButton({ product, mediaRef: externalMediaRef }) {
  const { addToCart, pending, hydrating } = useCart();
  const { t } = useLocale();
  const internalMediaRef = useRef(null);
  const mediaRef = externalMediaRef ?? internalMediaRef;
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState('');

  const canAdd = Number.isFinite(Number(product?.id));

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLocalError('');

    if (!canAdd) {
      setLocalError(t.commerce.unavailable);
      return;
    }

    const img =
      mediaRef.current?.querySelector('img') ?? mediaRef.current ?? null;

    setBusy(true);
    try {
      await addToCart(product, img);
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : t.commerce.failed,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="add-to-cart-wrap"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <button
        type="button"
        className="add-to-cart"
        onClick={handleClick}
        disabled={!canAdd || busy || pending || hydrating}
        aria-label={hydrating ? t.commerce.preparing : t.commerce.addedLabel(product?.name || '')}
      >
        {hydrating ? t.commerce.preparing : busy ? t.commerce.adding : t.commerce.add}
      </button>
      {localError ? (
        <p className="add-to-cart__error" role="alert">
          {localError}
        </p>
      ) : null}
    </div>
  );
}
