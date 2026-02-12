/**
 * Invoice Plugin - Manifest
 * TypeScript manifest export for CorePlugin interface
 */

import type { CorePlugin } from '@core/config/plugins/contracts';
import manifestJson from './plugin.manifest.json';

export const invoicePlugin: CorePlugin = {
  id: manifestJson.id,
  routes: manifestJson.routes || [],
  menuItems: [],
};
