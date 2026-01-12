import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, ScrollView, Text, StyleSheet, FlatList, RefreshControl, TextInput, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import {
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
  getResponsiveFontSize,
  FontFamily,
} from '@core/config';
import { useBalance, BalanceMutation } from '@plugins/balance';
import { SearchNormal, CloseCircle, Filter } from 'iconsax-react-nativejs';

interface AktivitasTabProps {
  isActive?: boolean;
  isVisible?: boolean;
  scrollEnabled?: boolean;
}

export const AktivitasTab: React.FC<AktivitasTabProps> = React.memo(({
  isActive = true,
  isVisible = true,
  scrollEnabled = false,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const horizontalPadding = getHorizontalPadding();
  const { mutations, loadMutations, refresh } = useBalance();
  const [refreshing, setRefreshing] = useState(false);

  // Local Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  useEffect(() => {
    if (isVisible && isActive) {
      loadMutations();
    }
  }, [isVisible, isActive, loadMutations]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
      await loadMutations();
    } finally {
      setRefreshing(false);
    }
  }, [refresh, loadMutations]);

  // Filter Logic
  const filteredTransactions = useMemo(() => {
    let data = mutations.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      data = data.filter(item =>
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.amount && item.amount.toString().includes(query))
      );
    }

    return data;
  }, [mutations, searchQuery]);

  const formatTransactionDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year}, ${hours}:${minutes}`;
  };

  const formatAmount = (amount: number): string => {
    const absAmount = Math.abs(amount);
    const formatted = absAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${amount < 0 ? '-' : ''}Rp ${formatted}`;
  };

  const renderTransactionItem = useCallback(({ item }: { item: BalanceMutation }) => (
    <View
      style={[
        styles.transactionItem,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.transactionContent}>
        <Text style={[styles.transactionTitle, { color: colors.text }]}>
          {item.description}
        </Text>
        <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
          {formatTransactionDate(new Date(item.createdAt))}
        </Text>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          {
            color: item.amount < 0
              ? colors.error || '#EF4444'
              : colors.success || colors.primary,
          },
        ]}
      >
        {formatAmount(item.amount)}
      </Text>
    </View>
  ), [colors]);

  const renderHeader = useMemo(() => (
    <View style={styles.headerContainer}>
      {/* Title */}
      <View style={styles.headerSection}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('home.activity') || 'Aktivitas'}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SearchNormal size={scale(20)} color={colors.textSecondary} variant="Linear" />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t('common.search') || "Cari transaksi..."}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <CloseCircle size={scale(20)} color={colors.textSecondary} variant="Linear" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setIsFilterVisible(true)}
        >
          <Filter
            size={scale(20)}
            color={colors.text}
            variant="Linear"
          />
        </TouchableOpacity>
      </View>
    </View>
  ), [colors, searchQuery, t]);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        {searchQuery ? (t('common.noResults') || 'Tidak ada hasil pencarian') : (t('balance.noTransactions') || 'Tidak ada transaksi')}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item, index) => item.id || index.toString()}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom: insets.bottom + moderateVerticalScale(24),
            paddingHorizontal: horizontalPadding,
            paddingTop: moderateVerticalScale(16),
          },
        ]}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        scrollEnabled={scrollEnabled}
      />
    </View>
  );
});

AktivitasTab.displayName = 'AktivitasTab';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  headerContainer: {
    marginBottom: moderateVerticalScale(16),
  },
  headerSection: {
    marginBottom: moderateVerticalScale(12),
  },
  headerTitle: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    height: moderateVerticalScale(44),
    borderRadius: scale(12),
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: scale(8),
    fontFamily: FontFamily.monasans.regular,
    fontSize: getResponsiveFontSize('medium'),
    padding: 0, // Reset default padding
  },
  clearButton: {
    padding: scale(4),
  },
  filterButton: {
    width: moderateVerticalScale(44),
    height: moderateVerticalScale(44),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(12),
    borderWidth: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale(16),
    borderRadius: scale(12),
    borderWidth: 1,
  },
  transactionContent: {
    flex: 1,
    marginRight: scale(12),
  },
  transactionTitle: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.medium,
    marginBottom: scale(4),
  },
  transactionDate: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
  },
  transactionAmount: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  separator: {
    height: scale(12),
  },
  emptyContainer: {
    paddingTop: moderateVerticalScale(40),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.regular,
    textAlign: 'center',
  },
});