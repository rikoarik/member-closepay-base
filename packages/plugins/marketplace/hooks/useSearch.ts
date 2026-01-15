/**
 * Search Hook
 * Hook untuk search functionality di marketplace
 */
import { useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';

export interface SearchOptions {
  placeholder?: string;
  autoFocus?: boolean;
  showFilter?: boolean;
  showCart?: boolean;
}

export const useSearch = (options: SearchOptions = {}) => {
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigation = useNavigation();

  const {
    placeholder = 'Cari produk, brand, dan lainnya...',
    autoFocus = false,
    showFilter = true,
    showCart = true,
  } = options;

  const handleSearch = useCallback((query: string) => {
    if (query.trim()) {
      setIsSearching(true);
      // @ts-ignore
      navigation.navigate('SearchResults' as never, { query: query.trim() } as never);
      setIsSearching(false);
    }
  }, [navigation]);

  const handleSearchSubmit = useCallback(() => {
    handleSearch(searchText);
  }, [handleSearch, searchText]);

  const clearSearch = useCallback(() => {
    setSearchText('');
  }, []);

  return {
    searchText,
    setSearchText,
    isSearching,
    placeholder,
    autoFocus,
    showFilter,
    showCart,
    handleSearch,
    handleSearchSubmit,
    clearSearch,
  };
};