/**
 * Payment Plugin - Manifest
 * TypeScript manifest export for CorePlugin interface
 */

import { CorePlugin } from '@core/config/plugins/contracts';
import manifestJson from './plugin.manifest.json';

export const PaymentPlugin: CorePlugin = {
  id: manifestJson.id,
  routes: manifestJson.routes || [],
  menuItems: [],
};

export default PaymentPlugin;