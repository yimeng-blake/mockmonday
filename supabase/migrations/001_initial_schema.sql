-- MockMonday Database Schema

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_color TEXT NOT NULL DEFAULT '#579BFC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_color)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    (ARRAY['#FF158A', '#579BFC', '#00C875', '#FDAB3D', '#A25DDC'])[floor(random() * 5 + 1)::int]
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Boards
CREATE TABLE boards (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  group_order TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Columns
CREATE TABLE columns (
  id TEXT PRIMARY KEY,
  board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'status', 'person', 'date', 'number')),
  width INTEGER DEFAULT 150,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Groups
CREATE TABLE groups (
  id TEXT PRIMARY KEY,
  board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Group',
  color TEXT NOT NULL DEFAULT '#579BFC',
  collapsed BOOLEAN NOT NULL DEFAULT false,
  item_order TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Items
CREATE TABLE items (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  parent_item_id TEXT REFERENCES items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cell Values
CREATE TABLE cell_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  column_id TEXT NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  value JSONB,
  UNIQUE(item_id, column_id)
);

-- Item Updates (comments/activity)
CREATE TABLE item_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Board Templates
CREATE TABLE board_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '',
  template_data JSONB NOT NULL
);

-- Indexes
CREATE INDEX idx_boards_user_id ON boards(user_id);
CREATE INDEX idx_columns_board_id ON columns(board_id);
CREATE INDEX idx_columns_position ON columns(board_id, position);
CREATE INDEX idx_groups_board_id ON groups(board_id);
CREATE INDEX idx_items_group_id ON items(group_id);
CREATE INDEX idx_items_board_id ON items(board_id);
CREATE INDEX idx_items_parent ON items(parent_item_id);
CREATE INDEX idx_cell_values_item ON cell_values(item_id);
CREATE INDEX idx_cell_values_column ON cell_values(column_id);
CREATE INDEX idx_item_updates_item ON item_updates(item_id);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cell_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_templates ENABLE ROW LEVEL SECURITY;

-- Profiles: users can manage their own
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Boards: users see only their boards
CREATE POLICY "Users can manage own boards" ON boards FOR ALL USING (auth.uid() = user_id);

-- Columns: through board ownership
CREATE POLICY "Users can manage columns on own boards" ON columns
  FOR ALL USING (board_id IN (SELECT id FROM boards WHERE user_id = auth.uid()));

-- Groups: through board ownership
CREATE POLICY "Users can manage groups on own boards" ON groups
  FOR ALL USING (board_id IN (SELECT id FROM boards WHERE user_id = auth.uid()));

-- Items: through board ownership
CREATE POLICY "Users can manage items on own boards" ON items
  FOR ALL USING (board_id IN (SELECT id FROM boards WHERE user_id = auth.uid()));

-- Cell values: through item -> board ownership
CREATE POLICY "Users can manage cell values on own items" ON cell_values
  FOR ALL USING (
    item_id IN (SELECT id FROM items WHERE board_id IN (SELECT id FROM boards WHERE user_id = auth.uid()))
  );

-- Item updates: through item -> board ownership
CREATE POLICY "Users can manage updates on own items" ON item_updates
  FOR ALL USING (
    item_id IN (SELECT id FROM items WHERE board_id IN (SELECT id FROM boards WHERE user_id = auth.uid()))
  );

-- Templates: readable by all authenticated users
CREATE POLICY "Templates readable by authenticated users" ON board_templates
  FOR SELECT USING (auth.role() = 'authenticated');

-- Seed board templates
INSERT INTO board_templates (id, name, description, icon, template_data) VALUES
('tpl-project', 'Project Planning', 'Plan and track project tasks with status, owners, and deadlines', 'clipboard-list', '{
  "columns": [
    {"title": "Task", "type": "text", "width": 320},
    {"title": "Status", "type": "status", "width": 160},
    {"title": "Owner", "type": "person", "width": 140},
    {"title": "Due Date", "type": "date", "width": 140},
    {"title": "Priority", "type": "status", "width": 140}
  ],
  "groups": [
    {"title": "To Do", "color": "#579BFC", "items": [
      {"Task": "Define project scope", "Status": {"label": "", "color": "#C4C4C4"}, "Priority": {"label": "High", "color": "#401694"}},
      {"Task": "Create project timeline", "Status": {"label": "", "color": "#C4C4C4"}, "Priority": {"label": "Medium", "color": "#5559DF"}}
    ]},
    {"title": "In Progress", "color": "#FDAB3D", "items": []},
    {"title": "Done", "color": "#00C875", "items": []}
  ]
}'::jsonb),
('tpl-sprint', 'Sprint Board', 'Agile sprint planning with story points and assignees', 'zap', '{
  "columns": [
    {"title": "Task", "type": "text", "width": 320},
    {"title": "Status", "type": "status", "width": 160},
    {"title": "Assignee", "type": "person", "width": 140},
    {"title": "Story Points", "type": "number", "width": 120},
    {"title": "Due Date", "type": "date", "width": 140}
  ],
  "groups": [
    {"title": "Current Sprint", "color": "#A25DDC", "items": []},
    {"title": "Backlog", "color": "#9AADBD", "items": []}
  ]
}'::jsonb),
('tpl-bugs', 'Bug Tracker', 'Track and prioritize bugs with severity levels', 'bug', '{
  "columns": [
    {"title": "Bug", "type": "text", "width": 320},
    {"title": "Severity", "type": "status", "width": 160},
    {"title": "Assigned To", "type": "person", "width": 140},
    {"title": "Reported", "type": "date", "width": 140},
    {"title": "Fix Version", "type": "text", "width": 120}
  ],
  "groups": [
    {"title": "Open", "color": "#E2445C", "items": []},
    {"title": "In Fix", "color": "#FDAB3D", "items": []},
    {"title": "Resolved", "color": "#00C875", "items": []}
  ]
}'::jsonb),
('tpl-content', 'Content Calendar', 'Plan and schedule content across platforms', 'calendar', '{
  "columns": [
    {"title": "Content", "type": "text", "width": 320},
    {"title": "Status", "type": "status", "width": 160},
    {"title": "Author", "type": "person", "width": 140},
    {"title": "Publish Date", "type": "date", "width": 140},
    {"title": "Platform", "type": "text", "width": 120}
  ],
  "groups": [
    {"title": "Ideas", "color": "#66CCFF", "items": []},
    {"title": "In Production", "color": "#FDAB3D", "items": []},
    {"title": "Published", "color": "#00C875", "items": []}
  ]
}'::jsonb),
('tpl-blank', 'Blank Board', 'Start from scratch with a clean board', 'layout-template', '{
  "columns": [
    {"title": "Item", "type": "text", "width": 320},
    {"title": "Status", "type": "status", "width": 160}
  ],
  "groups": [
    {"title": "Group 1", "color": "#579BFC", "items": []}
  ]
}'::jsonb);
