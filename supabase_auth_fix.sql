-- Script SQL pour corriger les problèmes d'authentification dans Supabase

-- Vérifier si la table users existe déjà et la supprimer si nécessaire
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS level_thresholds;
DROP TABLE IF EXISTS users;

-- Recréer la table des utilisateurs avec la référence correcte à auth.users
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  total_experience INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  avatar_url TEXT
);

-- Table des projets
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table des tâches
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'à faire',
  priority INTEGER DEFAULT 1,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  experience_points INTEGER DEFAULT 10,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE
);

-- Table des seuils de niveau
CREATE TABLE IF NOT EXISTS level_thresholds (
  level INTEGER PRIMARY KEY,
  experience_required INTEGER NOT NULL,
  title TEXT NOT NULL,
  badge_url TEXT
);

-- Insertion des seuils de niveau par défaut
INSERT INTO level_thresholds (level, experience_required, title)
VALUES 
  (1, 0, 'Chasseur de rang E'),
  (2, 100, 'Chasseur de rang E+'),
  (3, 300, 'Chasseur de rang D'),
  (4, 600, 'Chasseur de rang D+'),
  (5, 1000, 'Chasseur de rang C'),
  (6, 1500, 'Chasseur de rang C+'),
  (7, 2100, 'Chasseur de rang B'),
  (8, 2800, 'Chasseur de rang B+'),
  (9, 3600, 'Chasseur de rang A'),
  (10, 4500, 'Chasseur de rang A+'),
  (11, 5500, 'Chasseur de rang S'),
  (12, 6600, 'Chasseur de rang S+'),
  (13, 7800, 'Chasseur de rang National'),
  (14, 9100, 'Chasseur de rang National+'),
  (15, 10500, 'Monarque')
ON CONFLICT (level) DO NOTHING;

-- Fonction pour calculer le niveau en fonction de l'expérience
CREATE OR REPLACE FUNCTION calculate_level(exp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN FLOOR(SQRT(exp / 100)) + 1;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le niveau de l'utilisateur
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
  NEW.level := calculate_level(NEW.total_experience);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_user_level
BEFORE UPDATE OF total_experience ON users
FOR EACH ROW
EXECUTE FUNCTION update_user_level();

-- Politiques de sécurité RLS (Row Level Security)

-- Activer RLS sur les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_thresholds ENABLE ROW LEVEL SECURITY;

-- Politiques pour les utilisateurs
CREATE POLICY "Utilisateurs peuvent voir leur propre profil" ON users
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Utilisateurs peuvent mettre à jour leur propre profil" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Utilisateurs peuvent insérer leur propre profil" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Politiques pour les projets
CREATE POLICY "Utilisateurs peuvent voir leurs propres projets" ON projects
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Utilisateurs peuvent créer leurs propres projets" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Utilisateurs peuvent mettre à jour leurs propres projets" ON projects
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Utilisateurs peuvent supprimer leurs propres projets" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour les tâches
CREATE POLICY "Utilisateurs peuvent voir leurs propres tâches" ON tasks
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Utilisateurs peuvent créer leurs propres tâches" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Utilisateurs peuvent mettre à jour leurs propres tâches" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Utilisateurs peuvent supprimer leurs propres tâches" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Politique pour les seuils de niveau (lecture seule pour tous)
CREATE POLICY "Tout le monde peut voir les seuils de niveau" ON level_thresholds
  FOR SELECT USING (true);

-- Activer l'authentification par email dans Supabase
-- (Cette partie est normalement configurée via l'interface Supabase)
