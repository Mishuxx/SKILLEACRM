import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Inicializador de tablas automático si aún no existen en la base de datos
async function ensureTablesExist() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Project" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "color" TEXT NOT NULL DEFAULT 'bg-indigo-500',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "Task" (
        "id" TEXT PRIMARY KEY,
        "projectId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "assignee" TEXT NOT NULL DEFAULT 'Ricardo Pulgar',
        "priority" TEXT NOT NULL DEFAULT 'medium',
        "dueDate" TEXT,
        "meetingReference" TEXT,
        "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
        "columnId" TEXT NOT NULL DEFAULT 'backlog',
        "subtasks" JSONB NOT NULL DEFAULT '[]'::jsonb,
        "completedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "ActivityLog" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL DEFAULT '1',
        "userName" TEXT NOT NULL,
        "projectId" TEXT,
        "projectName" TEXT,
        "action" TEXT NOT NULL,
        "taskTitle" TEXT,
        "fromColumn" TEXT,
        "toColumn" TEXT,
        "meetingTitle" TEXT,
        "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (schemaErr) {
    console.warn('Tablas ya existentes o error inicializando DDL:', schemaErr);
  }
}

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        hasDatabase: false,
        message: 'DATABASE_URL no configurada. Operando en modo local.',
      });
    }

    // Asegurar estructura
    await ensureTablesExist();

    // Obtener proyectos
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

    await ensureTablesExist();

    const body = await req.json();
    const { action, payload } = body;

    switch (action) {
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

      case 'DELETE_TASK': {
        await prisma.task.delete({
          where: { id: payload.taskId },
        });
        return NextResponse.json({ success: true });
      }

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

      case 'DELETE_PROJECT': {
        await prisma.project.delete({
          where: { id: payload.projectId },
        });
        return NextResponse.json({ success: true });
      }

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
