/**
 * NewsScreen
 * Full page version of NewsTab
 * Bisa digunakan sebagai screen penuh (seperti NotificationScreen)
 */
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@core/theme';
import { ScreenHeader } from '@core/config';
import { useTranslation } from '@core/i18n';
import { NewsTab } from '../components/home/TabContent/NewsTab';

export const NewsScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {/* Header */}
      <ScreenHeader
        title={t('home.news') || 'Berita'}
      />

      {/* NewsTab sebagai full page - sudah punya RefreshControl sendiri */}
      <NewsTab 
        isActive={true} 
        isVisible={true}
      />
    </SafeAreaView>
  );
};

