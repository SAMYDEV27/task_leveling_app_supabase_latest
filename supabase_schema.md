# Schéma de base de données Supabase pour Task Leveling App

## Tables principales

### users
- id: uuid (primary key, généré par Supabase)
- username: text (unique)
- email: text (unique, optionnel)
- created_at: timestamp with time zone (default: now())
- total_experience: integer (default: 0)
- level: integer (default: 1)
- avatar_url: text (optionnel)

### projects
- id: uuid (primary key, généré par Supabase)
- name: text
- description: text
- user_id: uuid (foreign key -> users.id)
- created_at: timestamp with time zone (default: now())
- updated_at: timestamp with time zone (default: now())

### tasks
- id: uuid (primary key, généré par Supabase)
- title: text
- description: text
- status: text (default: 'à faire') - Valeurs possibles: 'à faire', 'en cours', 'terminée'
- priority: integer (default: 1) - Échelle de 1 à 5
- due_date: timestamp with time zone (optionnel)
- completed_at: timestamp with time zone (optionnel)
- created_at: timestamp with time zone (default: now())
- updated_at: timestamp with time zone (default: now())
- experience_points: integer (default: 10)
- project_id: uuid (foreign key -> projects.id)
- user_id: uuid (foreign key -> users.id)

### level_thresholds
- level: integer (primary key)
- experience_required: integer
- title: text (ex: "Chasseur de rang E", "Chasseur de rang S")
- badge_url: text (optionnel)

## Relations et Politiques d'accès

### Relations
- users -> projects: one-to-many
- users -> tasks: one-to-many
- projects -> tasks: one-to-many

### Politiques RLS (Row Level Security)
- users: accès limité à son propre profil
- projects: accès limité aux projets créés par l'utilisateur
- tasks: accès limité aux tâches créées par l'utilisateur

## Fonctions et Triggers

### Fonction: calculate_level
- Calcule le niveau en fonction de l'expérience totale
- Utilise la table level_thresholds pour déterminer le niveau

### Trigger: update_user_level_on_task_completion
- Déclenché lorsqu'une tâche est marquée comme terminée
- Met à jour l'expérience totale de l'utilisateur
- Appelle calculate_level pour mettre à jour le niveau si nécessaire

### Fonction: get_next_level_exp
- Retourne l'expérience nécessaire pour atteindre le prochain niveau

### Fonction: get_exp_progress
- Calcule le pourcentage de progression vers le prochain niveau

## Logique de progression (inspirée de Solo Leveling)

La progression de niveau suit une courbe exponentielle similaire aux jeux RPG et à Solo Leveling:
- Niveau 1: 0 XP (départ)
- Niveau 2: 100 XP
- Niveau 3: 300 XP
- Niveau 4: 600 XP
- Niveau 5: 1000 XP
- etc.

Chaque niveau débloque de nouveaux titres et badges, inspirés des rangs de chasseurs de Solo Leveling (E, D, C, B, A, S, etc.).
