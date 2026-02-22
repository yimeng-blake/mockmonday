import { StatusValue, Person } from './types';

export const STATUS_OPTIONS: StatusValue[] = [
  { label: 'Done', color: '#00C875' },
  { label: 'Working on it', color: '#FDAB3D' },
  { label: 'Stuck', color: '#E2445C' },
  { label: 'In Review', color: '#0086C0' },
  { label: 'Waiting for review', color: '#A25DDC' },
  { label: '', color: '#C4C4C4' },
];

export const PRIORITY_OPTIONS: StatusValue[] = [
  { label: 'Critical', color: '#333333' },
  { label: 'High', color: '#401694' },
  { label: 'Medium', color: '#5559DF' },
  { label: 'Low', color: '#579BFC' },
  { label: '', color: '#C4C4C4' },
];

export const GROUP_COLORS = [
  '#579BFC', '#00C875', '#FFCB00', '#E2445C',
  '#A25DDC', '#66CCFF', '#FDAB3D', '#FF158A',
  '#00D2D2', '#9AADBD',
];

export const DEMO_USER: Person = {
  id: 'demo-user',
  name: 'Demo User',
  avatarColor: '#6161FF',
};

export const PEOPLE: Person[] = [
  { id: 'p1', name: 'Alice Chen', avatarColor: '#FF158A' },
  { id: 'p2', name: 'Bob Smith', avatarColor: '#579BFC' },
  { id: 'p3', name: 'Carol Davis', avatarColor: '#00C875' },
  { id: 'p4', name: 'Dan Wilson', avatarColor: '#FDAB3D' },
  { id: 'p5', name: 'Eva Martinez', avatarColor: '#A25DDC' },
];

export const DEFAULT_COLUMN_WIDTHS: Record<string, number> = {
  text: 300,
  status: 160,
  person: 140,
  date: 140,
  number: 120,
};
