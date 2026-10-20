'use client';

import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Column, Task } from '@/types/kanban';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onDeleteTask: (taskId: string) => void;
  onQuickAddTask: (columnId: string) => void;
}

export default function KanbanColumn({
  column,
  tasks,
  onDeleteTask,
  onQuickAddTask,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col w-80 flex-shrink-0 bg-slate-100/90 border border-slate-200/90 rounded-2xl p-4 shadow-xs">
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/70">
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${column.color || 'bg-indigo-500'}`} />
          <h3 className="font-semibold text-slate-700 text-sm tracking-wide">
            {column.title}
          </h3>
          <span className="text-xs bg-white text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-200 font-semibold shadow-xs">
            {tasks.length}
          </span>
        </div>

        <button
          onClick={() => onQuickAddTask(column.id)}
          className="text-slate-400 hover:text-slate-700 p-1 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 shadow-xs"
          title="Agregar tarea rápida"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto pr-1 min-h-[420px] rounded-xl transition-colors ${
              snapshot.isDraggingOver ? 'bg-indigo-50/60 ring-2 ring-indigo-300/50' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onDeleteTask={onDeleteTask}
              />
            ))}
            {provided.placeholder}

            {tasks.length === 0 && (
              <div className="h-36 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs gap-1.5 bg-white/50">
                <span className="font-medium">No hay tareas aquí</span>
                <span className="text-[11px] text-slate-400">Arrastra una tarjeta o crea una nueva</span>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
