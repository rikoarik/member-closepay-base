/**
 * EditProfileScreen Component
 * Screen untuk edit profile user
 * Responsive untuk semua device termasuk EDC
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Keyboard,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Profile, GalleryEdit, Camera, Gallery } from 'iconsax-react-nativejs';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
import { useAuth } from '@core/auth';
import {
  scale,
  moderateScale,
  moderateVerticalScale,
  getHorizontalPadding,
  getVerticalPadding,
  getMinTouchTarget,
  getResponsiveFontSize,
  getIconSize,
  FontFamily,
  BottomSheet,
  permissionService,
  ScreenHeader,
} from '@core/config';
import { MediaType } from 'react-native-image-picker/lib/typescript/types';

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState(user?.email || 'Zakkitampan@gmail.com');
  const [name, setName] = useState(user?.name || 'Ilham Tarore');
  const [phone, setPhone] = useState('0892132731');
  const [address, setAddress] = useState('Bener, kec tengaran, kab semarang');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Initial values for dirty check
  const [initialValues, setInitialValues] = useState({
    email: user?.email || 'Zakkitampan@gmail.com',
    name: user?.name || 'Ilham Tarore',
    phone: '0892132731',
    address: 'Bener, kec tengaran, kab semarang',
    profileImage: null as string | null,
  });

  const isDirty =
    email !== initialValues.email ||
    name !== initialValues.name ||
    phone !== initialValues.phone ||
    address !== initialValues.address ||
    profileImage !== initialValues.profileImage;
  const emailInputRef = useRef<TextInput>(null);
  const nameInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);
  const addressInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);
  const inputRefs = useRef<{ [key: string]: TextInput | null }>({});

  // Setup input refs
  useEffect(() => {
    inputRefs.current = {
      email: emailInputRef.current,
      name: nameInputRef.current,
      phone: phoneInputRef.current,
      address: addressInputRef.current,
    };
  }, []);

  // Auto scroll to focused input when keyboard appears
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        // Find which input is focused
        const focusedInput = Object.keys(inputRefs.current).find((key) => {
          const input = inputRefs.current[key];
          return input && input.isFocused();
        });

        if (focusedInput && scrollViewRef.current) {
          // Scroll to focused input with some offset
          setTimeout(() => {
            const inputIndex = ['email', 'name', 'phone', 'address'].indexOf(focusedInput);
            const scrollOffset = inputIndex * moderateVerticalScale(100); // Approximate offset per input
            scrollViewRef.current?.scrollToPosition(0, scrollOffset, true);
          }, 100);
        }
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  const validateForm = (): boolean => {
    let isValid = true;

    // Validate email
    if (!email.trim()) {
      setEmailError(t('profile.emailRequired'));
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError(t('profile.emailInvalid'));
      isValid = false;
    } else {
      setEmailError('');
    }

    // Validate name
    if (!name.trim()) {
      setNameError(t('profile.nameRequired'));
      isValid = false;
    } else {
      setNameError('');
    }

    // Validate phone
    if (!phone.trim()) {
      setPhoneError(t('profile.phoneRequired'));
      isValid = false;
    } else if (!/^[0-9+\-\s()]+$/.test(phone.trim())) {
      setPhoneError(t('profile.phoneInvalid'));
      isValid = false;
    } else {
      setPhoneError('');
    }

    return isValid;
  };

  const handleChangePhoto = () => {
    setShowPhotoPicker(true);
  };

  const handleSelectFromGallery = () => {
    setShowPhotoPicker(false);

    if (Platform.OS === 'android') {
      // Use native ImagePickerModule for Android (with crop)
      const { NativeModules } = require('react-native');
      const { ImagePickerModule } = NativeModules;

      if (!ImagePickerModule || !ImagePickerModule.pickImage) {
        Alert.alert(
          t('common.error') || 'Error',
          t('profile.imagePickerNotAvailable') || 'Image picker module tidak tersedia.',
          [{ text: t('common.ok') || 'OK' }]
        );
        return;
      }

      ImagePickerModule.pickImage({
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.8,
      })
        .then((result: any) => {
          if (result && result.uri) {
            const imageUri = result.uri.startsWith('file://') ? result.uri : `file://${result.uri}`;
            setProfileImage(imageUri);
          }
        })
        .catch((error: any) => {
          console.error('Error selecting image from gallery:', error);

          if (error.code === 'CANCELLED') {
            return;
          }

          Alert.alert(
            t('common.error') || 'Error',
            error.message ||
              t('profile.imagePickerError') ||
              'Terjadi kesalahan saat memilih foto.',
            [{ text: t('common.ok') || 'OK' }]
          );
        });
    } else {
      // iOS: Use basic image picker without crop for now
      const { launchImageLibrary } = require('react-native-image-picker');

      const options = {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 1024,
        maxWidth: 1024,
        quality: 0.8,
      };

      launchImageLibrary(options, (response: any) => {
        if (response.didCancel) {
          return;
        }

        if (response.errorMessage) {
          Alert.alert(
            t('common.error') || 'Error',
            response.errorMessage ||
              t('profile.imagePickerError') ||
              'Terjadi kesalahan saat memilih foto.',
            [{ text: t('common.ok') || 'OK' }]
          );
          return;
        }

        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          if (asset.uri) {
            setProfileImage(asset.uri);
          }
        }
      });
    }
  };

  const handleTakePhoto = async () => {
    setShowPhotoPicker(false);

    try {
      // Request camera permission first
      const permissionResult = await permissionService.requestCameraPermission();

      if (permissionResult.status !== 'granted') {
        Alert.alert(
          t('profile.cameraPermissionRequired') || 'Izin Kamera Diperlukan',
          t('profile.cameraPermissionMessage') ||
            'Aplikasi memerlukan izin kamera untuk mengambil foto. Silakan aktifkan izin kamera di pengaturan.',
          [
            { text: t('common.cancel') || 'Batal', style: 'cancel' },
            {
              text: t('common.settings') || 'Pengaturan',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              },
            },
          ]
        );
        return;
      }

      if (Platform.OS === 'android') {
        // Use native ImagePickerModule for Android (with crop)
        const { NativeModules } = require('react-native');
        const { ImagePickerModule } = NativeModules;

        if (!ImagePickerModule || !ImagePickerModule.takePicture) {
          Alert.alert(
            t('common.error') || 'Error',
            t('profile.imagePickerNotAvailable') || 'Image picker module tidak tersedia.',
            [{ text: t('common.ok') || 'OK' }]
          );
          return;
        }

        const result = await ImagePickerModule.takePicture({
          maxWidth: 1024,
          maxHeight: 1024,
          quality: 0.8,
        });

        if (result && result.uri) {
          const imageUri = result.uri.startsWith('file://') ? result.uri : `file://${result.uri}`;
          setProfileImage(imageUri);
        }
      } else {
        // iOS: Use basic camera without crop for now
        const { launchCamera } = require('react-native-image-picker');

        const options = {
          mediaType: 'photo',
          includeBase64: false,
          maxHeight: 1024,
          maxWidth: 1024,
          quality: 0.8,
        };

        launchCamera(options, (response: any) => {
          if (response.didCancel) {
            return;
          }

          if (response.errorMessage) {
            Alert.alert(
              t('common.error') || 'Error',
              response.errorMessage ||
                t('profile.cameraError') ||
                'Terjadi kesalahan saat mengambil foto.',
              [{ text: t('common.ok') || 'OK' }]
            );
            return;
          }

          if (response.assets && response.assets[0]) {
            const asset = response.assets[0];
            if (asset.uri) {
              setProfileImage(asset.uri);
            }
          }
        });
      }
    } catch (error: any) {
      console.error('Error taking photo:', error);

      if (error.code === 'CANCELLED') {
        // User cancelled, no need to show error
        return;
      }

      Alert.alert(
        t('common.error') || 'Error',
        error.message || t('profile.cameraError') || 'Terjadi kesalahan saat mengambil foto.',
        [{ text: t('common.ok') || 'OK' }]
      );
    }
  };

  const handleRemovePhoto = () => {
    setShowPhotoPicker(false);
    Alert.alert(
      t('profile.removePhoto') || 'Hapus Foto',
      t('profile.removePhotoConfirmation') || 'Apakah Anda yakin ingin menghapus foto profil?',
      [
        {
          text: t('common.cancel') || 'Batal',
          style: 'cancel',
        },
        {
          text: t('common.remove') || 'Hapus',
          style: 'destructive',
          onPress: () => {
            setProfileImage(null);
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Implement API call to update profile
      await new Promise<void>((resolve) => setTimeout(resolve, 1000));
      // @ts-ignore - navigation type akan di-setup nanti
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <View style={styles.contentWrapper}>
        {/* Header */}
        <ScreenHeader
          title={t('profile.editProfile')}
          onBackPress={() => navigation.goBack()}
          style={{
            paddingBottom: moderateVerticalScale(16),
          }}
          rightComponent={
            isDirty ? (
              <TouchableOpacity
                onPress={handleSave}
                disabled={isSaving}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text
                  style={{
                    color: colors.primary,
                    fontFamily: FontFamily.monasans.bold,
                    fontSize: getResponsiveFontSize('medium'),
                  }}
                >
                  {isSaving ? t('common.loading') : t('common.save')}
                </Text>
              </TouchableOpacity>
            ) : null
          }
        />

        {/* Form */}
        <KeyboardAwareScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: getHorizontalPadding() },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          extraScrollHeight={20}
        >
          {/* Profile Photo Section */}
          <View style={styles.profilePhotoSection}>
            <View style={styles.profilePhotoContainer}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={[styles.profilePhoto, { borderColor: colors.surface }]}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[
                    styles.profilePhotoPlaceholder,
                    {
                      backgroundColor: colors.primaryLight,
                      borderColor: colors.surface,
                    },
                  ]}
                >
                  {name ? (
                    <Text
                      style={[
                        styles.profilePhotoInitial,
                        {
                          color: colors.primary,
                          fontSize: getResponsiveFontSize('xlarge'),
                        },
                      ]}
                    >
                      {name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </Text>
                  ) : (
                    <Profile size={scale(60)} color={colors.primary} variant="Bold" />
                  )}
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.changePhotoButton}
              onPress={handleChangePhoto}
              activeOpacity={0.7}
            >
              <GalleryEdit size={getIconSize('small')} color={colors.primary} />

              <Text
                style={[
                  styles.changePhotoText,
                  {
                    color: colors.primary,
                    fontSize: getResponsiveFontSize('medium'),
                  },
                ]}
              >
                {profileImage
                  ? t('profile.changePhoto') || 'Ganti Foto'
                  : t('profile.addPhoto') || 'Tambah Foto'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                  fontSize: getResponsiveFontSize('medium'),
                },
              ]}
            >
              {t('auth.email')}
            </Text>
            <TextInput
              ref={emailInputRef}
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: emailError ? colors.error : colors.border,
                  color: colors.text,
                  fontSize: getResponsiveFontSize('medium'),
                },
              ]}
              placeholder={t('auth.enterEmail')}
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSaving}
              returnKeyType="next"
              onSubmitEditing={() => nameInputRef.current?.focus()}
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToPosition(0, 0, true);
                }, 100);
              }}
            />
            {emailError ? (
              <Text style={[styles.errorText, { color: colors.error }]}>{emailError}</Text>
            ) : null}
          </View>

          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                  fontSize: getResponsiveFontSize('medium'),
                },
              ]}
            >
              {t('profile.name')}
            </Text>
            <TextInput
              ref={nameInputRef}
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: nameError ? colors.error : colors.border,
                  color: colors.text,
                  fontSize: getResponsiveFontSize('medium'),
                },
              ]}
              placeholder={t('profile.enterName')}
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (nameError) setNameError('');
              }}
              autoCapitalize="words"
              editable={!isSaving}
              returnKeyType="next"
              onSubmitEditing={() => phoneInputRef.current?.focus()}
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToPosition(0, moderateVerticalScale(100), true);
                }, 100);
              }}
            />
            {nameError ? (
              <Text style={[styles.errorText, { color: colors.error }]}>{nameError}</Text>
            ) : null}
          </View>

          {/* Phone Input */}
          <View style={styles.inputContainer}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                  fontSize: getResponsiveFontSize('medium'),
                },
              ]}
            >
              {t('profile.phoneNumber')}
            </Text>
            <TextInput
              ref={phoneInputRef}
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: phoneError ? colors.error : colors.border,
                  color: colors.text,
                  fontSize: getResponsiveFontSize('medium'),
                },
              ]}
              placeholder={t('profile.enterPhoneNumber')}
              placeholderTextColor={colors.textTertiary}
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (phoneError) setPhoneError('');
              }}
              keyboardType="phone-pad"
              editable={!isSaving}
              returnKeyType="next"
              onSubmitEditing={() => addressInputRef.current?.focus()}
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToPosition(0, moderateVerticalScale(200), true);
                }, 100);
              }}
            />
            {phoneError ? (
              <Text style={[styles.errorText, { color: colors.error }]}>{phoneError}</Text>
            ) : null}
          </View>

          {/* Address Input */}
          <View style={styles.inputContainer}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                  fontSize: getResponsiveFontSize('medium'),
                },
              ]}
            >
              {t('profile.address')}
            </Text>
            <TextInput
              ref={addressInputRef}
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: colors.text,
                  fontSize: getResponsiveFontSize('medium'),
                },
              ]}
              placeholder={t('profile.enterAddress')}
              placeholderTextColor={colors.textTertiary}
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={!isSaving}
              returnKeyType="done"
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToPosition(0, moderateVerticalScale(300), true);
                }, 100);
              }}
            />
          </View>
        </KeyboardAwareScrollView>
      </View>

      {/* Photo Picker Bottom Sheet */}
      <BottomSheet
        visible={showPhotoPicker}
        onClose={() => setShowPhotoPicker(false)}
        snapPoints={[100]}
      >
        <View style={[styles.bottomSheetContent, { paddingHorizontal: getHorizontalPadding() }]}>
          {/* Camera Option */}
          <TouchableOpacity
            style={[
              styles.bottomSheetOption,
              {
                backgroundColor: colors.surface,
                borderBottomColor: colors.border,
              },
            ]}
            onPress={handleTakePhoto}
            activeOpacity={0.7}
          >
            <View style={styles.bottomSheetOptionLeft}>
              <View
                style={[styles.bottomSheetIconContainer, { backgroundColor: colors.primaryLight }]}
              >
                <Camera size={getIconSize('medium')} color={colors.primary} />
              </View>
              <Text
                style={[
                  styles.bottomSheetOptionText,
                  {
                    color: colors.text,
                    fontSize: getResponsiveFontSize('large'),
                  },
                ]}
              >
                {t('profile.fromCamera') || 'Ambil Foto'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Gallery Option */}
          <TouchableOpacity
            style={[
              styles.bottomSheetOption,
              {
                backgroundColor: colors.surface,
                borderBottomColor: colors.border,
              },
            ]}
            onPress={handleSelectFromGallery}
            activeOpacity={0.7}
          >
            <View style={styles.bottomSheetOptionLeft}>
              <View
                style={[styles.bottomSheetIconContainer, { backgroundColor: colors.primaryLight }]}
              >
                <Gallery size={getIconSize('medium')} color={colors.primary} />
              </View>
              <Text
                style={[
                  styles.bottomSheetOptionText,
                  {
                    color: colors.text,
                    fontSize: getResponsiveFontSize('large'),
                  },
                ]}
              >
                {t('profile.fromGallery') || 'Dari Galeri'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Remove Photo Option (only if photo exists) */}
          {profileImage && (
            <TouchableOpacity
              style={[
                styles.bottomSheetOption,
                styles.bottomSheetOptionDanger,
                {
                  backgroundColor: colors.surface,
                  marginTop: moderateVerticalScale(8),
                },
              ]}
              onPress={handleRemovePhoto}
              activeOpacity={0.7}
            >
              <View style={styles.bottomSheetOptionLeft}>
                <View
                  style={[
                    styles.bottomSheetIconContainer,
                    { backgroundColor: colors.errorLight || colors.error + '20' },
                  ]}
                >
                  <Text style={[styles.bottomSheetIconEmoji, { fontSize: getIconSize('medium') }]}>
                    🗑️
                  </Text>
                </View>
                <Text
                  style={[
                    styles.bottomSheetOptionText,
                    {
                      color: colors.error,
                      fontSize: getResponsiveFontSize('large'),
                    },
                  ]}
                >
                  {t('profile.removePhoto') || 'Hapus Foto'}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Cancel Button */}
          <TouchableOpacity
            style={[
              styles.bottomSheetCancelButton,
              {
                backgroundColor: colors.surface,
                marginTop: moderateVerticalScale(8),
              },
            ]}
            onPress={() => setShowPhotoPicker(false)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.bottomSheetCancelText,
                {
                  color: colors.text,
                  fontSize: getResponsiveFontSize('large'),
                },
              ]}
            >
              {t('common.cancel') || 'Batal'}
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: moderateVerticalScale(4),
    minWidth: getMinTouchTarget(),
    minHeight: getMinTouchTarget(),
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: FontFamily.monasans.bold,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: moderateVerticalScale(16),
    paddingBottom: moderateVerticalScale(100), // Space untuk footer
  },
  profilePhotoSection: {
    alignItems: 'center',
    marginBottom: moderateVerticalScale(24),
  },
  profilePhotoContainer: {
    marginBottom: moderateVerticalScale(8),
  },
  profilePhotoWrapper: {
    position: 'relative',
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    overflow: 'visible',
  },
  profilePhoto: {
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    borderWidth: 4,
  },
  profilePhotoPlaceholder: {
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
  },
  profilePhotoInitial: {
    fontFamily: FontFamily.monasans.bold,
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    paddingVertical: moderateVerticalScale(8),
    paddingHorizontal: scale(16),
  },
  changePhotoText: {
    fontFamily: FontFamily.monasans.semiBold,
  },
  bottomSheetContent: {
    paddingTop: moderateVerticalScale(8),
    paddingBottom: moderateVerticalScale(8),
  },
  bottomSheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateVerticalScale(16),
    paddingHorizontal: scale(16),
    borderBottomWidth: 1,
  },
  bottomSheetOptionDanger: {
    borderBottomWidth: 0,
  },
  bottomSheetOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bottomSheetIconContainer: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(16),
  },
  bottomSheetIconEmoji: {
    textAlign: 'center',
  },
  changePhotoIcon: {
    marginRight: scale(8),
  },
  bottomSheetOptionText: {
    fontFamily: FontFamily.monasans.medium,
  },
  bottomSheetCancelButton: {
    paddingVertical: moderateVerticalScale(16),
    paddingHorizontal: scale(16),
    borderRadius: scale(12),
    alignItems: 'center',
    marginTop: moderateVerticalScale(8),
  },
  bottomSheetCancelText: {
    fontFamily: FontFamily.monasans.semiBold,
  },
  inputContainer: {
    marginBottom: moderateVerticalScale(20),
  },
  label: {
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(8),
  },
  input: {
    borderWidth: 1.5,
    borderRadius: scale(12),
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(14),
    fontFamily: FontFamily.monasans.regular,
    minHeight: getMinTouchTarget(),
  },
  errorText: {
    fontSize: getResponsiveFontSize('small'),
    fontFamily: FontFamily.monasans.regular,
    marginTop: moderateVerticalScale(6),
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  saveButton: {
    borderRadius: scale(12),
    paddingVertical: moderateVerticalScale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontFamily: FontFamily.monasans.semiBold,
  },
});
