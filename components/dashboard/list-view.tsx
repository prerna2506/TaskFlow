'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { TaskWithRelations, TaskStatus, TaskPriority } from '@/lib/types'
import { Calendar, Clock, MoreHorizontal, Pencil, Trash2, Play, Square } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { updateTask, deleteTask } from '@/lib/hooks/use-tasks'
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns'

interface ListViewProps {
  tasks: TaskWithRelations[]
  onEditTask: (task: TaskWithRelations) => void
  onTasksChange: () => void
  onStartTimer: (taskId: string) => void
  onStopTimer: () => void
  activeTimerTaskId: string | null
}

const statusLabels: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done'
}

const priorityStyles: Record<TaskPriority, string> = {
  low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
}

export function ListView({
  tasks,
  onEditTask,
  onTasksChange,
  onStartTimer,
  onStopTimer,
  activeTimerTaskId
}: ListViewProps) {
  const handleToggleStatus = async (task: TaskWithRelations) => {
    const newStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done'
    await updateTask(task.id, {
      status: newStatus,
      completed_at: newStatus === 'done' ? new Date().toISOString() : null
    })
    onTasksChange()
  }

  const handleDelete = async (taskId: string) => {
    await deleteTask(taskId)
    onTasksChange()
  }

  const formatDueDate = (dateStr: string) => {
    const date = parseISO(dateStr)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'MMM d')
  }

  const getDueDateColor = (dateStr: string, status: TaskStatus) => {
    if (status === 'done') return 'text-muted-foreground'
    const date = parseISO(dateStr)
    if (isPast(date) && !isToday(date)) return 'text-destructive'
    if (isToday(date)) return 'text-orange-600 dark:text-orange-400'
    return 'text-muted-foreground'
  }

  // Group tasks by status
  const groupedTasks = {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    done: tasks.filter(t => t.status === 'done')
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p className="text-lg">No tasks found</p>
        <p className="text-sm">Create a new task to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {(['todo', 'in_progress', 'done'] as TaskStatus[]).map(status => {
        const statusTasks = groupedTasks[status]
        if (statusTasks.length === 0) return null

        return (
          <div key={status}>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor:
                    status === 'todo' ? 'var(--status-todo)' :
                    status === 'in_progress' ? 'var(--status-in-progress)' :
                    'var(--status-done)'
                }}
              />
              {statusLabels[status]}
              <span className="text-xs font-normal">({statusTasks.length})</span>
            </h3>

            <div className="space-y-2">
              {statusTasks.map(task => (
                <div
                  key={task.id}
                  className={cn(
                    'group flex items-start gap-3 p-4 rounded-lg border bg-card transition-all hover:shadow-sm',
                    task.status === 'done' && 'opacity-60'
                  )}
                >
                  <Checkbox
                    checked={task.status === 'done'}
                    onCheckedChange={() => handleToggleStatus(task)}
                    className="mt-1"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4
                          className={cn(
                            'font-medium text-foreground',
                            task.status === 'done' && 'line-through text-muted-foreground'
                          )}
                        >
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {activeTimerTaskId === task.id ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => onStopTimer()}
                          >
                            <Square className="h-4 w-4 fill-current" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => onStartTimer(task.id)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEditTask(task)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(task.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      {task.project && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: task.project.color }}
                          />
                          {task.project.name}
                        </span>
                      )}

                      <Badge variant="secondary" className={priorityStyles[task.priority]}>
                        {task.priority}
                      </Badge>

                      {task.due_date && (
                        <span className={cn('inline-flex items-center gap-1 text-xs', getDueDateColor(task.due_date, task.status))}>
                          <Calendar className="h-3 w-3" />
                          {formatDueDate(task.due_date)}
                        </span>
                      )}

                      {task.labels && task.labels.length > 0 && (
                        <div className="flex items-center gap-1">
                          {task.labels.map(label => (
                            <span
                              key={label.id}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: `${label.color}20`,
                                color: label.color
                              }}
                            >
                              {label.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
