import { useRef } from 'react';
import { useCart } from '../context/CartContext';
import './AddToCartButton.css';

export default function AddToCartButton({ product, mediaRef: externalMediaRef }) {
  const { addToCart } = useCart();
  const internalMediaRef = useRef(null);
  const mediaRef = externalMediaRef ?? internalMediaRef;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const img =
      mediaRef.current?.querySelector('img') ?? mediaRef.current ?? null;
    addToCart(product, img);
  };

  return (
    <button
      type="button"
      className="add-to-cart"
      onClick={handleClick}
      aria-label={`เพิ่ม ${product.name} ลงตะกร้า`}
    >
      เพิ่มลงตะกร้า
    </button>
  );
}
