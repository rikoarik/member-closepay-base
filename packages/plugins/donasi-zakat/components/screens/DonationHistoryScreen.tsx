import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft2,
  Filter,
  TickCircle,
  DocumentDownload,
  DocumentText,
  Home2,
  Clock,
  Wallet,
  Profile,
  InfoCircle,
  ArrowRight2,
} from 'iconsax-react-nativejs';
import {
  scale,
  moderateScale,
  moderateVerticalScale,
  getHorizontalPadding,
  FontFamily,
} from '@core/config';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';

export const DonationHistoryScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const horizontalPadding = getHorizontalPadding();

  const history = [
    {
      id: '1',
      title: 'Zakat Penghasilan',
      provider: 'Baznas',
      date: '24 Okt, 10:30',
      amount: 'Rp 1.500.000',
      status: t('donasiZakat.success'),
      type: 'zakat',
      icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoVR9DA0h3B7ODdW3Q5-b2FphrnQZdeyfZh6YN2JNq3VLYSO7RxKKGyRgAZP_-4XsXP4L6jsHDnusS4U5PTK8P7qRx9C8h4kYeDM8ZqS7mo4_uyTVN2yJMVBw3715ij4hAOlbKsUAtBP9hgz8FURGDRer_7lVV3Mv4Zy81nFUm1bfQ1Bw6540ZRfUPNCcaelnih__xpi9eOUCGjhrZQG-MicbgLZu7cosicCPjLO-Bsi8rVSSJsqRjSQqDr1gcNZ-I-SFP2_oM2NM',
    },
    {
      id: '2',
      title: 'Sedekah Subuh',
      provider: 'Dompet Dhuafa',
      date: '24 Okt, 04:45',
      amount: 'Rp 50.000',
      status: t('donasiZakat.processing'),
      type: 'sedekah',
      icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSMkfkk4tmVLqNUg_xBiXoDTjK3Kt07sQMMEFfB7D5lkpve9b7O5qQwjjjkntv15pt1ntvKLWrFFaY23bxm0_qH6zZeCRIjHIF0rht3nNpjzL7-9UPT9RgfwcfjzBkAoHE8heIADrx1WxadxUS4YXp3dpuH888N-WJIgZ6Ex5FMCOFN8dgOOoUAj2UhMMqwenYBWPy6LYrF4Cm4VHO_TDIHUlWZl6KNxDptOw61ThFefeVpBLQcAh5zWOZZsKTCQHgKSNqz5orwR8',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + scale(12),
            paddingHorizontal: horizontalPadding,
            backgroundColor: colors.surface,
            borderBottomColor: colors.borderLight,
          },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <ArrowLeft2 size={scale(24)} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('donasiZakat.kindnessHistory')}
        </Text>
        <TouchableOpacity style={styles.headerButton}>
          <Filter size={scale(24)} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
          <View style={[styles.summaryGradient, { backgroundColor: colors.primary }]} />
          <View style={styles.summaryContent}>
            <View style={styles.summaryTop}>
              <Text style={styles.summaryLabel}>
                {t('donasiZakat.totalKindness', { year: '2024' })}
              </Text>
              <TickCircle size={scale(20)} color="rgba(255,255,255,0.8)" />
            </View>
            <Text style={styles.summaryAmount}>Rp 5.250.000</Text>
            <View style={styles.divider} />
            <View style={styles.summaryStats}>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>{t('donasiZakat.totalZakat')}</Text>
                <Text style={styles.statValue}>Rp 3.500.000</Text>
              </View>
              <View style={styles.verticalDivider} />
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>{t('donasiZakat.totalSedekah')}</Text>
                <Text style={styles.statValue}>Rp 1.750.000</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={[styles.monthLabel, { color: colors.textTertiary }]}>OKTOBER 2024</Text>

        {/* History List */}
        <View style={styles.listContainer}>
          {history.map((item) => (
            <View
              key={item.id}
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.borderLight },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardLeft}>
                  <View
                    style={[
                      styles.cardIconBox,
                      {
                        backgroundColor:
                          item.type === 'zakat' ? colors.successLight : colors.infoLight,
                        borderColor: colors.borderLight,
                      },
                    ]}
                  >
                    <Image source={{ uri: item.icon }} style={styles.cardIcon} />
                  </View>
                  <View>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
                      {item.provider} • {item.date}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardRight}>
                  <Text style={[styles.cardAmount, { color: colors.primary }]}>{item.amount}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          item.status === t('donasiZakat.success')
                            ? colors.successLight
                            : colors.warningLight,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            item.status === t('donasiZakat.success')
                              ? colors.success
                              : colors.warning,
                        },
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>
              </View>

              {item.status === t('donasiZakat.processing') && (
                <View style={[styles.infoBox, { backgroundColor: colors.background }]}>
                  <InfoCircle size={scale(14)} color={colors.warning} variant="Bold" />
                  <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    {t('donasiZakat.distributionReportInfo')}
                  </Text>
                </View>
              )}

              <View style={[styles.cardFooter, { borderTopColor: colors.borderLight }]}>
                <TouchableOpacity style={styles.footerBtn}>
                  <DocumentDownload size={scale(14)} color={colors.primary} />
                  <Text style={[styles.footerBtnText, { color: colors.primary }]}>
                    {item.type === 'zakat'
                      ? t('donasiZakat.downloadZakatReceipt')
                      : t('donasiZakat.downloadReceipt')}
                  </Text>
                </TouchableOpacity>
                <View style={[styles.footerDivider, { backgroundColor: colors.borderLight }]} />
                <TouchableOpacity style={styles.footerBtnSide}>
                  <DocumentText size={scale(14)} color={colors.textTertiary} />
                  <Text style={[styles.footerBtnTextSide, { color: colors.textTertiary }]}>
                    {t('common.detail')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: scale(12),
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: scale(8),
  },
  headerTitle: {
    fontSize: scale(18),
    fontFamily: FontFamily.monasans.bold,
  },
  scrollContent: {
    paddingHorizontal: getHorizontalPadding(),
    paddingBottom: moderateVerticalScale(40),
  },
  summaryCard: {
    marginTop: scale(24),
    borderRadius: scale(24),
    overflow: 'hidden',
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  summaryGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  summaryContent: {
    padding: scale(24),
    zIndex: 1,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(8),
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: scale(12),
    fontFamily: FontFamily.monasans.medium,
  },
  summaryAmount: {
    color: '#FFF',
    fontSize: scale(32),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: scale(24),
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: scale(16),
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statCol: {
    flex: 1,
  },
  verticalDivider: {
    width: 1,
    height: scale(32),
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: scale(16),
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: scale(11),
    marginBottom: scale(4),
  },
  statValue: {
    color: '#FFF',
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.bold,
  },
  monthLabel: {
    marginTop: moderateVerticalScale(32),
    fontSize: scale(12),
    fontFamily: FontFamily.monasans.bold,
    letterSpacing: 1.2,
    marginBottom: scale(16),
  },
  listContainer: {
    gap: scale(16),
  },
  card: {
    padding: scale(16),
    borderRadius: scale(24),
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardLeft: {
    flexDirection: 'row',
    gap: scale(12),
    flex: 1,
  },
  cardIconBox: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  cardIcon: {
    width: scale(32),
    height: scale(32),
    resizeMode: 'contain',
  },
  cardTitle: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.bold,
    marginBottom: scale(2),
  },
  cardSub: {
    fontSize: scale(11),
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  cardAmount: {
    fontSize: scale(14),
    fontFamily: FontFamily.monasans.bold,
  },
  statusBadge: {
    marginTop: scale(4),
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    borderRadius: scale(4),
  },
  statusText: {
    fontSize: scale(10),
    fontFamily: FontFamily.monasans.bold,
  },
  infoBox: {
    flexDirection: 'row',
    gap: scale(8),
    padding: scale(12),
    borderRadius: scale(12),
    marginTop: scale(12),
  },
  infoText: {
    flex: 1,
    fontSize: scale(11),
    lineHeight: scale(16),
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scale(16),
    paddingTop: scale(12),
    borderTopWidth: 1,
  },
  footerBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
  },
  footerBtnSide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
  },
  footerBtnText: {
    fontSize: scale(12),
    fontFamily: FontFamily.monasans.bold,
  },
  footerBtnTextSide: {
    fontSize: scale(12),
    fontFamily: FontFamily.monasans.medium,
  },
  footerDivider: {
    width: 1,
    height: scale(16),
  },
});

export default DonationHistoryScreen;
