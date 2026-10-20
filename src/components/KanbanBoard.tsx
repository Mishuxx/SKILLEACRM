'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import {
  Task,
  Column,
  Project,
  ActivityLogItem,
  ExtractedTaskCandidate,
} from '@/types/kanban';
import Sidebar from '@/components/Sidebar';
import KanbanColumn from '@/components/KanbanColumn';
import TaskListView from '@/components/TaskListView';
import TeamView from '@/components/TeamView';
import HistoryView from '@/components/HistoryView';
import MetricsPanel from '@/components/MetricsPanel';
import MeetingModal from '@/components/MeetingModal';
import {
  Search,
  Filter,
  FileUp,
  LayoutDashboard,
  CheckSquare,
  Users,
  History,
} from 'lucide-react';

const TEAM_MEMBERS = [
  'Daniela Medina',
  'Gustavo Mujica',
  'Ricardo Pulgar',
];

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Skillea Core & Clientes',
    description: 'Gestión comercial, operativa y tecnológica de Skillea',
    color: 'bg-indigo-500',
  },
  {
    id: 'proj-2',
    name: 'Entrevistas de Diagnóstico',
    description: 'Minutas de reuniones con clientes y acuerdos clave',
    color: 'bg-emerald-500',
  },
];

const DEFAULT_COLUMNS: Column[] = [
  { id: 'backlog', title: 'Backlog / Por Hacer', color: 'bg-slate-400' },
  { id: 'in_progress', title: 'En Progreso', color: 'bg-amber-500' },
  { id: 'in_review', title: 'En Revisión / QA', color: 'bg-sky-500' },
  { id: 'done', title: 'Completado', color: 'bg-emerald-500' },
];

const DEFAULT_TASKS: Task[] = [
  {
    id: 'task-1',
    projectId: 'proj-1',
    title: 'Investigar requerimientos técnicos para la app en Android',
    description: 'Verificar compatibilidad y alternativas tras reunión inicial.',
    assignee: 'Gustavo Mujica',
    priority: 'high',
    dueDate: '2026-10-24',
    columnId: 'in_progress',
    tags: ['Tech', 'Android'],
    meetingReference: 'Entrevista Skillea',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    projectId: 'proj-1',
    title: 'Coordinar seguimiento comercial y propuesta formal',
    description: 'Preparar términos del servicio y enviar cotización revisada.',
    assignee: 'Daniela Medina',
    priority: 'medium',
    dueDate: '2026-10-26',
    columnId: 'backlog',
    tags: ['Comercial', 'Seguimiento'],
    meetingReference: 'Entrevista Skillea',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    projectId: 'proj-1',
    title: 'Alinear prioridades del sprint con el equipo',
    description: 'Revisión general de avances de la semana.',
    assignee: 'Ricardo Pulgar',
    priority: 'urgent',
    dueDate: '2026-10-22',
    columnId: 'done',
    tags: ['Liderazgo'],
    meetingReference: 'Sincronización',
    createdAt: new Date().toISOString(),
  },
];

const STORAGE_KEY = 'skillea_crm_v5_simple_users';
const API_KEY_STORAGE = 'skillea_gemini_api_key_v2';

export default function KanbanBoard() {
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string>(DEFAULT_PROJECTS[0].id);
  const [activeTab, setActiveTab] = useState<'kanban' | 'list' | 'team' | 'history'>('kanban');

  const [columns] = useState<Column[]>(DEFAULT_COLUMNS);
  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS);
  const [activeAssignee, setActiveAssignee] = useState<string>(TEAM_MEMBERS[2]); // Ricardo Pulgar por defecto

  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([
    {
      id: 'log-1',
      userId: '1',
      userName: 'Ricardo Pulgar',
      projectName: 'Skillea Core & Clientes',
      action: 'MEETING_INGESTED',
      meetingTitle: 'Entrevista Skillea',
      timestamp: '2026-10-20T01:30:00.000Z',
    },
  ]);

  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssigneeFilter, setSelectedAssigneeFilter] = useState<string>('all');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.projects) setProjects(parsed.projects);
        if (parsed.activityLogs) setActivityLogs(parsed.activityLogs);
        if (parsed.activeProjectId) setActiveProjectId(parsed.activeProjectId);
        if (parsed.activeAssignee) setActiveAssignee(parsed.activeAssignee);
      }
      const savedKey = localStorage.getItem(API_KEY_STORAGE);
      if (savedKey) setApiKey(savedKey);
    } catch (e) {
      console.error('Error restaurando estado:', e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          tasks,
          projects,
          activityLogs,
          activeProjectId,
          activeAssignee,
        })
      );
    }
  }, [tasks, projects, activityLogs, activeProjectId, activeAssignee, isLoaded]);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem(API_KEY_STORAGE, key);
  };

  const addLog = (
    action: ActivityLogItem['action'],
    params: {
      taskTitle?: string;
      fromColumn?: string;
      toColumn?: string;
      meetingTitle?: string;
    }
  ) => {
    const currentProj = projects.find((p) => p.id === activeProjectId);
    const newLog: ActivityLogItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: 'simple-id',
      userName: activeAssignee,
      projectId: activeProjectId,
      projectName: currentProj?.name,
      action,
      ...params,
      timestamp: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const handleAddProject = () => {
    const name = prompt('Nombre del nuevo proyecto / cliente:');
    if (!name || !name.trim()) return;

    const colors = ['bg-indigo-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: name.trim(),
      color: colors[projects.length % colors.length],
    };

    setProjects((prev) => [...prev, newProj]);
    setActiveProjectId(newProj.id);
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const movedTask = tasks.find((t) => t.id === draggableId);
    if (!movedTask) return;

    const sourceCol = columns.find((c) => c.id === source.droppableId)?.title || source.droppableId;
    const destCol = columns.find((c) => c.id === destination.droppableId)?.title || destination.droppableId;

    setTasks((prev) => {
      const updated = Array.from(prev);
      const idx = updated.findIndex((t) => t.id === draggableId);
      const target = {
        ...updated[idx],
        columnId: destination.droppableId,
        completedAt: destination.droppableId === 'done' ? new Date().toISOString() : undefined,
      };

      updated.splice(idx, 1);
      const targetList = updated.filter((t) => t.columnId === destination.droppableId);
      const otherList = updated.filter((t) => t.columnId !== destination.droppableId);

      targetList.splice(destination.index, 0, target);
      return [...otherList, ...targetList];
    });

    addLog('MOVED', {
      taskTitle: movedTask.title,
      fromColumn: sourceCol,
      toColumn: destCol,
    });
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (taskToDelete) {
      addLog('DELETED', { taskTitle: taskToDelete.title });
    }
  };

  const handleUpdateTaskColumn = (taskId: string, newColId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const sourceCol = columns.find((c) => c.id === task.columnId)?.title;
    const destCol = columns.find((c) => c.id === newColId)?.title;

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, columnId: newColId } : t))
    );

    addLog('MOVED', {
      taskTitle: task.title,
      fromColumn: sourceCol,
      toColumn: destCol,
    });
  };

  const handleUpdateTaskAssignee = (taskId: string, newAssignee: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, assignee: newAssignee } : t))
    );
  };

  const handleQuickAddTask = (columnId: string) => {
    const title = prompt('Título de la tarea:');
    if (!title || !title.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      projectId: activeProjectId,
      title: title.trim(),
      columnId,
      priority: 'medium',
      assignee: activeAssignee,
      createdAt: new Date().toISOString(),
      tags: ['Manual'],
    };

    setTasks((prev) => [newTask, ...prev]);
    addLog('CREATED', { taskTitle: newTask.title });
  };

  const handleAddTasksFromMeeting = (
    candidates: ExtractedTaskCandidate[],
    meetingTitle: string
  ) => {
    const newTasks: Task[] = candidates.map((c) => ({
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      projectId: activeProjectId,
      title: c.title,
      description: c.description,
      assignee: c.assignee, // Ya normalizado a Daniela, Gustavo o Ricardo
      priority: c.priority,
      dueDate: c.dueDate,
      tags: c.tags,
      meetingReference: meetingTitle,
      columnId: 'backlog',
      createdAt: new Date().toISOString(),
    }));

    setTasks((prev) => [...newTasks, ...prev]);
    addLog('MEETING_INGESTED', { meetingTitle });
  };

  const currentProject = projects.find((p) => p.id === activeProjectId) || projects[0];
  const projectTasks = tasks.filter((t) => t.projectId === activeProjectId);

  const filteredTasks = projectTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.assignee && task.assignee.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesAssignee =
      selectedAssigneeFilter === 'all' || task.assignee === selectedAssigneeFilter;

    return matchesSearch && matchesAssignee;
  });

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-500 font-medium text-xs">
        Cargando SkilleaCRM...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* Sidebar Notion-like */}
      <Sidebar
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={setActiveProjectId}
        onAddProject={handleAddProject}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        teamMembers={TEAM_MEMBERS}
        activeAssignee={activeAssignee}
        onSelectAssignee={setActiveAssignee}
        onOpenMeetingModal={() => setIsMeetingModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="border-b border-slate-200/80 bg-white px-8 pt-5 pb-3 flex-shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto w-full">
            {/* Título de Proyecto */}
            <div className="flex items-center gap-3">
              <span className={`w-3.5 h-3.5 rounded-lg ${currentProject.color} shadow-2xs`} />
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
                  {currentProject.name}
                </h1>
                <p className="text-xs text-slate-400">
                  {currentProject.description || 'Proyecto activo en SkilleaCRM'}
                </p>
              </div>
            </div>

            {/* Acción Principal */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMeetingModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <FileUp className="w-3.5 h-3.5" />
                Cargar Notas / Entrevista
              </button>
            </div>
          </div>

          {/* Barra de Pestañas (Tabs) */}
          <div className="mt-5 border-t border-slate-100 pt-2 flex items-center justify-between max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'kanban'
                    ? 'bg-slate-100 text-indigo-700 border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Tablero Kanban
              </button>

              <button
                onClick={() => setActiveTab('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'list'
                    ? 'bg-slate-100 text-indigo-700 border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Lista
              </button>

              <button
                onClick={() => setActiveTab('team')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'team'
                    ? 'bg-slate-100 text-indigo-700 border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Equipo (3)
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-slate-100 text-indigo-700 border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                Historial ({activityLogs.length})
              </button>
            </div>

            {/* Búsqueda y Filtro Rápido por Asignado */}
            {(activeTab === 'kanban' || activeTab === 'list') && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar tarea..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-xs text-slate-600">
                  <Filter className="w-3 h-3 text-slate-400" />
                  <select
                    value={selectedAssigneeFilter}
                    onChange={(e) => setSelectedAssigneeFilter(e.target.value)}
                    className="bg-transparent text-slate-700 font-medium focus:outline-none text-xs cursor-pointer"
                  >
                    <option value="all">Todos los asignados</option>
                    {TEAM_MEMBERS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Scroll Content */}
        <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full">
          {/* Métricas (Hecho vs Por hacer) */}
          {(activeTab === 'kanban' || activeTab === 'list') && (
            <MetricsPanel
              tasks={projectTasks}
              columns={columns}
              teamMembers={TEAM_MEMBERS}
            />
          )}

          {/* Kanban */}
          {activeTab === 'kanban' && (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex items-start gap-6 min-w-max pb-8 overflow-x-auto">
                {columns.map((column) => {
                  const columnTasks = filteredTasks.filter((t) => t.columnId === column.id);
                  return (
                    <KanbanColumn
                      key={column.id}
                      column={column}
                      tasks={columnTasks}
                      onDeleteTask={handleDeleteTask}
                      onQuickAddTask={handleQuickAddTask}
                    />
                  );
                })}
              </div>
            </DragDropContext>
          )}

          {/* Lista */}
          {activeTab === 'list' && (
            <TaskListView
              tasks={filteredTasks}
              columns={columns}
              teamMembers={TEAM_MEMBERS}
              onDeleteTask={handleDeleteTask}
              onUpdateTaskColumn={handleUpdateTaskColumn}
              onUpdateTaskAssignee={handleUpdateTaskAssignee}
            />
          )}

          {/* Equipo */}
          {activeTab === 'team' && (
            <TeamView teamMembers={TEAM_MEMBERS} tasks={tasks} />
          )}

          {/* Historial */}
          {activeTab === 'history' && (
            <HistoryView
              logs={activityLogs}
              onClearLogs={() => setActivityLogs([])}
            />
          )}
        </div>
      </div>

      {/* Modal para procesar notas y entrevistas */}
      <MeetingModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        onAddTasks={handleAddTasksFromMeeting}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />
    </div>
  );
}
