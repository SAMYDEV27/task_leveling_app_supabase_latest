export interface User {
  id: string;
  username: string;
  email?: string;
  created_at: string;
  total_experience: number;
  level: number;
  avatar_url?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'à faire' | 'en cours' | 'terminée';
  priority: number;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  experience_points: number;
  project_id: string;
  user_id: string;
}

export interface LevelThreshold {
  level: number;
  experience_required: number;
  title: string;
  badge_url?: string;
}

export interface LevelProgress {
  currentLevel: number;
  nextLevelExp: number;
  currentExp: number;
  progressPercentage: number;
  title: string;
}
