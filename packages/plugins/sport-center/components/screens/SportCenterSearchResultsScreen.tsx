/**
 * SportCenterSearchResultsScreen Component
 * Halaman hasil pencarian Sport Center
 */
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft2, SearchNormal, CloseCircle } from 'iconsax-react-nativejs';
import { scale, moderateVerticalScale, getHorizontalPadding, FontFamily } from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { useSportCenterData } from '../../hooks';
import { FacilityCard } from '../shared';

const fontRegular = FontFamily?.monasans?.regular ?? 'System';
const fontSemiBold = FontFamily?.monasans?.semiBold ?? 'System';
const fontBold = FontFamily?.monasans?.bold ?? 'System';

export const SportCenterSearchResultsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const horizontalPadding = getHorizontalPadding();

  const initialQuery = (route.params as any)?.query || '';
  const [searchText, setSearchText] = useState(initialQuery);

  const { facilities, loading } = useSportCenterData('all', true);

  const filteredFacilities = useMemo(() => {
    if (!searchText.trim()) return [];
    const q = searchText.toLowerCase().trim();
    return facilities.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        (f.description && f.description.toLowerCase().includes(q)) ||
        f.sportType?.toLowerCase().includes(q) ||
        f.category?.toLowerCase().includes(q)
    );
  }, [facilities, searchText]);

  const handleFacilityPress = (facility: any) => {
    // @ts-ignore
    navigation.navigate('SportCenterFacilityDetail', { facility });
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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft2 size={scale(24)} color={colors.text} variant="Linear" />
          </TouchableOpacity>
          <View style={[styles.searchInputContainer, { backgroundColor: colors.background }]}>
            <SearchNormal size={scale(20)} color={colors.primary} variant="Linear" />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={t('sportCenter.searchPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton}>
                <CloseCircle size={scale(20)} color={colors.textSecondary} variant="Linear" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <FlatList
        data={filteredFacilities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FacilityCard facility={item} onPress={handleFacilityPress} />}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingHorizontal: horizontalPadding,
            paddingTop: moderateVerticalScale(16),
            paddingBottom: insets.bottom + 20,
          },
        ]}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {t('common.noResults')}
              </Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingBottom: moderateVerticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
  listContent: { flexGrow: 1 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: moderateVerticalScale(100),
  },
  emptyText: {
    fontSize: scale(14),
    fontFamily: fontRegular,
  },
});
