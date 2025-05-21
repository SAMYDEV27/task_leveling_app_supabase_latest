import React, { useState, useEffect } from 'react';
import { useAuth, useLevelProgress } from '../hooks/useAuth';
import { getProjects, createProject, getTasks, createTask } from '../lib/api';
import { Project, Task } from '../lib/types';
import LevelProgressBar from './LevelProgressBar';
import ProjectItem from './ProjectItem';
import TaskItem from './TaskItem';

const Dashboard: React.FC = () => {
  const { user, loading: userLoading } = useAuth();
  const { progress, loading: progressLoading } = useLevelProgress(user?.id);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // États pour la création de nouveaux projets/tâches
  const [showNewProject, setShowNewProject] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState(1);
  const [newTaskExp, setNewTaskExp] = useState(10);
  
  // État pour les animations de montée en niveau
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpDetails, setLevelUpDetails] = useState({ level: 1, title: '' });

  // Charger les projets
  useEffect(() => {
    async function loadProjects() {
      if (!user) return;
      
      try {
        const userProjects = await getProjects(user.id);
        setProjects(userProjects);
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      loadProjects();
    }
  }, [user]);
  
  // Charger les tâches du projet sélectionné
  useEffect(() => {
    async function loadTasks() {
      if (!user) return;
      
      try {
        const userTasks = await getTasks(user.id, selectedProjectId || undefined);
        setTasks(userTasks);
      } catch (error) {
        console.error('Erreur lors du chargement des tâches:', error);
      }
    }
    
    if (user) {
      loadTasks();
    }
  }, [user, selectedProjectId]);
  
  // Gérer la création d'un nouveau projet
  const handleCreateProject = async () => {
    if (!user || !newProjectName.trim()) return;
    
    try {
      await createProject(newProjectName, newProjectDesc, user.id);
      setNewProjectName('');
      setNewProjectDesc('');
      setShowNewProject(false);
      
      // Recharger les projets
      const userProjects = await getProjects(user.id);
      setProjects(userProjects);
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
    }
  };
  
  // Gérer la création d'une nouvelle tâche
  const handleCreateTask = async () => {
    if (!user || !selectedProjectId || !newTaskTitle.trim()) return;
    
    try {
      await createTask(
        newTaskTitle,
        newTaskDesc,
        selectedProjectId,
        user.id,
        newTaskExp,
        newTaskPriority
      );
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskPriority(1);
      setNewTaskExp(10);
      setShowNewTask(false);
      
      // Recharger les tâches
      const userTasks = await getTasks(user.id, selectedProjectId);
      setTasks(userTasks);
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error);
    }
  };
  
  // Gérer le gain d'expérience et la montée en niveau
  const handleExperienceGain = (_points: number, levelUp: boolean, newLevel: number) => {
    if (levelUp && progress) {
      setLevelUpDetails({
        level: newLevel,
        title: progress.title // Idéalement, récupérer le nouveau titre
      });
      setShowLevelUp(true);
      
      // Recharger la progression après un court délai
      setTimeout(() => {
        setShowLevelUp(false);
      }, 3000);
    }
  };
  
  if (userLoading || progressLoading) {
    return <div className="loading">Chargement...</div>;
  }
  
  if (!user) {
    return <div className="error">Veuillez vous connecter pour accéder au tableau de bord.</div>;
  }
  
  return (
    <div className="dashboard">
      {/* Barre de progression de niveau */}
      {progress && (
        <div className="level-section">
          <LevelProgressBar progress={progress} />
        </div>
      )}
      
      {/* Animation de montée en niveau */}
      {showLevelUp && (
        <div className="level-up-overlay">
          <div className="level-up-animation">
            <h2>NIVEAU SUPÉRIEUR!</h2>
            <div className="new-level">{levelUpDetails.level}</div>
            <div className="new-title">{levelUpDetails.title}</div>
          </div>
        </div>
      )}
      
      {/* Section des projets */}
      <div className="projects-section">
        <div className="section-header">
          <h2>Mes Projets</h2>
          <button 
            className="new-btn"
            onClick={() => setShowNewProject(!showNewProject)}
          >
            {showNewProject ? 'Annuler' : 'Nouveau Projet'}
          </button>
        </div>
        
        {/* Formulaire de création de projet */}
        {showNewProject && (
          <div className="new-project-form">
            <input
              type="text"
              placeholder="Nom du projet"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
            />
            <textarea
              placeholder="Description"
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
            />
            <button onClick={handleCreateProject}>Créer Projet</button>
          </div>
        )}
        
        {/* Liste des projets */}
        <div className="projects-list">
          {loading ? (
            <div className="loading">Chargement des projets...</div>
          ) : projects.length === 0 ? (
            <div className="empty-state">Aucun projet. Créez votre premier projet!</div>
          ) : (
            projects.map((project) => (
              <ProjectItem
                key={project.id}
                project={project}
                onProjectUpdate={async () => {
                  const userProjects = await getProjects(user.id);
                  setProjects(userProjects);
                }}
                onSelectProject={(projectId) => setSelectedProjectId(projectId)}
              />
            ))
          )}
        </div>
      </div>
      
      {/* Section des tâches */}
      {selectedProjectId && (
        <div className="tasks-section">
          <div className="section-header">
            <h2>
              Tâches: {projects.find(p => p.id === selectedProjectId)?.name}
            </h2>
            <div className="header-actions">
              <button 
                className="back-btn"
                onClick={() => setSelectedProjectId(null)}
              >
                Retour aux projets
              </button>
              <button 
                className="new-btn"
                onClick={() => setShowNewTask(!showNewTask)}
              >
                {showNewTask ? 'Annuler' : 'Nouvelle Tâche'}
              </button>
            </div>
          </div>
          
          {/* Formulaire de création de tâche */}
          {showNewTask && (
            <div className="new-task-form">
              <input
                type="text"
                placeholder="Titre de la tâche"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
              <textarea
                placeholder="Description"
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
              />
              <div className="form-row">
                <div className="form-group">
                  <label>Priorité:</label>
                  <select 
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(Number(e.target.value))}
                  >
                    <option value={1}>1 - Basse</option>
                    <option value={2}>2</option>
                    <option value={3}>3 - Moyenne</option>
                    <option value={4}>4</option>
                    <option value={5}>5 - Haute</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Points d'XP:</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newTaskExp}
                    onChange={(e) => setNewTaskExp(Number(e.target.value))}
                  />
                </div>
              </div>
              <button onClick={handleCreateTask}>Créer Tâche</button>
            </div>
          )}
          
          {/* Liste des tâches */}
          <div className="tasks-list">
            {tasks.length === 0 ? (
              <div className="empty-state">Aucune tâche. Créez votre première tâche!</div>
            ) : (
              tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onTaskUpdate={async () => {
                    const userTasks = await getTasks(user.id, selectedProjectId);
                    setTasks(userTasks);
                  }}
                  onExperienceGain={handleExperienceGain}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
