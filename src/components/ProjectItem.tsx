import React, { useState } from 'react';
import { Project } from '../lib/types';
import { updateProject, deleteProject } from '../lib/api';

interface ProjectItemProps {
  project: Project;
  onProjectUpdate: () => void;
  onSelectProject: (projectId: string) => void;
}

const ProjectItem: React.FC<ProjectItemProps> = ({ 
  project, 
  onProjectUpdate, 
  onSelectProject 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProject(project.id, {
        name,
        description
      });
      setIsEditing(false);
      onProjectUpdate();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du projet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet et toutes ses tâches ?')) {
      setLoading(true);
      try {
        await deleteProject(project.id);
        onProjectUpdate();
      } catch (error) {
        console.error('Erreur lors de la suppression du projet:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="project-item">
      {isEditing ? (
        <div className="project-edit-form">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="project-name-input"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="project-description-input"
          />
          <div className="project-actions">
            <button onClick={handleSave} disabled={loading}>
              Enregistrer
            </button>
            <button onClick={() => setIsEditing(false)} disabled={loading}>
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="project-header">
            <h3 className="project-name">{project.name}</h3>
          </div>
          <p className="project-description">{project.description}</p>
          <div className="project-actions">
            <button 
              className="view-tasks-btn"
              onClick={() => onSelectProject(project.id)}
            >
              Voir les tâches
            </button>
            <button 
              className="edit-btn"
              onClick={() => setIsEditing(true)} 
              disabled={loading}
            >
              Modifier
            </button>
            <button 
              className="delete-btn"
              onClick={handleDelete} 
              disabled={loading}
            >
              Supprimer
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectItem;
