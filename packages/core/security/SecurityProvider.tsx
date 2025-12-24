import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { Alert, BackHandler, Platform } from 'react-native';
import { useFreeRasp, SuspiciousAppInfo } from 'freerasp-react-native';
import { securityConfig } from './SecurityConfig';
import { axiosInstance } from '@core/config';

interface SecurityContextType {
  isSecure: boolean;
  securityStatus: string;
}

const SecurityContext = createContext<SecurityContextType>({
  isSecure: true,
  securityStatus: 'Secure',
});

export const useSecurity = () => useContext(SecurityContext);

/**
 * Report security threats to server for monitoring and analysis
 * This is a non-blocking fire-and-forget call
 */
const reportThreatToServer = async (
  threatType: string,
  details: Record<string, unknown> = {}
): Promise<void> => {
  try {
    await axiosInstance.post('/security/report-threat', {
      threatType,
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      platformVersion: Platform.Version,
      isProd: securityConfig.isProd,
      ...details,
    });
    console.log(`[TalsecSecurity] Threat reported to server: ${threatType}`);
  } catch (error) {
    // Silently fail - don't block app for failed threat reports
    console.log('[TalsecSecurity] Failed to report threat (non-critical):', error);
  }
};

// Inner component that uses useFreeRasp hook
const SecurityProviderInner: React.FC<{
  children: React.ReactNode;
  onThreatDetected: (threatType: string, message: string) => void;
}> = ({ children, onThreatDetected }) => {

  // Define threat handlers based on freerasp-react-native v4.x API
  // All callbacks are optional - implement the ones you need
  // Critical threats are reported to server for security monitoring
  const threatActions = useMemo(() => ({
    // Root/Jailbreak detection
    privilegedAccess: () => {
      console.log('[TalsecSecurity] onRootDetected: Device appears to be rooted');
      reportThreatToServer('ROOT_DETECTED');
      onThreatDetected('Root Access Detected', 'This device appears to be rooted. The app cannot run securely.');
    },

    // Debugger detection (only triggers in release builds)
    debug: () => {
      console.log('[TalsecSecurity] onDebuggerDetected: Debugger is attached');
      reportThreatToServer('DEBUGGER_DETECTED');
      onThreatDetected('Debugger Detected', 'A debugger is attached to the app. Please close any debugging tools.');
    },

    // Emulator/Simulator detection (only triggers in release builds)
    simulator: () => {
      console.log('[TalsecSecurity] onEmulatorDetected: App is running on an emulator');
      if (securityConfig.isProd) {
        reportThreatToServer('EMULATOR_DETECTED');
        onThreatDetected('Emulator Detected', 'Running on an emulator is not allowed in production.');
      }
    },

    // App integrity/tampering detection (only triggers in release builds)
    appIntegrity: () => {
      console.log('[TalsecSecurity] onTamperDetected: App has been tampered with or repackaged');
      reportThreatToServer('TAMPERING_DETECTED');
      onThreatDetected('Tampering Detected', 'The app signature does not match or it has been modified.');
    },

    // Unofficial store detection (only triggers in release builds)
    unofficialStore: () => {
      console.log('[TalsecSecurity] onUntrustedInstallationSourceDetected: App was not installed from a trusted store');
      reportThreatToServer('UNOFFICIAL_STORE');
      onThreatDetected('Unofficial Store', 'App was installed from an unofficial store.');
    },

    // Hooking framework detection (Frida, Xposed, etc.)
    hooks: () => {
      console.log('[TalsecSecurity] onHookDetected: Hooking framework detected (e.g., Frida, Xposed)');
      reportThreatToServer('HOOKING_DETECTED');
      onThreatDetected('Hooking Detected', 'A hooking framework like Frida or Xposed was detected.');
    },

    // Device binding check failure
    deviceBinding: () => {
      console.log('[TalsecSecurity] onDeviceBindingDetected: Device binding check failed');
      reportThreatToServer('DEVICE_BINDING_FAILED');
      // Optional: You may choose not to block for this
    },

    // Device ID anomaly
    deviceID: () => {
      console.log('[TalsecSecurity] onDeviceIdDetected: Device ID anomaly detected');
      reportThreatToServer('DEVICE_ID_ANOMALY');
      // Optional: You may choose not to block for this
    },

    // Passcode/Lock screen not set (DeviceState)
    passcode: () => {
      console.log('[TalsecSecurity] onUnlockedDeviceDetected: Device has no lock screen set');
      reportThreatToServer('NO_PASSCODE');
      // Optional: Warn user but don't block
    },

    // Hardware-backed keystore not available (DeviceState)
    secureHardwareNotAvailable: () => {
      console.log('[TalsecSecurity] onHardwareBackedKeystoreNotAvailableDetected: HW keystore not available');
      reportThreatToServer('NO_SECURE_HARDWARE');
      // Optional: Warn user but don't block
    },

    // Obfuscation issues detection
    obfuscationIssues: () => {
      console.log('[TalsecSecurity] onObfuscationIssuesDetected: Code obfuscation may not be properly enabled');
      reportThreatToServer('OBFUSCATION_ISSUES');
      // This is a warning - in production, ensure minifyEnabled = true
    },

    // Developer mode enabled (DeviceState)
    devMode: () => {
      console.log('[TalsecSecurity] onDeveloperModeDetected: Developer mode is enabled');
      reportThreatToServer('DEV_MODE_ENABLED');
      // Optional: Warn user but don't block
    },

    // System VPN active (DeviceState)
    systemVPN: () => {
      console.log('[TalsecSecurity] onSystemVPNDetected: System VPN is active');
      // Don't report VPN as threat - it's a legitimate privacy tool
      // Optional: You may allow VPN usage
    },

    // Malware detection
    malware: (suspiciousApps: SuspiciousAppInfo[]) => {
      console.log(`[TalsecSecurity] onMalwareDetected: ${suspiciousApps.length} suspicious app(s) detected`);
      const appDetails = suspiciousApps.map((appInfo) => ({
        packageName: appInfo.packageInfo.packageName,
        reason: appInfo.reason,
      }));
      suspiciousApps.forEach((appInfo) => {
        console.log(`  - Suspicious app: ${appInfo.packageInfo.packageName}, reason: ${appInfo.reason}`);
      });
      reportThreatToServer('MALWARE_DETECTED', {
        count: suspiciousApps.length,
        apps: appDetails,
      });
      onThreatDetected('Malware Detected', `${suspiciousApps.length} suspicious app(s) detected on device.`);
    },

    // ADB debugging enabled (DeviceState)
    adbEnabled: () => {
      console.log('[TalsecSecurity] onADBEnabledDetected: ADB debugging is enabled');
      if (securityConfig.isProd) {
        reportThreatToServer('ADB_ENABLED');
      }
      // Optional: Warn in production
    },

    // Screenshot detection (requires Android 14+)
    screenshot: () => {
      console.log('[TalsecSecurity] onScreenshotDetected: A screenshot was taken');
      reportThreatToServer('SCREENSHOT_DETECTED');
      // Optional: Log or notify user
    },

    // Screen recording detection (requires Android 15+)
    screenRecording: () => {
      console.log('[TalsecSecurity] onScreenRecordingDetected: Screen recording is active');
      reportThreatToServer('SCREEN_RECORDING_DETECTED');
      onThreatDetected('Screen Recording', 'Screen recording has been detected. Please stop recording.');
    },

    // Multiple app instances running
    multiInstance: () => {
      console.log('[TalsecSecurity] onMultiInstanceDetected: Multiple instances of the app are running');
      reportThreatToServer('MULTI_INSTANCE_DETECTED');
      onThreatDetected('Multi Instance', 'Multiple instances of the app detected. This is not allowed.');
    },
  }), [onThreatDetected]);

  // Initialize freeRASP using the hook
  // Note: useFreeRasp must be called at the top level of a functional component
  useFreeRasp(securityConfig, threatActions);

  return <>{children}</>;
};

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSecure, setIsSecure] = useState(true);
  const [securityStatus, setSecurityStatus] = useState('Secure');

  // Memoize alert handler to prevent recreating on every render
  const handleSecurityThreat = useCallback((threatType: string, message: string) => {
    // Prevent multiple alerts using functional update
    setIsSecure(prev => {
      if (!prev) return prev; // Already insecure, don't show alert again

      Alert.alert(
        threatType,
        message,
        [
          {
            text: 'Close App',
            onPress: () => {
              if (Platform.OS === 'android') {
                BackHandler.exitApp();
              }
            },
            style: 'destructive',
          },
        ],
        { cancelable: false }
      );

      return false; // Set to insecure
    });

    setSecurityStatus(threatType);
  }, []);

  // Memoize context value to prevent unnecessary re-renders of all consumers
  const contextValue = useMemo(() => ({
    isSecure,
    securityStatus,
  }), [isSecure, securityStatus]);

  if (!isSecure) {
    // Optionally render a blocking view instead of children
    // return <View style={{flex: 1, backgroundColor: 'black'}} />;
  }

  return (
    <SecurityContext.Provider value={contextValue}>
      <SecurityProviderInner onThreatDetected={handleSecurityThreat}>
        {children}
      </SecurityProviderInner>
    </SecurityContext.Provider>
  );
};
