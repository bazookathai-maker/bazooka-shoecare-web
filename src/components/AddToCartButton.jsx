import { useRef, useState } from 'react';
import { useCart } from '../context/CartContext';
import './AddToCartButton.css';

export default function AddToCartButton({ product, mediaRef: externalMediaRef }) {
  const { addToCart, pending } = useCart();
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
      setLocalError('สินค้านี้ยังไม่พร้อมเพิ่มลงตะกร้า');
      return;
    }

    const img =
      mediaRef.current?.querySelector('img') ?? mediaRef.current ?? null;

    setBusy(true);
    try {
      await addToCart(product, img);
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : 'เพิ่มสินค้าลงตะกร้าไม่สำเร็จ',
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
        disabled={!canAdd || busy || pending}
        aria-label={`เพิ่ม ${product?.name || 'สินค้า'} ลงตะกร้า`}
      >
        {busy ? 'กำลังเพิ่ม...' : 'เพิ่มลงตะกร้า'}
      </button>
      {localError ? (
        <p className="add-to-cart__error" role="alert">
          {localError}
        </p>
      ) : null}
    </div>
  );
}
