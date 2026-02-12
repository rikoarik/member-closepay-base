import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { SearchNormal, Add, Receipt1, ArrowRight2 } from 'iconsax-react-nativejs';
import {
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
  FontFamily,
  getResponsiveFontSize,
  useDimensions,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { getInvoices } from '../../hooks';
import type { Invoice, InvoiceStatus } from '../../models';

const fontRegular = FontFamily?.monasans?.regular ?? 'System';
const fontSemiBold = FontFamily?.monasans?.semiBold ?? 'System';
const fontBold = FontFamily?.monasans?.bold ?? 'System';

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  lunas: 'Lunas',
  belum_lunas: 'Belum Lunas',
  dicicil: 'Dicicil',
  menunggu: 'Menunggu',
  terlambat: 'Terlambat',
  selesai: 'Selesai',
};

interface InvoiceTabProps {
  isActive?: boolean;
  isVisible?: boolean;
  scrollEnabled?: boolean;
}

export const InvoiceTab: React.FC<InvoiceTabProps> = ({
  isActive = true,
  isVisible = true,
  scrollEnabled = true,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const horizontalPadding = getHorizontalPadding();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useDimensions();

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const invoices = React.useMemo(() => {
    const all = getInvoices();
    if (!searchQuery.trim()) return all;
    const q = searchQuery.toLowerCase();
    return all.filter((inv) => inv.title.toLowerCase().includes(q));
  }, [searchQuery]);

  const getStatusColors = useCallback(
    (status: InvoiceStatus) => {
      switch (status) {
        case 'lunas':
          return { bg: colors.successLight, text: colors.success };
        case 'belum_lunas':
          return { bg: colors.error, text: colors.surface };
        case 'dicicil':
          return { bg: colors.warning, text: colors.surface };
        default:
          return { bg: colors.primaryLight, text: colors.primary };
      }
    },
    [colors]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise<void>((r) => setTimeout(r, 800));
    setRefreshing(false);
  }, []);

  const handleInvoicePress = useCallback(
    (invoice: Invoice) => {
      (navigation as any).navigate('InvoiceDetail', { invoiceId: invoice.id });
    },
    [navigation]
  );

  const renderInvoice = useCallback(
    ({ item }: { item: Invoice }) => {
      const statusCfg = getStatusColors(item.status);
      return (
        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          activeOpacity={0.7}
          onPress={() => handleInvoicePress(item)}
        >
          <View style={styles.cardBody}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: colors.primary }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
                {item.billedFrom} •{' '}
                {new Date(item.issuedDate).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: statusCfg.bg }]}>
              <Text style={[styles.badgeText, { color: statusCfg.text }]}>
                {STATUS_LABELS[item.status]}
              </Text>
            </View>
          </View>
          <View style={[styles.cardFooter, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.footerLabel, { color: colors.primary }]}>Total</Text>
            <Text style={[styles.footerValue, { color: colors.primary }]}>
              Rp {item.amount.toLocaleString('id-ID')}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [colors, handleInvoicePress, getStatusColors]
  );

  const renderHeader = useCallback(
    () => (
      <>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <SearchNormal size={scale(18)} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Cari tagihan..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[
              styles.quickAction,
              { backgroundColor: colors.primaryLight, borderColor: colors.primary + '33' },
            ]}
          >
            <Add size={scale(18)} color={colors.primary} />
            <Text style={[styles.quickActionText, { color: colors.primary }]}>Buat Tagihan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.quickAction,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => {
              (navigation as any).navigate('Invoice');
            }}
          >
            <Receipt1 size={scale(18)} color={colors.text} />
            <Text style={[styles.quickActionText, { color: colors.text }]}>Semua Tagihan</Text>
            <ArrowRight2 size={scale(14)} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tagihan Terbaru</Text>
        </View>
      </>
    ),
    [colors, searchQuery, navigation]
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Belum ada tagihan</Text>
      </View>
    ),
    [colors.textSecondary]
  );

  if (!isVisible) return null;

  return (
    <View style={[styles.container, { width: screenWidth }]}>
      <View style={[styles.fixedHeader, { paddingHorizontal: horizontalPadding }]}>
        <Text style={[styles.tabTitle, { color: colors.text }]}>Tagihan</Text>
      </View>
      <FlatList
        data={invoices}
        keyExtractor={(item) => item.id}
        renderItem={renderInvoice}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingHorizontal: horizontalPadding,
            paddingBottom: insets.bottom + scale(20),
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
        ItemSeparatorComponent={() => <View style={{ height: scale(10) }} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  fixedHeader: {
    paddingTop: scale(10),
    paddingBottom: moderateVerticalScale(8),
  },
  tabTitle: {
    fontFamily: fontSemiBold,
    fontSize: getResponsiveFontSize('large'),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: scale(10),
    borderRadius: 12,
    borderWidth: 1,
    gap: scale(8),
    marginBottom: moderateVerticalScale(12),
  },
  searchInput: {
    flex: 1,
    fontFamily: fontRegular,
    fontSize: getResponsiveFontSize('medium'),
    paddingVertical: 0,
  },
  quickActions: {
    flexDirection: 'row',
    gap: scale(10),
    marginBottom: moderateVerticalScale(20),
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(6),
    paddingVertical: scale(12),
    borderRadius: 12,
    borderWidth: 1,
  },
  quickActionText: {
    fontFamily: fontSemiBold,
    fontSize: getResponsiveFontSize('small'),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(12),
  },
  sectionTitle: {
    fontFamily: fontSemiBold,
    fontSize: getResponsiveFontSize('medium'),
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: scale(14),
    gap: scale(8),
  },
  cardTitle: {
    fontSize: scale(12),
    fontFamily: fontBold,
    marginBottom: scale(2),
  },
  cardSub: {
    fontSize: scale(10),
    fontFamily: fontRegular,
  },
  badge: {
    paddingHorizontal: scale(10),
    paddingVertical: scale(3),
    borderRadius: 6,
  },
  badgeText: {
    fontSize: scale(8),
    fontFamily: fontBold,
    textTransform: 'uppercase',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(14),
    paddingVertical: scale(10),
  },
  footerLabel: {
    fontSize: scale(10),
    fontFamily: fontBold,
  },
  footerValue: {
    fontSize: scale(12),
    fontFamily: fontBold,
  },
  listContent: {
    paddingTop: moderateVerticalScale(4),
    flexGrow: 1,
  },
  emptyContainer: {
    paddingVertical: moderateVerticalScale(32),
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fontRegular,
    fontSize: getResponsiveFontSize('medium'),
  },
});
