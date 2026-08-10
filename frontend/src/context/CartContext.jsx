import { createContext, useCallback, useContext, useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], total_price: 0 });

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], total_price: 0 });
      return;
    }
    const { data } = await client.get("/cart/");
    setCart(data);
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = async (productId, quantity = 1) => {
    await client.post("/cart/items/", { product_id: productId, quantity });
    await refresh();
  };

  const updateItem = async (itemId, quantity) => {
    await client.patch(`/cart/items/${itemId}/`, { quantity });
    await refresh();
  };

  const removeItem = async (itemId) => {
    await client.delete(`/cart/items/${itemId}/`);
    await refresh();
  };

  const itemsCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, itemsCount, refresh, addItem, updateItem, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
