/**
 * StoreNearby - Widget toko terdekat di Beranda
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@core/theme';
import { useNavigation } from '@react-navigation/native';
import {
  getResponsiveFontSize,
  FontFamily,
  moderateVerticalScale,
  scale,
} from '@core/config';
import { useTranslation } from '@core/i18n';
import { StoreCard, type Store } from '../stores/StoreCard';
import { useStoreData } from '../hooks/useStoreData';

const CARD_WIDTH = 220;

export const StoreNearby: React.FC = React.memo(() => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const stores = useStoreData(5);

  const handleStorePress = (store: Store) => {
    navigation.navigate('FnBMerchantDetail' as never, {
      storeId: store.id,
      storeName: store.name,
      entryPoint: 'beranda',
    });
  };

  if (!stores.length) return null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('home.storeNearby') || 'Toko Terdekat'}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('FnB' as never)}>
          <Text style={[styles.seeAll, { color: colors.primary }]}>
            {t('common.viewAll') || 'Lihat Semua'}
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {stores.slice(0, 4).map((store) => (
          <View key={store.id} style={styles.cardWrapper}>
            <StoreCard store={store} onPress={handleStorePress} width={scale(CARD_WIDTH)} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
});

StoreNearby.displayName = 'StoreNearby';

const styles = StyleSheet.create({
  section: {
    marginBottom: moderateVerticalScale(16),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(12),
  },
  title: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
  },
  seeAll: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.medium,
  },
  list: {
    gap: 12,
    paddingRight: 4,
  },
  cardWrapper: {
    marginRight: 12,
  },
});
