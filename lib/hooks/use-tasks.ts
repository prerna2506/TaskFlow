'use client'

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { Task, Project, Label, TimeEntry, TaskWithRelations } from '@/lib/types'

const supabase = createClient()

async function fetchTasks(): Promise<TaskWithRelations[]> {
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  if (tasksError) throw tasksError
  if (!tasks) return []

  const { data: projects } = await supabase.from('projects').select('*')
  const { data: labels } = await supabase.from('labels').select('*')
  const { data: taskLabels } = await supabase.from('task_labels').select('*')

  const projectMap = new Map(projects?.map(p => [p.id, p]) || [])
  const labelMap = new Map(labels?.map(l => [l.id, l]) || [])
  const taskLabelMap = new Map<string, string[]>()
  
  taskLabels?.forEach(tl => {
    const existing = taskLabelMap.get(tl.task_id) || []
    taskLabelMap.set(tl.task_id, [...existing, tl.label_id])
  })

  return tasks.map(task => ({
    ...task,
    project: task.project_id ? projectMap.get(task.project_id) || null : null,
    labels: (taskLabelMap.get(task.id) || [])
      .map(lid => labelMap.get(lid))
      .filter(Boolean) as Label[]
  }))
}

async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

async function fetchLabels(): Promise<Label[]> {
  const { data, error } = await supabase
    .from('labels')
    .select('*')
    .order('name', { ascending: true })
  
  if (error) throw error
  return data || []
}

async function fetchTimeEntries(): Promise<TimeEntry[]> {
  const { data, error } = await supabase
    .from('time_entries')
    .select('*, task:tasks(*)')
    .order('start_time', { ascending: false })
  
  if (error) throw error
  return data || []
}

export function useTasks() {
  const { data, error, isLoading, mutate } = useSWR('tasks', fetchTasks)
  
  return {
    tasks: data || [],
    isLoading,
    error,
    mutate
  }
}

export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR('projects', fetchProjects)
  
  return {
    projects: data || [],
    isLoading,
    error,
    mutate
  }
}

export function useLabels() {
  const { data, error, isLoading, mutate } = useSWR('labels', fetchLabels)
  
  return {
    labels: data || [],
    isLoading,
    error,
    mutate
  }
}

export function useTimeEntries() {
  const { data, error, isLoading, mutate } = useSWR('time_entries', fetchTimeEntries)
  
  return {
    timeEntries: data || [],
    isLoading,
    error,
    mutate
  }
}

// Task mutations
export async function createTask(task: Partial<Task>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('tasks')
    .insert({ ...task, user_id: user.id })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTask(id: string, updates: Partial<Task>) {
  const { data, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTask(id: string) {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}

// Project mutations
export async function createProject(project: Partial<Project>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('projects')
    .insert({ ...project, user_id: user.id })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProject(id: string, updates: Partial<Project>) {
  const { data, error } = await supabase
    .from('projects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}

// Label mutations
export async function createLabel(label: Partial<Label>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('labels')
    .insert({ ...label, user_id: user.id })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteLabel(id: string) {
  const { error } = await supabase.from('labels').delete().eq('id', id)
  if (error) throw error
}

// Task label mutations
export async function addLabelToTask(taskId: string, labelId: string) {
  const { error } = await supabase
    .from('task_labels')
    .insert({ task_id: taskId, label_id: labelId })

  if (error) throw error
}

export async function removeLabelFromTask(taskId: string, labelId: string) {
  const { error } = await supabase
    .from('task_labels')
    .delete()
    .eq('task_id', taskId)
    .eq('label_id', labelId)

  if (error) throw error
}

// Time entry mutations
export async function createTimeEntry(entry: Partial<TimeEntry>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('time_entries')
    .insert({ ...entry, user_id: user.id })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTimeEntry(id: string, updates: Partial<TimeEntry>) {
  const { data, error } = await supabase
    .from('time_entries')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTimeEntry(id: string) {
  const { error } = await supabase.from('time_entries').delete().eq('id', id)
  if (error) throw error
}
