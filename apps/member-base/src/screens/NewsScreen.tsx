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
      <ScreenHeader title={t('home.news') || 'Berita'} />
      <NewsTab
        isActive={true}
        isVisible={true}
        scrollEnabled={true}
      />
    </SafeAreaView>
  );
};
