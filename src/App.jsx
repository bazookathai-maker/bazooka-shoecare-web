import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import ScrollToTop from './components/ScrollToTop';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import FeaturedProducts from './pages/FeaturedProducts';
import Recommended from './pages/Recommended';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import Reviews from './pages/Reviews';
import Faq from './pages/Faq';
import Contact from './pages/Contact';
import Checkout from './pages/Checkout';
import Cart from './pages/Cart';
import OrderSuccess from './pages/OrderSuccess';
import OrderStatus from './pages/OrderStatus';
import TrackOrder from './pages/TrackOrder';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <CartProvider>
        <Header />
        <Routes>
          {/* Default landing page */}
          <Route index path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/featured-products" element={<FeaturedProducts />} />
          <Route path="/recommended" element={<Recommended />} />
          <Route path="/articles/:slug" element={<ArticleDetail />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/order-status/:orderId" element={<OrderStatus />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </CartProvider>
    </BrowserRouter>
  );
}
