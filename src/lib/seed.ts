import { Board, Group, Item, Column } from './types';
import { PEOPLE } from './constants';

const productLaunchColumns: Column[] = [
  { id: 'col-name', title: 'Task', type: 'text', width: 320 },
  { id: 'col-status', title: 'Status', type: 'status', width: 160 },
  { id: 'col-person', title: 'Owner', type: 'person', width: 140 },
  { id: 'col-date', title: 'Due Date', type: 'date', width: 140 },
  { id: 'col-priority', title: 'Priority', type: 'status', width: 140 },
];

const sprintColumns: Column[] = [
  { id: 'scol-name', title: 'Task', type: 'text', width: 320 },
  { id: 'scol-status', title: 'Status', type: 'status', width: 160 },
  { id: 'scol-person', title: 'Assignee', type: 'person', width: 140 },
  { id: 'scol-points', title: 'Story Points', type: 'number', width: 120 },
  { id: 'scol-date', title: 'Due Date', type: 'date', width: 140 },
];

const boards: Record<string, Board> = {
  'board-1': {
    id: 'board-1',
    name: 'Product Launch',
    description: 'Q1 product launch planning and execution',
    groupIds: ['group-1', 'group-2', 'group-3'],
    columns: productLaunchColumns,
  },
  'board-2': {
    id: 'board-2',
    name: 'Sprint Backlog',
    description: 'Current sprint tasks and backlog items',
    groupIds: ['group-4', 'group-5'],
    columns: sprintColumns,
  },
};

const groups: Record<string, Group> = {
  'group-1': {
    id: 'group-1',
    boardId: 'board-1',
    title: 'Planning',
    color: '#579BFC',
    collapsed: false,
    itemIds: ['item-1', 'item-2', 'item-3', 'item-4'],
  },
  'group-2': {
    id: 'group-2',
    boardId: 'board-1',
    title: 'In Progress',
    color: '#FDAB3D',
    collapsed: false,
    itemIds: ['item-5', 'item-6', 'item-7', 'item-8', 'item-9'],
  },
  'group-3': {
    id: 'group-3',
    boardId: 'board-1',
    title: 'Completed',
    color: '#00C875',
    collapsed: false,
    itemIds: ['item-10', 'item-11', 'item-12'],
  },
  'group-4': {
    id: 'group-4',
    boardId: 'board-2',
    title: 'Current Sprint',
    color: '#A25DDC',
    collapsed: false,
    itemIds: ['item-13', 'item-14', 'item-15', 'item-16', 'item-17'],
  },
  'group-5': {
    id: 'group-5',
    boardId: 'board-2',
    title: 'Backlog',
    color: '#9AADBD',
    collapsed: false,
    itemIds: ['item-18', 'item-19', 'item-20'],
  },
};

const items: Record<string, Item> = {
  'item-1': {
    id: 'item-1', groupId: 'group-1', boardId: 'board-1',
    values: {
      'col-name': 'Define target audience',
      'col-status': { label: 'Done', color: '#00C875' },
      'col-person': PEOPLE[0],
      'col-date': '2026-02-15',
      'col-priority': { label: 'High', color: '#401694' },
    },
  },
  'item-2': {
    id: 'item-2', groupId: 'group-1', boardId: 'board-1',
    values: {
      'col-name': 'Competitive analysis',
      'col-status': { label: 'Done', color: '#00C875' },
      'col-person': PEOPLE[2],
      'col-date': '2026-02-18',
      'col-priority': { label: 'Medium', color: '#5559DF' },
    },
  },
  'item-3': {
    id: 'item-3', groupId: 'group-1', boardId: 'board-1',
    values: {
      'col-name': 'Set pricing strategy',
      'col-status': { label: 'Working on it', color: '#FDAB3D' },
      'col-person': PEOPLE[3],
      'col-date': '2026-02-21',
      'col-priority': { label: 'Critical', color: '#333333' },
    },
  },
  'item-4': {
    id: 'item-4', groupId: 'group-1', boardId: 'board-1',
    values: {
      'col-name': 'Create go-to-market plan',
      'col-status': { label: 'Waiting for review', color: '#A25DDC' },
      'col-person': PEOPLE[1],
      'col-date': '2026-02-24',
      'col-priority': { label: 'High', color: '#401694' },
    },
  },
  'item-5': {
    id: 'item-5', groupId: 'group-2', boardId: 'board-1',
    values: {
      'col-name': 'Design landing page',
      'col-status': { label: 'Working on it', color: '#FDAB3D' },
      'col-person': PEOPLE[4],
      'col-date': '2026-02-23',
      'col-priority': { label: 'High', color: '#401694' },
    },
  },
  'item-6': {
    id: 'item-6', groupId: 'group-2', boardId: 'board-1',
    values: {
      'col-name': 'Write blog post announcement',
      'col-status': { label: 'Working on it', color: '#FDAB3D' },
      'col-person': PEOPLE[2],
      'col-date': '2026-02-28',
      'col-priority': { label: 'Medium', color: '#5559DF' },
    },
  },
  'item-7': {
    id: 'item-7', groupId: 'group-2', boardId: 'board-1',
    values: {
      'col-name': 'Prepare email campaign',
      'col-status': { label: 'Stuck', color: '#E2445C' },
      'col-person': PEOPLE[0],
      'col-date': '2026-02-20',
      'col-priority': { label: 'Medium', color: '#5559DF' },
    },
  },
  'item-8': {
    id: 'item-8', groupId: 'group-2', boardId: 'board-1',
    values: {
      'col-name': 'Record product demo video',
      'col-status': { label: 'In Review', color: '#0086C0' },
      'col-person': PEOPLE[3],
      'col-date': '2026-03-05',
      'col-priority': { label: 'Low', color: '#579BFC' },
    },
  },
  'item-9': {
    id: 'item-9', groupId: 'group-2', boardId: 'board-1',
    values: {
      'col-name': 'Social media content plan',
      'col-status': { label: 'Working on it', color: '#FDAB3D' },
      'col-person': PEOPLE[1],
      'col-date': '2026-03-01',
      'col-priority': { label: 'Low', color: '#579BFC' },
    },
  },
  'item-10': {
    id: 'item-10', groupId: 'group-3', boardId: 'board-1',
    values: {
      'col-name': 'Set up analytics dashboard',
      'col-status': { label: 'Done', color: '#00C875' },
      'col-person': PEOPLE[3],
      'col-date': '2026-02-10',
      'col-priority': { label: 'Medium', color: '#5559DF' },
    },
  },
  'item-11': {
    id: 'item-11', groupId: 'group-3', boardId: 'board-1',
    values: {
      'col-name': 'Create brand guidelines',
      'col-status': { label: 'Done', color: '#00C875' },
      'col-person': PEOPLE[4],
      'col-date': '2026-02-12',
      'col-priority': { label: 'High', color: '#401694' },
    },
  },
  'item-12': {
    id: 'item-12', groupId: 'group-3', boardId: 'board-1',
    values: {
      'col-name': 'Finalize product name',
      'col-status': { label: 'Done', color: '#00C875' },
      'col-person': PEOPLE[0],
      'col-date': '2026-02-05',
      'col-priority': { label: 'Critical', color: '#333333' },
    },
  },
  'item-13': {
    id: 'item-13', groupId: 'group-4', boardId: 'board-2',
    values: {
      'scol-name': 'Implement user auth flow',
      'scol-status': { label: 'Working on it', color: '#FDAB3D' },
      'scol-person': PEOPLE[1],
      'scol-points': 8,
      'scol-date': '2026-02-22',
    },
  },
  'item-14': {
    id: 'item-14', groupId: 'group-4', boardId: 'board-2',
    values: {
      'scol-name': 'Fix navigation bug on mobile',
      'scol-status': { label: 'Stuck', color: '#E2445C' },
      'scol-person': PEOPLE[4],
      'scol-points': 3,
      'scol-date': '2026-02-19',
    },
  },
  'item-15': {
    id: 'item-15', groupId: 'group-4', boardId: 'board-2',
    values: {
      'scol-name': 'Add dark mode support',
      'scol-status': { label: 'In Review', color: '#0086C0' },
      'scol-person': PEOPLE[3],
      'scol-points': 5,
      'scol-date': '2026-02-25',
    },
  },
  'item-16': {
    id: 'item-16', groupId: 'group-4', boardId: 'board-2',
    values: {
      'scol-name': 'Write API documentation',
      'scol-status': { label: 'Working on it', color: '#FDAB3D' },
      'scol-person': PEOPLE[2],
      'scol-points': 2,
      'scol-date': '2026-02-27',
    },
  },
  'item-17': {
    id: 'item-17', groupId: 'group-4', boardId: 'board-2',
    values: {
      'scol-name': 'Optimize database queries',
      'scol-status': { label: 'Done', color: '#00C875' },
      'scol-person': PEOPLE[0],
      'scol-points': 5,
      'scol-date': '2026-02-16',
    },
  },
  'item-18': {
    id: 'item-18', groupId: 'group-5', boardId: 'board-2',
    values: {
      'scol-name': 'Integrate payment gateway',
      'scol-status': { label: '', color: '#C4C4C4' },
      'scol-person': null,
      'scol-points': 13,
      'scol-date': '',
    },
  },
  'item-19': {
    id: 'item-19', groupId: 'group-5', boardId: 'board-2',
    values: {
      'scol-name': 'Set up CI/CD pipeline',
      'scol-status': { label: '', color: '#C4C4C4' },
      'scol-person': PEOPLE[1],
      'scol-points': 5,
      'scol-date': '',
    },
  },
  'item-20': {
    id: 'item-20', groupId: 'group-5', boardId: 'board-2',
    values: {
      'scol-name': 'Performance load testing',
      'scol-status': { label: 'Waiting for review', color: '#A25DDC' },
      'scol-person': null,
      'scol-points': 8,
      'scol-date': '',
    },
  },
};

export const seedData = {
  boards,
  groups,
  items,
  boardOrder: ['board-1', 'board-2'],
};
