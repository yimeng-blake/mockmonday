export type ColumnType = 'text' | 'status' | 'person' | 'date' | 'number';

export interface Board {
  id: string;
  name: string;
  description?: string;
  groupIds: string[];
  columns: Column[];
}

export interface Column {
  id: string;
  title: string;
  type: ColumnType;
  width?: number;
}

export interface Group {
  id: string;
  boardId: string;
  title: string;
  color: string;
  collapsed: boolean;
  itemIds: string[];
}

export interface Item {
  id: string;
  groupId: string;
  boardId: string;
  parentItemId?: string;
  values: Record<string, CellValue>;
}

export type CellValue = string | number | StatusValue | PersonValue | null;

export interface StatusValue {
  label: string;
  color: string;
}

export interface PersonValue {
  id: string;
  name: string;
  avatarColor: string;
}

export interface Person {
  id: string;
  name: string;
  avatarColor: string;
}

export interface FilterState {
  statusFilter: string[];
  personFilter: string[];
  keyword: string;
}

export interface SortConfig {
  columnId: string;
  direction: 'asc' | 'desc';
}

export interface ItemUpdate {
  id: string;
  itemId: string;
  userId: string;
  content: string;
  createdAt: string;
  profile?: {
    displayName: string;
    avatarColor: string;
  };
}

export interface BoardTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  templateData: {
    columns: Array<{ title: string; type: ColumnType; width: number }>;
    groups: Array<{
      title: string;
      color: string;
      items: Array<Record<string, CellValue>>;
    }>;
  };
}
