const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
const DURATION = 720;

export function flyToCart(imageSrc, fromRect, toRect) {
  return new Promise((resolve) => {
    const flyer = document.createElement('div');
    flyer.className = 'cart-flyer';
    flyer.setAttribute('aria-hidden', 'true');

    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = '';
    flyer.appendChild(img);

    const size = Math.min(fromRect.width, fromRect.height, 88);
    const startX = fromRect.left + fromRect.width / 2;
    const startY = fromRect.top + fromRect.height / 2;
    const endX = toRect.left + toRect.width / 2;
    const endY = toRect.top + toRect.height / 2;

    Object.assign(flyer.style, {
      position: 'fixed',
      left: `${startX}px`,
      top: `${startY}px`,
      width: `${size}px`,
      height: `${size}px`,
      zIndex: '9999',
      pointerEvents: 'none',
    });

    document.body.appendChild(flyer);

    const deltaX = endX - startX;
    const deltaY = endY - startY;

    const animation = flyer.animate(
      [
        {
          transform: 'translate(-50%, -50%) scale(1)',
          opacity: 1,
        },
        {
          transform: `translate(calc(-50% + ${deltaX * 0.45}px), calc(-50% + ${deltaY * 0.35}px)) scale(0.55)`,
          opacity: 0.92,
          offset: 0.55,
        },
        {
          transform: `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px)) scale(0.12)`,
          opacity: 0.35,
        },
      ],
      {
        duration: DURATION,
        easing: EASING,
        fill: 'forwards',
      },
    );

    animation.onfinish = () => {
      flyer.remove();
      resolve();
    };
  });
}
