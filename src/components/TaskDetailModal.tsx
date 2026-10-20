'use client';

import React, { useState } from 'react';
import { Task, Priority } from '@/types/kanban';
import {
  Calendar,
  Clock,
  User,
  Tag,
  FileText,
  Trash2,
  CheckCircle2,
  X,
  AlertTriangle,
} from 'lucide-react';

interface TaskDetailModalProps {
  task: Task | null;
  columns: { id: string; title: string }[];
  teamMembers: string[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (updatedTask: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function TaskDetailModal({
  task,
  columns,
  teamMembers,
  isOpen,
  onClose,
  onUpdateTask,
  onDeleteTask,
}: TaskDetailModalProps) {
  if (!isOpen || !task) return null;

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [assignee, setAssignee] = useState(task.assignee || teamMembers[0]);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [columnId, setColumnId] = useState(task.columnId);
  const [dueDate, setDueDate] = useState(task.dueDate || '');
  const [tagInput, setTagInput] = useState((task.tags || []).join(', '));

  const handleSave = () => {
    const updatedTags = tagInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    onUpdateTask({
      ...task,
      title: title.trim() || 'Tarea sin título',
      description: description.trim(),
      assignee,
      priority,
      columnId,
      dueDate: dueDate || undefined,
      tags: updatedTags,
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`¿Estás seguro de que deseas eliminar la tarea "${task.title}"?`)) {
      onDeleteTask(task.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 text-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Detalle de Tarea
            </span>
            {task.meetingReference && (
              <span className="text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100 font-semibold flex items-center gap-1">
                <FileText className="w-3 h-3 text-indigo-500" />
                {task.meetingReference}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Título */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Título de la tarea</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Estado, Asignado, Prioridad */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Estado (Columna)</label>
              <select
                value={columnId}
                onChange={(e) => setColumnId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
              >
                {columns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Responsable</label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
              >
                {teamMembers.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Prioridad</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          {/* Fecha Límite y Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Fecha límite
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" /> Etiquetas (separadas por coma)
              </label>
              <input
                type="text"
                placeholder="Tech, Android, Diseño"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Descripción & Notas</label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles técnicos, acuerdos de la reunión, enlaces relevantes..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/70">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Eliminar Tarea
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
