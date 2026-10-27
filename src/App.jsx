import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ScrollToTop from './components/ScrollToTop';
import AnalyticsListener from './components/AnalyticsListener';
import CookieNotice from './components/CookieNotice';
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
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import NotFound from './pages/NotFound';
import StorePolicy from './pages/StorePolicy';
import { RETURN_POLICY, SHIPPING_POLICY } from './data/storePolicies';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
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
          <Route
            path={SHIPPING_POLICY.path}
            element={<StorePolicy key={SHIPPING_POLICY.key} policy={SHIPPING_POLICY} />}
          />
          <Route
            path={RETURN_POLICY.path}
            element={<StorePolicy key={RETURN_POLICY.key} policy={RETURN_POLICY} />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<Account />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/order-status/:orderId" element={<OrderStatus />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
        <AnalyticsListener />
        <CookieNotice />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
