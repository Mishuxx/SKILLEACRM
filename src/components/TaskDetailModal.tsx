'use client';

import React, { useState } from 'react';
import { Task, Priority, Subtask } from '@/types/kanban';
import {
  Calendar,
  Tag,
  FileText,
  Trash2,
  CheckCircle2,
  X,
  Plus,
  CheckSquare2,
  Square,
} from 'lucide-react';
import { getDueDateStatus } from '@/utils/dateUtils';

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
  const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const dueStatus = getDueDateStatus(dueDate);

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSub: Subtask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

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
      subtasks,
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`¿Estás seguro de que deseas eliminar la tarea "${task.title}"?`)) {
      onDeleteTask(task.id);
      onClose();
    }
  };

  const completedCount = subtasks.filter((s) => s.completed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 text-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Detalle & Subtareas
            </span>
            {task.meetingReference && (
              <span className="text-[11px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-md border border-indigo-100 font-semibold flex items-center gap-1">
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
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
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
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Fecha límite
                </label>
                {dueStatus && (
                  <span className={`text-[10px] px-2 py-0.2 rounded font-semibold border ${dueStatus.badgeClass}`}>
                    {dueStatus.label}
                  </span>
                )}
              </div>
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

          {/* Checklist / Subtareas */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <CheckSquare2 className="w-4 h-4 text-indigo-600" />
                Checklist / Subtareas ({completedCount}/{subtasks.length})
              </label>
            </div>

            {/* Input para agregar subtarea */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Añadir un paso o subtarea..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Añadir
              </button>
            </div>

            {/* Lista de subtareas */}
            <div className="space-y-1.5 mt-2 max-h-36 overflow-y-auto">
              {subtasks.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 border border-slate-200/60 group"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleSubtask(s.id)}
                    className="flex items-center gap-2 text-xs text-left flex-1 cursor-pointer"
                  >
                    {s.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                    <span
                      className={`truncate ${
                        s.completed ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    >
                      {s.title}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(s.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-1 pt-1 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700">Descripción & Notas</label>
            <textarea
              rows={4}
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
