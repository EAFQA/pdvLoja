import { createContext, useCallback, useContext, useState } from "react";
import { toast } from "react-toastify";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [warningsShowed, setWarningsShowed] = useState([]);

  const checkMinStock = useCallback((product, quantityOnCart) => {
    if (product.stockQuantity - quantityOnCart <= product.minStockQuantity) {
      if (!warningsShowed.includes(product.id)) {
        toast.warn("Estoque mínimo atingido para o produto " + product.name);
        setWarningsShowed([...warningsShowed, product.id]);
      }
    }
  }, [warningsShowed]);

  // Function to add an item to the cart
  const addToCart = (product) => {
    if (!product || !product.id) return;

    if (!product.stockQuantity)
      {
        toast.error("Quantidade indisponível em estoque");
        return;
      }
  

    if (cart.some(item => item.id === product.id))
    {
      setCart(
        cart.map(item => {
          if (item.id === product.id) {

            if (item.quantity >= item.stockQuantity) {
              toast.error("Quantidade indisponível em estoque");
              return item;
            }

            checkMinStock(product, item.quantity + 1);

            return {
              ...item,
              quantity: item.quantity + 1
            };
          }
          return item;
        }
      ));
      return;
    }

    checkMinStock(product, 1);

    setCart([...cart, {
      ...product,
      quantity: 1
    }]);
  };

  const updateQuantityOnCart = (id, newQuantity) => {
    if (!id || !newQuantity) return;
    
    const product = cart.find(item => item.id === id);

    if (!id || !product) return;

    if (newQuantity > product.stockQuantity)
    {
      toast.error("Quantidade indisponível em estoque");
      return;
    }

    checkMinStock(product, newQuantity);

    setCart(
      cart.map(item => {
        if (item.id === product.id) {
          return {
            ...item,
            quantity: newQuantity
          };
        }
        return item;
      }
    ));
  };

  // Function to remove an item from the cart
  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const buyCart = () => {
    if (!cart.length) return;
    const newSale = {
      products: cart.map(item => ({
        id: item.id,
        quantity: item.quantity,
        stockQuantity: item.stockQuantity,
        price: item.price
      })),
      type: 'sale',
      date: new Date().toISOString()
    };

    console.log(newSale);
    return newSale;
  };

  const clearCart = () => {
    setWarningsShowed([]);
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantityOnCart, buyCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use ProductContext
export const useCart = () => useContext(CartContext);