export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  color: string
  created_at: string
  updated_at: string
}

export interface Label {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  project_id: string | null
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  project?: Project | null
  labels?: Label[]
}

export interface TaskLabel {
  task_id: string
  label_id: string
}

export interface TimeEntry {
  id: string
  user_id: string
  task_id: string
  description: string | null
  start_time: string
  end_time: string | null
  duration_minutes: number | null
  created_at: string
  task?: Task
}

export interface TaskWithRelations extends Task {
  project: Project | null
  labels: Label[]
  time_entries?: TimeEntry[]
}
