/**
 * Wrapper to use app's quick-access menu icon in core (same as home).
 * eslint-disable: temporary solution, same pattern as QuickAccessButtonsWrapper.
 */
// eslint-disable-next-line no-restricted-imports
import { getMenuIconForQuickAccess } from '../../../../../apps/member-base/src/components/home/quick-actions/QuickAccessButtons';

export const getQuickMenuIcon = getMenuIconForQuickAccess;
