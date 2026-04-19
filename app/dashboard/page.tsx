'use client'

import { useState, useMemo } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header, ViewMode, StatusFilter, PriorityFilter } from '@/components/dashboard/header'
import { ListView } from '@/components/dashboard/list-view'
import { TableView } from '@/components/dashboard/table-view'
import { CalendarView } from '@/components/dashboard/calendar-view'
import { TaskDialog } from '@/components/dashboard/task-dialog'
import { TimeTracker } from '@/components/dashboard/time-tracker'
import { useTasks } from '@/lib/hooks/use-tasks'
import type { TaskWithRelations } from '@/lib/types'

export default function DashboardPage() {
  const { tasks, isLoading, mutate: mutateTasks } = useTasks()
  
  // View and filter state
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([])
  
  // Task dialog state
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskWithRelations | null>(null)
  
  // Time tracker state
  const [activeTimerTaskId, setActiveTimerTaskId] = useState<string | null>(null)

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = task.title.toLowerCase().includes(query)
        const matchesDescription = task.description?.toLowerCase().includes(query)
        if (!matchesTitle && !matchesDescription) return false
      }

      // Status filter
      if (statusFilter !== 'all' && task.status !== statusFilter) return false

      // Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false

      // Project filter
      if (selectedProjectId && task.project_id !== selectedProjectId) return false

      // Label filter
      if (selectedLabelIds.length > 0) {
        const taskLabelIds = task.labels?.map(l => l.id) || []
        if (!selectedLabelIds.some(id => taskLabelIds.includes(id))) return false
      }

      return true
    })
  }, [tasks, searchQuery, statusFilter, priorityFilter, selectedProjectId, selectedLabelIds])

  const handleAddTask = () => {
    setEditingTask(null)
    setTaskDialogOpen(true)
  }

  const handleEditTask = (task: TaskWithRelations) => {
    setEditingTask(task)
    setTaskDialogOpen(true)
  }

  const handleToggleLabel = (labelId: string) => {
    setSelectedLabelIds(prev =>
      prev.includes(labelId)
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    )
  }

  const handleStartTimer = (taskId: string) => {
    setActiveTimerTaskId(taskId)
  }

  const handleStopTimer = () => {
    setActiveTimerTaskId(null)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
        selectedLabelIds={selectedLabelIds}
        onToggleLabel={handleToggleLabel}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          onAddTask={handleAddTask}
        />

        <div className="flex-1 flex min-h-0">
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <>
                {viewMode === 'list' && (
                  <ListView
                    tasks={filteredTasks}
                    onEditTask={handleEditTask}
                    onTasksChange={() => mutateTasks()}
                    onStartTimer={handleStartTimer}
                    onStopTimer={handleStopTimer}
                    activeTimerTaskId={activeTimerTaskId}
                  />
                )}
                {viewMode === 'table' && (
                  <TableView
                    tasks={filteredTasks}
                    onEditTask={handleEditTask}
                    onTasksChange={() => mutateTasks()}
                    onStartTimer={handleStartTimer}
                    onStopTimer={handleStopTimer}
                    activeTimerTaskId={activeTimerTaskId}
                  />
                )}
                {viewMode === 'calendar' && (
                  <CalendarView
                    tasks={filteredTasks}
                    onEditTask={handleEditTask}
                  />
                )}
              </>
            )}
          </main>

          {/* Time Tracker Sidebar */}
          <aside className="w-80 border-l bg-card p-4 overflow-y-auto hidden lg:block">
            <TimeTracker
              tasks={tasks}
              activeTaskId={activeTimerTaskId}
              onStartTimer={handleStartTimer}
              onStopTimer={handleStopTimer}
            />
          </aside>
        </div>
      </div>

      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        task={editingTask}
        onSuccess={() => mutateTasks()}
        defaultProjectId={selectedProjectId}
      />
    </div>
  )
}
