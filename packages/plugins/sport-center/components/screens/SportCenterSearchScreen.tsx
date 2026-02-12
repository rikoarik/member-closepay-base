/**
 * SportCenterSearchScreen Component
 * Halaman search untuk Sport Center - History dan Rekomendasi
 */
import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ArrowLeft2, SearchNormal, CloseCircle, Calendar, Chart } from 'iconsax-react-nativejs';
import {
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
  getResponsiveFontSize,
  FontFamily,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';

const fontRegular = FontFamily?.monasans?.regular ?? 'System';
const fontSemiBold = FontFamily?.monasans?.semiBold ?? 'System';
const fontBold = FontFamily?.monasans?.bold ?? 'System';

export const SportCenterSearchScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const horizontalPadding = getHorizontalPadding();
  const searchInputRef = useRef<TextInput>(null);

  const [searchQuery, setSearchQuery] = useState('');

  // Auto focus on enter
  useFocusEffect(
    React.useCallback(() => {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }, [])
  );

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // @ts-ignore
      navigation.navigate('SportCenterSearchResults', { query: searchQuery.trim() });
    }
  };

  const handleRecommendationPress = (query: string) => {
    setSearchQuery(query);
    // @ts-ignore
    navigation.navigate('SportCenterSearchResults', { query });
  };

  const recommendations = [
    t('sportCenter.futsal'),
    t('sportCenter.badminton'),
    t('sportCenter.tenis'),
    t('sportCenter.basketball'),
    'Gym',
    'Renang',
  ];

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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft2 size={scale(24)} color={colors.text} variant="Linear" />
          </TouchableOpacity>
          <View style={[styles.searchInputContainer, { backgroundColor: colors.background }]}>
            <SearchNormal size={scale(20)} color={colors.primary} variant="Linear" />
            <TextInput
              ref={searchInputRef}
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={t('sportCenter.searchPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
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

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: horizontalPadding, paddingBottom: 24 }}
      >
        {/* Recommendations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Chart size={scale(20)} color={colors.primary} variant="Linear" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('search.recommendations')}
            </Text>
          </View>
          <View style={styles.recommendationsContainer}>
            {recommendations.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.recommendationItem, { backgroundColor: colors.primary + '10' }]}
                onPress={() => handleRecommendationPress(item)}
              >
                <Text style={[styles.recommendationText, { color: colors.primary }]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingBottom: moderateVerticalScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
    marginTop: moderateVerticalScale(8),
  },
  backButton: { padding: scale(4) },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(14),
    height: scale(44),
    borderRadius: scale(22),
  },
  searchInput: {
    flex: 1,
    marginLeft: scale(8),
    fontFamily: fontRegular,
    fontSize: scale(14),
    paddingVertical: 0,
  },
  clearButton: { padding: scale(4) },
  content: { flex: 1 },
  section: { marginTop: moderateVerticalScale(24) },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginBottom: moderateVerticalScale(16),
  },
  sectionTitle: {
    fontSize: scale(16),
    fontFamily: fontSemiBold,
  },
  recommendationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(10),
  },
  recommendationItem: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
    borderRadius: scale(20),
  },
  recommendationText: {
    fontSize: scale(14),
    fontFamily: fontSemiBold,
  },
});
