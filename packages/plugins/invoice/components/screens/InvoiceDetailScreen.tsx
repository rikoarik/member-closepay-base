import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft2, DocumentDownload, Wallet, Printer, Send2 } from 'iconsax-react-nativejs';
import { useTheme } from '@core/theme';
import { scale, FontFamily, ScreenHeader } from '@core/config';
import { useTranslation } from '@core/i18n';
import { getInvoiceById } from '../../hooks';
import type { Invoice, InvoiceStatus } from '../../models';
import { Screen } from 'react-native-screens';

const fontRegular = FontFamily?.monasans?.regular ?? 'System';
const fontSemiBold = FontFamily?.monasans?.semiBold ?? 'System';
const fontBold = FontFamily?.monasans?.bold ?? 'System';
const fontExtraBold = fontBold;

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

export const InvoiceDetailScreen: React.FC = () => {
  const { colors } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const params = route.params as { invoiceId?: string; invoice?: Invoice } | undefined;
  // Support passing ID or object directly (though ID is safer for fresh data)
  const invoiceId = params?.invoiceId || params?.invoice?.id;
  const invoiceData = invoiceId ? getInvoiceById(invoiceId) : params?.invoice;

  // Fallback if not found
  if (!invoiceData) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader title={t('invoice.detailTitle')} style={{ paddingTop: insets.top }} />
        <View style={styles.emptyState}>
          <Text
            style={{ color: colors.textSecondary, fontFamily: fontSemiBold, fontSize: scale(14) }}
          >
            Invoice tidak ditemukan
          </Text>
        </View>
      </View>
    );
  }

  const invoice = invoiceData;
  const isUnpaid =
    invoice.status === 'belum_lunas' ||
    invoice.status === 'terlambat' ||
    invoice.status === 'menunggu';
  const isLate = invoice.status === 'terlambat';

  // Items breakdown
  const items = invoice.items || [];
  const subtotal = invoice.subtotal || items.reduce((sum, item) => sum + item.amount, 0);
  const adminFee = invoice.adminFee || 0;
  const promo = invoice.promo || invoice.discount || 0;
  const total = invoice.amount;

  // Formatters
  const formatCurrency = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const showPayButton =
    invoice.status === 'belum_lunas' ||
    invoice.status === 'terlambat' ||
    invoice.status === 'menunggu' ||
    invoice.status === 'dicicil';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Custom Header with Actions */}
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft2 size={scale(24)} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('invoice.detailTitle')}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity>
            <Send2 size={scale(20)} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Printer size={scale(20)} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity>
            <DocumentDownload size={scale(20)} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + scale(100) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* INFO CARD */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.borderLight },
          ]}
        >
          {/* Row 1: From & Status */}
          <View
            style={[
              styles.infoRow,
              {
                borderBottomColor: colors.borderLight,
                borderBottomWidth: 1,
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textTertiary }]}>
                {t('invoice.billedFrom').toUpperCase()}
              </Text>
              <Text style={[styles.value, { color: colors.text }]}>{invoice.billedFrom}</Text>
            </View>
            <View
              style={[styles.statusBadge, { backgroundColor: isUnpaid ? '#FEF2F2' : '#F0FDF4' }]}
            >
              <Text style={[styles.statusText, { color: isUnpaid ? '#DC2626' : '#16A34A' }]}>
                {t(getStatusLabelKey(invoice.status))}
              </Text>
            </View>
          </View>

          {/* Row 2: Dates Grid */}
          <View style={styles.datesRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textTertiary }]}>
                {t('invoice.billingDate')}
              </Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {formatDate(invoice.issuedDate)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textTertiary }]}>
                {t('invoice.dueDate')}
              </Text>
              <Text style={[styles.value, { color: isLate ? colors.error : colors.text }]}>
                {formatDate(invoice.dueDate)}
              </Text>
            </View>
          </View>

          {/* Row 3: To */}
          <View
            style={{
              marginTop: scale(12),
              paddingTop: scale(12),
              borderTopWidth: 1,
              borderTopColor: colors.borderLight,
            }}
          >
            <Text style={[styles.label, { color: colors.textTertiary }]}>
              {t('invoice.billedTo').toUpperCase()}
            </Text>
            <Text style={[styles.value, { color: colors.text }]}>{invoice.billedTo}</Text>
            <Text style={[styles.subValue, { color: colors.textSecondary }]}>
              {invoice.customerNumber}
            </Text>
          </View>
        </View>

        {/* BREAKDOWN CARD */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.borderLight,
            },
          ]}
        >
          <Text style={[styles.cardHeader, { color: colors.text }]}>
            {t('invoice.costBreakdown')}
          </Text>
          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          {/* Invoice Amount (Subtotal + Admin) */}
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>
              {t('invoice.subtotal')}
            </Text>
            <Text style={[styles.rowValue, { color: colors.text }]}>
              {formatCurrency(subtotal + adminFee)}
            </Text>
          </View>

          {/* Discount */}
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>
              {t('invoice.discount')}
            </Text>
            <Text style={[styles.rowValue, { color: colors.success }]}>
              - {formatCurrency(promo)}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          {/* Total Bill */}
          <View style={styles.row}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>
              {t('invoice.totalInvoice')}
            </Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>{formatCurrency(total)}</Text>
          </View>

          {/* Paid Amount */}
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>
              {t('invoice.amountPaid')}
            </Text>
            <Text style={[styles.rowValue, { color: colors.success }]}>
              {formatCurrency(invoice.amountPaid)}
            </Text>
          </View>

          {/* Remaining (Highlighted) */}
          <View style={[styles.highlightRow, { backgroundColor: '#FEF2F2' }]}>
            <Text style={[styles.highlightLabel, { color: '#B91C1C' }]}>
              {t('invoice.statusUnpaid')}
            </Text>
            <Text style={[styles.highlightValue, { color: '#DC2626' }]}>
              {formatCurrency(total - invoice.amountPaid)}
            </Text>
          </View>
        </View>

        {/* DESCRIPTION CARD */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.borderLight,
            },
          ]}
        >
          <Text style={[styles.cardHeader, { color: colors.text }]}>
            {t('invoice.description')}
          </Text>
          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
          <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
            {invoice.description}
          </Text>
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      {showPayButton && (
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderTopColor: colors.borderLight,
              paddingBottom: Math.max(insets.bottom, scale(20)),
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.payButton,
              { backgroundColor: colors.primary, shadowColor: colors.primary },
            ]}
            onPress={() => (navigation as any).navigate('InvoicePayment', { invoice })}
          >
            <Wallet size={scale(24)} color={colors.surface} variant="Bold" />
            <Text style={[styles.payButtonText, { color: colors.surface }]}>
              {t('invoice.payNow')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    height: scale(56),
    borderBottomWidth: 1,
    zIndex: 10,
  },
  backButton: {
    width: scale(40),
    height: scale(40),
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontFamily: fontBold,
    fontSize: scale(16),
    flex: 1,
  },
  headerRightPlaceholder: {
    width: scale(40),
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(16),
  },

  content: {
    padding: scale(16),
  },

  // Cards
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: scale(16),
    marginBottom: scale(16),
  },
  cardHeader: {
    fontFamily: fontBold,
    fontSize: scale(14),
    marginBottom: scale(12),
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: scale(12),
  },

  // Info Row
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  datesRow: {
    flexDirection: 'row',
    gap: scale(24),
    marginTop: scale(12),
  },

  // Text Styles
  label: {
    fontFamily: fontSemiBold,
    fontSize: scale(10),
    marginBottom: scale(4),
  },
  value: {
    fontFamily: fontBold,
    fontSize: scale(12),
  },
  subValue: {
    fontFamily: fontRegular,
    fontSize: scale(10),
    marginTop: scale(2),
  },
  descriptionText: {
    fontFamily: fontRegular,
    fontSize: scale(12),
    lineHeight: scale(18),
  },

  // Status Badge
  statusBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: 6,
  },
  statusText: {
    fontFamily: fontBold,
    fontSize: scale(10),
    textTransform: 'uppercase',
  },

  // Breakdown Rows
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(8),
  },
  rowLabel: {
    fontFamily: fontRegular,
    fontSize: scale(12),
  },
  rowValue: {
    fontFamily: fontSemiBold,
    fontSize: scale(12),
  },
  totalLabel: {
    fontFamily: fontBold,
    fontSize: scale(13),
  },
  totalValue: {
    fontFamily: fontBold,
    fontSize: scale(14),
  },

  // Highlight Row (Unpaid)
  highlightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale(12),
    borderRadius: 8,
    marginTop: scale(8),
  },
  highlightLabel: {
    fontFamily: fontBold,
    fontSize: scale(12),
  },
  highlightValue: {
    fontFamily: fontBold,
    fontSize: scale(12),
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: scale(16),
    paddingTop: scale(16),
    borderTopWidth: 1,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(12),
    height: scale(48),
    borderRadius: 12,
  },
  payButtonText: {
    fontFamily: fontBold,
    fontSize: scale(14),
  },
});
