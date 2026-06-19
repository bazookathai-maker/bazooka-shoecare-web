import { allProducts } from './products';

/** Same 6 listing images as home featured section — copy text from matching shop products */
const featuredImages = [
  '/products/product-26.jpg.jpg',
  '/products/product-8.jpg.png',
  '/products/product-2.jpg.png',
  '/products/product-11.jpg.png',
  '/products/product-5.jpg.jpg',
  '/products/product-23.jpg.PNG',
];

function pickShopProduct(image) {
  const product = allProducts.find((item) => item.image === image);
  if (!product) {
    throw new Error(`Shop product not found for image: ${image}`);
  }
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image,
    category: product.category,
  };
}

const curatedProducts = featuredImages.map(pickShopProduct);

export const featuredProductsList = curatedProducts.map((item, index) => ({
  id: item.id,
  name: item.name,
  description: item.description,
  price: item.price,
  image: item.image,
  category: item.category,
  listId: `featured-${index + 1}`,
}));

export const recommendedProductsList = curatedProducts.map((item, index) => ({
  id: item.id,
  name: item.name,
  description: item.description,
  price: item.price,
  image: item.image,
  category: item.category,
  listId: `recommended-${index + 1}`,
}));
