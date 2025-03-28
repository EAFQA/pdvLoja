import { useCallback, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import "./App.css";
import Menu from "./components/menu";
import Cart from "./sections/cart";
import { CartProvider } from "./contexts/cart";
import { ActionsProvider } from "./contexts/actions";
import { ProductProvider } from "./contexts/product";
import Stock from "./sections/stock";

function App() {
  const [currentRoute, setCurrentRoute] = useState('cart');

  const handleRouteChange = useCallback((newRoute) => {
    setCurrentRoute(newRoute);
  }, []);

  return (
    <main className="container">
      <CartProvider>
        <ActionsProvider>
          <ProductProvider>
            <div style={{ height: '100vh', background: '#FFFFFF' }}>
              <Menu handleRouteChange={handleRouteChange} currentRoute={currentRoute} />
            </div>
            <div 
              style={{ 
                width: 'calc(100vw - 112px)', 
                height: '100vh', 
                background: '#D8D8D6', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
              }}
            >
              {
                currentRoute === 'cart' ? <Cart /> : <Stock />
              }
            </div>
          </ProductProvider>
        </ActionsProvider>
      </CartProvider>
    </main>
  );
}

export default App;
