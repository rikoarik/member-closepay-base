import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@core/theme';
import { useNavigation } from '@react-navigation/native';
import { Receipt1 } from 'iconsax-react-nativejs';
import { getResponsiveFontSize, FontFamily, moderateVerticalScale, scale } from '@core/config';
import { useTranslation } from '@core/i18n';
import { getInvoices } from '../../hooks';
import type { InvoiceStatus } from '../../models';

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

interface InvoiceFeaturedProps {
  isActive?: boolean;
  isVisible?: boolean;
}

export const InvoiceFeatured: React.FC<InvoiceFeaturedProps> = React.memo(
  ({ isActive = true, isVisible = true }) => {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation();

    const recentInvoices = useMemo(() => {
      return getInvoices()
        .filter((inv) => inv.status !== 'lunas')
        .slice(0, 5);
    }, []);

    const getStatusColors = (status: InvoiceStatus) => {
      switch (status) {
        case 'lunas':
          return { bg: colors.successLight, text: colors.success };
        case 'belum_lunas':
          return { bg: colors.errorLight, text: colors.error };
        case 'dicicil':
          return { bg: colors.warningLight, text: colors.warning };
        default:
          return { bg: colors.primaryLight, text: colors.primary };
      }
    };

    if (recentInvoices.length === 0) return null;

    const handleInvoicePress = (invoiceId: string) => {
      (navigation as any).navigate('InvoiceDetail', { invoiceId });
    };

    return (
      <View style={styles.section}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Tagihan</Text>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => navigation.navigate('Invoice' as never)}
          >
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
          {recentInvoices.map((invoice) => {
            const statusCfg = getStatusColors(invoice.status);
            return (
              <TouchableOpacity
                key={invoice.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => handleInvoicePress(invoice.id)}
                activeOpacity={0.7}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.iconBg, { backgroundColor: colors.primaryLight }]}>
                    <Receipt1 size={scale(16)} color={colors.primary} variant="Bold" />
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: statusCfg.bg }]}>
                    <Text style={[styles.statusText, { color: statusCfg.text }]}>
                      {STATUS_LABELS[invoice.status]}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
                  {invoice.title}
                </Text>
                <Text style={[styles.cardAmount, { color: colors.primary }]}>
                  Rp {invoice.amount.toLocaleString('id-ID')}
                </Text>
                <Text style={[styles.cardDate, { color: colors.textSecondary }]}>
                  Jatuh tempo:{' '}
                  {new Date(invoice.dueDate).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }
);

InvoiceFeatured.displayName = 'InvoiceFeatured';

const styles = StyleSheet.create({
  section: {
    marginBottom: moderateVerticalScale(16),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: getResponsiveFontSize('large'),
    fontFamily: FontFamily.monasans.bold,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  seeAll: {
    fontSize: getResponsiveFontSize('medium'),
    fontFamily: FontFamily.monasans.medium,
  },
  list: {
    gap: scale(12),
  },
  card: {
    width: scale(160),
    borderRadius: 12,
    borderWidth: 1,
    padding: scale(14),
    marginRight: scale(4),
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(10),
  },
  iconBg: {
    width: scale(32),
    height: scale(32),
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusPill: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    borderRadius: 6,
  },
  statusText: {
    fontSize: scale(8),
    fontFamily: fontBold,
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: fontSemiBold,
    marginBottom: scale(6),
    lineHeight: scale(16),
  },
  cardAmount: {
    fontSize: scale(13),
    fontFamily: fontBold,
    marginBottom: scale(4),
  },
  cardDate: {
    fontSize: getResponsiveFontSize('xsmall'),
    fontFamily: fontRegular,
  },
});
