'use client';

import React, { useState, useRef } from 'react';
import {
  Sparkles,
  AlertCircle,
  CheckCircle,
  Tag,
  User,
  Clock,
  Loader2,
  Upload,
  FileText,
  Key,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ExtractedTaskCandidate } from '@/types/kanban';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTasks: (tasks: ExtractedTaskCandidate[], meetingTitle: string) => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

const SAMPLE_NOTES = `Reunión de Sincronización SkilleaCRM - 20 de Octubre

Asistentes: Ricardo Pulgar Mendoza, Maxym Gryn.

Puntos tratados:
1. Ricardo comentó que estuvo investigando la aplicación del cliente y notó que de momento solo existe versión para iOS. Mencionó que no encontró nada de Android en las tiendas.
2. Maxym preguntó detalles al respecto y quedó en investigar por su cuenta la disponibilidad técnica y el roadmap para Android antes del viernes.
3. Ricardo se comprometió a mantener informado al equipo con cualquier actualización sobre la cuenta y preparar la propuesta de seguimiento para el lunes.`;

export default function MeetingModal({
  isOpen,
  onClose,
  onAddTasks,
  apiKey,
  onSaveApiKey,
}: MeetingModalProps) {
  const [meetingTitle, setMeetingTitle] = useState('Entrevista / Reunión');
  const [notes, setNotes] = useState('');
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [showApiKeyConfig, setShowApiKeyConfig] = useState(!apiKey);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTaskCandidate[]>([]);
  const [step, setStep] = useState<'input' | 'review'>('input');
  const [fileName, setFileName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Manejo de carga de archivos (.txt, .md, transcripciones)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    if (!meetingTitle || meetingTitle === 'Entrevista / Reunión') {
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      setMeetingTitle(cleanName);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setNotes(content);
      }
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    if (!notes.trim()) {
      setErrorMessage('Por favor ingresa notas o sube un archivo con la transcripción.');
      return;
    }

    const keyToUse = localApiKey.trim() || apiKey.trim();
    if (keyToUse) {
      onSaveApiKey(keyToUse);
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/analyze-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes,
          meetingTitle,
          apiKey: keyToUse,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ocurrió un error al procesar las notas.');
      }

      setExtractedTasks(data.tasks || []);
      setStep('review');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al conectar con el servicio de IA.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskSelection = (id: string) => {
    setExtractedTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, selected: !t.selected } : t))
    );
  };

  const updateTaskField = (id: string, field: keyof ExtractedTaskCandidate, value: any) => {
    setExtractedTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const handleConfirmAndAdd = () => {
    const selected = extractedTasks.filter((t) => t.selected);
    onAddTasks(selected, meetingTitle);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setNotes('');
    setFileName(null);
    setExtractedTasks([]);
    setStep('input');
    setErrorMessage('');
  };

  const loadSampleNotes = () => {
    setNotes(SAMPLE_NOTES);
    setMeetingTitle('Entrevista Técnica Skillea');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 text-slate-800 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-2xl border border-indigo-200/60 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {step === 'input'
                  ? 'Cargar Entrevista / Notas con IA'
                  : 'Revisar Tareas Detectadas'}
              </h2>
              <p className="text-xs text-slate-500">
                {step === 'input'
                  ? 'Pega la transcripción o sube un archivo de texto para generar tus tarjetas.'
                  : `Se identificaron ${extractedTasks.length} compromisos. Edita o desmarca lo que desees.`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors p-2 text-sm rounded-xl hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {errorMessage && (
            <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs leading-relaxed">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          {step === 'input' ? (
            <>
              {/* Título de la reunión */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Nombre o Asunto de la Entrevista / Reunión
                </label>
                <input
                  type="text"
                  placeholder="Ej: Entrevista Cliente X, Sincronización Semanal..."
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Botón de subida de archivo y área de texto */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Transcripción, Minuta o Archivo de Notas
                  </label>
                  <button
                    type="button"
                    onClick={loadSampleNotes}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    Cargar texto de ejemplo
                  </button>
                </div>

                {/* Subir archivo de notas */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".txt,.md,.vtt,.srt,.doc,.docx"
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 bg-slate-50/50 group"
                >
                  <div className="p-2 rounded-xl bg-white text-indigo-600 shadow-xs border border-slate-200 group-hover:scale-105 transition-transform">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-medium text-slate-700">
                    {fileName ? (
                      <span className="text-indigo-600 font-semibold flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 inline" /> Archivo cargado: {fileName}
                      </span>
                    ) : (
                      <>
                        <span className="text-indigo-600 font-semibold">Haz clic para subir archivo</span> o arrástralo aquí (.txt, .md)
                      </>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    O pega el texto copiado de Zoom / Google Meet en el cuadro inferior
                  </span>
                </div>

                {/* Textarea */}
                <textarea
                  rows={7}
                  placeholder="Pega aquí las notas, apuntes de la entrevista o la transcripción completa..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none font-sans leading-relaxed"
                />
              </div>

              {/* Acordeón opcional de API Key (Solo si no está configurada o se desea cambiar) */}
              <div className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setShowApiKeyConfig(!showApiKeyConfig)}
                  className="w-full flex items-center justify-between text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  <span className="flex items-center gap-2">
                    <Key className="w-3.5 h-3.5 text-indigo-500" />
                    {localApiKey ? 'API Key guardada ✓' : 'Configurar Google Gemini API Key (Opcional si usas .env)'}
                  </span>
                  {showApiKeyConfig ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {showApiKeyConfig && (
                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        Se guarda en tu navegador y no te la volverá a pedir:
                      </span>
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-indigo-600 hover:underline"
                      >
                        Crear clave gratis ↗
                      </a>
                    </div>
                    <input
                      type="password"
                      placeholder="AIzaSy..."
                      value={localApiKey}
                      onChange={(e) => setLocalApiKey(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Paso 2: Revisión de Tareas */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-medium text-slate-500">
                  Selecciona y personaliza las tareas que entrarán a SkilleaCRM:
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setExtractedTasks((prev) =>
                      prev.map((t) => ({ ...t, selected: !prev.every((x) => x.selected) }))
                    )
                  }
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  {extractedTasks.every((x) => x.selected) ? 'Deseleccionar todas' : 'Seleccionar todas'}
                </button>
              </div>

              <div className="space-y-3">
                {extractedTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      task.selected
                        ? 'bg-white border-indigo-200 shadow-xs ring-1 ring-indigo-500/10'
                        : 'bg-slate-50/60 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={task.selected}
                        onChange={() => toggleTaskSelection(task.id)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />

                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={task.title}
                          onChange={(e) => updateTaskField(task.id, 'title', e.target.value)}
                          className="w-full bg-transparent font-semibold text-slate-900 text-sm focus:bg-slate-50 px-2 py-1 rounded-lg border border-transparent focus:border-slate-300 focus:outline-none"
                        />

                        <textarea
                          rows={2}
                          value={task.description}
                          onChange={(e) => updateTaskField(task.id, 'description', e.target.value)}
                          className="w-full bg-slate-50 text-xs text-slate-600 px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-300 resize-none leading-relaxed"
                        />

                        {/* Metadatos */}
                        <div className="flex flex-wrap items-center gap-2.5 text-xs pt-1">
                          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <input
                              type="text"
                              value={task.assignee}
                              placeholder="Responsable"
                              onChange={(e) => updateTaskField(task.id, 'assignee', e.target.value)}
                              className="bg-transparent border-none text-xs text-slate-800 font-medium focus:outline-none w-24"
                            />
                          </div>

                          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <input
                              type="date"
                              value={task.dueDate || ''}
                              onChange={(e) => updateTaskField(task.id, 'dueDate', e.target.value)}
                              className="bg-transparent border-none text-xs text-slate-700 focus:outline-none"
                            />
                          </div>

                          <select
                            value={task.priority}
                            onChange={(e) => updateTaskField(task.id, 'priority', e.target.value)}
                            className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
                          >
                            <option value="low">Prioridad Baja</option>
                            <option value="medium">Prioridad Media</option>
                            <option value="high">Prioridad Alta</option>
                            <option value="urgent">Prioridad Urgente</option>
                          </select>

                          {task.tags?.length > 0 && (
                            <div className="flex items-center gap-1 text-slate-500">
                              <Tag className="w-3 h-3 text-slate-400" />
                              <span className="text-[11px] font-medium">{task.tags.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/70">
          {step === 'review' ? (
            <>
              <button
                type="button"
                onClick={() => setStep('input')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                ← Volver a notas
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAndAdd}
                  disabled={extractedTasks.filter((t) => t.selected).length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  Agregar ({extractedTasks.filter((t) => t.selected).length}) a SkilleaCRM
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando con IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analizar Entrevista
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
