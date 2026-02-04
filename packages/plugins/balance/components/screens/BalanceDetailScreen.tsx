/**
 * BalanceDetailScreen Component
 * Screen detail saldo with bottom sheet transaction history
 */
import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  RefreshControl,
  FlatList,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { useBalance } from '../../hooks/useBalance';
import { TransactionType } from '../../models/TransactionType';
import { TransactionItemSkeleton } from '../ui/TransactionItemSkeleton';
import { BalanceCard } from '../ui/BalanceCard';
import {
  ArrowLeft2,
  Wallet3,
  ArrowCircleRight2,
  Card,
  Shop,
  MoneyRecive,
  MoneySend,
  Wallet,
  CloseCircle,
} from 'iconsax-react-nativejs';
import {
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
  getMinTouchTarget,
  getResponsiveFontSize,
  getIconSize,
  FontFamily,
} from '@core/config';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// All available action buttons
const ALL_ACTION_BUTTONS = [
  { id: 'fillBalance', icon: Wallet3, label: 'Isi Saldo' },
  { id: 'tfMember', icon: ArrowCircleRight2, label: 'TF member' },
  { id: 'tfBank', icon: Card, label: 'Tf Bank' },
  { id: 'pay', icon: Shop, label: 'Bayar' },
];

// Mock multiple balance accounts with configurable actions
const MOCK_BALANCE_ACCOUNTS = [
  {
    id: '1',
    title: 'Saldo Utama',
    balance: 10000000,
    actions: ['fillBalance', 'tfMember', 'tfBank', 'pay'],
  },
  {
    id: '2',
    title: 'Saldo Plafon',
    balance: 5000000,
    actions: ['tfMember', 'pay'],
  },
  {
    id: '3',
    title: 'Saldo Makan',
    balance: 2500000,
    actions: ['fillBalance', 'pay', 'tfBank'],
  },
];

// Mock transactions per account
const MOCK_TRANSACTIONS: Record<string, any[]> = {
  '1': [
    // Saldo Utama
    {
      id: 't1',
      type: TransactionType.CREDIT,
      amount: 500000,
      description: 'Top Up Saldo via BCA',
      date: '2023-10-25',
    },
    {
      id: 't2',
      type: TransactionType.DEBIT,
      amount: 50000,
      description: 'Bayar Tagihan Listrik',
      date: '2023-10-24',
    },
    {
      id: 't3',
      type: TransactionType.DEBIT,
      amount: 150000,
      description: 'Transfer ke Member A',
      date: '2023-10-22',
    },
    {
      id: 't4',
      type: TransactionType.CREDIT,
      amount: 1000000,
      description: 'Top Up Saldo via Mandiri',
      date: '2023-10-20',
    },
    {
      id: 't5',
      type: TransactionType.DEBIT,
      amount: 25000,
      description: 'Beli Pulsa',
      date: '2023-10-18',
    },
    {
      id: 't6',
      type: TransactionType.DEBIT,
      amount: 75000,
      description: 'Pembelian Token PLN',
      date: '2023-10-15',
    },
    {
      id: 't7',
      type: TransactionType.CREDIT,
      amount: 200000,
      description: 'Bonus Referral',
      date: '2023-10-12',
    },
  ],
  '2': [
    // Saldo Plafon
    {
      id: 'p1',
      type: TransactionType.CREDIT,
      amount: 5000000,
      description: 'Limit Awal Bulan',
      date: '2023-11-01',
    },
    {
      id: 'p2',
      type: TransactionType.DEBIT,
      amount: 200000,
      description: 'Belanja Material',
      date: '2023-11-02',
    },
    {
      id: 'p3',
      type: TransactionType.DEBIT,
      amount: 500000,
      description: 'Pembayaran Vendor',
      date: '2023-11-05',
    },
    {
      id: 'p4',
      type: TransactionType.DEBIT,
      amount: 150000,
      description: 'Biaya Service',
      date: '2023-11-08',
    },
    {
      id: 'p5',
      type: TransactionType.DEBIT,
      amount: 300000,
      description: 'Pembelian Equipment',
      date: '2023-11-10',
    },
  ],
  '3': [
    // Saldo Makan
    {
      id: 'm1',
      type: TransactionType.CREDIT,
      amount: 2500000,
      description: 'Jatah Makan November',
      date: '2023-11-01',
    },
    {
      id: 'm2',
      type: TransactionType.DEBIT,
      amount: 25000,
      description: 'Kantin Sejahtera',
      date: '2023-11-02',
    },
    {
      id: 'm3',
      type: TransactionType.DEBIT,
      amount: 30000,
      description: 'Warung Bu Tini',
      date: '2023-11-02',
    },
    {
      id: 'm4',
      type: TransactionType.DEBIT,
      amount: 45000,
      description: 'Kantin Utama',
      date: '2023-11-03',
    },
    {
      id: 'm5',
      type: TransactionType.DEBIT,
      amount: 15000,
      description: 'Es Teh Jumbo',
      date: '2023-11-03',
    },
    {
      id: 'm6',
      type: TransactionType.DEBIT,
      amount: 35000,
      description: 'Ayam Goreng Pak Slamet',
      date: '2023-11-04',
    },
    {
      id: 'm7',
      type: TransactionType.DEBIT,
      amount: 22000,
      description: 'Nasi Padang Express',
      date: '2023-11-05',
    },
  ],
  '4': [
    // Saldo Bonus
    {
      id: 'b1',
      type: TransactionType.CREDIT,
      amount: 1500000,
      description: 'Bonus Kinerja Bulanan',
      date: '2023-11-01',
    },
    {
      id: 'b2',
      type: TransactionType.DEBIT,
      amount: 50000,
      description: 'Redeem Voucher Toko Online',
      date: '2023-11-03',
    },
    {
      id: 'b3',
      type: TransactionType.DEBIT,
      amount: 25000,
      description: 'Diskon Belanja',
      date: '2023-11-05',
    },
    {
      id: 'b4',
      type: TransactionType.CREDIT,
      amount: 100000,
      description: 'Bonus Referral Baru',
      date: '2023-11-08',
    },
  ],
  '5': [
    // Saldo Voucher
    {
      id: 'v1',
      type: TransactionType.CREDIT,
      amount: 750000,
      description: 'Voucher Promosi',
      date: '2023-11-01',
    },
    {
      id: 'v2',
      type: TransactionType.DEBIT,
      amount: 50000,
      description: 'Potongan Harga Produk',
      date: '2023-11-02',
    },
    {
      id: 'v3',
      type: TransactionType.DEBIT,
      amount: 25000,
      description: 'Diskon Service',
      date: '2023-11-05',
    },
    {
      id: 'v4',
      type: TransactionType.DEBIT,
      amount: 15000,
      description: 'Cashback Belanja',
      date: '2023-11-07',
    },
  ],
  '6': [
    // Saldo Tunai
    {
      id: 'c1',
      type: TransactionType.CREDIT,
      amount: 1000000,
      description: 'Top Up via ATM',
      date: '2023-11-01',
    },
    {
      id: 'c2',
      type: TransactionType.DEBIT,
      amount: 150000,
      description: 'Tarik Tunai ATM',
      date: '2023-11-02',
    },
    {
      id: 'c3',
      type: TransactionType.DEBIT,
      amount: 200000,
      description: 'Transfer Antar Bank',
      date: '2023-11-05',
    },
    {
      id: 'c4',
      type: TransactionType.CREDIT,
      amount: 500000,
      description: 'Setoran Tunai',
      date: '2023-11-08',
    },
    {
      id: 'c5',
      type: TransactionType.DEBIT,
      amount: 100000,
      description: 'Pembayaran Cash',
      date: '2023-11-10',
    },
    {
      id: 'c6',
      type: TransactionType.DEBIT,
      amount: 75000,
      description: 'Biaya Admin',
      date: '2023-11-12',
    },
  ],
  '7': [
    // Saldo Kesehatan
    {
      id: 'h1',
      type: TransactionType.CREDIT,
      amount: 1800000,
      description: 'Jatah Kesehatan Tahunan',
      date: '2024-01-01',
    },
    {
      id: 'h2',
      type: TransactionType.DEBIT,
      amount: 150000,
      description: 'Konsultasi Dokter',
      date: '2024-01-05',
    },
    {
      id: 'h3',
      type: TransactionType.DEBIT,
      amount: 75000,
      description: 'Pembelian Obat',
      date: '2024-01-08',
    },
    {
      id: 'h4',
      type: TransactionType.DEBIT,
      amount: 250000,
      description: 'Medical Check Up',
      date: '2024-01-10',
    },
  ],
  '8': [
    // Saldo Transport
    {
      id: 'tr1',
      type: TransactionType.CREDIT,
      amount: 900000,
      description: 'Jatah Transport Bulanan',
      date: '2023-11-01',
    },
    {
      id: 'tr2',
      type: TransactionType.DEBIT,
      amount: 25000,
      description: 'GoRide Premium',
      date: '2023-11-02',
    },
    {
      id: 'tr3',
      type: TransactionType.DEBIT,
      amount: 35000,
      description: 'GrabCar',
      date: '2023-11-03',
    },
    {
      id: 'tr4',
      type: TransactionType.DEBIT,
      amount: 15000,
      description: 'Parkir Mall',
      date: '2023-11-05',
    },
    {
      id: 'tr5',
      type: TransactionType.DEBIT,
      amount: 45000,
      description: 'Tiket Bus AKAP',
      date: '2023-11-08',
    },
  ],
};

const horizontalPadding = getHorizontalPadding();

// Bottom sheet snap points
const SHEET_MIN_HEIGHT = Platform.OS === 'ios' ? scale(450) : scale(480);
const SHEET_MAX_HEIGHT_ANDROID = Platform.OS === 'ios' ? scale(50) : scale(40);
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT - SHEET_MAX_HEIGHT_ANDROID; // Almost full screen

export const BalanceDetailScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { loadMutations, refresh, isLoading } = useBalance();
  const [showBalance, setShowBalance] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAccountIndex, setSelectedAccountIndex] = useState(0);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Bottom sheet animation
  const sheetHeight = useRef(new Animated.Value(SHEET_MIN_HEIGHT)).current;
  const sheetTranslateY = useRef(new Animated.Value(0)).current;

  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  React.useEffect(() => {
    loadMutations();
  }, [selectedMonth, loadMutations]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
      await loadMutations();
    } finally {
      setRefreshing(false);
    }
  }, [refresh, loadMutations]);

  const filteredMutations = useMemo(() => {
    const currentAccountId = MOCK_BALANCE_ACCOUNTS[selectedAccountIndex].id;
    return MOCK_TRANSACTIONS[currentAccountId] || [];
  }, [selectedAccountIndex]);

  const formatBalance = (balance: number) => {
    return showBalance ? `Rp ${balance.toLocaleString('id-ID')}` : 'Rp ********';
  };

  const formatAmount = (amount: number, type: string): string => {
    const formatted = Math.abs(amount).toLocaleString('id-ID');
    return type === TransactionType.CREDIT ? `+ Rp ${formatted}` : `-Rp ${formatted}`;
  };

  const getAccountActionButtons = (account: (typeof MOCK_BALANCE_ACCOUNTS)[0]) => {
    return ALL_ACTION_BUTTONS.filter((btn) => account.actions.includes(btn.id));
  };

  const getTransactionIcon = (type: string, description: string) => {
    if (description.toLowerCase().includes('top up')) return Wallet;
    if (description.toLowerCase().includes('transfer')) return MoneySend;
    if (description.toLowerCase().includes('bayar')) return Shop;
    return type === TransactionType.CREDIT ? MoneyRecive : MoneySend;
  };

  const cardWidth = scale(343);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / cardWidth);
    if (index !== selectedAccountIndex && index >= 0 && index < MOCK_BALANCE_ACCOUNTS.length) {
      setSelectedAccountIndex(index);
    }
  };

  // Expand bottom sheet to full
  const expandSheet = () => {
    setIsSheetExpanded(true);
    Animated.spring(sheetHeight, {
      toValue: SHEET_MAX_HEIGHT,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
  };

  // Collapse bottom sheet to min
  const collapseSheet = () => {
    setIsSheetExpanded(false);
    Animated.spring(sheetHeight, {
      toValue: SHEET_MIN_HEIGHT,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
  };

  // Pan responder for drag gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        const newHeight = isSheetExpanded
          ? SHEET_MAX_HEIGHT - gestureState.dy
          : SHEET_MIN_HEIGHT - gestureState.dy;

        if (newHeight >= SHEET_MIN_HEIGHT && newHeight <= SHEET_MAX_HEIGHT) {
          sheetHeight.setValue(newHeight);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const threshold = 50;

        if (gestureState.dy < -threshold) {
          // Dragged up - expand
          expandSheet();
        } else if (gestureState.dy > threshold) {
          // Dragged down - collapse
          collapseSheet();
        } else {
          // Return to current state
          if (isSheetExpanded) {
            expandSheet();
          } else {
            collapseSheet();
          }
        }
      },
    })
  ).current;

  const renderBalanceMenuCard = ({ item }: { item: (typeof MOCK_BALANCE_ACCOUNTS)[0] }) => {
    const accountActions = getAccountActionButtons(item);

    return (
      <View style={[styles.cardWrapper, { backgroundColor: colors.surface }]}>
        <BalanceCard
          title={item.title}
          balance={item.balance}
          showBalance={showBalance}
          onToggleBalance={() => setShowBalance((v) => !v)}
          hideDetailButton={true}
        />

        <View
          style={[
            styles.actionSection,
            { justifyContent: accountActions.length >= 4 ? 'space-around' : 'flex-start' },
          ]}
        >
          {accountActions.map((button) => {
            const IconComponent = button.icon;
            return (
              <TouchableOpacity
                key={button.id}
                style={styles.actionButton}
                onPress={() => console.log(button.id)}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: colors.background }]}>
                  <IconComponent size={scale(22)} color={colors.textSecondary} variant="Outline" />
                </View>
                <Text style={[styles.actionButtonLabel, { color: colors.text }]}>
                  {button.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft2 size={scale(20)} color={colors.text} variant="Outline" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('balance.balance') || 'Saldo'}
          </Text>
          <View style={styles.headerRight} />
        </View>

        {/* Main Content - Balance Cards */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        >
          <FlatList
            ref={flatListRef}
            data={MOCK_BALANCE_ACCOUNTS}
            renderItem={renderBalanceMenuCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={cardWidth + scale(16)}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContent}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          />

          {/* Pagination */}
          <View style={styles.paginationContainer}>
            {MOCK_BALANCE_ACCOUNTS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  {
                    backgroundColor:
                      selectedAccountIndex === index ? colors.primary : colors.border,
                    width: selectedAccountIndex === index ? scale(24) : scale(8),
                  },
                ]}
              />
            ))}
          </View>

          {/* Spacer for bottom sheet */}
          <View style={{ height: SHEET_MIN_HEIGHT + scale(20) }} />
        </ScrollView>
      </SafeAreaView>

      {/* Bottom Sheet - Transaction History */}
      <Animated.View
        style={[
          styles.bottomSheet,
          {
            backgroundColor: colors.surface,
            height: sheetHeight,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        {/* Drag Handle */}
        <View {...panResponder.panHandlers} style={styles.dragHandleArea}>
          <View style={[styles.dragBar, { backgroundColor: colors.border }]} />
        </View>

        {/* Sheet Header */}
        <View style={styles.sheetHeader}>
          <Text style={[styles.sheetTitle, { color: colors.text }]}>
            {t('balance.transactionHistory') || 'Riwayat Transaksi'}
          </Text>
          {isSheetExpanded && (
            <TouchableOpacity onPress={collapseSheet} style={styles.closeButton}>
              <CloseCircle size={scale(24)} color={colors.textSecondary} variant="Outline" />
            </TouchableOpacity>
          )}
        </View>

        {/* Month Tabs */}
        <ScrollView
          horizontal
          style={styles.monthTabsContainer}
          showsHorizontalScrollIndicator={false}
        >
          <View style={styles.monthTabs}>
            {months.map((month, index) => (
              <TouchableOpacity
                key={index}
                style={styles.monthTab}
                onPress={() => setSelectedMonth(index)}
              >
                <Text
                  style={[
                    styles.monthTabText,
                    { color: selectedMonth === index ? colors.primary : colors.textSecondary },
                  ]}
                >
                  {month}
                </Text>
                {selectedMonth === index && (
                  <View style={[styles.monthTabUnderline, { backgroundColor: colors.primary }]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Transaction List - Always scrollable */}
        <ScrollView
          style={styles.transactionScroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          scrollEnabled={true}
        >
          {/* Date Header */}
          <Text style={[styles.dateHeader, { color: colors.text }]}>12 Nov 2020.</Text>

          {isLoading ? (
            <View style={styles.transactionList}>
              {[1, 2, 3].map((_, i) => (
                <TransactionItemSkeleton key={i} />
              ))}
            </View>
          ) : filteredMutations.length > 0 ? (
            <View style={styles.transactionList}>
              {filteredMutations.map((mutation, index) => {
                const IconComponent = getTransactionIcon(mutation.type, mutation.description);
                return (
                  <View key={mutation.id || index} style={styles.transactionItem}>
                    <View style={styles.transactionLeft}>
                      <View
                        style={[styles.transactionIcon, { backgroundColor: colors.background }]}
                      >
                        <IconComponent
                          size={scale(20)}
                          color={colors.textSecondary}
                          variant="Outline"
                        />
                      </View>
                      <View style={styles.transactionInfo}>
                        <Text style={[styles.transactionTitle, { color: colors.text }]}>
                          {mutation.description.split(' ')[0]}
                        </Text>
                        <Text style={[styles.transactionSubtitle, { color: colors.textSecondary }]}>
                          {mutation.description}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.transactionAmount,
                        {
                          color:
                            mutation.type === TransactionType.CREDIT
                              ? colors.success || '#22C55E'
                              : colors.text,
                        },
                      ]}
                    >
                      {formatAmount(mutation.amount, mutation.type)}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {t('balance.noTransactions') || 'Tidak ada transaksi'}
              </Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalPadding,
    paddingVertical: moderateVerticalScale(12),
  },
  backButton: { padding: scale(4), marginRight: scale(8) },
  headerTitle: { fontSize: getResponsiveFontSize('xlarge'), fontFamily: FontFamily.monasans.bold },
  headerRight: { flex: 1 },
  content: { flex: 1,
    paddingVertical: moderateVerticalScale(16),
   },
  carouselContent: { paddingHorizontal: horizontalPadding, gap: scale(16) },

  cardWrapper: {
    width: scale(345),
    borderRadius: scale(16),
    overflow: 'hidden',
  },

  actionSection: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingVertical: moderateVerticalScale(20),
    paddingHorizontal: scale(16),
    gap: scale(16),
  },
  actionButton: { alignItems: 'center', width: scale(60) },
  actionIconContainer: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(8),
  },
  actionButtonLabel: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    textAlign: 'center',
  },

  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(6),
    marginTop: moderateVerticalScale(16),
    marginBottom: moderateVerticalScale(16),
  },
  paginationDot: { height: scale(6), borderRadius: scale(3) },

  // Bottom Sheet Styles
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    paddingHorizontal: horizontalPadding,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  dragHandleArea: {
    paddingVertical: moderateVerticalScale(12),
    alignItems: 'center',
  },
  dragBar: {
    width: scale(40),
    height: scale(4),
    borderRadius: scale(2),
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(16),
  },
  sheetTitle: {
    fontSize: getResponsiveFontSize('xlarge'),
    fontFamily: FontFamily.monasans.bold,
  },
  closeButton: {
    padding: scale(4),
  },
  monthTabsContainer: {
    marginBottom: moderateVerticalScale(16),
    flexGrow: 0,
  },
  monthTabs: {
    flexDirection: 'row',
    gap: scale(24),
    paddingHorizontal: horizontalPadding, // Add padding inside scrollview for first/last items
  },
  monthTab: {
    paddingBottom: moderateVerticalScale(8),
    position: 'relative',
  },
  monthTabText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.medium,
  },
  monthTabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: scale(2),
    borderRadius: scale(1),
  },

  transactionScroll: {
    flex: 1,
  },
  dateHeader: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginBottom: moderateVerticalScale(16),
  },
  transactionList: {
    gap: moderateVerticalScale(20),
    paddingBottom: moderateVerticalScale(40), // Extra padding at bottom
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  transactionLeft: { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  transactionIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  transactionInfo: { flex: 1 },
  transactionTitle: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(2),
  },
  transactionSubtitle: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    lineHeight: scale(18),
  },
  transactionAmount: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  emptyState: { alignItems: 'center', paddingVertical: moderateVerticalScale(32) },
  emptyText: { fontSize: getResponsiveFontSize('medium'), fontFamily: FontFamily.monasans.regular },
});
