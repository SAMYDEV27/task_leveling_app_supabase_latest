import { supabase } from './supabase';
import { User, Project, Task, LevelProgress } from './types';

// Fonctions d'authentification
export async function signUp(username: string, email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  // Créer le profil utilisateur dans la table users
  if (data.user) {
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: data.user.id,
          username,
          email,
          total_experience: 0,
          level: 1,
        },
      ]);

    if (profileError) {
      throw profileError;
    }
  }

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  // Récupérer les informations du profil
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    throw error;
  }

  return data as User;
}

// Fonctions pour les projets
export async function getProjects(userId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data as Project[];
}

export async function createProject(name: string, description: string, userId: string) {
  const { data, error } = await supabase
    .from('projects')
    .insert([
      {
        name,
        description,
        user_id: userId,
      },
    ])
    .select();

  if (error) {
    throw error;
  }

  return data[0] as Project;
}

export async function updateProject(id: string, updates: Partial<Project>) {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    throw error;
  }

  return data[0] as Project;
}

export async function deleteProject(id: string) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}

// Fonctions pour les tâches
export async function getTasks(userId: string, projectId?: string) {
  let query = supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId);

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data as Task[];
}

export async function createTask(
  title: string,
  description: string,
  projectId: string,
  userId: string,
  experiencePoints: number = 10,
  priority: number = 1,
  dueDate?: string
) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([
      {
        title,
        description,
        project_id: projectId,
        user_id: userId,
        experience_points: experiencePoints,
        priority,
        due_date: dueDate,
        status: 'à faire',
      },
    ])
    .select();

  if (error) {
    throw error;
  }

  return data[0] as Task;
}

export async function updateTask(id: string, updates: Partial<Task>) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    throw error;
  }

  return data[0] as Task;
}

export async function completeTask(id: string, userId: string) {
  // 1. Marquer la tâche comme terminée
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .update({
      status: 'terminée',
      completed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (taskError) {
    throw taskError;
  }

  // 2. Mettre à jour l'expérience de l'utilisateur
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('total_experience, level')
    .eq('id', userId)
    .single();

  if (userError) {
    throw userError;
  }

  const newExperience = (user.total_experience || 0) + (task.experience_points || 10);
  
  // Calculer le nouveau niveau (formule simplifiée)
  const newLevel = Math.floor(Math.sqrt(newExperience / 100)) + 1;
  const levelUp = newLevel > user.level;

  // 3. Mettre à jour le niveau de l'utilisateur
  const { error: updateError } = await supabase
    .from('users')
    .update({
      total_experience: newExperience,
      level: newLevel,
    })
    .eq('id', userId);

  if (updateError) {
    throw updateError;
  }

  return {
    task: task as Task,
    levelUp,
    newLevel,
    experienceGained: task.experience_points,
  };
}

export async function deleteTask(id: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}

// Fonctions pour le système de progression
export async function getLevelProgress(userId: string): Promise<LevelProgress> {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw error;
  }

  const currentLevel = user.level;
  const totalExp = user.total_experience;
  
  // Calculer l'expérience nécessaire pour le niveau actuel et le suivant
  const currentLevelExp = Math.pow(currentLevel - 1, 2) * 100;
  const nextLevelExp = Math.pow(currentLevel, 2) * 100;
  
  // Calculer le pourcentage de progression
  const expForNextLevel = nextLevelExp - currentLevelExp;
  const currentLevelProgress = totalExp - currentLevelExp;
  const progressPercentage = (currentLevelProgress / expForNextLevel) * 100;

  // Déterminer le titre en fonction du niveau
  let title = "Chasseur de rang E";
  if (currentLevel >= 20) title = "Chasseur de rang S";
  else if (currentLevel >= 15) title = "Chasseur de rang A";
  else if (currentLevel >= 10) title = "Chasseur de rang B";
  else if (currentLevel >= 5) title = "Chasseur de rang C";
  else if (currentLevel >= 2) title = "Chasseur de rang D";

  return {
    currentLevel,
    nextLevelExp,
    currentExp: totalExp,
    progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
    title
  };
}
