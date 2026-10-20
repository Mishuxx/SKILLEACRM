'use client';

import React from 'react';
import { Task } from '@/types/kanban';
import { UserCheck } from 'lucide-react';

interface TeamViewProps {
  teamMembers: string[];
  tasks: Task[];
}

const MEMBER_ROLES: Record<string, { role: string; color: string }> = {
  'Daniela Medina': { role: 'Gestión & Operaciones', color: 'bg-emerald-600' },
  'Gustavo Mujica': { role: 'Desarrollo & Tecnología', color: 'bg-blue-600' },
  'Ricardo Pulgar': { role: 'Producto & Dirección', color: 'bg-indigo-600' },
};

export default function TeamView({ teamMembers, tasks }: TeamViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-slate-900">Equipo de SkilleaCRM</h2>
        <p className="text-xs text-slate-500">
          Supervisión de compromisos y volumen de tareas asignadas por persona.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {teamMembers.map((name) => {
          const info = MEMBER_ROLES[name] || { role: 'Equipo', color: 'bg-indigo-600' };
          const userTasks = tasks.filter((t) => t.assignee === name);
          const completed = userTasks.filter((t) => t.columnId === 'done').length;
          const inProgress = userTasks.filter((t) => t.columnId === 'in_progress').length;
          const pending = userTasks.filter((t) => t.columnId === 'backlog').length;

          return (
            <div
              key={name}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold text-white shadow-xs ${info.color}`}
                >
                  {name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-tight">{name}</h3>
                  <p className="text-xs text-slate-400">{info.role}</p>
                </div>
              </div>

              {/* Estadísticas */}
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center my-3">
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                    Por Hacer
                  </span>
                  <span className="text-sm font-bold text-slate-700">{pending}</span>
                </div>
                <div className="p-2 bg-amber-50/60 rounded-xl">
                  <span className="text-[10px] text-amber-700 font-semibold uppercase block">
                    En Marcha
                  </span>
                  <span className="text-sm font-bold text-amber-800">{inProgress}</span>
                </div>
                <div className="p-2 bg-emerald-50/60 rounded-xl">
                  <span className="text-[10px] text-emerald-700 font-semibold uppercase block">
                    Listas
                  </span>
                  <span className="text-sm font-bold text-emerald-800">{completed}</span>
                </div>
              </div>

              {/* Tareas asignadas */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Tareas Actuales ({userTasks.length})
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {userTasks.length === 0 ? (
                    <span className="text-xs text-slate-300 italic">Sin tareas pendientes</span>
                  ) : (
                    userTasks.map((t) => (
                      <div
                        key={t.id}
                        className="text-xs p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between"
                      >
                        <span className="truncate max-w-[170px] text-slate-700 font-medium">
                          {t.title}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                            t.columnId === 'done'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {t.columnId === 'done' ? 'Listo' : 'Pendiente'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
