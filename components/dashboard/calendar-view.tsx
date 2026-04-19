'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { TaskWithRelations, TaskPriority } from '@/lib/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
  addMonths,
  subMonths
} from 'date-fns'

interface CalendarViewProps {
  tasks: TaskWithRelations[]
  onEditTask: (task: TaskWithRelations) => void
}

const priorityStyles: Record<TaskPriority, string> = {
  low: 'bg-emerald-500',
  medium: 'bg-amber-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500'
}

export function CalendarView({ tasks, onEditTask }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => {
      if (!task.due_date) return false
      return isSameDay(parseISO(task.due_date), day)
    })
  }

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const goToToday = () => setCurrentMonth(new Date())

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-lg border bg-card overflow-hidden">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 border-b bg-muted/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div
              key={day}
              className="py-3 text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const dayTasks = getTasksForDay(day)
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const isCurrentDay = isToday(day)

            return (
              <div
                key={idx}
                className={cn(
                  'min-h-[120px] border-b border-r p-2 transition-colors',
                  !isCurrentMonth && 'bg-muted/30',
                  idx % 7 === 6 && 'border-r-0',
                  idx >= days.length - 7 && 'border-b-0'
                )}
              >
                <div className="flex items-start justify-between mb-1">
                  <span
                    className={cn(
                      'inline-flex items-center justify-center h-7 w-7 rounded-full text-sm',
                      isCurrentDay && 'bg-primary text-primary-foreground font-semibold',
                      !isCurrentDay && !isCurrentMonth && 'text-muted-foreground',
                      !isCurrentDay && isCurrentMonth && 'text-foreground'
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                </div>

                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map(task => (
                    <button
                      key={task.id}
                      onClick={() => onEditTask(task)}
                      className={cn(
                        'w-full text-left px-2 py-1 rounded text-xs font-medium truncate transition-all hover:ring-2 hover:ring-ring',
                        task.status === 'done'
                          ? 'bg-muted text-muted-foreground line-through'
                          : 'bg-primary/10 text-foreground'
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        <span
                          className={cn('h-1.5 w-1.5 rounded-full shrink-0', priorityStyles[task.priority])}
                        />
                        <span className="truncate">{task.title}</span>
                      </span>
                    </button>
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="block text-xs text-muted-foreground px-2">
                      +{dayTasks.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tasks without due dates */}
      {tasks.filter(t => !t.due_date).length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            Tasks without due date ({tasks.filter(t => !t.due_date).length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {tasks.filter(t => !t.due_date).slice(0, 10).map(task => (
              <button
                key={task.id}
                onClick={() => onEditTask(task)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-muted hover:bg-accent transition-colors"
              >
                <span
                  className={cn('h-2 w-2 rounded-full', priorityStyles[task.priority])}
                />
                {task.title}
              </button>
            ))}
            {tasks.filter(t => !t.due_date).length > 10 && (
              <span className="px-3 py-1.5 text-sm text-muted-foreground">
                +{tasks.filter(t => !t.due_date).length - 10} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
