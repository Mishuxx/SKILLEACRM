'use client';

import React from 'react';
import { ActivityLogItem } from '@/types/kanban';
import {
  History,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Trash2,
  PlusCircle,
  Clock,
} from 'lucide-react';

interface ActivityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ActivityLogItem[];
  onClearLogs?: () => void;
}

export default function ActivityDrawer({
  isOpen,
  onClose,
  logs,
  onClearLogs,
}: ActivityDrawerProps) {
  if (!isOpen) return null;

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: 'short',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-2xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Historial de Auditoría</h3>
                <p className="text-xs text-slate-500">Registro cronológico de movimientos y acciones</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Lista de Actividades */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {logs.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
                <Clock className="w-6 h-6 text-slate-300" />
                <span>No hay actividades registradas aún</span>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-3 hover:bg-white transition-all shadow-2xs"
                >
                  <div className="p-2 rounded-xl mt-0.5 flex-shrink-0 bg-white border border-slate-200 shadow-2xs">
                    {log.action === 'MOVED' && <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />}
                    {log.action === 'CREATED' && <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />}
                    {log.action === 'MEETING_INGESTED' && <Sparkles className="w-3.5 h-3.5 text-purple-600" />}
                    {log.action === 'DELETED' && <Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        {log.userName}
                      </span>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">
                        {formatTime(log.timestamp)}
                      </span>
                    </div>

                    {log.action === 'MOVED' && (
                      <p className="text-xs text-slate-600 leading-snug">
                        Movió <strong className="text-slate-800">"{log.taskTitle}"</strong> a{' '}
                        <span className="font-semibold text-indigo-600">
                          {log.toColumn}
                        </span>
                      </p>
                    )}

                    {log.action === 'CREATED' && (
                      <p className="text-xs text-slate-600 leading-snug">
                        Creó la tarea <strong className="text-slate-800">"{log.taskTitle}"</strong>
                      </p>
                    )}

                    {log.action === 'MEETING_INGESTED' && (
                      <p className="text-xs text-slate-600 leading-snug">
                        Procesó la reunión <strong className="text-slate-800">"{log.meetingTitle}"</strong> y generó nuevas tareas.
                      </p>
                    )}

                    {log.action === 'DELETED' && (
                      <p className="text-xs text-slate-600 leading-snug">
                        Eliminó la tarea <strong className="text-slate-800">"{log.taskTitle}"</strong>
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {logs.length > 0 && onClearLogs && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={onClearLogs}
                className="text-xs text-slate-500 hover:text-rose-600 transition-colors"
              >
                Limpiar historial
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
