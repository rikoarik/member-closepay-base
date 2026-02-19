/**
 * QuickMenuSettingsScreen Component
 * Screen untuk mengatur menu cepat yang ditampilkan di home
 * Responsive untuk semua device termasuk EDC
 */
import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
  LinearTransition,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { getQuickMenuIcon } from './QuickMenuIconWrapper';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowDown2,
  ArrowUp2,
  Call,
  People,
  Game,
  Shop,
  DocumentText,
  Minus,
} from 'iconsax-react-nativejs';
// Import QuickAccessButtons via wrapper (temporary solution for dependency violation)
// TODO: Move QuickAccessButtons to core or refactor in future phase
import { getIconSize, useDimensions } from '../../utils/responsive';
import { QuickAccessButtons } from './QuickAccessButtonsWrapper';
import { useTheme } from '@core/theme';
import { useTranslation } from '@core/i18n';
// Direct imports to avoid require cycle through @core/config/index.ts
import {
  scale,
  moderateVerticalScale,
  getHorizontalPadding,
  getMinTouchTarget,
  getResponsiveFontSize,
} from '../../utils/responsive';
import { FontFamily } from '../../utils/fonts';
import { ScreenHeader } from './ScreenHeader';
import { BottomSheet } from './BottomSheet';
import {
  loadQuickMenuSettings,
  saveQuickMenuSettings,
  getAllMenuItems,
} from '../../services/quickMenuService';
import type { QuickMenuItem } from '../../services/quickMenuService';
import { configService } from '../../services/configService';

const PREVIEW_SNAP_POINTS = [100];
const QUICK_ACCESS_MAX_SLOTS = 7;
const SELECTED_GRID_COLUMNS = 4;
const DEFAULT_FIXED_TOP_COUNT = 3;

type CategoryKey = 'transaksi' | 'simpan' | 'lifestyle' | 'lainnya';
const CATEGORY_ORDER: CategoryKey[] = ['transaksi', 'simpan', 'lifestyle', 'lainnya'];

function getCategoryForItem(id: string): CategoryKey {
  const transaksi = ['topupva', 'transfermember', 'transferbank', 'kartuvirtual', 'ppob', 'payIPL', 'cardtransaction'];
  const simpan = ['savings', 'investasi', 'tabungan'];
  const lifestyle = ['marketplace', 'fnb', 'sportcenter', 'lifestyle'];
  if (transaksi.some((x) => id.toLowerCase().includes(x))) return 'transaksi';
  if (simpan.some((x) => id.toLowerCase().includes(x))) return 'simpan';
  if (lifestyle.some((x) => id.toLowerCase().includes(x))) return 'lifestyle';
  return 'lainnya';
}

function groupByCategory(items: QuickMenuItem[]): Map<CategoryKey, QuickMenuItem[]> {
  const map = new Map<CategoryKey, QuickMenuItem[]>();
  for (const key of CATEGORY_ORDER) {
    map.set(key, []);
  }
  for (const item of items) {
    const cat = getCategoryForItem(item.id);
    const list = map.get(cat) ?? [];
    list.push(item);
    map.set(cat, list);
  }
  return map;
}

const SPRING_SLOT = { damping: 16, stiffness: 220 };

const DropTargetSlot = memo<{
  slotIndex: number;
  dropTargetSlotIndex: SharedValue<number>;
  highlightColorSv: SharedValue<string>;
  slotBorderRadius: number;
  style: object | object[];
  children: React.ReactNode;
}>(({ slotIndex, dropTargetSlotIndex, highlightColorSv, slotBorderRadius, style, children }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: dropTargetSlotIndex.value === slotIndex ? highlightColorSv.value : 'transparent',
    borderRadius: slotBorderRadius,
    transform: [
      {
        scale: withSpring(dropTargetSlotIndex.value === slotIndex ? 1.03 : 1, SPRING_SLOT),
      },
    ],
  }));
  const flatStyle = Array.isArray(style) ? style : [style];
  return (
    <Animated.View style={[...flatStyle, animatedStyle]}>
      {children}
    </Animated.View>
  );
});
DropTargetSlot.displayName = 'DropTargetSlot';

const PreviewQuickAccessButtons = memo<{
  buttons: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    iconBgColor: string;
  }>;
  textColor: string;
  buttonWidth: number;
}>(
  ({ buttons, textColor, buttonWidth }) => {
    const gap = scale(12);
    const itemsPerRow = 4;

    const getButtonStyle = useCallback(
      (index: number) => {
        const rowIndex = Math.floor(index / itemsPerRow);
        const positionInRow = index % itemsPerRow;
        const isLastInRow = positionInRow === itemsPerRow - 1;
        const totalRows = Math.ceil(buttons.length / itemsPerRow);
        const isLastRow = rowIndex === totalRows - 1;

        return {
          width: buttonWidth,
          marginRight: isLastInRow ? 0 : gap,
          marginBottom: isLastRow ? 0 : moderateVerticalScale(12),
        };
      },
      [buttonWidth, gap, buttons.length, itemsPerRow]
    );

    return (
      <View style={styles.previewQuickAccessRow}>
        {buttons.map((button, index) => (
          <View key={button.id} style={[styles.previewQuickAccessButton, getButtonStyle(index)]}>
            <View style={[styles.previewQuickAccessIcon, { backgroundColor: button.iconBgColor }]}>
              {button.icon}
            </View>
            <Text style={[styles.previewQuickAccessLabel, { color: textColor }]} numberOfLines={2}>
              {button.label}
            </Text>
          </View>
        ))}
      </View>
    );
  },
  (prevProps, nextProps) => {
    if (
      prevProps.buttons.length !== nextProps.buttons.length ||
      prevProps.textColor !== nextProps.textColor ||
      prevProps.buttonWidth !== nextProps.buttonWidth
    ) {
      return false;
    }
    return prevProps.buttons.every((btn, index) => btn.id === nextProps.buttons[index].id);
  }
);

PreviewQuickAccessButtons.displayName = 'PreviewQuickAccessButtons';

const PreviewContent = memo<{
  previewButtons: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    iconBgColor: string;
  }>;
  headerContainerStyle: any;
  titleStyle: any;
  previewTitleText: string;
  scrollContentStyle: any;
  cardContainerStyle: any;
  topIndicatorStyle: any;
  placeholderSmallStyle: any;
  placeholderLargeStyle: any;
  onBack: () => void;
  backButtonStyle: any;
  backIconColor: string;
  textColor: string;
  buttonWidth: number;
  menuContainerStyle: any;
  menuTitleText: string;
  menuTitleStyle: any;
}>(
  ({
    previewButtons,
    headerContainerStyle,
    titleStyle,
    previewTitleText,
    scrollContentStyle,
    cardContainerStyle,
    topIndicatorStyle,
    placeholderSmallStyle,
    placeholderLargeStyle,
    onBack,
    backButtonStyle,
    backIconColor,
    textColor,
    buttonWidth,
    menuContainerStyle,
    menuTitleText,
    menuTitleStyle,
  }) => {
    return (
      <>
        <View style={headerContainerStyle}>
          <Text style={titleStyle}>{previewTitleText}</Text>
        </View>
        <ScrollView
          style={styles.previewScrollView}
          contentContainerStyle={scrollContentStyle}
          showsVerticalScrollIndicator={false}
        >
          <View style={cardContainerStyle}>
            <View style={topIndicatorStyle} />

            <View style={placeholderSmallStyle} />
            <View style={placeholderLargeStyle} />

            <View style={[styles.previewQuickAccess, menuContainerStyle]}>
              <Text style={menuTitleStyle}>{menuTitleText}</Text>
              <PreviewQuickAccessButtons
                buttons={previewButtons}
                textColor={textColor}
                buttonWidth={buttonWidth}
              />
            </View>
          </View>
        </ScrollView>
      </>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.previewButtons.length !== nextProps.previewButtons.length) {
      return false;
    }

    for (let i = 0; i < prevProps.previewButtons.length; i++) {
      if (prevProps.previewButtons[i].id !== nextProps.previewButtons[i].id) {
        return false;
      }
    }

    if (
      prevProps.previewTitleText !== nextProps.previewTitleText ||
      prevProps.headerContainerStyle !== nextProps.headerContainerStyle ||
      prevProps.titleStyle !== nextProps.titleStyle ||
      prevProps.scrollContentStyle !== nextProps.scrollContentStyle ||
      prevProps.cardContainerStyle !== nextProps.cardContainerStyle ||
      prevProps.topIndicatorStyle !== nextProps.topIndicatorStyle ||
      prevProps.placeholderSmallStyle !== nextProps.placeholderSmallStyle ||
      prevProps.placeholderLargeStyle !== nextProps.placeholderLargeStyle ||
      prevProps.backButtonStyle !== nextProps.backButtonStyle ||
      prevProps.backIconColor !== nextProps.backIconColor ||
      prevProps.textColor !== nextProps.textColor ||
      prevProps.buttonWidth !== nextProps.buttonWidth ||
      prevProps.menuContainerStyle !== nextProps.menuContainerStyle ||
      prevProps.menuTitleText !== nextProps.menuTitleText ||
      prevProps.menuTitleStyle !== nextProps.menuTitleStyle
    ) {
      return false; // Re-render if any style changed
    }

    return true; // Don't re-render - props are the same
  }
);

PreviewContent.displayName = 'PreviewContent';

export const QuickMenuSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // Initial state - empty array, will be loaded from storage
  const [menuItems, setMenuItems] = useState<QuickMenuItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeDragIndex, setActiveDragIndex] = useState<number | null>(null);
  const [draggingFromAvailable, setDraggingFromAvailable] = useState<QuickMenuItem | null>(null);
  const [listScrollLayout, setListScrollLayout] = useState({ contentHeight: 0, layoutHeight: 0, scrollY: 0 });
  const listScrollYSv = useSharedValue(0);
  const listContentHeightSv = useSharedValue(0);
  const listLayoutHeightSv = useSharedValue(0);
  const listScrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      listScrollYSv.value = e.contentOffset.y;
    },
  });
  const dragActivated = useSharedValue(false);
  const activeDragIndexRef = React.useRef<number | null>(null);
  const selectedGridRef = React.useRef<View>(null);
  const containerRef = React.useRef<View>(null);
  const containerWindowRef = React.useRef({ x: 0, y: 0 });
  const draggingFromAvailableRef = React.useRef<QuickMenuItem | null>(null);
  const dragOverlayX = useSharedValue(0);
  const dragOverlayY = useSharedValue(0);
  const dragOverlayScale = useSharedValue(0);
  const dragOverlayOpacity = useSharedValue(0);
  const dropTargetSlotIndex = useSharedValue(-1);
  const dropTargetHighlightColor = useSharedValue('rgba(0,0,0,0.06)');
  const dashedBoxOpacity = useSharedValue(1);
  const dashedBoxScale = useSharedValue(1);
  const availableDragStarted = useSharedValue(false);
  const gridLayoutRef = React.useRef<{
    gx: number;
    gy: number;
    w: number;
    h: number;
  } | null>(null);
  const gridCellRef = React.useRef<{
    cellWidth: number;
    rowHeight: number;
    gap: number;
  } | null>(null);

  const quickMenuConfig = configService.getConfig()?.quickMenu;
  const fixedTopCount = quickMenuConfig?.fixedTopCount ?? DEFAULT_FIXED_TOP_COUNT;
  const isTopSlotLocked = useCallback((index: number) => index < fixedTopCount, [fixedTopCount]);
  const editableSlotCount = quickMenuConfig?.editableSlotCount ?? QUICK_ACCESS_MAX_SLOTS - fixedTopCount;
  const maxSlots = fixedTopCount + editableSlotCount;
  const enableDrag = quickMenuConfig?.enableDrag !== false;

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const allItems = await getAllMenuItems();
        setMenuItems(allItems);
      } catch (error) {
        console.error('Failed to load quick menu settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    dropTargetHighlightColor.value = colors.primaryLight || 'rgba(0,0,0,0.06)';
  }, [colors.primaryLight, dropTargetHighlightColor]);

  const handleRemove = (id: string) => {
    setMenuItems((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, enabled: false } : i));
      saveQuickMenuSettings(next).catch((e) => console.error('Quick menu save failed', e));
      return next;
    });
  };

  const handleAdd = (id: string) => {
    setMenuItems((prev) => {
      const enabled = prev.filter((m) => m.enabled);
      const newEnabledIds =
        enabled.length >= maxSlots
          ? [...enabled.slice(0, maxSlots - 1).map((e) => e.id), id]
          : [...enabled.map((e) => e.id), id];
      const ordered = [
        ...newEnabledIds.map((sid) => prev.find((i) => i.id === sid)!),
        ...prev.filter((i) => !newEnabledIds.includes(i.id)),
      ];
      const next = ordered.map((item) => ({ ...item, enabled: newEnabledIds.includes(item.id) }));
      saveQuickMenuSettings(next).catch((e) => console.error('Quick menu save failed', e));
      return next;
    });
  };

  const handleReorderByIndex = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;
      setMenuItems((prev) => {
        const enabled = prev.filter((i) => i.enabled).slice(0, maxSlots);
        const reordered = [...enabled];
        const [removed] = reordered.splice(fromIndex, 1);
        reordered.splice(toIndex, 0, removed);
        const reorderedIds = new Set(reordered.map((i) => i.id));
        const rest = prev.filter((i) => !reorderedIds.has(i.id));
        const next = [...reordered, ...rest];
        const withEnabled = next.map((item) => ({
          ...item,
          enabled: reorderedIds.has(item.id),
        }));
        saveQuickMenuSettings(withEnabled).catch((e) => console.error('Quick menu save failed', e));
        return withEnabled;
      });
    },
    [maxSlots]
  );

  const setDragActive = useCallback((idx: number) => {
    setActiveDragIndex(idx);
    activeDragIndexRef.current = idx;
  }, []);

  const onGridDragEnd = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (isTopSlotLocked(fromIndex) || isTopSlotLocked(toIndex)) {
        setActiveDragIndex(null);
        activeDragIndexRef.current = null;
        dragActivated.value = false;
        return;
      }
      if (activeDragIndexRef.current === fromIndex) {
        handleReorderByIndex(fromIndex, toIndex);
      }
      setActiveDragIndex(null);
      activeDragIndexRef.current = null;
      dragActivated.value = false;
    },
    [handleReorderByIndex, dragActivated, isTopSlotLocked]
  );

  const { width: screenWidth } = useDimensions();
  const SELECTED_GRID_GAP = scale(8);
  const selectedGridItemWidth = useMemo(() => {
    const horizontalPadding = getHorizontalPadding();
    const totalGap = SELECTED_GRID_GAP * (SELECTED_GRID_COLUMNS - 1);
    const availableWidth = screenWidth - horizontalPadding * 2;
    return (availableWidth - totalGap) / SELECTED_GRID_COLUMNS;
  }, [screenWidth]);
  const GRID_GAP = scale(12);
  const gridRowHeight = selectedGridItemWidth + SELECTED_GRID_GAP;

  const handleAddToSlot = useCallback(
    (droppedItem: QuickMenuItem, slotIndex: number) => {
      if (!droppedItem || slotIndex < 0 || slotIndex >= maxSlots) return;
      if (isTopSlotLocked(slotIndex)) return;
      setMenuItems((prev) => {
        const enabled = prev.filter((m) => m.enabled).slice(0, maxSlots);
        const newSelected: (QuickMenuItem | undefined)[] = [...enabled];
        newSelected[slotIndex] = droppedItem;
        const actualSelected = newSelected.filter((i): i is QuickMenuItem => i != null);
        const actualSelectedIds = new Set(actualSelected.map((i) => i.id));
        const rest = prev.filter((i) => !actualSelectedIds.has(i.id));
        const fullOrder = [...actualSelected, ...rest];
        const next = fullOrder.map((item) => ({
          ...item,
          enabled: actualSelectedIds.has(item.id),
        }));
        saveQuickMenuSettings(next).catch((e) => console.error('Quick menu save failed', e));
        return next;
      });
    },
    [maxSlots, isTopSlotLocked]
  );

  const handleAddToFirstEmptySlot = useCallback(
    (item: QuickMenuItem) => {
      const enabled = menuItems.filter((m) => m.enabled).slice(0, maxSlots);
      const selectedIds = enabled.map((e) => e.id);
      let targetIndex = -1;
      for (let i = fixedTopCount; i < maxSlots; i++) {
        if (!enabled[i]) {
          targetIndex = i;
          break;
        }
      }
      if (targetIndex === -1) targetIndex = maxSlots - 1;
      handleAddToSlot(item, targetIndex);
    },
    [menuItems, maxSlots, fixedTopCount, handleAddToSlot]
  );

  const startDragFromAvailable = useCallback(
    (item: QuickMenuItem, absX: number, absY: number) => {
      containerRef.current?.measureInWindow((x, y) => {
        containerWindowRef.current = { x, y };
        draggingFromAvailableRef.current = item;
        setDraggingFromAvailable(item);
        const ox = containerWindowRef.current.x;
        const oy = containerWindowRef.current.y;
        dragOverlayX.value = absX - ox - 24;
        dragOverlayY.value = absY - oy - 24;
        dragOverlayScale.value = withSpring(1.15, { damping: 14, stiffness: 180 });
        dragOverlayOpacity.value = withTiming(1, { duration: 100 });
      });
      gridCellRef.current = {
        cellWidth: selectedGridItemWidth,
        rowHeight: gridRowHeight,
        gap: SELECTED_GRID_GAP,
      };
      selectedGridRef.current?.measureInWindow((gx, gy, w, h) => {
        gridLayoutRef.current = { gx, gy, w, h };
      });
    },
    [dragOverlayX, dragOverlayY, dragOverlayScale, dragOverlayOpacity, selectedGridItemWidth, gridRowHeight]
  );

  const getSlotIndexAtPoint = useCallback((absX: number, absY: number): number | null => {
    const layout = gridLayoutRef.current;
    const cell = gridCellRef.current;
    if (!layout || !cell) return null;
    const relX = absX - layout.gx;
    const relY = absY - layout.gy;
    if (relX < 0 || relY < 0 || relX >= layout.w || relY >= layout.h) return null;
    const col = Math.floor(relX / (cell.cellWidth + cell.gap));
    const row = Math.floor(relY / cell.rowHeight);
    if (row === 0) return null;
    let toIndex: number;
    if (row === 0) {
      if (col < 0 || col > 2) return null;
      toIndex = col;
    } else {
      if (col < 0 || col >= SELECTED_GRID_COLUMNS) return null;
      toIndex = 3 + col;
      if (toIndex >= maxSlots) return null;
    }
    const slotLeft = col * (cell.cellWidth + cell.gap);
    const slotTop = row * cell.rowHeight;
    const insideSlot =
      relX >= slotLeft &&
      relX < slotLeft + cell.cellWidth &&
      relY >= slotTop &&
      relY < slotTop + cell.rowHeight
    ;
    return insideSlot ? toIndex : null;
  }, [maxSlots]);

  const updateDragPosition = useCallback((absX: number, absY: number) => {
    const { x, y } = containerWindowRef.current;
    dragOverlayX.value = absX - x - 24;
    dragOverlayY.value = absY - y - 24;
    const toIndex = getSlotIndexAtPoint(absX, absY);
    dropTargetSlotIndex.value = toIndex !== null ? toIndex : -1;
  }, [dragOverlayX, dragOverlayY, getSlotIndexAtPoint]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await saveQuickMenuSettings(menuItems);
      navigation.goBack();
    } catch (e) {
      console.error('Quick menu save failed', e);
    } finally {
      setIsSaving(false);
    }
  }, [menuItems, navigation]);

  const clearDragState = useCallback(() => {
    draggingFromAvailableRef.current = null;
    setDraggingFromAvailable(null);
    availableDragStarted.value = false;
    dropTargetSlotIndex.value = -1;
    dragOverlayScale.value = 0;
    dragOverlayOpacity.value = 0;
  }, [availableDragStarted, dropTargetSlotIndex, dragOverlayScale, dragOverlayOpacity]);

  const onDropFromAvailable = useCallback(
    (absX: number, absY: number, itemId: string) => {
      const wasDragging = draggingFromAvailableRef.current !== null;
      const item = draggingFromAvailableRef.current ?? menuItems.find((i) => i.id === itemId);
      dropTargetSlotIndex.value = -1;

      const finishWithExitAnimation = (onDone?: () => void) => {
        dragOverlayScale.value = withTiming(
          0,
          { duration: 180, easing: Easing.out(Easing.cubic) },
          (finished) => {
            if (finished) {
              runOnJS(clearDragState)();
              onDone?.();
            }
          }
        );
        dragOverlayOpacity.value = withTiming(0, { duration: 150 });
      };

      if (wasDragging && item) {
        const toIndex = getSlotIndexAtPoint(absX, absY);
        const layout = gridLayoutRef.current;
        const cell = gridCellRef.current;

        if (toIndex !== null && !isTopSlotLocked(toIndex) && layout && cell) {
          const row = toIndex <= 2 ? 0 : 1;
          const col = toIndex <= 2 ? toIndex : toIndex - 3;
          const slotLeft = col * (cell.cellWidth + cell.gap);
          const slotTop = row * cell.rowHeight;
          const centerX = layout.gx + slotLeft + cell.cellWidth / 2;
          const centerY = layout.gy + slotTop + cell.rowHeight / 2;
          const { x: cx, y: cy } = containerWindowRef.current;
          const targetOverlayX = centerX - cx - 24;
          const targetOverlayY = centerY - cy - 24;

          dragOverlayX.value = withSpring(targetOverlayX, { damping: 18, stiffness: 220 });
          dragOverlayY.value = withSpring(targetOverlayY, { damping: 18, stiffness: 220 });

          const runAfterSnap = () => {
            handleAddToSlot(item, toIndex);
          };
          setTimeout(() => {
            runAfterSnap();
            finishWithExitAnimation();
          }, 220);
        } else {
          finishWithExitAnimation();
        }
      } else {
        if (item) handleAdd(item.id);
        clearDragState();
      }
    },
    [menuItems, handleAddToSlot, handleAdd, clearDragState, getSlotIndexAtPoint, isTopSlotLocked]
  );

  const selectedItems = useMemo(
    () => menuItems.filter((i) => i.enabled).slice(0, maxSlots),
    [menuItems, maxSlots]
  );
  const availableItems = useMemo(() => {
    const enabled = menuItems.filter((m) => m.enabled);
    return menuItems.filter(
      (item) => enabled.findIndex((e) => e.id === item.id) < 0 || enabled.findIndex((e) => e.id === item.id) >= maxSlots
    );
  }, [menuItems, maxSlots]);

  const availableByCategory = useMemo(() => {
    return groupByCategory(availableItems);
  }, [availableItems]);

  const getCategoryLabelKey = (cat: CategoryKey): string => {
    switch (cat) {
      case 'transaksi':
        return 'home.allMenuCategoryTransaksi';
      case 'simpan':
        return 'home.allMenuCategorySimpan';
      case 'lifestyle':
        return 'home.allMenuCategoryLifestyle';
      default:
        return 'home.allMenuCategoryLainnya';
    }
  };

  const showDashedBox = selectedItems.length > 0;
  useEffect(() => {
    if (showDashedBox) {
      dashedBoxOpacity.value = withTiming(1, { duration: 200 });
      dashedBoxScale.value = withSpring(1, { damping: 16, stiffness: 200 });
    } else {
      dashedBoxOpacity.value = withTiming(0.6, { duration: 150 });
      dashedBoxScale.value = 1;
    }
  }, [showDashedBox]);

  const LIST_SCROLL_THUMB_MIN = 24;
  const listScrollThumbAnimatedStyle = useAnimatedStyle(() => {
    const layoutH = listLayoutHeightSv.value;
    const contentH = listContentHeightSv.value;
    const scrollY = listScrollYSv.value;
    if (contentH <= layoutH || layoutH <= 0) {
      return { height: 0, top: 0, opacity: 0 };
    }
    const proportionalH = (layoutH / contentH) * layoutH;
    const thumbH = Math.min(layoutH * 0.35, Math.max(LIST_SCROLL_THUMB_MIN, proportionalH));
    const scrollable = contentH - layoutH;
    const ratio = Math.min(1, Math.max(0, scrollY / scrollable));
    const top = ratio * (layoutH - thumbH);
    return {
      height: thumbH,
      top: withSpring(top, { damping: 28, stiffness: 380 }),
      opacity: 1,
    };
  }, []);

  const iconCacheRef = React.useRef<Map<string, React.ReactNode>>(new Map());

  const getPreviewMenuIcon = useCallback(
    (iconName?: string) => {
      const cacheKey = `preview-${iconName || 'default'}-${colors.info}-${colors.warning}-${
        colors.success
      }-${colors.error}`;

      if (iconCacheRef.current.has(cacheKey)) {
        return iconCacheRef.current.get(cacheKey)!;
      }

      const iconSize = getIconSize('medium');
      let icon: React.ReactNode;

      switch (iconName) {
        case 'payIPL':
          icon = <ArrowDown2 size={iconSize} color={colors.info} variant="Bold" />;
          break;
        case 'emergency':
          icon = <Call size={iconSize} color={colors.warning} variant="Bold" />;
          break;
        case 'guest':
          icon = <People size={iconSize} color={colors.success} variant="Bold" />;
          break;
        case 'ppob':
          icon = <Game size={iconSize} color={colors.info} variant="Bold" />;
          break;
        case 'transfer':
          icon = <ArrowDown2 size={iconSize} color={colors.error} variant="Bold" />;
          break;
        case 'payment':
          icon = <Game size={iconSize} color={colors.info} variant="Bold" />;
          break;
        case 'bill':
          icon = <Game size={iconSize} color={colors.error} variant="Bold" />;
          break;
        case 'topup':
          icon = <ArrowUp2 size={iconSize} color={colors.success} variant="Bold" />;
          break;
        case 'donation':
          icon = <People size={iconSize} color={colors.warning} variant="Bold" />;
          break;
        case 'marketplace':
          icon = <Shop size={iconSize} color={colors.info} variant="Bold" />;
          break;
        case 'withdraw':
          icon = <ArrowDown2 size={iconSize} color={colors.error} variant="Bold" />;
          break;
        case 'fnb':
          icon = <Shop size={iconSize} color={colors.warning} variant="Bold" />;
          break;
        case 'sportcenter':
          icon = <Game size={iconSize} color={colors.success} variant="Bold" />;
          break;
        case 'invoice':
          icon = <DocumentText size={iconSize} color={colors.error} variant="Bold" />;
          break;
        default:
          icon = <Game size={iconSize} color={colors.info} variant="Bold" />;
      }

      iconCacheRef.current.set(cacheKey, icon);
      return icon;
    },
    [colors.info, colors.warning, colors.success, colors.error]
  );

  const getMenuIcon = useCallback(
    (iconName?: string) => {
      const cacheKey = `${iconName || 'default'}-${colors.info}-${colors.warning}-${
        colors.success
      }-${colors.error}`;

      if (iconCacheRef.current.has(cacheKey)) {
        return iconCacheRef.current.get(cacheKey)!;
      }

      const iconSize = getIconSize('large');
      let icon: React.ReactNode;

      switch (iconName) {
        case 'payIPL':
          icon = <ArrowDown2 size={iconSize} color={colors.info} variant="Bold" />;
          break;
        case 'emergency':
          icon = <Call size={iconSize} color={colors.warning} variant="Bold" />;
          break;
        case 'guest':
          icon = <People size={iconSize} color={colors.success} variant="Bold" />;
          break;
        case 'ppob':
          icon = <Game size={iconSize} color={colors.info} variant="Bold" />;
          break;
        case 'transfer':
          icon = <ArrowDown2 size={iconSize} color={colors.error} variant="Bold" />;
          break;
        case 'payment':
          icon = <Game size={iconSize} color={colors.info} variant="Bold" />;
          break;
        case 'bill':
          icon = <Game size={iconSize} color={colors.error} variant="Bold" />;
          break;
        case 'topup':
          icon = <ArrowUp2 size={iconSize} color={colors.success} variant="Bold" />;
          break;
        case 'donation':
          icon = <People size={iconSize} color={colors.warning} variant="Bold" />;
          break;
        case 'marketplace':
          icon = <Shop size={iconSize} color={colors.info} variant="Bold" />;
          break;
        case 'withdraw':
          icon = <ArrowDown2 size={iconSize} color={colors.error} variant="Bold" />;
          break;
        case 'fnb':
          icon = <Shop size={iconSize} color={colors.warning} variant="Bold" />;
          break;
        case 'sportcenter':
          icon = <Game size={iconSize} color={colors.success} variant="Bold" />;
          break;
        case 'invoice':
          icon = <DocumentText size={iconSize} color={colors.error} variant="Bold" />;
          break;
        default:
          icon = <Game size={iconSize} color={colors.info} variant="Bold" />;
      }

      iconCacheRef.current.set(cacheKey, icon);
      return icon;
    },
    [colors.info, colors.warning, colors.success, colors.error]
  );

  const getDefaultBgColor = useCallback((_iconName?: string) => colors.surface, [colors.surface]);

  const menuItemsKey = useMemo(
    () =>
      menuItems
        .filter((item) => item.enabled)
        .map((item) => `${item.id}:${item.label}:${item.icon || ''}`)
        .sort()
        .join('|'),
    [menuItems]
  );

  const emptyButtonsArray = useMemo(() => [], []);

  const previousPreviewButtonsRef = React.useRef<
    Array<{
      id: string;
      label: string;
      icon: React.ReactNode;
      iconBgColor: string;
    }>
  >([]);
  const previousMenuItemsKeyRef = React.useRef<string>('');

  const previewButtons = useMemo(() => {
    if (
      menuItemsKey === previousMenuItemsKeyRef.current &&
      previousPreviewButtonsRef.current.length > 0
    ) {
      return previousPreviewButtonsRef.current;
    }

    const enabledItems = menuItems.filter((item) => item.enabled).slice(0, maxSlots);

    if (enabledItems.length === 0) {
      previousMenuItemsKeyRef.current = menuItemsKey;
      previousPreviewButtonsRef.current = [];
      return emptyButtonsArray;
    }

    const buttons = enabledItems.map((item) => ({
      id: item.id,
      label: item.label,
      icon: getPreviewMenuIcon(item.icon),
      iconBgColor: item.iconBgColor || getDefaultBgColor(item.icon),
    }));

    previousMenuItemsKeyRef.current = menuItemsKey;
    previousPreviewButtonsRef.current = buttons;

    return buttons;
  }, [menuItemsKey, menuItems, getPreviewMenuIcon, getDefaultBgColor, emptyButtonsArray]);

  const hasEnabledItems = useMemo(() => {
    return menuItems.some((item) => item.enabled);
  }, [menuItems]);

  useEffect(() => {
    if (showPreview && !hasEnabledItems) {
      setShowPreview(false);
    }
  }, [showPreview, hasEnabledItems]);

  const handleClosePreview = useCallback(() => {
    setShowPreview(false);
  }, []);

  const previewSnapPoints = useMemo(() => [125], []);

  const headerContainerStyle = useMemo(
    () => [
      styles.previewHeaderContainer,
      {
        paddingHorizontal: getHorizontalPadding(),
      },
    ],
    []
  );

  const titleStyle = useMemo(
    () => [
      styles.previewTitle,
      {
        color: colors.text,
        fontSize: getResponsiveFontSize('large'),
      },
    ],
    [colors.text]
  );

  const scrollContentStyle = useMemo(
    () => [styles.previewContent, { paddingHorizontal: getHorizontalPadding() }],
    []
  );

  const cardContainerStyle = useMemo(
    () => [
      styles.previewCardContainer,
      {
        backgroundColor: colors.surfaceSecondary || '#F3F4F6',
      },
    ],
    [colors.surfaceSecondary]
  );

  const topIndicatorStyle = useMemo(
    () => [
      styles.previewTopIndicator,
      {
        backgroundColor: colors.primary,
      },
    ],
    [colors.primary]
  );

  const placeholderSmallStyle = useMemo(
    () => [
      styles.previewPlaceholderSmall,
      {
        backgroundColor: colors.surface || '#FFFFFF',
        opacity: 0.6,
        marginTop: moderateVerticalScale(16),
        marginBottom: moderateVerticalScale(12),
      },
    ],
    [colors.surface]
  );

  const placeholderLargeStyle = useMemo(
    () => [
      styles.previewPlaceholderLarge,
      {
        backgroundColor: colors.surface || '#FFFFFF',
        opacity: 0.6,
        marginBottom: moderateVerticalScale(24),
      },
    ],
    [colors.surface]
  );

  const previewTitleText = useMemo(() => `${t('common.preview')} ${t('home.homepage')}`, [t]);

  const backButtonStyle = useMemo(
    () => [
      styles.previewBackButton,
      {
        minWidth: getMinTouchTarget(),
        minHeight: getMinTouchTarget(),
      },
    ],
    []
  );

  const backIconColor = useMemo(() => colors.text, [colors.text]);

  const previewTextColor = useMemo(() => colors.text, [colors.text]);

  const menuContainerStyle = useMemo(
    () => [
      styles.previewMenuContainer,
      {
        backgroundColor: colors.surface || '#FFFFFF',
        borderRadius: scale(16),
      },
    ],
    [colors.surface]
  );

  const menuTitleText = useMemo(() => t('home.quickAccess'), [t]);

  const menuTitleStyle = useMemo(
    () => [
      styles.previewMenuTitle,
      {
        color: colors.text,
        fontSize: getResponsiveFontSize('medium'),
      },
    ],
    [colors.text]
  );

  const previewButtonWidth = useMemo(() => {
    const gap = scale(12);
    const itemsPerRow = 4;
    const horizontalPadding = getHorizontalPadding();
    const cardPadding = scale(40);
    const totalGap = gap * (itemsPerRow - 1);
    const availableWidth = screenWidth - horizontalPadding * 2 - cardPadding * 2;
    const calculatedWidth = (availableWidth - totalGap) / itemsPerRow;
    const minWidth = scale(60);
    const maxWidth = scale(100);
    return Math.max(minWidth, Math.min(maxWidth, Math.floor(calculatedWidth)));
  }, [screenWidth]);

  const dashedBoxAnimatedStyle = useAnimatedStyle(() => ({
    opacity: dashedBoxOpacity.value,
    transform: [{ scale: dashedBoxScale.value }],
  }));

  const dragOverlayAnimatedStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: dragOverlayX.value,
    top: dragOverlayY.value,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ scale: dragOverlayScale.value }],
    opacity: dragOverlayOpacity.value,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  }));

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <View ref={containerRef} style={styles.flex1}>
      <ScreenHeader title={t('quickMenu.manageTitle')} />

      {!isLoading && menuItems.length === 0 ? (
        <View style={[styles.flex1, styles.scrollContent, styles.scrollContentCentered, { paddingHorizontal: getHorizontalPadding(), paddingTop: moderateVerticalScale(16) }]}>
          <View style={styles.emptyStateView}>
            <View
              style={[
                styles.emptyStateIconContainer,
                { backgroundColor: colors.surfaceSecondary || colors.borderLight },
              ]}
            >
              <DocumentText
                size={getIconSize('large') * 1.5}
                color={colors.textSecondary}
                variant="Outline"
              />
            </View>
            <Text
              style={[
                styles.emptyStateText,
                {
                  color: colors.textSecondary,
                  fontSize: getResponsiveFontSize('medium'),
                },
              ]}
            >
              {t('profile.noMenuEnabled')}
            </Text>
          </View>
        </View>
      ) : !isLoading ? (
        <>
          <View style={{ paddingHorizontal: getHorizontalPadding(), paddingTop: moderateVerticalScale(24) }}>
            <Text
              style={[
                styles.instructionText,
                {
                  color: colors.textSecondary,
                  fontSize: getResponsiveFontSize('small'),
                  marginBottom: moderateVerticalScale(12),
                },
              ]}
            >
              {t('quickMenu.instructionReorder')}
            </Text>
            <View ref={selectedGridRef} style={{ marginBottom: moderateVerticalScale(16) }}>
              <View style={[styles.selectedGrid]}>
                {selectedItems.slice(0, fixedTopCount).map((item, index) => {
                  const cellContent = (
                    <View style={styles.selectedGridItemInner}>
                      <View style={[styles.selectedIconWrap, { backgroundColor: colors.surface }]}>
                        {getQuickMenuIcon(colors.textSecondary, item.icon, item.id)}
                      </View>
                      <Text
                        style={[
                          styles.selectedLabel,
                          { color: colors.text, fontSize: getResponsiveFontSize('small') },
                        ]}
                        numberOfLines={3}
                      >
                        {item.labelKey ? t(item.labelKey) : item.label}
                      </Text>
                    </View>
                  );
                  const cellWrapperStyle = [
                    styles.selectedGridItem,
                    {
                      width: selectedGridItemWidth,
                      marginRight: (index % SELECTED_GRID_COLUMNS) === SELECTED_GRID_COLUMNS - 1 ? 0 : SELECTED_GRID_GAP,
                      marginBottom: SELECTED_GRID_GAP,
                    },
                  ];
                  return (
                    <View key={item.id} style={cellWrapperStyle}>
                      {cellContent}
                    </View>
                  );
                })}
              </View>
              {showDashedBox ? (
              <View style={styles.dashedDropZoneInner}>
                  {Array.from({ length: editableSlotCount }, (_, i) => i).map((i) => {
                    const index = fixedTopCount + i;
                    const item = selectedItems[index];
                    const cellWrapperStyle = [
                      styles.selectedGridItem,
                      {
                        width: selectedGridItemWidth,
                        marginRight: (i % SELECTED_GRID_COLUMNS) === SELECTED_GRID_COLUMNS - 1 ? 0 : SELECTED_GRID_GAP,
                        marginBottom: SELECTED_GRID_GAP,
                        backgroundColor: activeDragIndex === index ? (colors.surfaceSecondary || colors.border) : undefined,
                      },
                    ];
                    if (!item) {
                      const emptySlotWrapper = (
                        <DropTargetSlot
                          slotIndex={index}
                          dropTargetSlotIndex={dropTargetSlotIndex}
                          highlightColorSv={dropTargetHighlightColor}
                          slotBorderRadius={scale(12)}
                          style={cellWrapperStyle}
                        >
                          <View style={styles.selectedGridItemInner}>
                            <View style={[styles.dashedSlotBorder, styles.dashedIconWrap, { borderColor: colors.border, marginBottom: moderateVerticalScale(6) }]} />
                            <View style={{ height: moderateVerticalScale(36), width: '100%' }} />
                          </View>
                        </DropTargetSlot>
                      );
                      return (
                        <Animated.View key={`empty-${index}`} layout={LinearTransition.duration(200)}>
                          {emptySlotWrapper}
                        </Animated.View>
                      );
                    }
                    const cellContent = (
                      <View style={styles.selectedGridItemInner}>
                        <TouchableOpacity
                          style={[styles.removeBadge, { backgroundColor: colors.error }]}
                          onPress={() => handleRemove(item.id)}
                          hitSlop={8}
                        >
                          <Minus size={12} color={colors.surface} variant="Bold" />
                        </TouchableOpacity>
                        <View style={[styles.dashedSlotBorder, styles.dashedIconWrap, { borderColor: colors.border }]}>
                          <View style={[styles.selectedIconWrap, { backgroundColor: colors.surface }]}>
                            {getQuickMenuIcon(colors.primary, item.icon, item.id)}
                          </View>
                        </View>
                        <Text
                          style={[
                            styles.selectedLabel,
                            { color: colors.text, fontSize: getResponsiveFontSize('small') },
                          ]}
                          numberOfLines={3}
                        >
                          {item.labelKey ? t(item.labelKey) : item.label}
                        </Text>
                      </View>
                    );
                    const slotWrapper = (
                      <DropTargetSlot
                        slotIndex={index}
                        dropTargetSlotIndex={dropTargetSlotIndex}
                        highlightColorSv={dropTargetHighlightColor}
                        slotBorderRadius={scale(12)}
                        style={cellWrapperStyle}
                      >
                        {cellContent}
                      </DropTargetSlot>
                    );
                    if (enableDrag) {
                      const cellWidth = selectedGridItemWidth;
                      const panGesture = Gesture.Pan()
                        .minDistance(8)
                        .onStart(() => {
                          'worklet';
                          dragActivated.value = false;
                        })
                        .onUpdate((e) => {
                          'worklet';
                          if (dragActivated.value) return;
                          const moved = e.translationX * e.translationX + e.translationY * e.translationY;
                          if (moved > 400) {
                            dragActivated.value = true;
                            runOnJS(setDragActive)(index);
                          }
                        })
                        .onEnd((e) => {
                          'worklet';
                          const row = index < fixedTopCount ? 0 : 1;
                          const col = index < fixedTopCount ? index : index - fixedTopCount;
                          const dropCol = Math.round(col + e.translationX / (cellWidth + SELECTED_GRID_GAP));
                          const dropRow = Math.round(row + e.translationY / gridRowHeight);
                          let toIndex: number;
                          if (dropRow <= 0) {
                            toIndex = Math.max(0, Math.min(fixedTopCount - 1, dropCol));
                          } else {
                            toIndex = fixedTopCount + Math.max(0, Math.min(editableSlotCount - 1, dropCol));
                          }
                          toIndex = Math.max(0, Math.min(maxSlots - 1, toIndex));
                          runOnJS(onGridDragEnd)(index, toIndex);
                        });
                      return (
                        <GestureDetector key={item.id} gesture={panGesture}>
                          <Animated.View layout={LinearTransition.duration(200)}>
                            {slotWrapper}
                          </Animated.View>
                        </GestureDetector>
                      );
                    }
                    return (
                      <Animated.View key={item.id} layout={LinearTransition.duration(200)}>
                        {slotWrapper}
                      </Animated.View>
                    );
                  })}
              </View>
              ) : null}
            </View>
          </View>

          <View style={styles.scrollViewWrapper}>
            <Animated.ScrollView
              style={styles.scrollView}
              contentContainerStyle={[
                styles.scrollContentList,
                { paddingHorizontal: scale(12), paddingTop: moderateVerticalScale(8), paddingBottom: insets.bottom + moderateVerticalScale(48) },
              ]}
              showsVerticalScrollIndicator={true}
              onScroll={listScrollHandler}
              onContentSizeChange={(_w, h) => {
                const ch = typeof h === 'number' ? h : 0;
                listContentHeightSv.value = ch;
                setListScrollLayout((prev) => ({ ...prev, contentHeight: ch }));
              }}
              onLayout={(e) => {
                const layout = e?.nativeEvent?.layout;
                if (layout != null) {
                  listLayoutHeightSv.value = layout.height;
                  setListScrollLayout((prev) => ({ ...prev, layoutHeight: layout.height }));
                }
              }}
              scrollEventThrottle={16}
            >
            <Text
              style={[
                styles.instructionText,
                {
                  color: colors.textSecondary,
                  fontSize: getResponsiveFontSize('small'),
                  marginBottom: moderateVerticalScale(12),
                  paddingHorizontal: scale(4),
                },
              ]}
            >
              {t('quickMenu.instructionSwap')}
            </Text>
            <View style={[styles.availableSection, { marginTop: moderateVerticalScale(4) }]}>
              {CATEGORY_ORDER.map((cat) => {
                const items = availableByCategory.get(cat) ?? [];
                if (items.length === 0) return null;
                return (
                  <View key={cat} style={styles.availableCategoryBlock}>
                    <Text
                      style={[
                        styles.availableCategoryTitle,
                        { color: colors.text, fontSize: getResponsiveFontSize('medium') },
                      ]}
                    >
                      {t(getCategoryLabelKey(cat))}
                    </Text>
                    <View style={styles.availableGrid}>
                      {items.map((item, index) => {
                        const panGesture = Gesture.Pan()
                          .minDistance(10)
                          .onStart(() => {
                            'worklet';
                            availableDragStarted.value = false;
                          })
                          .onUpdate((e) => {
                            'worklet';
                            const moved = e.translationX * e.translationX + e.translationY * e.translationY;
                            if (moved > 100 && !availableDragStarted.value) {
                              availableDragStarted.value = true;
                              runOnJS(startDragFromAvailable)(item, e.absoluteX, e.absoluteY);
                            }
                            if (availableDragStarted.value) {
                              runOnJS(updateDragPosition)(e.absoluteX, e.absoluteY);
                            }
                          })
                          .onEnd((e) => {
                            'worklet';
                            runOnJS(onDropFromAvailable)(e.absoluteX, e.absoluteY, item.id);
                          });
                        const tapGesture = Gesture.Tap()
                          .onEnd(() => {
                            'worklet';
                            runOnJS(handleAddToFirstEmptySlot)(item);
                          });
                        const combinedGesture = Gesture.Race(tapGesture, panGesture);
                        const cellContent = (
                          <View style={styles.selectedGridItemInner}>
                            <View style={[styles.selectedIconWrap, { backgroundColor: colors.surface }]}>
                              {getQuickMenuIcon(colors.primary, item.icon, item.id)}
                            </View>
                            <Text
                              style={[
                                styles.selectedLabel,
                                { color: colors.text, fontSize: getResponsiveFontSize('small') },
                              ]}
                              numberOfLines={3}
                            >
                              {item.labelKey ? t(item.labelKey) : item.label}
                            </Text>
                          </View>
                        );
                        return (
                          <GestureDetector key={item.id} gesture={combinedGesture}>
                            <Animated.View
                              style={[
                                styles.availableGridItem,
                                {
                                  width: selectedGridItemWidth,
                                  marginRight: (index % SELECTED_GRID_COLUMNS) === SELECTED_GRID_COLUMNS - 1 ? 0 : scale(12),
                                },
                              ]}
                            >
                              {cellContent}
                            </Animated.View>
                          </GestureDetector>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>
            </Animated.ScrollView>
            {listScrollLayout.contentHeight > listScrollLayout.layoutHeight && listScrollLayout.layoutHeight > 0 && (
              <View
                style={[
                  styles.listScrollIndicatorTrack,
                  {
                    height: listScrollLayout.layoutHeight,
                    right: scale(8),
                    zIndex: 10,
                  },
                ]}
                pointerEvents="none"
              >
                <Animated.View
                  style={[styles.listScrollIndicatorThumb, { backgroundColor: colors.primary }, listScrollThumbAnimatedStyle]}
                />
              </View>
            )}
          </View>
        </>
      ) : null}

      {!isLoading && menuItems.length > 0 && (
        <View style={[styles.saveButtonContainerAbsolute, { paddingHorizontal: getHorizontalPadding(), backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={[styles.saveButton, styles.saveButtonFull, { backgroundColor: colors.primary }]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            <Text style={[styles.saveButtonText, { color: colors.surface, fontSize: getResponsiveFontSize('medium') }]}>
              {isSaving ? t('common.loading') : t('common.save')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {draggingFromAvailable && (
        <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none', zIndex: 1000 }]}>
          <Animated.View style={[styles.dragOverlayIcon, dragOverlayAnimatedStyle]}>
            <View style={[styles.selectedIconWrap, { backgroundColor: colors.surface }]}>
              {getQuickMenuIcon(colors.primary, draggingFromAvailable.icon, draggingFromAvailable.id)}
            </View>
          </Animated.View>
        </View>
      )}
      </View>

      {hasEnabledItems && selectedItems.length > 0 && (
        <BottomSheet
          visible={showPreview}
          onClose={handleClosePreview}
          snapPoints={PREVIEW_SNAP_POINTS}
          initialSnapPoint={0}
          enablePanDownToClose={true}
          disableClose={false}
        >
          <PreviewContent
            previewButtons={previewButtons}
            headerContainerStyle={headerContainerStyle}
            titleStyle={titleStyle}
            previewTitleText={previewTitleText}
            scrollContentStyle={scrollContentStyle}
            cardContainerStyle={cardContainerStyle}
            topIndicatorStyle={topIndicatorStyle}
            placeholderSmallStyle={placeholderSmallStyle}
            placeholderLargeStyle={placeholderLargeStyle}
            onBack={handleClosePreview}
            backButtonStyle={backButtonStyle}
            backIconColor={backIconColor}
            textColor={previewTextColor}
            buttonWidth={previewButtonWidth}
            menuContainerStyle={menuContainerStyle}
            menuTitleText={menuTitleText}
            menuTitleStyle={menuTitleStyle}
          />
        </BottomSheet>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex1: {
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
    textAlign: 'center',
  },
  scrollViewWrapper: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  listScrollIndicatorTrack: {
    position: 'absolute',
    top: 0,
    width: scale(6),
    borderRadius: scale(3),
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  listScrollIndicatorThumb: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: scale(3),
    minHeight: scale(24),
  },
  scrollContent: {
    paddingTop: moderateVerticalScale(16),
    paddingBottom: moderateVerticalScale(16),
  },
  scrollContentList: {
    paddingTop: 0,
    paddingBottom: moderateVerticalScale(8),
  },
  scrollContentCentered: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
  },
  emptyStateView: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  emptyStateIconContainer: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    fontFamily: FontFamily.monasans.regular,
  },
  draggableListContainer: {
    minHeight: scale(56),
    marginBottom: moderateVerticalScale(4),
  },
  draggableGridContainer: {
    minHeight: scale(56),
  },
  draggableGridRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: scale(12),
  },
  draggableGridCell: {
    marginRight: 0,
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    borderRadius: scale(12),
    borderWidth: 1
  },
  selectedRowIconWrap: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(10),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  selectedRowLabel: {
    fontFamily: FontFamily.monasans.medium,
    flex: 1,
  },
  removeBadgeRow: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  dashedSlotBorder: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: scale(12),
  },
  dashedIconWrap: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashedDropZoneInner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: moderateVerticalScale(12),
  },
  selectedGridItem: {
    alignItems: 'center',
    position: 'relative',
  },
  selectedGridItemInner: {
    alignItems: 'center',
    justifyContent: 'center',
 
    paddingHorizontal: scale(8),
    borderRadius: scale(12),
    width: '100%',
  },
  removeBadge: {
    position: 'absolute',
    top: -4,
    right: -2,
    zIndex: 1,
    width: scale(18),
    height: scale(18),
    borderRadius: scale(9),
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIconWrap: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(6),
  },
  dragOverlayIcon: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedLabel: {
    fontSize: scale(11),
    fontFamily: FontFamily.monasans.medium,
    textAlign: 'center',
    minWidth: 0,
    width: '100%',
  },
  swapInstructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(4),
  },
  swapIconWrap: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(10),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  swapInstructionText: {
    flex: 1,
  },
  availableSection: {
    marginTop: 0,
  },
  availableCategoryBlock: {
    marginBottom: moderateVerticalScale(16),
  },
  availableCategoryTitle: {
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(8),
  },
  availableGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  availableGridItem: {
    alignItems: 'center',
  },
  availableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(12),
    borderRadius: scale(12),
    borderWidth: 1,
    marginBottom: moderateVerticalScale(10),
  },
  availableIconWrap: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(10),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  availableLabel: {
    fontFamily: FontFamily.monasans.medium,
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: moderateVerticalScale(16),
    borderRadius: scale(12),
    borderWidth: 1,
    marginBottom: moderateVerticalScale(12),
  },
  menuItemLabel: {
    fontFamily: FontFamily.monasans.regular,
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  footerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewButton: {
    borderRadius: scale(12),
    paddingVertical: moderateVerticalScale(16),
    paddingHorizontal: scale(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewButtonText: {
    fontFamily: FontFamily.monasans.semiBold,
  },
  emptyStateText: {
    fontFamily: FontFamily.monasans.regular,
    textAlign: 'center',
    marginBottom: moderateVerticalScale(8),
  },
  emptyStateSubtext: {
    fontFamily: FontFamily.monasans.regular,
    textAlign: 'center',
  },
  saveButtonContainer: {
    paddingTop: moderateVerticalScale(16),
  },
  saveButtonContainerAbsolute: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: moderateVerticalScale(16),
  },
  saveButton: {
    borderRadius: scale(12),
    paddingVertical: moderateVerticalScale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonFull: {
    width: '100%',
  },
  saveButtonText: {
    fontFamily: FontFamily.monasans.semiBold,
  },
  previewHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: moderateVerticalScale(16),
    paddingBottom: moderateVerticalScale(12),
    gap: scale(12),
  },
  previewBackButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(4),
  },
  previewTitle: {
    fontFamily: FontFamily.monasans.bold,
    textAlign: 'left',
    flex: 1,
  },
  previewScrollView: {
    flex: 1,
  },
  previewContent: {
    paddingTop: moderateVerticalScale(16),
    paddingBottom: moderateVerticalScale(32),
  },
  previewCardContainer: {
    borderRadius: scale(16),
    padding: scale(20),
  },
  previewTopIndicator: {
    width: scale(100),
    height: scale(30),
    borderRadius: scale(12),
    alignSelf: 'flex-start',
  },
  previewPlaceholderSmall: {
    height: moderateVerticalScale(30),
    borderRadius: scale(12),
  },
  previewPlaceholderLarge: {
    height: moderateVerticalScale(100),
    borderRadius: scale(12),
  },
  previewQuickAccess: {
    marginTop: 0,
  },
  previewMenuContainer: {
    paddingVertical: moderateVerticalScale(16),
    paddingHorizontal: scale(16),
  },
  previewMenuTitle: {
    fontFamily: FontFamily.monasans.semiBold,
    marginBottom: moderateVerticalScale(12),
  },
  previewQuickAccessRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: '100%',
  },
  previewQuickAccessButton: {
    alignItems: 'center',
  },
  previewQuickAccessIcon: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateVerticalScale(6),
  },
  previewQuickAccessLabel: {
    fontSize: scale(11),
    fontFamily: FontFamily.monasans.medium,
    textAlign: 'center',
  },
});
