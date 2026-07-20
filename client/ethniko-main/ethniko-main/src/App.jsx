import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AppRoutes from './routes/AppRoutes';
import SearchModal from './components/common/SearchModal';
import CartDrawer from './components/common/CartDrawer';
import { ThemeProvider } from './context/ThemeContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import { SearchProvider } from './context/SearchContext';

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <ThemeProvider>
      <WishlistProvider>
        <CartProvider>
          <SearchProvider>
            <BrowserRouter>
              <div className="flex flex-col min-h-screen bg-[#FFFFFF] text-[#181818] dark:bg-[#181818] dark:text-[#F8F6F2] selection:bg-[#B68D40] selection:text-white transition-colors duration-300">
                
                {/* Persistent navigation header */}
                <Navbar onOpenCart={() => setCartOpen(true)} />
                
                {/* Main page content area */}
                <main className="flex-grow">
                  <AppRoutes />
                </main>
                
                {/* Persistent page footer */}
                <Footer />

                {/* Overlays / Global drawers */}
                <SearchModal />
                <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
              </div>
            </BrowserRouter>
          </SearchProvider>
        </CartProvider>
      </WishlistProvider>
    </ThemeProvider>
  );
}
