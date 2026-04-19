'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTimeEntries, createTimeEntry, updateTimeEntry } from '@/lib/hooks/use-tasks'
import type { TaskWithRelations, TimeEntry } from '@/lib/types'
import { Clock, Play, Square, Pause } from 'lucide-react'
import { format, differenceInSeconds, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

interface TimeTrackerProps {
  tasks: TaskWithRelations[]
  activeTaskId: string | null
  onStartTimer: (taskId: string) => void
  onStopTimer: () => void
}

export function TimeTracker({ tasks, activeTaskId, onStartTimer, onStopTimer }: TimeTrackerProps) {
  const { timeEntries, mutate: mutateTimeEntries } = useTimeEntries()
  const [elapsedTime, setElapsedTime] = useState(0)
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null)

  const activeTask = activeTaskId ? tasks.find(t => t.id === activeTaskId) : null

  // Find active time entry (one without end_time)
  useEffect(() => {
    const active = timeEntries.find(e => !e.end_time)
    setActiveEntry(active || null)
  }, [timeEntries])

  // Update elapsed time every second when timer is running
  useEffect(() => {
    if (!activeEntry) {
      setElapsedTime(0)
      return
    }

    const startTime = parseISO(activeEntry.start_time)
    
    const updateElapsed = () => {
      setElapsedTime(differenceInSeconds(new Date(), startTime))
    }

    updateElapsed()
    const interval = setInterval(updateElapsed, 1000)

    return () => clearInterval(interval)
  }, [activeEntry])

  const handleStart = async (taskId: string) => {
    // Stop any existing timer first
    if (activeEntry) {
      await handleStop()
    }

    // Create new time entry
    await createTimeEntry({
      task_id: taskId,
      start_time: new Date().toISOString()
    })
    await mutateTimeEntries()
    onStartTimer(taskId)
  }

  const handleStop = async () => {
    if (!activeEntry) return

    const endTime = new Date()
    const startTime = parseISO(activeEntry.start_time)
    const durationMinutes = Math.round(differenceInSeconds(endTime, startTime) / 60)

    await updateTimeEntry(activeEntry.id, {
      end_time: endTime.toISOString(),
      duration_minutes: durationMinutes
    })
    await mutateTimeEntries()
    onStopTimer()
    setActiveEntry(null)
    setElapsedTime(0)
  }

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTotalTimeForTask = (taskId: string) => {
    const entries = timeEntries.filter(e => e.task_id === taskId && e.duration_minutes)
    return entries.reduce((total, e) => total + (e.duration_minutes || 0), 0)
  }

  const formatMinutes = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`
  }

  // Get today's entries
  const todaysEntries = timeEntries.filter(entry => {
    const entryDate = parseISO(entry.start_time)
    const today = new Date()
    return (
      entryDate.getDate() === today.getDate() &&
      entryDate.getMonth() === today.getMonth() &&
      entryDate.getFullYear() === today.getFullYear()
    )
  })

  const todayTotal = todaysEntries.reduce((total, e) => total + (e.duration_minutes || 0), 0)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4" />
          Time Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Timer */}
        {activeTask ? (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Tracking</p>
                <p className="font-medium truncate">{activeTask.title}</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleStop}
                className="shrink-0"
              >
                <Square className="h-4 w-4 mr-1 fill-current" />
                Stop
              </Button>
            </div>
            <div className="mt-3 text-3xl font-mono font-semibold text-primary">
              {formatTime(elapsedTime)}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-muted/50 border border-dashed text-center">
            <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Click the play button on a task to start tracking time
            </p>
          </div>
        )}

        {/* Today's Summary */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Today&apos;s total</span>
            <span className="font-semibold">{formatMinutes(todayTotal)}</span>
          </div>
        </div>

        {/* Recent Entries */}
        {todaysEntries.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Today&apos;s sessions
            </p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {todaysEntries
                .filter(e => e.duration_minutes)
                .slice(0, 5)
                .map(entry => {
                  const task = tasks.find(t => t.id === entry.task_id)
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between py-1.5 text-sm"
                    >
                      <span className="truncate mr-2">
                        {task?.title || 'Unknown task'}
                      </span>
                      <span className="text-muted-foreground shrink-0">
                        {formatMinutes(entry.duration_minutes || 0)}
                      </span>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* Tasks with logged time */}
        <div className="space-y-2 pt-2 border-t">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Time by task
          </p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {tasks
              .filter(t => getTotalTimeForTask(t.id) > 0)
              .sort((a, b) => getTotalTimeForTask(b.id) - getTotalTimeForTask(a.id))
              .slice(0, 5)
              .map(task => (
                <div
                  key={task.id}
                  className="flex items-center justify-between py-1.5 text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      onClick={() => handleStart(task.id)}
                      className="p-1 rounded hover:bg-accent transition-colors"
                      disabled={activeTaskId === task.id}
                    >
                      <Play className={cn(
                        'h-3 w-3',
                        activeTaskId === task.id && 'text-muted-foreground'
                      )} />
                    </button>
                    <span className="truncate">{task.title}</span>
                  </div>
                  <span className="text-muted-foreground shrink-0">
                    {formatMinutes(getTotalTimeForTask(task.id))}
                  </span>
                </div>
              ))}
            {tasks.filter(t => getTotalTimeForTask(t.id) > 0).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">
                No time logged yet
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
