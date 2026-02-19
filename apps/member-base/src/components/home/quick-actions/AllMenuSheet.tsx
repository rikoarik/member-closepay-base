/**
 * AllMenuSheet Component
 * Uses core BottomSheet; grid per category; icons use theme colors.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, type ThemeColors } from '@core/theme';
import { useTranslation } from '@core/i18n';
import {
  BottomSheet,
  getEnabledMenuItems,
  getIconSize,
  getHorizontalPadding,
  getResponsiveFontSize,
  scale,
  moderateVerticalScale,
  FontFamily,
  useDimensions,
} from '@core/config';
import type { QuickMenuItem } from '@core/config';
import { Call, People, Shop, DocumentText } from 'iconsax-react-nativejs';
import {
  IconTopUpVA,
  IconTransferMember,
  IconKartuVirtual,
  IconTransferBank,
  IconMobile,
  IconWallet,
  IconBill,
  IconTransfer,
  IconMore,
  IconDonation,
  IconFnB,
  IconSport,
} from './icons';

const GRID_GAP = scale(12);
const GRID_ITEMS_PER_ROW = 4;

type CategoryKey = 'transaksi' | 'simpan' | 'lifestyle' | 'lainnya';

const CATEGORY_ORDER: CategoryKey[] = ['transaksi', 'simpan', 'lifestyle', 'lainnya'];

function getCategoryForItem(id: string): CategoryKey {
  const transaksi = ['topupva', 'transfermember', 'transferbank', 'kartuvirtual', 'ppob', 'payIPL', 'cardtransaction'];
  const simpan = ['savings', 'investasi', 'tabungan'];
  const lifestyle = ['marketplace', 'fnb', 'sportcenter', 'lifestyle'];
  if (transaksi.some((x) => id.toLowerCase().includes(x))) return 'transaksi';
  if (simpan.some((x) => id.toLowerCase().includes(x))) return 'simpan';
  if (lifestyle.some((x) => id.toLowerCase().includes(x))) return 'lifestyle';
  return 'lainnya';
}

function groupByCategory(items: QuickMenuItem[]): Map<CategoryKey, QuickMenuItem[]> {
  const map = new Map<CategoryKey, QuickMenuItem[]>();
  for (const key of CATEGORY_ORDER) {
    map.set(key, []);
  }
  for (const item of items) {
    const cat = getCategoryForItem(item.id);
    const list = map.get(cat) ?? [];
    list.push(item);
    map.set(cat, list);
  }
  return map;
}

interface AllMenuSheetProps {
  visible: boolean;
  onClose: () => void;
}

const getMenuIconForSheet = (
  iconName?: string,
  itemId?: string,
  iconColor: string = '#333'
): React.ReactNode => {
  const size = getIconSize('large');
  const variant = 'Bulk' as const;
  if (itemId === 'topupva') return <IconTopUpVA width={size} height={size} color={iconColor} />;
  if (itemId === 'transfermember') return <IconTransferMember width={size} height={size} color={iconColor} />;
  if (itemId === 'kartuvirtual') return <IconKartuVirtual width={size} height={size} color={iconColor} />;
  if (itemId === 'transferbank') return <IconTransferBank width={size} height={size} color={iconColor} />;
  switch (iconName) {
    case 'payIPL':
    case 'marketplace':
      return <Shop size={size} color={iconColor} variant={variant} />;
    case 'emergency':
      return <Call size={size} color={iconColor} variant={variant} />;
    case 'guest':
      return <People size={size} color={iconColor} variant={variant} />;
    case 'ppob':
      return <IconMobile width={size} height={size} color={iconColor} />;
    case 'transfer':
    case 'withdraw':
      return <IconTransfer width={size} height={size} color={iconColor} />;
    case 'payment':
    case 'topup':
      return <IconWallet width={size} height={size} color={iconColor} />;
    case 'bill':
      return <IconBill width={size} height={size} color={iconColor} />;
    case 'donation':
    case 'heart':
      return <IconDonation width={size} height={size} color={iconColor} />;
    case 'fnb':
      return <IconFnB width={size} height={size} color={iconColor} />;
    case 'sportcenter':
      return <IconSport width={size} height={size} color={iconColor} />;
    case 'invoice':
      return <DocumentText size={size} color={iconColor} variant={variant} />;
    default:
      return <IconMore width={size} height={size} color={iconColor} />;
  }
};

const getDefaultIconBgColor = (colors: ThemeColors): string => colors.surface;

const getCategoryLabelKey = (cat: CategoryKey): string => {
  switch (cat) {
    case 'transaksi':
      return 'home.allMenuCategoryTransaksi';
    case 'simpan':
      return 'home.allMenuCategorySimpan';
    case 'lifestyle':
      return 'home.allMenuCategoryLifestyle';
    default:
      return 'home.allMenuCategoryLainnya';
  }
};

export const AllMenuSheet: React.FC<AllMenuSheetProps> = ({ visible, onClose }) => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useDimensions();
  const [items, setItems] = useState<QuickMenuItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      getEnabledMenuItems()
        .then((list) => list.filter((item) => item.id !== 'all-menu'))
        .then(setItems)
        .finally(() => setLoading(false));
    }
  }, [visible]);

  const handleSelect = useCallback(
    (item: QuickMenuItem) => {
      if (item.route) {
        (navigation as any).navigate(item.route);
      }
      onClose();
    },
    [navigation, onClose]
  );

  const categoriesMap = groupByCategory(items);
  const horizontalPadding = getHorizontalPadding();
  const gridButtonWidth =
    Math.floor((screenWidth - horizontalPadding * 2 - GRID_GAP * (GRID_ITEMS_PER_ROW - 1)) / GRID_ITEMS_PER_ROW) ||
    scale(72);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      snapPoints={[85, 150]}
      initialSnapPoint={0}
      enablePanDownToClose
    >
      <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
        <Text style={[styles.title, { color: colors.text }]}>{t('home.quickAccess')}</Text>
        <TouchableOpacity onPress={onClose} hitSlop={12} style={styles.closeArea}>
          <Text style={[styles.closeText, { color: colors.primary }]}>{t('common.close')}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={[styles.loadingContainer, { paddingBottom: insets.bottom + 40 }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: horizontalPadding, paddingBottom: insets.bottom + 80 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {CATEGORY_ORDER.map((catKey) => {
            const list = categoriesMap.get(catKey) ?? [];
            if (list.length === 0) return null;
            return (
              <View key={catKey} style={styles.categorySection}>
                <Text style={[styles.categoryTitle, { color: colors.textSecondary }]}>
                  {t(getCategoryLabelKey(catKey))}
                </Text>
                <View style={styles.grid}>
                  {list.map((item, index) => {
                    const row = Math.floor(index / GRID_ITEMS_PER_ROW);
                    const col = index % GRID_ITEMS_PER_ROW;
                    const isLastRow = row === Math.ceil(list.length / GRID_ITEMS_PER_ROW) - 1;
                    const isLastCol = col === GRID_ITEMS_PER_ROW - 1;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.gridItem,
                          {
                            width: gridButtonWidth,
                            marginRight: isLastCol ? 0 : GRID_GAP,
                            marginBottom: isLastRow ? 0 : moderateVerticalScale(12),
                          },
                        ]}
                        onPress={() => handleSelect(item)}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.gridIcon,
                            {
                              backgroundColor:
                                item.iconBgColor || getDefaultIconBgColor(colors),
                            },
                          ]}
                        >
                          {getMenuIconForSheet(item.icon, item.id, colors.primary)}
                        </View>
                        <Text style={[styles.gridLabel, { color: colors.text }]} numberOfLines={2}>
                          {item.labelKey ? t(item.labelKey) : item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: scale(2),
    paddingBottom: scale(6),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  title: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
  },
  closeArea: {
    padding: 4,
  },
  closeText: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: moderateVerticalScale(8),
    paddingBottom: moderateVerticalScale(24),
  },
  categorySection: {
    marginBottom: moderateVerticalScale(24),
  },
  categoryTitle: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(10),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  gridItem: {
    alignItems: 'center',
  },
  gridIcon: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(16),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(8),
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  gridLabel: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.medium,
    textAlign: 'center',
  },
});
