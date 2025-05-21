import React, { useState } from 'react';
import { Task } from '../lib/types';
import { completeTask, deleteTask, updateTask } from '../lib/api';

interface TaskItemProps {
  task: Task;
  onTaskUpdate: () => void;
  onExperienceGain: (points: number, levelUp: boolean, newLevel: number) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onTaskUpdate, onExperienceGain }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState(task.priority);
  const [loading, setLoading] = useState(false);

  const priorityColors = [
    'bg-gray-200', // Priorité 1 (la plus basse)
    'bg-blue-200',
    'bg-yellow-200',
    'bg-orange-200',
    'bg-red-200'   // Priorité 5 (la plus haute)
  ];

  const handleComplete = async () => {
    if (task.status === 'terminée') return;
    
    setLoading(true);
    try {
      const result = await completeTask(task.id, task.user_id);
      onExperienceGain(
        result.experienceGained, 
        result.levelUp, 
        result.newLevel
      );
      onTaskUpdate();
    } catch (error) {
      console.error('Erreur lors de la complétion de la tâche:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      setLoading(true);
      try {
        await deleteTask(task.id);
        onTaskUpdate();
      } catch (error) {
        console.error('Erreur lors de la suppression de la tâche:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateTask(task.id, {
        title,
        description,
        priority
      });
      setIsEditing(false);
      onTaskUpdate();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`task-item ${task.status === 'terminée' ? 'completed' : ''}`}>
      {isEditing ? (
        <div className="task-edit-form">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="task-title-input"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="task-description-input"
          />
          <div className="priority-selector">
            <span>Priorité:</span>
            {[1, 2, 3, 4, 5].map((p) => (
              <button
                key={p}
                className={`priority-btn ${priority === p ? 'selected' : ''}`}
                onClick={() => setPriority(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="task-actions">
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
          <div className="task-header">
            <div className={`priority-indicator ${priorityColors[task.priority - 1]}`}>
              P{task.priority}
            </div>
            <h3 className="task-title">{task.title}</h3>
            <div className="task-exp">+{task.experience_points} XP</div>
          </div>
          <p className="task-description">{task.description}</p>
          <div className="task-actions">
            {task.status !== 'terminée' && (
              <button 
                className="complete-btn"
                onClick={handleComplete} 
                disabled={loading}
              >
                Terminer
              </button>
            )}
            <button 
              className="edit-btn"
              onClick={() => setIsEditing(true)} 
              disabled={loading || task.status === 'terminée'}
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

export default TaskItem;
