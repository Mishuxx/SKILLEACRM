'use client';

import React from 'react';
import { Task, Column } from '@/types/kanban';
import {
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';

interface MetricsPanelProps {
  tasks: Task[];
  columns: Column[];
  teamMembers: string[];
}

const MEMBER_COLORS: Record<string, string> = {
  'Daniela Medina': 'bg-emerald-600',
  'Gustavo Mujica': 'bg-blue-600',
  'Ricardo Pulgar': 'bg-indigo-600',
};

export default function MetricsPanel({ tasks, columns, teamMembers }: MetricsPanelProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.columnId === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.columnId === 'in_progress').length;
  const urgentTasks = tasks.filter(
    (t) => t.priority === 'urgent' && t.columnId !== 'done'
  ).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 mb-8 shadow-xs">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
        {/* KPI 1: Progreso Global */}
        <div className="flex-1 border-b lg:border-b-0 lg:border-r border-slate-100 pb-5 lg:pb-0 lg:pr-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Progreso General
            </span>
            <span className="text-base font-bold text-slate-900">{completionRate}%</span>
          </div>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
              title={`Completado: ${completedTasks}`}
            />
            <div
              className="bg-amber-400 h-full transition-all duration-500"
              style={{
                width: `${totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0}%`,
              }}
              title={`En Progreso: ${inProgressTasks}`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-medium">
            <span>
              <strong className="text-emerald-600">{completedTasks}</strong> hechos
            </span>
            <span>
              <strong className="text-slate-700">{totalTasks - completedTasks}</strong> por hacer
            </span>
          </div>
        </div>

        {/* KPI 2: Desglose */}
        <div className="flex items-center gap-4 flex-1 border-b lg:border-b-0 lg:border-r border-slate-100 pb-5 lg:pb-0 lg:pr-6">
          <div className="flex-1 p-3 bg-slate-50/70 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>En Marcha</span>
            </div>
            <div className="text-lg font-bold text-slate-800">{inProgressTasks}</div>
          </div>

          <div className="flex-1 p-3 bg-slate-50/70 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Completadas</span>
            </div>
            <div className="text-lg font-bold text-slate-800">{completedTasks}</div>
          </div>

          <div className="flex-1 p-3 bg-slate-50/70 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>Urgentes</span>
            </div>
            <div className="text-lg font-bold text-rose-600">{urgentTasks}</div>
          </div>
        </div>

        {/* KPI 3: Carga por Miembro */}
        <div className="flex-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-indigo-500" />
            Carga de Trabajo
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {teamMembers.map((name) => {
              const pendingCount = tasks.filter(
                (t) => t.assignee === name && t.columnId !== 'done'
              ).length;
              const color = MEMBER_COLORS[name] || 'bg-indigo-600';

              return (
                <div
                  key={name}
                  className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs flex-shrink-0"
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${color}`}
                  >
                    {name[0]}
                  </div>
                  <span className="font-medium text-slate-700">{name.split(' ')[0]}</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-white border border-slate-200 font-semibold text-slate-600 text-[10px]">
                    {pendingCount} act.
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
