'use client'

import { useState } from 'react'
import { useProjects, useLabels, createProject, createLabel, deleteProject, deleteLabel } from '@/lib/hooks/use-tasks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  LayoutDashboard,
  FolderKanban,
  Tags,
  Clock,
  Plus,
  ChevronDown,
  ChevronRight,
  Trash2,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  selectedProjectId: string | null
  onSelectProject: (id: string | null) => void
  selectedLabelIds: string[]
  onToggleLabel: (id: string) => void
}

const PROJECT_COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
]

const LABEL_COLORS = [
  '#6b7280', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'
]

export function Sidebar({ selectedProjectId, onSelectProject, selectedLabelIds, onToggleLabel }: SidebarProps) {
  const router = useRouter()
  const { projects, mutate: mutateProjects } = useProjects()
  const { labels, mutate: mutateLabels } = useLabels()
  
  const [projectsExpanded, setProjectsExpanded] = useState(true)
  const [labelsExpanded, setLabelsExpanded] = useState(true)
  const [showNewProject, setShowNewProject] = useState(false)
  const [showNewLabel, setShowNewLabel] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newLabelName, setNewLabelName] = useState('')

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return
    try {
      await createProject({
        name: newProjectName.trim(),
        color: PROJECT_COLORS[projects.length % PROJECT_COLORS.length]
      })
      await mutateProjects()
      setNewProjectName('')
      setShowNewProject(false)
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return
    try {
      await createLabel({
        name: newLabelName.trim(),
        color: LABEL_COLORS[labels.length % LABEL_COLORS.length]
      })
      await mutateLabels()
      setNewLabelName('')
      setShowNewLabel(false)
    } catch (error) {
      console.error('Failed to create label:', error)
    }
  }

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject(id)
      await mutateProjects()
      if (selectedProjectId === id) {
        onSelectProject(null)
      }
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  const handleDeleteLabel = async (id: string) => {
    try {
      await deleteLabel(id)
      await mutateLabels()
    } catch (error) {
      console.error('Failed to delete label:', error)
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-xl font-semibold text-sidebar-foreground flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-sidebar-primary" />
          TaskFlow
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          <button
            onClick={() => onSelectProject(null)}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              selectedProjectId === null
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            All Tasks
          </button>
        </div>

        {/* Projects Section */}
        <div className="mt-6">
          <button
            onClick={() => setProjectsExpanded(!projectsExpanded)}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            <span className="flex items-center gap-2">
              <FolderKanban className="h-3.5 w-3.5" />
              Projects
            </span>
            {projectsExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
          
          {projectsExpanded && (
            <div className="mt-1 space-y-0.5">
              {projects.map(project => (
                <div
                  key={project.id}
                  className={cn(
                    'group flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer',
                    selectedProjectId === project.id
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  )}
                  onClick={() => onSelectProject(project.id)}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="flex-1 truncate">{project.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteProject(project.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-opacity"
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </button>
                </div>
              ))}
              
              {showNewProject ? (
                <div className="px-3 py-2">
                  <Input
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Project name"
                    className="h-8 text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateProject()
                      if (e.key === 'Escape') {
                        setShowNewProject(false)
                        setNewProjectName('')
                      }
                    }}
                    onBlur={() => {
                      if (!newProjectName.trim()) {
                        setShowNewProject(false)
                      }
                    }}
                  />
                </div>
              ) : (
                <button
                  onClick={() => setShowNewProject(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Project
                </button>
              )}
            </div>
          )}
        </div>

        {/* Labels Section */}
        <div className="mt-6">
          <button
            onClick={() => setLabelsExpanded(!labelsExpanded)}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            <span className="flex items-center gap-2">
              <Tags className="h-3.5 w-3.5" />
              Labels
            </span>
            {labelsExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
          
          {labelsExpanded && (
            <div className="mt-1 space-y-0.5">
              {labels.map(label => (
                <div
                  key={label.id}
                  className={cn(
                    'group flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer',
                    selectedLabelIds.includes(label.id)
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  )}
                  onClick={() => onToggleLabel(label.id)}
                >
                  <span
                    className="h-2.5 w-2.5 rounded shrink-0"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="flex-1 truncate">{label.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteLabel(label.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-opacity"
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </button>
                </div>
              ))}
              
              {showNewLabel ? (
                <div className="px-3 py-2">
                  <Input
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    placeholder="Label name"
                    className="h-8 text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateLabel()
                      if (e.key === 'Escape') {
                        setShowNewLabel(false)
                        setNewLabelName('')
                      }
                    }}
                    onBlur={() => {
                      if (!newLabelName.trim()) {
                        setShowNewLabel(false)
                      }
                    }}
                  />
                </div>
              ) : (
                <button
                  onClick={() => setShowNewLabel(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Label
                </button>
              )}
            </div>
          )}
        </div>
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  )
}
