'use client';

import React from 'react';
import { Project } from '@/types/kanban';
import {
  FolderKanban,
  LayoutDashboard,
  CheckSquare,
  Users,
  History,
  Plus,
  Trash2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onAddProject: () => void;
  onDeleteProject: (id: string, name: string) => void;
  activeTab: 'kanban' | 'list' | 'team' | 'history';
  onSelectTab: (tab: 'kanban' | 'list' | 'team' | 'history') => void;
  teamMembers: string[];
  activeAssignee: string;
  onSelectAssignee: (name: string) => void;
  onOpenMeetingModal: () => void;
}

export default function Sidebar({
  projects,
  activeProjectId,
  onSelectProject,
  onAddProject,
  onDeleteProject,
  activeTab,
  onSelectTab,
  teamMembers,
  activeAssignee,
  onSelectAssignee,
  onOpenMeetingModal,
}: SidebarProps) {
  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200/80 flex flex-col h-screen select-none flex-shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200/70 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <FolderKanban className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none">
              SkilleaCRM
            </h1>
            <span className="text-[10px] text-slate-500 font-medium">Workspace & IA</span>
          </div>
        </div>
      </div>

      {/* Botón rápido IA */}
      <div className="p-3">
        <button
          onClick={onOpenMeetingModal}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Analizar Entrevista / Notas
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {/* Vistas / Pestañas de Navegación Estilo Notion */}
        <div>
          <div className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Vistas
          </div>
          <nav className="space-y-0.5">
            <button
              onClick={() => onSelectTab('kanban')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'kanban'
                  ? 'bg-indigo-100/70 text-indigo-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-slate-500" />
              Tablero Kanban
            </button>

            <button
              onClick={() => onSelectTab('list')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-indigo-100/70 text-indigo-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-slate-500" />
              Lista de Tareas
            </button>

            <button
              onClick={() => onSelectTab('team')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'team'
                  ? 'bg-indigo-100/70 text-indigo-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4 text-slate-500" />
              Equipo y Carga
            </button>

            <button
              onClick={() => onSelectTab('history')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-indigo-100/70 text-indigo-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4 text-slate-500" />
              Historial de Auditoría
            </button>
          </nav>
        </div>

        {/* Proyectos Estilo Trello / Notion con opción de borrar */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Proyectos ({projects.length})
            </span>
            <button
              onClick={onAddProject}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
              title="Crear nuevo proyecto"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-0.5">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeProjectId === proj.id
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/80'
                    : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                }`}
              >
                <button
                  onClick={() => onSelectProject(proj.id)}
                  className="flex items-center gap-2 truncate flex-1 text-left cursor-pointer"
                >
                  <span className={`w-2 h-2 rounded-full ${proj.color}`} />
                  <span className="truncate">{proj.name}</span>
                </button>

                <div className="flex items-center gap-1">
                  {/* Botón Borrar Proyecto */}
                  {projects.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(proj.id, proj.name);
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-rose-50 transition-all cursor-pointer"
                      title="Borrar proyecto y sus tareas"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}

                  {activeProjectId === proj.id && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Miembros del Equipo */}
        <div>
          <div className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Miembros ({teamMembers.length})
          </div>
          <div className="space-y-1">
            {teamMembers.map((member) => (
              <div
                key={member}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 bg-white/60 border border-slate-200/60 font-medium"
              >
                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                  {member[0]}
                </div>
                <span className="truncate">{member}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer: Asignador Activo */}
      <div className="p-3 border-t border-slate-200/80 bg-white">
        <div className="text-[10px] text-slate-400 font-semibold mb-1 uppercase tracking-wider">
          Asignando como:
        </div>
        <select
          value={activeAssignee}
          onChange={(e) => onSelectAssignee(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
        >
          {teamMembers.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
}
