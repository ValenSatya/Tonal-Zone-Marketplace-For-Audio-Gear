"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";

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
  isLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LEGACY_CART_KEY = "tonalzone_cart";
const LEGACY_SELECTED_KEY = "tonalzone_cart_selected";

/**
 * Returns isolated storage keys per user.
 * Guests use '_guest', logged in users use their sanitized user ID or email.
 */
function getCartStorageKeys(userIdOrEmail?: string | null) {
  if (!userIdOrEmail) {
    return {
      cartKey: "tonalzone_cart_guest",
      selectedKey: "tonalzone_cart_selected_guest",
    };
  }
  const safeId = userIdOrEmail.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
  return {
    cartKey: `tonalzone_cart_u_${safeId}`,
    selectedKey: `tonalzone_cart_selected_u_${safeId}`,
  };
}

/**
 * Helper to get current user identifier from localStorage
 */
function getCurrentUserIdentifier(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("tonalzone_user");
    if (raw) {
      const u = JSON.parse(raw);
      return u.id || u.email || null;
    }
  } catch {}
  return null;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const currentOwnerRef = useRef<string | null>(null);

  // Load cart for a specific user identifier
  const loadCartForOwner = useCallback((ownerId: string | null) => {
    try {
      const { cartKey, selectedKey } = getCartStorageKeys(ownerId);

      // One-time migration: check if old un-scoped legacy cart exists
      const legacyStored = localStorage.getItem(LEGACY_CART_KEY);
      if (legacyStored && !localStorage.getItem(cartKey)) {
        try {
          localStorage.setItem(cartKey, legacyStored);
          const legacySelected = localStorage.getItem(LEGACY_SELECTED_KEY);
          if (legacySelected) {
            localStorage.setItem(selectedKey, legacySelected);
          }
          localStorage.removeItem(LEGACY_CART_KEY);
          localStorage.removeItem(LEGACY_SELECTED_KEY);
        } catch {}
      }

      const stored = localStorage.getItem(cartKey);
      const parsedItems: CartItem[] = stored ? JSON.parse(stored) : [];
      setItems(parsedItems);

      const storedSelected = localStorage.getItem(selectedKey);
      if (storedSelected) {
        const parsedSelected: string[] = JSON.parse(storedSelected);
        const validSelected = parsedSelected.filter((id) => parsedItems.some((i) => i.id === id));
        setSelectedItemIds(validSelected);
      } else {
        setSelectedItemIds(parsedItems.map((i) => i.id));
      }
      currentOwnerRef.current = ownerId;
    } catch (e) {
      console.error("Failed to load user-isolated cart", e);
    }
  }, []);

  // Initial cart load
  useEffect(() => {
    const ownerId = getCurrentUserIdentifier();
    loadCartForOwner(ownerId);
    setIsLoaded(true);
  }, [loadCartForOwner]);

  // Handle User Login/Logout switching (Shopee / Tokopedia style cart isolation)
  useEffect(() => {
    const handleUserSwitch = () => {
      const newOwnerId = getCurrentUserIdentifier();
      const prevOwnerId = currentOwnerRef.current;

      // If user owner hasn't changed, ignore
      if (newOwnerId === prevOwnerId) return;

      // Scenario: Guest -> Logged-in User (Merge guest items into user cart)
      if (!prevOwnerId && newOwnerId) {
        try {
          const guestKeys = getCartStorageKeys(null);
          const guestRaw = localStorage.getItem(guestKeys.cartKey);
          const guestItems: CartItem[] = guestRaw ? JSON.parse(guestRaw) : [];

          const userKeys = getCartStorageKeys(newOwnerId);
          const userRaw = localStorage.getItem(userKeys.cartKey);
          const userItems: CartItem[] = userRaw ? JSON.parse(userRaw) : [];

          // Merge guest items into user items
          if (guestItems.length > 0) {
            const merged = [...userItems];
            for (const gItem of guestItems) {
              const existingIdx = merged.findIndex((i) => i.id === gItem.id);
              if (existingIdx > -1) {
                merged[existingIdx].quantity += gItem.quantity;
              } else {
                merged.push(gItem);
              }
            }
            localStorage.setItem(userKeys.cartKey, JSON.stringify(merged));
            localStorage.removeItem(guestKeys.cartKey);
            localStorage.removeItem(guestKeys.selectedKey);
          }
        } catch (e) {
          console.error("Failed to merge guest cart into user cart:", e);
        }
      }

      // Load new user's isolated cart
      loadCartForOwner(newOwnerId);
    };

    window.addEventListener("userLoginChange", handleUserSwitch);
    window.addEventListener("storage", handleUserSwitch);

    return () => {
      window.removeEventListener("userLoginChange", handleUserSwitch);
      window.removeEventListener("storage", handleUserSwitch);
    };
  }, [loadCartForOwner]);

  // Save cart to user-isolated localStorage key whenever items change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const { cartKey } = getCartStorageKeys(currentOwnerRef.current);
      localStorage.setItem(cartKey, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save user cart to storage", e);
    }
  }, [items, isLoaded]);

  // Save selection to user-isolated localStorage key whenever selectedItemIds change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const { selectedKey } = getCartStorageKeys(currentOwnerRef.current);
      localStorage.setItem(selectedKey, JSON.stringify(selectedItemIds));
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
      isLoaded,
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
      isLoaded,
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
