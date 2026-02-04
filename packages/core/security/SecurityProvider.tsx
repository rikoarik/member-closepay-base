import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { Alert, BackHandler, Platform } from 'react-native';
import { useFreeRasp, SuspiciousAppInfo } from 'freerasp-react-native';
import { securityConfig, shouldInitializeFreeRasp } from './SecurityConfig';
import { SecurityAlertBottomSheet } from './SecurityAlertBottomSheet';
import { securityEmitter, SECURITY_EVENTS, ThreatDetectedEvent } from './native/SecurityEventEmitter';

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
 * Report security threats to server (mock - no API call)
 */
const reportThreatToServer = async (): Promise<void> => {
  // Mock mode: skip API call
};

// Inner component that uses useFreeRasp hook
// This component is only rendered when FreeRASP should be initialized
const SecurityProviderInner: React.FC<{
  children: React.ReactNode;
  onThreatDetected: (threatType: string, message: string) => void;
}> = ({ children, onThreatDetected }) => {
  // Define threat handlers based on freerasp-react-native v4.x API
  // All callbacks are optional - implement the ones you need
  // Critical threats are reported to server for security monitoring
  const threatActions = useMemo(() => ({
    privilegedAccess: () => {
      reportThreatToServer();
      onThreatDetected('Root Access Detected', 'This device appears to be rooted. The app cannot run securely.');
    },
    debug: () => {
      reportThreatToServer();
      onThreatDetected('Debugger Detected', 'A debugger is attached to the app. Please close any debugging tools.');
    },
    simulator: () => {
      if (securityConfig.isProd) {
        reportThreatToServer();
        onThreatDetected('Emulator Detected', 'Running on an emulator is not allowed in production.');
      }
    },
    appIntegrity: () => {
      reportThreatToServer();
      onThreatDetected('Tampering Detected', 'The app signature does not match or it has been modified.');
    },
    unofficialStore: () => {
      reportThreatToServer();
      onThreatDetected('Unofficial Store', 'App was installed from an unofficial store.');
    },
    hooks: () => {
      reportThreatToServer();
      onThreatDetected('Hooking Detected', 'A hooking framework like Frida or Xposed was detected.');
    },
    deviceBinding: () => {
      reportThreatToServer();
      onThreatDetected('Device Binding Failed', 'Device binding check failed.');
    },
    deviceID: () => {
      reportThreatToServer();
      onThreatDetected('Device ID Anomaly', 'Device ID anomaly detected.');
    },
    secureHardwareNotAvailable: () => {
      reportThreatToServer();
      onThreatDetected('No Secure Hardware', 'Hardware-backed keystore not available.');
    },
    obfuscationIssues: () => {
      reportThreatToServer();
      onThreatDetected('Obfuscation Issues', 'Code obfuscation may not be properly enabled.');
    },
    devMode: () => {
      reportThreatToServer();
      onThreatDetected('Developer Mode', 'Developer mode is enabled. This is not allowed.');
    },
    systemVPN: () => {},
    malware: (suspiciousApps: SuspiciousAppInfo[]) => {
      reportThreatToServer();
      onThreatDetected('Malware Detected', `${suspiciousApps.length} suspicious app(s) detected on device.`);
    },
    adbEnabled: () => {
      if (securityConfig.isProd) {
        reportThreatToServer();
      }
    },
    multiInstance: () => {
      reportThreatToServer();
      onThreatDetected('Multi Instance', 'Multiple instances of the app detected. This is not allowed.');
    },
  }), [onThreatDetected]);

  // Initialize freeRASP using the hook
  // Note: useFreeRasp must be called at the top level of a functional component
  useFreeRasp(securityConfig, threatActions);

  return <>{children}</>;
};

// Wrapper component that conditionally renders SecurityProviderInner
const SecurityProviderWithFreeRasp: React.FC<{
  children: React.ReactNode;
  onThreatDetected: (threatType: string, message: string) => void;
}> = ({ children, onThreatDetected }) => {
  if (shouldInitializeFreeRasp) {
    return <SecurityProviderInner onThreatDetected={onThreatDetected}>{children}</SecurityProviderInner>;
  }
  // If FreeRASP shouldn't be initialized, just render children without security checks
  return <>{children}</>;
};

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSecure, setIsSecure] = useState(true);
  const [securityStatus, setSecurityStatus] = useState('Secure');
  const [showSecurityAlert, setShowSecurityAlert] = useState(false);
  const [alertData, setAlertData] = useState({ threatType: '', message: '' });

  // Memoize alert handler to prevent recreating on every render
  const handleSecurityThreat = useCallback((threatType: string, message: string) => {
    // Prevent multiple alerts using functional update
    setIsSecure(prev => {
      if (!prev) return prev; // Already insecure, don't exit again

      // Silent - no console output

      // Immediately exit app without showing dialog
      // This adds friction for attackers (though still bypassable)
      if (Platform.OS === 'android') {
        BackHandler.exitApp();
      } else {
        setShowSecurityAlert(true);
        setAlertData({ threatType, message });
      }

      return false; // Set to insecure
    });

    setSecurityStatus(threatType);
  }, []);

  // Listen to threat events from native module
  useEffect(() => {
    const subscription = securityEmitter.addListener(
      SECURITY_EVENTS.THREAT_DETECTED,
      (event: ThreatDetectedEvent) => {
        const threatType = event.threatType || 'Unknown Threat';
        const message = getThreatMessage(threatType, event.details);
        handleSecurityThreat(threatType, message);
      }
    );

    // Initialize native security module in background
    // This will coordinate with FreeRASP initialization
    if (shouldInitializeFreeRasp) {
      securityEmitter.initialize().catch(() => {
        // Silent fail - initialization will happen via useFreeRasp hook as fallback
      });
    }

    return () => {
      subscription.remove();
    };
  }, [handleSecurityThreat]);

  /**
   * Get threat message from threat type and details
   */
  const getThreatMessage = (threatType: string, details?: Record<string, any>): string => {
    const threatMessages: Record<string, string> = {
      'ROOT_DETECTED': 'This device appears to be rooted. The app cannot run securely.',
      'DEBUGGER_DETECTED': 'A debugger is attached to the app. Please close any debugging tools.',
      'EMULATOR_DETECTED': 'Running on an emulator is not allowed in production.',
      'TAMPERING_DETECTED': 'The app signature does not match or it has been modified.',
      'UNOFFICIAL_STORE': 'App was installed from an unofficial store.',
      'HOOKING_DETECTED': 'A hooking framework like Frida or Xposed was detected.',
      'DEVICE_BINDING_FAILED': 'Device binding check failed.',
      'DEVICE_ID_ANOMALY': 'Device ID anomaly detected.',
      'NO_SECURE_HARDWARE': 'Hardware-backed keystore not available.',
      'OBFUSCATION_ISSUES': 'Code obfuscation may not be properly enabled.',
      'DEV_MODE_ENABLED': 'Developer mode is enabled. This is not allowed.',
      'MALWARE_DETECTED': details?.count 
        ? `${details.count} suspicious app(s) detected on device.`
        : 'Suspicious apps detected on device.',
      'ADB_ENABLED': 'ADB debugging is enabled.',
      'MULTI_INSTANCE_DETECTED': 'Multiple instances of the app detected. This is not allowed.',
    };

    return threatMessages[threatType] || 'Security threat detected.';
  };

  const handleCloseApp = useCallback(() => {
    // iOS: Force app exit by throwing unhandled error
    setTimeout(() => {
      throw new Error(`[Security] ${alertData.threatType}: ${alertData.message}`);
    }, 100);
  }, [alertData]);

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
      <SecurityProviderWithFreeRasp onThreatDetected={handleSecurityThreat}>
        {children}
      </SecurityProviderWithFreeRasp>

      {/* iOS Security Alert Bottom Sheet */}
      {Platform.OS === 'ios' && (
        <SecurityAlertBottomSheet
          visible={showSecurityAlert}
          threatType={alertData.threatType}
          message={alertData.message}
          onCloseApp={handleCloseApp}
        />
      )}
    </SecurityContext.Provider>
  );
};
