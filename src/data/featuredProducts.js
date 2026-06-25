import { allProducts, BESTSELLER_LISTING_IMAGES } from './products';

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

const curatedProducts = BESTSELLER_LISTING_IMAGES.map(pickShopProduct);

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
