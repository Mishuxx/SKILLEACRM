import { NextResponse } from 'next/server';

interface AnalyzeRequest {
  notes: string;
  meetingTitle?: string;
  apiKey?: string;
}

const ALLOWED_MEMBERS = ['Daniela Medina', 'Gustavo Mujica', 'Ricardo Pulgar'];

export async function POST(req: Request) {
  try {
    const body: AnalyzeRequest = await req.json();
    const { notes, meetingTitle = 'Reunión sin título', apiKey } = body;

    if (!notes || notes.trim().length === 0) {
      return NextResponse.json({ error: 'Las notas de la reunión no pueden estar vacías' }, { status: 400 });
    }

    const keyToUse = apiKey?.trim() || process.env.GEMINI_API_KEY;

    if (!keyToUse) {
      return NextResponse.json(
        { 
          error: 'No se encontró una Google Gemini API Key. Ingresa una API Key gratuita en la configuración o agrégala al archivo .env.local.' 
        }, 
        { status: 401 }
      );
    }

    const promptText = `
Eres un asistente experto en gestión ágil de proyectos y análisis de reuniones para SkilleaCRM.
Los únicos 3 miembros del equipo a quienes se les pueden asignar tareas son:
1. "Daniela Medina" (o "Daniela")
2. "Gustavo Mujica" (o "Gustavo")
3. "Ricardo Pulgar" (o "Ricardo")

Analiza la siguiente transcripción o minuta y extrae TODAS las tareas accionables (Action Items), acuerdos y compromisos o investigaciones mencionadas.

Reglas de salida:
- "title": Breve y comenzando con un verbo en infinitivo (ej: "Investigar disponibilidad de la aplicación para Android").
- "description": Contexto relevante de lo conversado en la reunión.
- "assignee": DEBE ser exactamente uno de: "Daniela Medina", "Gustavo Mujica", o "Ricardo Pulgar". Si se menciona a alguien más o no es claro, asígnalo a "Ricardo Pulgar" por defecto.
- "priority": "low" | "medium" | "high" | "urgent".
- "dueDate": Fecha en YYYY-MM-DD o null si no se mencionó.
- "tags": Lista de 1 a 3 tags breves.

Devuelve ÚNICAMENTE un array JSON válido, sin bloques de código ni texto adicional:
[
  {
    "title": "...",
    "description": "...",
    "assignee": "Daniela Medina" | "Gustavo Mujica" | "Ricardo Pulgar",
    "priority": "low" | "medium" | "high" | "urgent",
    "dueDate": null,
    "tags": ["..."]
  }
]

Contexto de la reunión: ${meetingTitle}
Notas:
"""
${notes}
"""
`;

    const modelsToTry = [
      'gemini-3.8-flash',
      'gemini-2.0-flash',
      'gemini-2.5-flash-preview',
      'gemini-1.5-flash',
    ];

    let responseData = '';
    let lastError = '';
    let usedModel = '';

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${keyToUse}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json',
            },
          }),
        });

        const data = await res.json();
        if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          responseData = data.candidates[0].content.parts[0].text;
          usedModel = model;
          break;
        } else {
          lastError = data.error?.message || JSON.stringify(data);
          console.warn(`Falló modelo ${model}:`, lastError);
        }
      } catch (err: any) {
        lastError = err?.message || String(err);
      }
    }

    if (!responseData) {
      return NextResponse.json(
        { error: `Error en la API de Gemini: ${lastError}` },
        { status: 500 }
      );
    }

    // Parse JSON
    let tasks: any[] = [];
    try {
      let jsonString = responseData.trim();
      const firstBracket = jsonString.indexOf('[');
      const lastBracket = jsonString.lastIndexOf(']');

      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        jsonString = jsonString.substring(firstBracket, lastBracket + 1);
      }

      tasks = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Error parseando JSON de Gemini:', responseData, parseError);
      return NextResponse.json(
        { error: 'La respuesta de la IA contiene texto adicional y no pudo parsearse.' },
        { status: 500 }
      );
    }

    // Normalizar responsables a los 3 exactos
    const normalizeAssignee = (raw: string) => {
      const lower = (raw || '').toLowerCase();
      if (lower.includes('daniela')) return 'Daniela Medina';
      if (lower.includes('gustavo')) return 'Gustavo Mujica';
      if (lower.includes('ricardo')) return 'Ricardo Pulgar';
      return 'Ricardo Pulgar';
    };

    return NextResponse.json({
      success: true,
      meetingTitle,
      modelUsed: usedModel,
      extractedCount: tasks.length,
      tasks: tasks.map((t: any, index: number) => ({
        id: `extracted-${Date.now()}-${index}`,
        title: t.title || 'Tarea sin título',
        description: t.description || '',
        assignee: normalizeAssignee(t.assignee),
        priority: ['low', 'medium', 'high', 'urgent'].includes(t.priority?.toLowerCase()) ? t.priority.toLowerCase() : 'medium',
        dueDate: t.dueDate || '',
        tags: Array.isArray(t.tags) ? t.tags : [],
        selected: true,
      })),
    });

  } catch (error: any) {
    console.error('API /api/analyze-notes general error:', error);
    return NextResponse.json(
      { error: error?.message || 'Error inesperado procesando las notas' },
      { status: 500 }
    );
  }
}
