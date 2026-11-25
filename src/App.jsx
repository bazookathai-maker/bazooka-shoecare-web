import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LocaleProvider } from './i18n/LocaleContext';
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

function routePath(prefix, path) {
  if (!prefix) return path;
  return path === '/' ? prefix : `${prefix}${path}`;
}

function localizedRoutes(prefix) {
  const path = (suffix) => routePath(prefix, suffix);
  return [
    <Route key={path('/')} path={path('/')} element={<Home />} />,
    <Route key={path('/products')} path={path('/products')} element={<Products />} />,
    <Route key={path('/products/:slug')} path={path('/products/:slug')} element={<ProductDetail />} />,
    <Route key={path('/featured-products')} path={path('/featured-products')} element={<FeaturedProducts />} />,
    <Route key={path('/recommended')} path={path('/recommended')} element={<Recommended />} />,
    <Route key={path('/articles/:slug')} path={path('/articles/:slug')} element={<ArticleDetail />} />,
    <Route key={path('/articles')} path={path('/articles')} element={<Articles />} />,
    <Route key={path('/reviews')} path={path('/reviews')} element={<Reviews />} />,
    <Route key={path('/faq')} path={path('/faq')} element={<Faq />} />,
    <Route key={path('/contact')} path={path('/contact')} element={<Contact />} />,
    <Route
      key={path(SHIPPING_POLICY.path)}
      path={path(SHIPPING_POLICY.path)}
      element={<StorePolicy key={`${prefix}-${SHIPPING_POLICY.key}`} policy={SHIPPING_POLICY} />}
    />,
    <Route
      key={path(RETURN_POLICY.path)}
      path={path(RETURN_POLICY.path)}
      element={<StorePolicy key={`${prefix}-${RETURN_POLICY.key}`} policy={RETURN_POLICY} />}
    />,
    <Route key={path('/login')} path={path('/login')} element={<Login />} />,
    <Route key={path('/register')} path={path('/register')} element={<Register />} />,
    <Route key={path('/account')} path={path('/account')} element={<Account />} />,
    <Route key={path('/cart')} path={path('/cart')} element={<Cart />} />,
    <Route key={path('/checkout')} path={path('/checkout')} element={<Checkout />} />,
    <Route key={path('/order-success')} path={path('/order-success')} element={<OrderSuccess />} />,
    <Route key={path('/order-status/:orderId')} path={path('/order-status/:orderId')} element={<OrderStatus />} />,
    <Route key={path('/track-order')} path={path('/track-order')} element={<TrackOrder />} />,
  ];
}

export default function App() {
  return (
    <BrowserRouter>
      <LocaleProvider>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
        <Header />
        <Routes>
          {localizedRoutes('')}
          {localizedRoutes('/en')}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
        <AnalyticsListener />
        <CookieNotice />
        </CartProvider>
      </AuthProvider>
      </LocaleProvider>
    </BrowserRouter>
  );
}
