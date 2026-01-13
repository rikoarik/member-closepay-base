/**
 * SearchScreen Component
 * Halaman search untuk marketplace seperti Shopee
 * Menampilkan history search dan rekomendasi
 */
import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, ScrollView, Keyboard, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft2, SearchNormal, CloseCircle, ShoppingCart, Calendar, Chart, Trash } from 'iconsax-react-nativejs';
import {
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
  getResponsiveFontSize,
  FontFamily,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { useDimensions } from '@core/config';

// Mock data untuk history search dan rekomendasi
const mockSearchHistory = [
  'baju pria',
  'sepatu running',
  'handphone samsung',
  'tas wanita',
  'kamera canon',
];

const mockRecommendations = [
  'baju muslim',
  'sepatu sneakers',
  'laptop gaming',
  'jam tangan',
  'kamera mirrorless',
  'tas ransel',
  'celana jeans',
  'kaos polos',
];

export const SearchScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const horizontalPadding = getHorizontalPadding();
  const { width: screenWidth } = useDimensions();
  const searchInputRef = useRef<TextInput>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState(mockSearchHistory);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Add to history if not already exists
      if (!searchHistory.includes(searchQuery.trim())) {
        setSearchHistory(prev => [searchQuery.trim(), ...prev.slice(0, 4)]);
      }
      // @ts-ignore
      navigation.navigate('SearchResults' as never, { query: searchQuery.trim() } as never);
    }
  };

  const handleHistoryItemPress = (query: string) => {
    setSearchQuery(query);
    // @ts-ignore
    navigation.navigate('SearchResults' as never, { query } as never);
  };

  const handleRecommendationPress = (query: string) => {
    setSearchQuery(query);
    // Add to history
    if (!searchHistory.includes(query)) {
      setSearchHistory(prev => [query, ...prev.slice(0, 4)]);
    }
    // @ts-ignore
    navigation.navigate('SearchResults' as never, { query } as never);
  };

  const handleClearHistory = () => {
    Alert.alert(
      t('search.clearHistory') || 'Hapus History',
      t('search.clearHistoryConfirm') || 'Apakah Anda yakin ingin menghapus semua history pencarian?',
      [
        {
          text: t('common.cancel') || 'Batal',
          style: 'cancel',
        },
        {
          text: t('common.delete') || 'Hapus',
          style: 'destructive',
          onPress: () => setSearchHistory([]),
        },
      ]
    );
  };

  const handleRemoveHistoryItem = (query: string) => {
    setSearchHistory(prev => prev.filter(item => item !== query));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            paddingTop: insets.top,
            paddingHorizontal: horizontalPadding,
          },
        ]}
      >
        <View style={styles.searchRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft2 size={scale(24)} color={colors.text} variant="Linear" />
          </TouchableOpacity>
          <View style={[styles.searchInputContainer, { backgroundColor: colors.primaryLight || colors.surface }]}>
            <SearchNormal size={scale(20)} color={colors.primary} variant="Linear" />
            <TextInput
              ref={searchInputRef}
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={t('marketplace.searchPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              multiline={false}
              numberOfLines={1}
              // @ts-ignore
              ellipsizeMode="tail"
              onChangeText={setSearchQuery}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <CloseCircle size={scale(20)} color={colors.textSecondary} variant="Linear" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={{
          paddingBottom: insets.bottom + moderateVerticalScale(20),
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
      >
        {/* Search History */}
        {searchHistory.length > 0 && (
          <View style={[styles.section, { marginTop: moderateVerticalScale(16) }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Calendar size={scale(20)} color={colors.primary} variant="Linear" />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {t('search.recentSearches') || 'Pencarian Terbaru'}
                </Text>
              </View>
              <TouchableOpacity onPress={handleClearHistory}>
                <Trash size={scale(18)} color={colors.textSecondary} variant="Linear" />
              </TouchableOpacity>
            </View>
            <View style={styles.historyContainer}>
              {searchHistory.map((query, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.historyItem, { backgroundColor: colors.surface }]}
                  onPress={() => handleHistoryItemPress(query)}
                >
                  <Calendar size={scale(16)} color={colors.textSecondary} variant="Linear" />
                  <Text style={[styles.historyText, { color: colors.text }]}>{query}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveHistoryItem(query)}
                    style={styles.removeHistoryButton}
                  >
                    <CloseCircle size={scale(16)} color={colors.textSecondary} variant="Linear" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Recommendations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Chart size={scale(20)} color={colors.primary} variant="Linear" />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('search.recommendations') || 'Rekomendasi Pencarian'}
              </Text>
            </View>
          </View>
          <View style={styles.recommendationsContainer}>
            {mockRecommendations.map((query, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.recommendationItem, { backgroundColor: colors.primaryLight || colors.surface }]}
                onPress={() => handleRecommendationPress(query)}
              >
                <Text style={[styles.recommendationText, { color: colors.primary }]}>{query}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  header: {
    paddingBottom: moderateVerticalScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginTop: moderateVerticalScale(8),
  },
  backButton: {
    padding: scale(4),
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    height: scale(44),
    borderRadius: scale(22),
  },
  searchInput: {
    flex: 1,
    marginLeft: scale(8),
    fontFamily: FontFamily.monasans.regular,
    fontSize: getResponsiveFontSize('medium'),
  },
  clearButton: {
    padding: scale(4),
  },
  cartButton: {
    padding: scale(8),
    marginRight: scale(4),
  },
  searchButton: {
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(10),
    borderRadius: scale(8),
  },
  searchButtonText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  section: {
    paddingHorizontal: getHorizontalPadding(),
    marginBottom: moderateVerticalScale(24),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(12),
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  sectionTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  historyContainer: {
    gap: scale(8),
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(12),
    borderRadius: scale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  historyText: {
    flex: 1,
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    marginLeft: scale(12),
  },
  removeHistoryButton: {
    padding: scale(4),
  },
  recommendationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
  },
  recommendationItem: {
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(8),
    borderRadius: scale(20),
    borderWidth: 1,
    borderColor: 'transparent',
  },
  recommendationText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.medium,
  },
});
