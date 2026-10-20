'use client';

import React from 'react';
import { ActivityLogItem } from '@/types/kanban';
import { History, ArrowRight, PlusCircle, Sparkles, Trash2, Clock, Calendar } from 'lucide-react';

interface HistoryViewProps {
  logs: ActivityLogItem[];
  onClearLogs?: () => void;
}

export default function HistoryView({ logs, onClearLogs }: HistoryViewProps) {
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Historial de Auditoría de SkilleaCRM</h2>
            <p className="text-xs text-slate-500">
              Registro inmutable de todas las tareas creadas, movidas y minutas analizadas.
            </p>
          </div>
        </div>

        {logs.length > 0 && onClearLogs && (
          <button
            onClick={onClearLogs}
            className="text-xs text-slate-400 hover:text-rose-600 font-medium transition-colors"
          >
            Limpiar historial
          </button>
        )}
      </div>

      <div className="space-y-3">
        {logs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <Clock className="w-8 h-8 text-slate-300" />
            <span>Aún no hay actividades registradas en el historial.</span>
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="p-4 bg-slate-50/80 border border-slate-200/70 rounded-xl flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs flex-shrink-0">
                  {log.action === 'MOVED' && <ArrowRight className="w-4 h-4 text-indigo-600" />}
                  {log.action === 'CREATED' && <PlusCircle className="w-4 h-4 text-emerald-600" />}
                  {log.action === 'MEETING_INGESTED' && <Sparkles className="w-4 h-4 text-purple-600" />}
                  {log.action === 'DELETED' && <Trash2 className="w-4 h-4 text-rose-500" />}
                </div>

                <div className="min-w-0">
                  <div className="text-xs text-slate-700">
                    <strong className="text-slate-900 font-bold">{log.userName}</strong>
                    {log.projectName && (
                      <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md ml-2 font-medium">
                        {log.projectName}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                    {log.action === 'MOVED' && (
                      <>
                        Movió <strong className="text-slate-900">"{log.taskTitle}"</strong> a{' '}
                        <span className="text-indigo-600 font-semibold">{log.toColumn}</span>
                      </>
                    )}
                    {log.action === 'CREATED' && (
                      <>
                        Creó la tarea <strong className="text-slate-900">"{log.taskTitle}"</strong>
                      </>
                    )}
                    {log.action === 'MEETING_INGESTED' && (
                      <>
                        Analizó la reunión <strong className="text-slate-900">"{log.meetingTitle}"</strong> con IA.
                      </>
                    )}
                    {log.action === 'DELETED' && (
                      <>
                        Eliminó la tarea <strong className="text-slate-900">"{log.taskTitle}"</strong>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 font-medium flex-shrink-0 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-300" />
                {formatTime(log.timestamp)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
