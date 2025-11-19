
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Product, Settings } from '@/lib/types';
import { useUser } from '@/components/providers/app-providers';

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addItem: (item: Product, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  currency: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { settings } = useUser();
  const currency = settings?.currency || '₹';

  useEffect(() => {
    setIsMounted(true);
    const storedCart = localStorage.getItem('stratic-cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('stratic-cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isMounted]);

  const addItem = (item: Product, quantity: number = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      if (existingItem) {
        const newQuantity = Math.min(existingItem.quantity + quantity, item.stock);
        return prevItems.map(i =>
          i.id === item.id ? { ...i, quantity: newQuantity } : i
        );
      }
      return [...prevItems, { ...item, quantity }];
    });
  };

  const removeItem = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(i => i.id !== itemId));
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(i => (i.id === itemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  if (!isMounted) {
    return (
        <CartContext.Provider value={{
            cartItems: [],
            addItem: () => {},
            removeItem: () => {},
            updateItemQuantity: () => {},
            clearCart: () => {},
            cartCount: 0,
            cartTotal: 0,
            currency: '₹',
        }}>
            {children}
        </CartContext.Provider>
    )
  }

  return (
    <CartContext.Provider value={{ cartItems, addItem, removeItem, updateItemQuantity, clearCart, cartCount, cartTotal, currency }}>
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
