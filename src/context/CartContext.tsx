"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

export interface CartItem {
  id: string; // unique identifier (e.g. `${productId}-${offerId}-${variant}`)
  productId: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  variant: string;
  sellerId?: string;
  sellerName?: string;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  selectedItemIds: string[];
  selectedItems: CartItem[];
  isAllSelected: boolean;
  selectedCount: number;
  selectedSubtotal: number;
  toggleSelectItem: (id: string) => void;
  selectAllItems: () => void;
  unselectAllItems: () => void;
  toggleSelectAll: () => void;
  removeSelectedItems: () => void;
  clearSelectedFromCart: () => void;
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "tonalzone_cart";
const SELECTED_STORAGE_KEY = "tonalzone_cart_selected";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart and selection from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      const parsedItems: CartItem[] = stored ? JSON.parse(stored) : [];
      setItems(parsedItems);

      const storedSelected = localStorage.getItem(SELECTED_STORAGE_KEY);
      if (storedSelected) {
        const parsedSelected: string[] = JSON.parse(storedSelected);
        // Only keep selections that actually exist in items
        const validSelected = parsedSelected.filter((id) => parsedItems.some((i) => i.id === id));
        setSelectedItemIds(validSelected);
      } else {
        // Default: select all items
        setSelectedItemIds(parsedItems.map((i) => i.id));
      }
    } catch (e) {
      console.error("Failed to load cart from storage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart to storage", e);
    }
  }, [items, isLoaded]);

  // Save selection to localStorage whenever selectedItemIds change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(SELECTED_STORAGE_KEY, JSON.stringify(selectedItemIds));
    } catch (e) {
      console.error("Failed to save selection to storage", e);
    }
  }, [selectedItemIds, isLoaded]);

  const addToCart = useCallback((itemData: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === itemData.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      } else {
        return [...prev, { ...itemData, quantity }];
      }
    });
    // Auto-select the newly added item
    setSelectedItemIds((prev) => (prev.includes(itemData.id) ? prev : [...prev, itemData.id]));
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedItemIds((prev) => prev.filter((itemId) => itemId !== id));
  }, []);

  const toggleSelectItem = useCallback((id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  }, []);

  const selectAllItems = useCallback(() => {
    setSelectedItemIds(items.map((i) => i.id));
  }, [items]);

  const unselectAllItems = useCallback(() => {
    setSelectedItemIds([]);
  }, []);

  const isAllSelected = useMemo(() => {
    return items.length > 0 && items.every((i) => selectedItemIds.includes(i.id));
  }, [items, selectedItemIds]);

  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(items.map((i) => i.id));
    }
  }, [isAllSelected, items]);

  const removeSelectedItems = useCallback(() => {
    setItems((prev) => prev.filter((item) => !selectedItemIds.includes(item.id)));
    setSelectedItemIds([]);
  }, [selectedItemIds]);

  const clearSelectedFromCart = useCallback(() => {
    setItems((prev) => prev.filter((item) => !selectedItemIds.includes(item.id)));
    setSelectedItemIds([]);
  }, [selectedItemIds]);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setSelectedItemIds([]);
  }, []);

  const selectedItems = useMemo(() => {
    return items.filter((i) => selectedItemIds.includes(i.id));
  }, [items, selectedItemIds]);

  const selectedCount = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [selectedItems]);

  const selectedSubtotal = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [selectedItems]);

  const totalCount = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [items]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const value = useMemo(
    () => ({
      items,
      selectedItemIds,
      selectedItems,
      isAllSelected,
      selectedCount,
      selectedSubtotal,
      toggleSelectItem,
      selectAllItems,
      unselectAllItems,
      toggleSelectAll,
      removeSelectedItems,
      clearSelectedFromCart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalCount,
      subtotal,
      isCartOpen,
      setIsCartOpen,
      openCart,
      closeCart,
    }),
    [
      items,
      selectedItemIds,
      selectedItems,
      isAllSelected,
      selectedCount,
      selectedSubtotal,
      toggleSelectItem,
      selectAllItems,
      unselectAllItems,
      toggleSelectAll,
      removeSelectedItems,
      clearSelectedFromCart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalCount,
      subtotal,
      isCartOpen,
      openCart,
      closeCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
