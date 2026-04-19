"use client"

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useProjects,
  useLabels,
  createTask,
  updateTask,
  addLabelToTask,
  removeLabelFromTask
} from '@/lib/hooks/use-tasks'
import type { Task, TaskStatus, TaskPriority } from '@/lib/types'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task | null
  onSuccess: (task?: any) => void
  defaultProjectId?: string | null
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  onSuccess,
  defaultProjectId
}: TaskDialogProps) {

  const { projects } = useProjects()
  const { labels: allLabels } = useLabels()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('todo')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [dueDate, setDueDate] = useState('')
  const [projectId, setProjectId] = useState<string>('none')
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setStatus(task.status)
      setPriority(task.priority)
      setDueDate(task.due_date || '')
      setProjectId(task.project_id || 'none')
      setSelectedLabels(task.labels?.map(l => l.id) || [])
    } else {
      setTitle('')
      setDescription('')
      setStatus('todo')
      setPriority('medium')
      setDueDate('')
      setProjectId(defaultProjectId || 'none')
      setSelectedLabels([])
    }
  }, [task, open, defaultProjectId])

  const toggleLabel = (labelId: string) => {
    setSelectedLabels(prev =>
      prev.includes(labelId)
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        due_date: dueDate || null,
        project_id: projectId === 'none' ? null : projectId,
        completed_at: status === 'done' ? new Date().toISOString() : null
      }

      if (task) {
        await updateTask(task.id, taskData)

        const currentLabelIds = task.labels?.map(l => l.id) || []

        const labelsToAdd = selectedLabels.filter(id => !currentLabelIds.includes(id))
        const labelsToRemove = currentLabelIds.filter(id => !selectedLabels.includes(id))

        for (const labelId of labelsToAdd) {
          await addLabelToTask(task.id, labelId)
        }

        for (const labelId of labelsToRemove) {
          await removeLabelFromTask(task.id, labelId)
        }

        onSuccess()
      } else {
        const newTask = await createTask(taskData)

        for (const labelId of selectedLabels) {
          await addLabelToTask(newTask.id, labelId)
        }

        onSuccess(newTask)
      }

      onOpenChange(false)

    } catch (error) {
      console.error('Failed to save task:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {task ? 'Edit Task' : 'Create Task'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Labels</Label>
            <div className="flex flex-wrap gap-2">
              {allLabels.map(label => (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => toggleLabel(label.id)}
                  className={cn(
                    "px-2 py-1 rounded text-xs",
                    selectedLabels.includes(label.id)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  )}
                >
                  {label.name}
                  {selectedLabels.includes(label.id) && <X className="inline h-3 w-3 ml-1" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  )
}