import { supabase } from '@/lib/supabase';

export type Exercise = {
  id: string;
  name: string;
  category: string | null;
  description: string;
  techniqueNotes: string | null;
};

export type HomeworkAssignment = {
  id: string;
  dogId: string;
  title: string;
  notes: string | null;
  status: 'assigned' | 'completed';
  isMilestone: boolean;
  dueDate: string | null;
  aiSummary: string | null;
  assignedAt: string;
  completedAt: string | null;
  exercise: Exercise | null;
};

function mapExercise(row: any): Exercise {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description,
    techniqueNotes: row.technique_notes,
  };
}

function mapHomework(row: any): HomeworkAssignment {
  return {
    id: row.id,
    dogId: row.dog_id,
    title: row.title,
    notes: row.notes,
    status: row.status,
    isMilestone: row.is_milestone,
    dueDate: row.due_date,
    aiSummary: row.ai_summary,
    assignedAt: row.assigned_at,
    completedAt: row.completed_at,
    exercise: row.exercise ? mapExercise(row.exercise) : null,
  };
}

export async function fetchHomework(dogId: string): Promise<HomeworkAssignment[]> {
  const { data, error } = await supabase
    .from('homework_assignments')
    .select('*, exercise:exercises(*)')
    .eq('dog_id', dogId)
    .order('assigned_at', { ascending: false });

  if (error || !data) return [];
  return data.map(mapHomework);
}

export async function fetchHomeworkItem(id: string): Promise<HomeworkAssignment | null> {
  const { data } = await supabase
    .from('homework_assignments')
    .select('*, exercise:exercises(*)')
    .eq('id', id)
    .maybeSingle();

  return data ? mapHomework(data) : null;
}

export async function markHomeworkComplete(id: string): Promise<void> {
  const { error } = await supabase
    .from('homework_assignments')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
}
