'use client';

import React from 'react';
import { Task, Column, Priority } from '@/types/kanban';
import { Calendar, Trash2, FileText } from 'lucide-react';

interface TaskListViewProps {
  tasks: Task[];
  columns: Column[];
  teamMembers: string[];
  onDeleteTask: (id: string) => void;
  onUpdateTaskColumn: (id: string, colId: string) => void;
  onUpdateTaskAssignee: (id: string, assignee: string) => void;
}

const priorityBadges: Record<Priority, { label: string; cls: string }> = {
  low: { label: 'Baja', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  medium: { label: 'Media', cls: 'bg-sky-50 text-sky-700 border-sky-200' },
  high: { label: 'Alta', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
  urgent: { label: 'Urgente', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export default function TaskListView({
  tasks,
  columns,
  teamMembers,
  onDeleteTask,
  onUpdateTaskColumn,
  onUpdateTaskAssignee,
}: TaskListViewProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
            <tr>
              <th className="px-5 py-3.5">Tarea</th>
              <th className="px-4 py-3.5">Estado</th>
              <th className="px-4 py-3.5">Asignado a</th>
              <th className="px-4 py-3.5">Prioridad</th>
              <th className="px-4 py-3.5">Fecha Límite</th>
              <th className="px-4 py-3.5">Reunión de Origen</th>
              <th className="px-4 py-3.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">
                  No hay tareas registradas en este proyecto.
                </td>
              </tr>
            ) : (
              tasks.map((task) => {
                const priorityInfo = priorityBadges[task.priority] || priorityBadges.medium;
                return (
                  <tr key={task.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-5 py-3.5 font-medium text-slate-900 max-w-xs">
                      <div className="font-semibold text-slate-800 leading-snug">{task.title}</div>
                      {task.description && (
                        <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {task.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <select
                        value={task.columnId}
                        onChange={(e) => onUpdateTaskColumn(task.id, e.target.value)}
                        className="bg-slate-100/80 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-none cursor-pointer"
                      >
                        {columns.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3.5">
                      <select
                        value={task.assignee || teamMembers[0]}
                        onChange={(e) => onUpdateTaskAssignee(task.id, e.target.value)}
                        className="bg-slate-100/80 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-none cursor-pointer"
                      >
                        {teamMembers.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${priorityInfo.cls}`}
                      >
                        {priorityInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {task.dueDate ? (
                        <div className="flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{task.dueDate}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {task.meetingReference ? (
                        <span className="inline-flex items-center gap-1 text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100 font-medium">
                          <FileText className="w-3 h-3 text-indigo-400" />
                          {task.meetingReference}
                        </span>
                      ) : (
                        <span className="text-slate-300">Manual</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Eliminar tarea"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
