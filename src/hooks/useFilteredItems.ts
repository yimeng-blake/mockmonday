'use client';

import { useMemo } from 'react';
import { useBoardStore } from '@/store/boardStore';
import { useUIStore } from '@/store/uiStore';
import { isStatusValue, isPersonValue } from '@/lib/utils';
import { CellValue } from '@/lib/types';

function compareCellValues(a: CellValue, b: CellValue, direction: 'asc' | 'desc'): number {
  const mult = direction === 'asc' ? 1 : -1;
  if (a === null && b === null) return 0;
  if (a === null) return mult;
  if (b === null) return -mult;
  if (typeof a === 'string' && typeof b === 'string') return mult * a.localeCompare(b);
  if (typeof a === 'number' && typeof b === 'number') return mult * (a - b);
  if (isStatusValue(a) && isStatusValue(b)) return mult * (a.label || '').localeCompare(b.label || '');
  if (isPersonValue(a) && isPersonValue(b)) return mult * a.name.localeCompare(b.name);
  return 0;
}

export function useFilteredItems(groupId: string): string[] {
  const group = useBoardStore((s) => s.groups[groupId]);
  const items = useBoardStore((s) => s.items);
  const filters = useUIStore((s) => s.activeFilters);
  const sortConfig = useUIStore((s) => s.sortConfig);

  return useMemo(() => {
    if (!group) return [];
    const { statusFilter, personFilter, keyword } = filters;
    const hasFilters = statusFilter.length > 0 || personFilter.length > 0 || keyword.length > 0;

    let result = group.itemIds;

    if (hasFilters) {
      result = result.filter((itemId) => {
        const item = items[itemId];
        if (!item) return false;
        if (statusFilter.length > 0) {
          if (!Object.values(item.values).some((v) => isStatusValue(v) && statusFilter.includes(v.label))) return false;
        }
        if (personFilter.length > 0) {
          if (!Object.values(item.values).some((v) => isPersonValue(v) && personFilter.includes(v.id))) return false;
        }
        if (keyword.length > 0) {
          const kw = keyword.toLowerCase();
          if (!Object.values(item.values).some((v) => {
            if (typeof v === 'string') return v.toLowerCase().includes(kw);
            if (isStatusValue(v)) return v.label.toLowerCase().includes(kw);
            if (isPersonValue(v)) return v.name.toLowerCase().includes(kw);
            return false;
          })) return false;
        }
        return true;
      });
    }

    if (sortConfig) {
      result = [...result].sort((aId, bId) => {
        const aItem = items[aId];
        const bItem = items[bId];
        if (!aItem || !bItem) return 0;
        return compareCellValues(aItem.values[sortConfig.columnId], bItem.values[sortConfig.columnId], sortConfig.direction);
      });
    }

    return result;
  }, [group, items, filters, sortConfig]);
}
