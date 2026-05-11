import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    lng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          'nav.home': 'Home',
          'nav.menu': 'Menu',
          'nav.cart': 'Cart',
          'nav.admin': 'Admin',
          'hero.title': 'Delicious Food Delivered to Your Door',
          'hero.subtitle': 'Order from Tai Hub and experience the best taste in town.',
          'search.placeholder': 'Search for dishes...',
          'featured.title': 'Featured Dishes',
          'categories.all': 'All',
          'cart.empty': 'Your cart is empty',
          'cart.checkout': 'Proceed to Checkout',
          'checkout.title': 'Secure Checkout',
          'order.whatsapp': 'Order via WhatsApp',
          'admin.login': 'Restaurant Login',
          'admin.dashboard': 'Dashboard',
          'admin.orders': 'Orders',
          'admin.inventory': 'Inventory',
          'admin.analytics': 'Sales Reports',
        }
      }
    }
  });

export default i18n;
