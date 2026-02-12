/**
 * SportCenterWishlistScreen Component
 * Daftar venue favorit user
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Heart, Location } from 'iconsax-react-nativejs';
import {
  scale,
  moderateVerticalScale,
  FontFamily,
  getHorizontalPadding,
  getResponsiveFontSize,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { useSportCenterData } from '../../hooks';

import { useTabBar } from '../navigation/TabBarContext';

const fontRegular = FontFamily?.monasans?.regular ?? 'System';
const fontSemiBold = FontFamily?.monasans?.semiBold ?? 'System';
const fontBold = FontFamily?.monasans?.bold ?? 'System';

export const SportCenterWishlistScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const paddingH = getHorizontalPadding();

  // Mock wishlist data: take first 3 facilities as "favorites" for demo
  const { facilities, loading } = useSportCenterData('all');
  const { toggleTabBar } = useTabBar();
  const lastContentOffset = React.useRef(0);

  const wishlistItems = React.useMemo(() => {
    return facilities.slice(0, 3);
  }, [facilities]);

  const handleScroll = (event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const diff = currentOffset - lastContentOffset.current;

    if (Math.abs(diff) > 3) {
      if (diff > 0 && currentOffset > 20) {
        toggleTabBar(false);
      } else {
        toggleTabBar(true);
      }
    }
    lastContentOffset.current = currentOffset;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingHorizontal: paddingH, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('sportCenter.wishlist') || 'Favorit'}
        </Text>
        <Heart size={scale(24)} color={colors.primary} variant="Bold" />
      </View>

      <ScrollView
         contentContainerStyle={[
           styles.scrollContent,
           { paddingHorizontal: paddingH, paddingBottom: moderateVerticalScale(100) }
         ]}
         showsVerticalScrollIndicator={false}
         onScroll={handleScroll}
         scrollEventThrottle={16}
      >
        {!loading && wishlistItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Heart size={scale(48)} color={colors.textSecondary} variant="Bulk" />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('sportCenter.emptyWishlist') || 'Belum ada favorit'}
            </Text>
          </View>
        ) : (
          wishlistItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
              activeOpacity={0.7}
              onPress={() => {
                // @ts-ignore
                navigation.navigate('SportCenterFacilityDetail', { facilityId: item.id });
              }}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Heart size={scale(20)} color={colors.primary} variant="Bold" />
                </View>

                <View style={styles.infoRow}>
                  <Location size={scale(14)} color={colors.textSecondary} variant="Bold" />
                  <Text
                    style={[styles.infoText, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {item.address || 'Jakarta'}
                  </Text>
                </View>

                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
                    {t('sportCenter.startingFrom') || 'Mulai dari'}
                  </Text>
                  <Text style={[styles.priceValue, { color: colors.primary }]}>
                    Rp {(item.pricePerSlot || 0).toLocaleString('id-ID')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateVerticalScale(12),
    gap: scale(12),
  },
  backButton: { padding: scale(4) },
  headerTitle: {
    fontFamily: fontSemiBold,
    fontSize: getResponsiveFontSize('large'),
    flex: 1,
  },
  scrollContent: {
    paddingBottom: moderateVerticalScale(32),
  },
  emptyContainer: {
    paddingVertical: moderateVerticalScale(48),
    alignItems: 'center',
    gap: scale(16),
  },
  emptyText: {
    fontFamily: fontRegular,
    fontSize: getResponsiveFontSize('medium'),
  },
  card: {
    flexDirection: 'row',
    padding: scale(12),
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: moderateVerticalScale(12),
  },
  cardImage: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(12),
    marginRight: scale(12),
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: scale(8),
  },
  cardTitle: {
    fontFamily: fontSemiBold,
    fontSize: getResponsiveFontSize('medium'),
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    marginTop: scale(4),
  },
  infoText: {
    fontFamily: fontRegular,
    fontSize: getResponsiveFontSize('small'),
    flex: 1,
  },
  priceRow: {
    marginTop: scale(8),
  },
  priceLabel: {
    fontFamily: fontRegular,
    fontSize: scale(10),
  },
  priceValue: {
    fontFamily: fontSemiBold,
    fontSize: getResponsiveFontSize('medium'),
  },
});

