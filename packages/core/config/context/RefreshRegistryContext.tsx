/**
 * RefreshRegistryContext
 * Allows child widgets to register refresh callbacks.
 * When parent triggers refresh (e.g. pull-to-refresh), all registered callbacks are invoked.
 * Used by BerandaTab so plugin widgets like RecentTransactions can participate in refresh.
 */

import React, { createContext, useCallback, useContext, useRef } from 'react';

type RefreshCallback = () => void | Promise<void>;

interface RefreshRegistryContextValue {
  registerRefreshCallback: (id: string, fn: RefreshCallback) => () => void;
  refreshAll: () => Promise<void>;
}

const RefreshRegistryContext = createContext<RefreshRegistryContextValue | null>(null);

export function RefreshRegistryProvider({ children }: { children: React.ReactNode }) {
  const callbacksRef = useRef<Map<string, RefreshCallback>>(new Map());

  const registerRefreshCallback = useCallback((id: string, fn: RefreshCallback) => {
    callbacksRef.current.set(id, fn);
    return () => {
      callbacksRef.current.delete(id);
    };
  }, []);

  const refreshAll = useCallback(async () => {
    const callbacks = Array.from(callbacksRef.current.values());
    await Promise.all(callbacks.map((fn) => fn()));
  }, []);

  const value: RefreshRegistryContextValue = {
    registerRefreshCallback,
    refreshAll,
  };

  return (
    <RefreshRegistryContext.Provider value={value}>
      {children}
    </RefreshRegistryContext.Provider>
  );
}

export function useRefreshRegistry(): RefreshRegistryContextValue | null {
  return useContext(RefreshRegistryContext);
}
