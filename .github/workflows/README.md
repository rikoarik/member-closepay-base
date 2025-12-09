# CI/CD Workflows

Dokumentasi untuk GitHub Actions workflows yang digunakan dalam project ini.

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

Workflow ini dijalankan pada:
- Pull Request ke branch `main`
- Push ke semua branch

**Jobs:**
- **test-lint**: Menjalankan test dengan coverage dan linting
- **build-android**: Build Android APK (debug & release)
- **build-ios**: Build iOS (simulator untuk tanpa signing, atau device untuk dengan signing)

**Artifacts:**
- Android Debug APK
- Android Release APK
- iOS Build artifacts (jika tersedia)

### 2. Release Workflow (`.github/workflows/release.yml`)

Workflow ini dijalankan pada:
- Push tag dengan format `v*` (contoh: `v1.0.0`)
- Push ke branch `main`
- Manual trigger via workflow_dispatch

**Jobs:**
- **build-android-release**: Build Android Release APK
- **build-ios-release**: Build iOS Release IPA (jika signing tersedia)
- **create-release**: Membuat GitHub Release dan upload artifacts

## Setup

### Prerequisites

1. **Node.js**: Versi 20 atau lebih tinggi
2. **Android SDK**: Otomatis diinstall oleh GitHub Actions
3. **Xcode**: Otomatis tersedia di macOS runner

### GitHub Secrets (untuk iOS Build)

Untuk build iOS dengan code signing, tambahkan secrets berikut di repository settings:

1. `IOS_CERTIFICATE_BASE64`: Base64 encoded .p12 certificate
   ```bash
   base64 -i certificate.p12 | pbcopy
   ```

2. `IOS_CERTIFICATE_PASSWORD`: Password untuk certificate

3. `IOS_PROVISIONING_PROFILE_BASE64`: Base64 encoded provisioning profile
   ```bash
   base64 -i profile.mobileprovision | pbcopy
   ```

4. `IOS_KEYCHAIN_PASSWORD`: Password untuk keychain (bisa random string)

**Catatan**: Jika secrets tidak di-set, iOS build akan menggunakan simulator build tanpa signing.

### iOS ExportOptions.plist

File `ios/ExportOptions.plist` digunakan untuk export IPA. Update file ini dengan:
- `teamID`: Apple Developer Team ID
- `provisioningProfiles`: Mapping bundle ID ke provisioning profile name

## Usage

### Manual Release

1. Buka tab "Actions" di GitHub
2. Pilih workflow "Release"
3. Klik "Run workflow"
4. Masukkan version tag (contoh: `v1.0.0`)
5. Klik "Run workflow"

### Tag Release

```bash
git tag v1.0.0
git push origin v1.0.0
```

Workflow akan otomatis membuat release dengan tag tersebut.

## Artifacts

Artifacts dari build dapat di-download dari:
- **CI Workflow**: Tab "Actions" → Pilih workflow run → Scroll ke "Artifacts"
- **Release**: Tab "Releases" → Pilih release → Download files

## Troubleshooting

### Android Build Fails

- Pastikan `debug.keystore` ada di `android/app/`
- Check Gradle version compatibility
- Verify Android SDK setup

### iOS Build Fails

- Pastikan CocoaPods dependencies terinstall
- Verify code signing setup jika menggunakan signing
- Check Xcode version compatibility

### Test Coverage Fails

- Coverage threshold: 80% (dapat diubah di `jest.config.js`)
- Pastikan semua test files mengikuti pattern `*.test.{ts,tsx}`

