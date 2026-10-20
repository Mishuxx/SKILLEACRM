import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Si no hay DATABASE_URL configurada (modo local fallback)
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        hasDatabase: false,
        message: 'DATABASE_URL no configurada. Operando en modo local.',
      });
    }

    // Obtener o inicializar proyectos predeterminados si la base de datos está vacía
    let projects = await prisma.project.findMany({
      orderBy: { createdAt: 'asc' },
    });

    if (projects.length === 0) {
      const defaultProj = await prisma.project.create({
        data: {
          name: 'Skillea Core & Clientes',
          description: 'Gestión comercial, operativa y tecnológica de Skillea',
          color: 'bg-indigo-500',
        },
      });
      projects = [defaultProj];
    }

    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const activityLogs = await prisma.activityLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 80,
    });

    return NextResponse.json({
      hasDatabase: true,
      projects,
      tasks: tasks.map((t) => ({
        ...t,
        subtasks: Array.isArray(t.subtasks) ? t.subtasks : [],
      })),
      activityLogs,
    });
  } catch (error: any) {
    console.error('Error fetching data from database:', error);
    return NextResponse.json(
      { hasDatabase: false, error: error?.message || 'Error de base de datos' },
      { status: 200 }
    );
  }
}

export async function POST(req: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ success: false, message: 'DATABASE_URL no configurada' }, { status: 400 });
    }

    const body = await req.json();
    const { action, payload } = body;

    switch (action) {
      // 1. Guardar nueva tarea
      case 'CREATE_TASK': {
        const newTask = await prisma.task.create({
          data: {
            projectId: payload.projectId,
            title: payload.title,
            description: payload.description,
            assignee: payload.assignee,
            priority: payload.priority,
            dueDate: payload.dueDate || null,
            meetingReference: payload.meetingReference || null,
            tags: payload.tags || [],
            columnId: payload.columnId || 'backlog',
            subtasks: payload.subtasks || [],
          },
        });
        return NextResponse.json({ success: true, task: newTask });
      }

      // 2. Mover tarea de columna
      case 'MOVE_TASK': {
        const updated = await prisma.task.update({
          where: { id: payload.taskId },
          data: {
            columnId: payload.columnId,
            completedAt: payload.columnId === 'done' ? new Date() : null,
          },
        });
        return NextResponse.json({ success: true, task: updated });
      }

      // 3. Actualizar tarea completa
      case 'UPDATE_TASK': {
        const updated = await prisma.task.update({
          where: { id: payload.taskId },
          data: {
            title: payload.title,
            description: payload.description,
            assignee: payload.assignee,
            priority: payload.priority,
            dueDate: payload.dueDate || null,
            columnId: payload.columnId,
            tags: payload.tags || [],
            subtasks: payload.subtasks || [],
          },
        });
        return NextResponse.json({ success: true, task: updated });
      }

      // 4. Eliminar tarea
      case 'DELETE_TASK': {
        await prisma.task.delete({
          where: { id: payload.taskId },
        });
        return NextResponse.json({ success: true });
      }

      // 5. Ingestar tareas desde reunión con IA
      case 'INGEST_MEETING_TASKS': {
        const createdTasks = await prisma.$transaction(
          payload.tasks.map((t: any) =>
            prisma.task.create({
              data: {
                projectId: payload.projectId,
                title: t.title,
                description: t.description,
                assignee: t.assignee,
                priority: t.priority,
                dueDate: t.dueDate || null,
                meetingReference: payload.meetingTitle,
                tags: t.tags || [],
                columnId: 'backlog',
                subtasks: (t.subtasks || []).map((sub: string, i: number) => ({
                  id: `sub-${Date.now()}-${i}`,
                  title: sub,
                  completed: false,
                })),
              },
            })
          )
        );
        return NextResponse.json({ success: true, tasks: createdTasks });
      }

      // 6. Crear proyecto
      case 'CREATE_PROJECT': {
        const newProj = await prisma.project.create({
          data: {
            name: payload.name,
            color: payload.color || 'bg-indigo-500',
            description: payload.description || '',
          },
        });
        return NextResponse.json({ success: true, project: newProj });
      }

      // 7. Eliminar proyecto
      case 'DELETE_PROJECT': {
        await prisma.project.delete({
          where: { id: payload.projectId },
        });
        return NextResponse.json({ success: true });
      }

      // 8. Registrar log de actividad
      case 'ADD_LOG': {
        const log = await prisma.activityLog.create({
          data: {
            userName: payload.userName,
            projectId: payload.projectId || null,
            projectName: payload.projectName || null,
            action: payload.action,
            taskTitle: payload.taskTitle || null,
            fromColumn: payload.fromColumn || null,
            toColumn: payload.toColumn || null,
            meetingTitle: payload.meetingTitle || null,
          },
        });
        return NextResponse.json({ success: true, log });
      }

      default:
        return NextResponse.json({ error: 'Acción desconocida' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('API /api/sync error:', error);
    return NextResponse.json(
      { error: error?.message || 'Error procesando la solicitud en la base de datos' },
      { status: 500 }
    );
  }
}
