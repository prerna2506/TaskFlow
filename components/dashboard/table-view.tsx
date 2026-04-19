'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { TaskWithRelations, TaskStatus, TaskPriority } from '@/lib/types'
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2, Play, Square } from 'lucide-react'
import { updateTask, deleteTask } from '@/lib/hooks/use-tasks'
import { format, parseISO } from 'date-fns'

interface TableViewProps {
  tasks: TaskWithRelations[]
  onEditTask: (task: TaskWithRelations) => void
  onTasksChange: () => void
  onStartTimer: (taskId: string) => void
  onStopTimer: () => void
  activeTimerTaskId: string | null
}

type SortField = 'title' | 'status' | 'priority' | 'due_date' | 'created_at'
type SortDirection = 'asc' | 'desc'

const statusLabels: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done'
}

const statusStyles: Record<TaskStatus, string> = {
  todo: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
}

const priorityOrder: Record<TaskPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3
}

const priorityStyles: Record<TaskPriority, string> = {
  low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
}

export function TableView({
  tasks,
  onEditTask,
  onTasksChange,
  onStartTimer,
  onStopTimer,
  activeTimerTaskId
}: TableViewProps) {
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1
    
    switch (sortField) {
      case 'title':
        return multiplier * a.title.localeCompare(b.title)
      case 'status':
        const statusOrder = { todo: 0, in_progress: 1, done: 2 }
        return multiplier * (statusOrder[a.status] - statusOrder[b.status])
      case 'priority':
        return multiplier * (priorityOrder[a.priority] - priorityOrder[b.priority])
      case 'due_date':
        if (!a.due_date && !b.due_date) return 0
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        return multiplier * (new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
      case 'created_at':
        return multiplier * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      default:
        return 0
    }
  })

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

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p className="text-lg">No tasks found</p>
        <p className="text-sm">Create a new task to get started</p>
      </div>
    )
  }

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead>
      <button
        className="flex items-center gap-1 hover:text-foreground transition-colors"
        onClick={() => handleSort(field)}
      >
        {children}
        <ArrowUpDown className={cn(
          'h-3 w-3',
          sortField === field ? 'text-foreground' : 'text-muted-foreground'
        )} />
      </button>
    </TableHead>
  )

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12" />
            <SortableHeader field="title">Title</SortableHeader>
            <SortableHeader field="status">Status</SortableHeader>
            <SortableHeader field="priority">Priority</SortableHeader>
            <TableHead>Project</TableHead>
            <TableHead>Labels</TableHead>
            <SortableHeader field="due_date">Due Date</SortableHeader>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTasks.map(task => (
            <TableRow
              key={task.id}
              className={cn(task.status === 'done' && 'opacity-60')}
            >
              <TableCell>
                <Checkbox
                  checked={task.status === 'done'}
                  onCheckedChange={() => handleToggleStatus(task)}
                />
              </TableCell>
              <TableCell>
                <div>
                  <span className={cn(
                    'font-medium',
                    task.status === 'done' && 'line-through text-muted-foreground'
                  )}>
                    {task.title}
                  </span>
                  {task.description && (
                    <p className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">
                      {task.description}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className={statusStyles[task.status]}>
                  {statusLabels[task.status]}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className={priorityStyles[task.priority]}>
                  {task.priority}
                </Badge>
              </TableCell>
              <TableCell>
                {task.project ? (
                  <span className="inline-flex items-center gap-1.5 text-sm">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: task.project.color }}
                    />
                    {task.project.name}
                  </span>
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
              </TableCell>
              <TableCell>
                {task.labels && task.labels.length > 0 ? (
                  <div className="flex items-center gap-1 flex-wrap">
                    {task.labels.slice(0, 2).map(label => (
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
                    {task.labels.length > 2 && (
                      <span className="text-xs text-muted-foreground">
                        +{task.labels.length - 2}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
              </TableCell>
              <TableCell>
                {task.due_date ? (
                  <span className="text-sm">
                    {format(parseISO(task.due_date), 'MMM d, yyyy')}
                  </span>
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
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
                      className="h-8 w-8"
                      onClick={() => onStartTimer(task.id)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
