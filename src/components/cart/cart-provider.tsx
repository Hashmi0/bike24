"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";

import { cartReducer } from "@/lib/cart/cart-reducer";
import { loadCart, saveCart } from "@/lib/cart/cart-storage";
import { EMPTY_CART, type CartBundle, type CartState } from "@/lib/cart/cart-types";

type NewCartBundle = Omit<CartBundle, "id">;

type CartContextValue = {
  state: CartState;
  bundleCount: number;
  isHydrated: boolean;
  addBundle: (bundle: NewCartBundle) => void;
  removeBundle: (bundleId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, EMPTY_CART);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    queueMicrotask(() => {
      if (!active) {
        return;
      }

      const savedCart = loadCart();
      dispatch({ type: "clear" });

      for (const bundle of savedCart.bundles) {
        dispatch({ type: "addBundle", bundle });
      }

      setIsHydrated(true);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (isHydrated) {
      saveCart(state);
    }
  }, [isHydrated, state]);

  const addBundle = useCallback((bundle: NewCartBundle) => {
    dispatch({
      type: "addBundle",
      bundle: { ...bundle, id: crypto.randomUUID() },
    });
  }, []);

  const removeBundle = useCallback((bundleId: string) => {
    dispatch({ type: "removeBundle", bundleId });
  }, []);

  const clearCart = useCallback(() => dispatch({ type: "clear" }), []);

  const value = useMemo(
    () => ({
      state,
      bundleCount: state.bundles.length,
      isHydrated,
      addBundle,
      removeBundle,
      clearCart,
    }),
    [addBundle, clearCart, isHydrated, removeBundle, state],
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
