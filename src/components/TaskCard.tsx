'use client';

import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Task, Priority } from '@/types/kanban';
import { Calendar, Trash2, FileText, CheckSquare2, AlertCircle } from 'lucide-react';
import { getDueDateStatus } from '@/utils/dateUtils';

interface TaskCardProps {
  task: Task;
  index: number;
  onDeleteTask: (taskId: string) => void;
  onClickTask?: (task: Task) => void;
}

const priorityConfig: Record<Priority, { label: string; badge: string; dot: string }> = {
  low: {
    label: 'Baja',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    dot: 'bg-emerald-500',
  },
  medium: {
    label: 'Media',
    badge: 'bg-sky-50 text-sky-700 border-sky-200/80',
    dot: 'bg-sky-500',
  },
  high: {
    label: 'Alta',
    badge: 'bg-amber-50 text-amber-800 border-amber-200/80',
    dot: 'bg-amber-500',
  },
  urgent: {
    label: 'Urgente',
    badge: 'bg-rose-50 text-rose-700 border-rose-200/80',
    dot: 'bg-rose-500',
  },
};

const avatarColors: Record<string, string> = {
  'Daniela Medina': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Gustavo Mujica': 'bg-blue-100 text-blue-700 border-blue-200',
  'Ricardo Pulgar': 'bg-indigo-100 text-indigo-700 border-indigo-200',
};

export default function TaskCard({ task, index, onDeleteTask, onClickTask }: TaskCardProps) {
  const priorityInfo = priorityConfig[task.priority] || priorityConfig.medium;
  const avatarStyle = avatarColors[task.assignee || ''] || 'bg-slate-100 text-slate-700 border-slate-200';
  const dueStatus = getDueDateStatus(task.dueDate);

  const subtasksCount = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClickTask && onClickTask(task)}
          className={`group bg-white border rounded-xl p-4 mb-3 transition-all cursor-grab active:cursor-grabbing ${
            snapshot.isDragging
              ? 'border-indigo-400 shadow-xl ring-2 ring-indigo-400/30 scale-[1.02]'
              : 'border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
          } ${dueStatus?.isOverdue && task.columnId !== 'done' ? 'border-rose-300/80 ring-1 ring-rose-200/50' : ''}`}
        >
          {/* Top badges: Priority & Trash */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-md border flex items-center gap-1.5 ${priorityInfo.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${priorityInfo.dot}`} />
              {priorityInfo.label}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTask(task.id);
              }}
              className="text-slate-400 hover:text-rose-600 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-rose-50 transition-all cursor-pointer"
              title="Eliminar tarea"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Título de la tarea */}
          <h4 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors mb-1.5 leading-snug">
            {task.title}
          </h4>

          {/* Descripción */}
          {task.description && (
            <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Barra de progreso de subtareas si existen */}
          {subtasksCount > 0 && (
            <div className="mb-3 bg-slate-50 border border-slate-200/70 p-2 rounded-lg">
              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600 mb-1">
                <span className="flex items-center gap-1">
                  <CheckSquare2 className="w-3 h-3 text-indigo-500" />
                  Subtareas
                </span>
                <span>
                  {completedSubtasks}/{subtasksCount}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full transition-all"
                  style={{ width: `${(completedSubtasks / subtasksCount) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Referencia a la reunión de origen */}
          {task.meetingReference && (
            <div className="flex items-center gap-1.5 text-[11px] text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded-md border border-indigo-100/90 mb-3 max-w-fit font-medium">
              <FileText className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
              <span className="truncate max-w-[200px]">{task.meetingReference}</span>
            </div>
          )}

          {/* Etiquetas / Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {task.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium border border-slate-200/60"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Footer: Responsable & Fecha con Alerta de Vencimiento */}
          <div className="flex items-center justify-between text-xs pt-2.5 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold shadow-xs ${avatarStyle}`}
              >
                {task.assignee ? task.assignee[0].toUpperCase() : '?'}
              </div>
              <span className="text-xs text-slate-600 font-medium truncate max-w-[110px]">
                {task.assignee || 'Sin asignar'}
              </span>
            </div>

            {dueStatus && (
              <div
                className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border ${dueStatus.badgeClass}`}
                title={task.dueDate}
              >
                {dueStatus.isOverdue && task.columnId !== 'done' ? (
                  <AlertCircle className="w-3 h-3 text-rose-600" />
                ) : (
                  <Calendar className="w-3 h-3 text-slate-400" />
                )}
                <span>{dueStatus.label}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
