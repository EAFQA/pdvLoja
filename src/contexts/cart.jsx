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

            const newQuantity = item.quantity + 1;

            if (newQuantity > item.stockQuantity) {
              return {
                ...item,
                quantity: item.stockQuantity
              };
            }

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
    )).filter(item => item.quantity > 0);
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

  const updateCartByStockAction = (stockAction) => {
    const newCart = cart.map(item => {
      const action = stockAction.find(action => action.id === item.id);
      console.log(action);
      if (action) {
        const newQuantity = item.stockQuantity + action.incrementQuantity;

        if (item.quantity > newQuantity) {
          return {
            ...item,
            quantity: newQuantity,
            stockQuantity: newQuantity
          };
        }

        return {
          ...item,
          stockQuantity: newQuantity
        };
      }
      return item;
    }).filter(item => item.quantity > 0);
  
    setCart(newCart);
  }

  const updateCartByUpdate = (updatedItem) => {
    const newCart = cart.map(item => {
      if (item.id === updatedItem.id) {
        return {
          ...item,
          price: updatedItem.price,
          stockQuantity: updatedItem.stockQuantity,
          minStockQuantity: updatedItem.minStockQuantity,
          quantity: item.quantity > updatedItem.stockQuantity ? updatedItem.stockQuantity : item.quantity
        };
      }
      return item;
    }).filter(item => item.quantity > 0);

    setCart(newCart);
  }


  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        updateQuantityOnCart, 
        buyCart, 
        clearCart, 
        updateCartByStockAction, 
        updateCartByUpdate 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use ProductContext
export const useCart = () => useContext(CartContext);