import { Task } from '@/types/kanban';

export function exportTasksToCSV(tasks: Task[], projectName: string) {
  const headers = [
    'ID',
    'Titulo',
    'Descripcion',
    'Responsable',
    'Estado',
    'Prioridad',
    'Fecha Limite',
    'Reunion de Origen',
    'Etiquetas',
    'Subtareas Completadas',
    'Total Subtareas',
  ];

  const rows = tasks.map((t) => {
    const completedSubtasks = t.subtasks?.filter((s) => s.completed).length || 0;
    const totalSubtasks = t.subtasks?.length || 0;

    return [
      `"${t.id}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${t.assignee || 'Sin asignar'}"`,
      `"${t.columnId}"`,
      `"${t.priority}"`,
      `"${t.dueDate || ''}"`,
      `"${t.meetingReference || 'Manual'}"`,
      `"${(t.tags || []).join(', ')}"`,
      completedSubtasks,
      totalSubtasks,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `SkilleaCRM_${projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
