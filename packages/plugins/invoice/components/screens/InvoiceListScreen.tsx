import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Add,
  Receipt1,
  Flash,
  ShoppingBag,
  Wifi,
  Drop,
  SearchNormal,
  Profile,
  InfoCircle,
  Filter,
} from 'iconsax-react-nativejs';
import { useTheme } from '@core/theme';
import { scale, FontFamily, ScreenHeader } from '@core/config';
import { useTranslation } from '@core/i18n';
import { useInvoiceData } from '../../hooks';
import type { SentStatusFilter } from '../../hooks';
import type { Invoice, InvoiceStatus } from '../../models';
import { InvoiceFilterBottomSheet, InvoiceFilters } from '../sheets/InvoiceFilterBottomSheet';
import { DatePicker } from '@core/config';

const fontRegular = FontFamily?.monasans?.regular ?? 'System';
const fontSemiBold = FontFamily?.monasans?.semiBold ?? 'System';
const fontBold = FontFamily?.monasans?.bold ?? 'System';

// Helper to get i18n status label key
const getStatusLabelKey = (status: InvoiceStatus): string => {
  const map: Record<InvoiceStatus, string> = {
    lunas: 'invoice.statusPaid',
    belum_lunas: 'invoice.statusUnpaid',
    dicicil: 'invoice.statusInstallment',
    menunggu: 'invoice.statusWaiting',
    terlambat: 'invoice.statusLate',
    selesai: 'invoice.statusCompleted',
  };
  return map[status];
};

// Maps invoice title keywords to icon config for visual variety
const getInvoiceIcon = (title: string, colors: any) => {
  const lower = title.toLowerCase();
  if (lower.includes('listrik') || lower.includes('pln')) {
    return { icon: Flash, bg: colors.warningLight, color: colors.warning };
  }
  if (lower.includes('cicil') || lower.includes('gadget') || lower.includes('toko')) {
    return { icon: ShoppingBag, bg: colors.primaryLight, color: colors.primary };
  }
  if (lower.includes('internet') || lower.includes('wifi') || lower.includes('indihome')) {
    return { icon: Wifi, bg: colors.infoLight, color: colors.info };
  }
  if (lower.includes('pdam') || lower.includes('air')) {
    return { icon: Drop, bg: colors.primaryLight, color: colors.primary };
  }
  return { icon: Receipt1, bg: colors.primaryLight, color: colors.primary };
};

// Section grouping type
type SectionItem = { type: 'sectionHeader'; title: string } | { type: 'invoice'; data: Invoice };

export const InvoiceListScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {
    invoices,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    sentStatusFilter,
    setSentStatusFilter,
  } = useInvoiceData();

  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [receivedFilter, setReceivedFilter] = useState<InvoiceFilters>({
    status: 'all',
    sortType: 'dueDate',
    sortOrder: 'asc', // Default asc as per 'Terlama ke Terbaru' usually being default for dates? Or 'desc' for recent? Let's stick to 'asc' (Oldest first for due dates often makes sense to see what's urgent) or just matching init.
    dateRange: { startDate: null, endDate: null },
  });

  const getStatusColors = useCallback(
    (status: InvoiceStatus) => {
      switch (status) {
        case 'lunas':
          return { bg: colors.successLight, text: colors.success };
        case 'belum_lunas':
          return { bg: colors.primaryLight, text: colors.primary };
        case 'dicicil':
          return { bg: colors.warningLight, text: colors.warning };
        case 'menunggu':
          return { bg: colors.warningLight, text: colors.warning };
        case 'terlambat':
          return { bg: colors.errorLight, text: colors.error };
        case 'selesai':
          return { bg: colors.infoLight, text: colors.info };
        default:
          return { bg: colors.primaryLight, text: colors.primary };
      }
    },
    [colors]
  );

  // ─── Received tab helpers ──────────────────────────
  // ─── Received tab helpers ──────────────────────────
  const filteredReceivedInvoices = useMemo(() => {
    let data = invoices;

    // 1. Status Filter
    if (receivedFilter.status && receivedFilter.status !== 'all') {
      if (receivedFilter.status === 'belum_lunas') {
        data = data.filter((inv) => ['belum_lunas', 'menunggu', 'terlambat'].includes(inv.status));
      } else {
        data = data.filter((inv) => inv.status === receivedFilter.status);
      }
    }

    // 2. Search Filter
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      data = data.filter(
        (inv) =>
          inv.title.toLowerCase().includes(lower) ||
          inv.invoiceNumber.toLowerCase().includes(lower) ||
          inv.billedFrom.toLowerCase().includes(lower)
      );
    }

    // 3. Date Range Filter
    if (
      receivedFilter.dateRange &&
      receivedFilter.dateRange.startDate &&
      receivedFilter.dateRange.endDate
    ) {
      const start = new Date(receivedFilter.dateRange.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(receivedFilter.dateRange.endDate);
      end.setHours(23, 59, 59, 999);

      data = data.filter((inv) => {
        const date = new Date(inv.issuedDate); // Filter by issuedDate (Tangal Terbit)
        return date >= start && date <= end;
      });
    }

    // 3. Sorting
    data = [...data].sort((a, b) => {
      let dateA = 0;
      let dateB = 0;

      if (receivedFilter.sortType === 'invoiceDate') {
        dateA = new Date(a.issuedDate).getTime();
        dateB = new Date(b.issuedDate).getTime();
      } else if (receivedFilter.sortType === 'createdDate') {
        dateA = new Date(a.issuedDate).getTime(); // Fallback
        dateB = new Date(b.issuedDate).getTime();
      } else {
        // dueDate default
        dateA = new Date(a.dueDate).getTime();
        dateB = new Date(b.dueDate).getTime();
      }

      if (receivedFilter.sortOrder === 'asc') {
        return dateA - dateB;
      }
      return dateB - dateA;
    });

    return data;
  }, [invoices, receivedFilter, searchQuery]);

  const unpaidInvoices = invoices.filter((inv) => inv.status !== 'lunas');
  const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + (inv.amount - inv.amountPaid), 0);
  const nearestDue =
    unpaidInvoices.length > 0
      ? unpaidInvoices.reduce((nearest, inv) => {
          const dueMs = new Date(inv.dueDate).getTime();
          const nearestMs = new Date(nearest.dueDate).getTime();
          return dueMs < nearestMs ? inv : nearest;
        })
      : null;
  const daysUntilDue = nearestDue
    ? Math.max(
        0,
        Math.ceil((new Date(nearestDue.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      )
    : 0;

  // ─── Sent tab: group invoices into sections (recent / last week) ───
  const sentSectionData = useMemo<SectionItem[]>(() => {
    if (activeTab !== 'sent') return [];
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recent: Invoice[] = [];
    const lastWeek: Invoice[] = [];

    invoices.forEach((inv) => {
      const issued = new Date(inv.issuedDate);
      if (issued >= oneWeekAgo) {
        recent.push(inv);
      } else {
        lastWeek.push(inv);
      }
    });

    const result: SectionItem[] = [];
    if (recent.length > 0) {
      result.push({ type: 'sectionHeader', title: t('invoice.recentInvoices') });
      recent.forEach((inv) => result.push({ type: 'invoice', data: inv }));
    }
    if (lastWeek.length > 0) {
      result.push({ type: 'sectionHeader', title: t('invoice.lastWeek') });
      lastWeek.forEach((inv) => result.push({ type: 'invoice', data: inv }));
    }

    return result;
  }, [invoices, activeTab, t]);

  // ─── Received Invoice card ──────────────────────────
  const renderReceivedCard = useCallback(
    ({ item }: { item: Invoice }) => {
      const statusCfg = getStatusColors(item.status);
      const iconCfg = getInvoiceIcon(item.title, colors);
      const IconComponent = iconCfg.icon;
      const isPaid = item.status === 'lunas';

      return (
        <TouchableOpacity
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.borderLight },
          ]}
          activeOpacity={0.7}
          onPress={() => {
            (navigation as any).navigate('InvoiceDetail', { invoiceId: item.id });
          }}
        >
          <View style={styles.cardTop}>
            <View style={[styles.iconCircle, { backgroundColor: iconCfg.bg }]}>
              <IconComponent size={scale(18)} color={iconCfg.color} variant="Bold" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.cardSubtitle, { color: colors.textTertiary }]} numberOfLines={1}>
                {item.billedFrom}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
              <Text style={[styles.statusBadgeText, { color: statusCfg.text }]}>
                {t(getStatusLabelKey(item.status))}
              </Text>
            </View>
          </View>

          <View style={styles.cardBottom}>
            <View>
              <Text style={[styles.cardLabel, { color: colors.textTertiary }]}>
                {t('invoice.amount').toUpperCase()}
              </Text>
              <Text style={[styles.cardAmount, { color: colors.text }]}>
                Rp {item.amount.toLocaleString('id-ID')}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.cardLabel, { color: colors.textTertiary }]}>
                {isPaid ? t('invoice.paidOn').toUpperCase() : t('invoice.dueDate').toUpperCase()}
              </Text>
              <Text style={[styles.cardDueDate, { color: isPaid ? colors.text : colors.error }]}>
                {new Date(isPaid ? item.issuedDate : item.dueDate).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [colors, navigation, getStatusColors, t]
  );

  // ─── Sent Invoice card (different layout) ──────────────────────────
  const renderSentCard = useCallback(
    (item: Invoice) => {
      const statusCfg = getStatusColors(item.status);
      const isMerchant = item.senderType === 'merchant';
      const iconBg = isMerchant ? colors.primaryLight : colors.warningLight;
      const iconColor = isMerchant ? colors.primary : colors.warning;

      return (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.sentCard,
            { backgroundColor: colors.surface, borderColor: colors.borderLight },
          ]}
          activeOpacity={0.7}
          onPress={() => {
            (navigation as any).navigate('InvoiceDetail', { invoiceId: item.id });
          }}
        >
          <View style={styles.sentCardRow}>
            <View style={[styles.sentIconCircle, { backgroundColor: iconBg }]}>
              <Profile size={scale(20)} color={iconColor} variant="Bold" />
            </View>
            <View style={styles.sentCardInfo}>
              <Text style={[styles.sentCardName, { color: colors.text }]} numberOfLines={1}>
                {item.billedTo}
              </Text>
              <Text
                style={[styles.sentCardInvoiceNum, { color: colors.textTertiary }]}
                numberOfLines={1}
              >
                {item.invoiceNumber}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
              <Text style={[styles.statusBadgeText, { color: statusCfg.text }]}>
                {t(getStatusLabelKey(item.status))}
              </Text>
            </View>
          </View>

          <View style={styles.sentCardBottom}>
            <Text style={[styles.sentCardAmount, { color: colors.text }]}>
              Rp {item.amount.toLocaleString('id-ID')}
            </Text>
            <Text style={[styles.sentCardDue, { color: colors.textTertiary }]}>
              {t('invoice.dueDate')}:{' '}
              {new Date(item.dueDate).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [colors, navigation, getStatusColors, t]
  );

  // ─── Sent tab section list render ──────────────────────────
  const renderSentItem = useCallback(
    ({ item }: { item: SectionItem }) => {
      if (item.type === 'sectionHeader') {
        return (
          <View style={styles.sentSectionHeader}>
            <Text style={[styles.sentSectionTitle, { color: colors.textSecondary }]}>
              {item.title.toUpperCase()}
            </Text>
          </View>
        );
      }
      return renderSentCard(item.data);
    },
    [colors, renderSentCard]
  );

  // ─── Filter chip helpers ──────────────────────────
  const SENT_FILTERS: { key: SentStatusFilter; labelKey: string }[] = [
    { key: 'all', labelKey: 'invoice.filterAll' },
    { key: 'belum_lunas', labelKey: 'invoice.filterUnpaid' },
    { key: 'menunggu', labelKey: 'invoice.filterWaiting' },
  ];

  const renderFilterChips = () => (
    <View style={styles.filterRow}>
      {SENT_FILTERS.map((f) => {
        const isActive = sentStatusFilter === f.key;
        return (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterChip,
              {
                backgroundColor: isActive ? colors.primary : colors.surface,
                borderColor: isActive ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setSentStatusFilter(f.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: isActive ? colors.surface : colors.textSecondary },
              ]}
            >
              {t(f.labelKey)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // ─── Sent tab header (search + filters) ──────────────────────────
  const renderSentHeader = () => (
    <View style={styles.sentHeaderContainer}>
      {/* Search Bar */}
      <View
        style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <SearchNormal size={scale(18)} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={t('invoice.searchPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Chips */}
      {renderFilterChips()}
    </View>
  );

  const renderTabSwitcher = () => (
    <View
      style={[styles.tabRow, { borderColor: colors.borderLight, backgroundColor: colors.surface }]}
    >
      <TouchableOpacity
        style={[
          styles.tab,
          {
            backgroundColor: activeTab === 'received' ? colors.primary : 'transparent',
          },
        ]}
        onPress={() => setActiveTab('received')}
        activeOpacity={0.9}
      >
        <Text
          style={[
            styles.tabText,
            { color: activeTab === 'received' ? colors.surface : colors.textSecondary },
          ]}
        >
          {t('invoice.myInvoices')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tab,
          {
            backgroundColor: activeTab === 'sent' ? colors.primary : 'transparent',
          },
        ]}
        onPress={() => setActiveTab('sent')}
        activeOpacity={0.9}
      >
        <Text
          style={[
            styles.tabText,
            { color: activeTab === 'sent' ? colors.surface : colors.textSecondary },
          ]}
        >
          {t('invoice.sendInvoice')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ─── List Header ──────────────────────────
  const renderListHeader = () => {
    if (activeTab === 'received') {
      return (
        <View>
          {/* Summary Card (Only for My Invoices) */}
          <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
            <Text style={[styles.summaryLabel, { color: colors.surface + 'CC' }]}>
              {t('invoice.totalBilling')}
            </Text>
            <Text style={[styles.summaryAmount, { color: colors.surface }]}>
              <Text style={styles.summaryRp}>Rp </Text>
              {totalUnpaid.toLocaleString('id-ID')}
            </Text>
            {nearestDue && (
              <View style={[styles.dueBadge, { backgroundColor: colors.surface + '33' }]}>
                <Text style={[styles.dueBadgeText, { color: colors.surface }]}>
                  ⓘ {t('invoice.dueDate').toUpperCase()} {daysUntilDue}{' '}
                  {t('invoice.dueDate') === 'Jatuh Tempo' ? 'HARI' : 'DAYS'}
                </Text>
              </View>
            )}
          </View>

          {/* Search Bar & Filter Button */}
          <View style={[styles.searchRow, { marginBottom: scale(16) }]}>
            <View
              style={[
                styles.searchBar,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  flex: 1,
                  marginBottom: 0,
                },
              ]}
            >
              <SearchNormal size={scale(18)} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder={t('invoice.searchPlaceholder')}
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity
              style={[
                styles.filterBtn,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => setFilterSheetVisible(true)}
            >
              <Filter size={scale(20)} color={colors.text} variant="Linear" />
            </TouchableOpacity>
          </View>

          {/* Status Filter Chips (Moved from BottomSheet) */}
          <View style={[styles.filterRow, { marginBottom: scale(16), paddingHorizontal: 0 }]}>
            {[
              { label: t('invoice.filterAll'), value: 'all' },
              { label: t('invoice.statusUnpaid'), value: 'belum_lunas' },
              { label: t('invoice.statusPaid'), value: 'lunas' },
              { label: t('invoice.statusInstallment'), value: 'dicicil' },
            ].map((item) => {
              const isSelected = receivedFilter.status === item.value;
              return (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() =>
                    setReceivedFilter((prev) => ({ ...prev, status: item.value as any }))
                  }
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: isSelected ? colors.surface : colors.textSecondary },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {t('invoice.invoiceList').toUpperCase()}
            </Text>
          </View>
        </View>
      );
    }
    return renderSentHeader();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t('invoice.title')} style={{ paddingTop: insets.top }} />
      <View style={[styles.warniglabel, { backgroundColor: colors.warningLight }]}>
        <InfoCircle size={scale(24)} color={colors.warning} variant="Outline" />
        <View style={styles.warniglabelTextContainer}>
          <Text style={[styles.warniglabelText]}>{t('invoice.warningLabel')}</Text>
          <Text style={[styles.warniglabelText2]}>{t('invoice.warningLabel2')}</Text>
        </View>
      </View>

      {renderTabSwitcher()}

      <FlatList<any>
        data={activeTab === 'received' ? filteredReceivedInvoices : sentSectionData}
        keyExtractor={(item, index) => {
          if (activeTab === 'received') return item.id;
          const sectionItem = item as SectionItem;
          return sectionItem.type === 'sectionHeader' ? `section-${index}` : sectionItem.data.id;
        }}
        renderItem={activeTab === 'received' ? renderReceivedCard : renderSentItem}
        ListHeaderComponent={renderListHeader()}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + scale(120), paddingTop: 0 },
        ]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: scale(10) }} />}
      />

      <View
        style={[
          styles.addButtonWrapper,
          { backgroundColor: colors.background, paddingBottom: insets.bottom },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.addButton,
            { borderColor: colors.borderLight, backgroundColor: colors.primary },
          ]}
          onPress={() => (navigation as any).navigate('InvoiceCreate')}
          activeOpacity={0.7}
        >
          <View style={[styles.addIconCircle, { backgroundColor: colors.background }]}>
            <Add size={scale(20)} color={colors.text} />
          </View>
          <Text style={[styles.addButtonText, { color: colors.surface }]}>
            {t('invoice.addNewInvoice')}
          </Text>
        </TouchableOpacity>
      </View>

      <InvoiceFilterBottomSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
        onApply={setReceivedFilter}
        initialFilters={receivedFilter}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: scale(16),
    paddingTop: scale(16),
  },

  // Summary Card
  summaryCard: {
    borderRadius: 16,
    padding: scale(20),
    marginBottom: scale(20),
  },
  summaryLabel: {
    fontSize: scale(12),
    fontFamily: fontRegular,
    marginBottom: scale(4),
  },
  summaryAmount: {
    fontSize: scale(28),
    fontFamily: fontBold,
    marginBottom: scale(12),
  },
  summaryRp: {
    fontSize: scale(14),
    fontFamily: fontSemiBold,
  },
  dueBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: 20,
  },
  dueBadgeText: {
    fontSize: scale(9),
    fontFamily: fontBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Tab Switcher
  tabRow: {
    flexDirection: 'row',
    marginBottom: scale(12),
    marginHorizontal: scale(16),
    borderRadius: 24,
    padding: scale(4),
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: scale(10),
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: scale(12),
    fontFamily: fontSemiBold,
  },

  warniglabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    borderWidth: 1,
    borderColor: '#FFCDD2',
    padding: scale(16),
    borderRadius: 16,
    marginHorizontal: scale(16),
    marginBottom: scale(16),
  },
  warniglabelTextContainer: {
    flexWrap: 'wrap',
  },
  warniglabelText: {
    fontSize: scale(10),
    fontFamily: fontRegular,
  },
  warniglabelText2: {
    fontSize: scale(10),
    fontFamily: fontSemiBold,
  },

  // Section Header (received tab)
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(16),
  },
  sectionTitle: {
    fontSize: scale(11),
    fontFamily: fontBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  seeAll: {
    fontSize: scale(12),
    fontFamily: fontSemiBold,
  },

  // Received Invoice Card
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: scale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
    marginBottom: scale(14),
  },
  iconCircle: {
    width: scale(40),
    height: scale(40),
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: scale(13),
    fontFamily: fontBold,
    marginBottom: scale(2),
  },
  cardSubtitle: {
    fontSize: scale(10),
    fontFamily: fontRegular,
  },
  statusBadge: {
    paddingHorizontal: scale(10),
    paddingVertical: scale(4),
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: scale(8),
    fontFamily: fontBold,
    textTransform: 'uppercase',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    fontSize: scale(8),
    fontFamily: fontSemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: scale(2),
  },
  cardAmount: {
    fontSize: scale(14),
    fontFamily: fontBold,
  },
  cardDueDate: {
    fontSize: scale(11),
    fontFamily: fontSemiBold,
  },

  // Search Bar (sent tab)
  searchRow: {
    flexDirection: 'row',
    gap: scale(12),
  },
  filterBtn: {
    width: scale(44),
    height: scale(44),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: scale(10),
    borderRadius: 12,
    borderWidth: 1,
    gap: scale(8),
    marginBottom: scale(12),
  },
  searchInput: {
    flex: 1,
    fontFamily: fontRegular,
    fontSize: scale(12),
    paddingVertical: 0,
  },

  // Filter Chips (sent tab)
  filterRow: {
    flexDirection: 'row',
    gap: scale(8),
    marginBottom: scale(16),
  },
  filterChip: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: scale(11),
    fontFamily: fontSemiBold,
  },

  // Sent tab header container
  sentHeaderContainer: {
    marginBottom: scale(4),
  },

  // Sent section header
  sentSectionHeader: {
    paddingVertical: scale(10),
    marginTop: scale(4),
  },
  sentSectionTitle: {
    fontSize: scale(11),
    fontFamily: fontBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Sent Invoice Card
  sentCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: scale(14),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  sentCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
    marginBottom: scale(10),
  },
  sentIconCircle: {
    width: scale(38),
    height: scale(38),
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sentCardInfo: {
    flex: 1,
  },
  sentCardName: {
    fontSize: scale(13),
    fontFamily: fontBold,
    marginBottom: scale(2),
  },
  sentCardInvoiceNum: {
    fontSize: scale(10),
    fontFamily: fontRegular,
  },
  sentCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sentCardAmount: {
    fontSize: scale(14),
    fontFamily: fontBold,
  },
  sentCardDue: {
    fontSize: scale(10),
    fontFamily: fontRegular,
  },

  // FAB
  addButtonWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: scale(16),
    boxShadow: '0px -4px 6px -1px rgba(0, 0, 0, 0.1), 0px -2px 4px -1px rgba(0, 0, 0, 0.06)',
    justifyContent: 'center',
  },
  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: scale(30),
    marginHorizontal: scale(16),
    paddingVertical: scale(12),
    alignItems: 'center',
    gap: scale(10),
  },
  addIconCircle: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(14),
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: scale(14),
    fontFamily: fontBold,
  },
});
