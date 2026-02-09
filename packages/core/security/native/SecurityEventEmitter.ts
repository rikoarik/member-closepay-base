import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

interface SecurityNativeModuleInterface {
  initialize(): Promise<boolean>;
  isInitialized(): Promise<boolean>;
}

const { SecurityNativeModule } = NativeModules;

const isNativeModuleAvailable = !!SecurityNativeModule;

const hasEventEmitterMethods = (mod: unknown): boolean =>
  typeof mod === 'object' &&
  mod !== null &&
  typeof (mod as { addListener?: unknown }).addListener === 'function' &&
  typeof (mod as { removeListeners?: unknown }).removeListeners === 'function';

const safeNativeModule =
  isNativeModuleAvailable && hasEventEmitterMethods(SecurityNativeModule)
    ? SecurityNativeModule
    : { addListener: () => ({ remove: () => {} }), removeListeners: () => {} };

/**
 * Security Event Emitter
 *
 * Wrapper for native security module event communication.
 * Handles threat detection events from native layer.
 */
let hasWarnedNativeModuleUnavailable = false;

class SecurityEventEmitter extends NativeEventEmitter {
  private static instance: SecurityEventEmitter | null = null;
  private moduleAvailable: boolean;

  constructor() {
    super(safeNativeModule as any);
    this.moduleAvailable = isNativeModuleAvailable;
  }

  /**
   * Get singleton instance
   */
  static getInstance(): SecurityEventEmitter {
    if (!SecurityEventEmitter.instance) {
      SecurityEventEmitter.instance = new SecurityEventEmitter();
    }
    return SecurityEventEmitter.instance;
  }

  /**
   * Initialize security module
   */
  async initialize(): Promise<boolean> {
    if (!SecurityNativeModule) {
      if (__DEV__ && !hasWarnedNativeModuleUnavailable) {
        hasWarnedNativeModuleUnavailable = true;
        console.warn(
          '[SecurityEventEmitter] Native module not available (expected in simulator or when FreeRASP is not linked)'
        );
      }
      return false;
    }

    try {
      return await SecurityNativeModule.initialize();
    } catch (error) {
      if (__DEV__) {
        console.warn('[SecurityEventEmitter] Failed to initialize:', error);
      }
      return false;
    }
  }

  /**
   * Check if security is initialized
   */
  async isInitialized(): Promise<boolean> {
    if (!SecurityNativeModule) {
      return false;
    }

    try {
      return await SecurityNativeModule.isInitialized();
    } catch (error) {
      return false;
    }
  }
}

/**
 * Threat detection event type
 */
export interface ThreatDetectedEvent {
  threatType: string;
  details?: Record<string, any>;
  timestamp: number;
}

/**
 * Get security event emitter instance
 */
export const securityEmitter = SecurityEventEmitter.getInstance();

/**
 * Event names
 */
export const SECURITY_EVENTS = {
  THREAT_DETECTED: 'ThreatDetected',
} as const;
