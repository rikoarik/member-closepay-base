import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { Animated } from 'react-native';

interface TabBarContextType {
  isVisible: boolean;
  showTabBar: () => void;
  hideTabBar: () => void;
  toggleTabBar: (visible: boolean) => void;
}

const TabBarContext = createContext<TabBarContextType | undefined>(undefined);

export const useTabBar = () => {
  const context = useContext(TabBarContext);
  if (!context) {
    throw new Error('useTabBar must be used within a TabBarProvider');
  }
  return context;
};

export const TabBarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(true);

  const showTabBar = useCallback(() => setIsVisible(true), []);
  const hideTabBar = useCallback(() => setIsVisible(false), []);
  const toggleTabBar = useCallback((visible: boolean) => setIsVisible(visible), []);

  const value = useMemo(
    () => ({ isVisible, showTabBar, hideTabBar, toggleTabBar }),
    [isVisible, showTabBar, hideTabBar, toggleTabBar]
  );

  return <TabBarContext.Provider value={value}>{children}</TabBarContext.Provider>;
};
