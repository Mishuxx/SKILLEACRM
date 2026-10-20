export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  role: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
}

export interface ActivityLogItem {
  id: string;
  userId: string;
  userName: string;
  projectId?: string;
  projectName?: string;
  action: 'CREATED' | 'MOVED' | 'DELETED' | 'MEETING_INGESTED' | 'PROJECT_DELETED' | 'UPDATED';
  taskTitle?: string;
  fromColumn?: string;
  toColumn?: string;
  meetingTitle?: string;
  timestamp: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  assignee?: string;
  priority: Priority;
  dueDate?: string;
  meetingReference?: string;
  tags?: string[];
  subtasks?: Subtask[];
  columnId: string;
  createdAt: string;
  completedAt?: string;
}

export interface Column {
  id: string;
  title: string;
  color?: string;
}

export interface ExtractedTaskCandidate {
  id: string;
  title: string;
  description: string;
  assignee: string;
  priority: Priority;
  dueDate?: string;
  tags: string[];
  subtasks?: string[];
  selected: boolean;
}
