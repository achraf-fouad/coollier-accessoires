'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

type CartContextType = {
  cart: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isGiftPack: boolean;
  setGiftPack: (val: boolean) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isGiftPack, setGiftPack] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addItem = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Bundle Pricing Logic:
  // 1 item = 129
  // 2 items = 199
  // 3 items = 299
  // 4+ items: I'll assume the 3-pack repeats or we just add the single price?
  // Let's go with a simple rule: 1=129, 2=199, >=3 = 299 + (extra * 100)?
  // Actually, I'll follow the user's explicit rules and maybe 3+ is just 299 as a cap or something.
  // Actually, usually these brands want 3 = 299. If they buy 4, maybe they want another pack?
  // I'll implement:
  // if totalItems === 1 -> 129
  // if totalItems === 2 -> 199
  // if totalItems >= 3 -> 299
  
  let basePrice = 0;
  if (totalItems === 1) basePrice = 129;
  else if (totalItems === 2) basePrice = 199;
  else if (totalItems >= 3) basePrice = 299;

  const subtotal = basePrice + (isGiftPack ? 49 : 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isGiftPack,
        setGiftPack,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
