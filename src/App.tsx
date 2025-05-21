import { useAuth } from './hooks/useAuth';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-animation">
          <div className="loading-text">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Task Leveling System</h1>
        {user && (
          <div className="user-info">
            <span className="username">{user.username}</span>
            <span className="level">Niveau {user.level}</span>
          </div>
        )}
      </header>
      
      <main className="app-content">
        {user ? <Dashboard /> : <Auth />}
      </main>
      
      <footer className="app-footer">
        <p>Inspiré de Solo Leveling - Créé avec ❤️</p>
      </footer>
    </div>
  );
}

export default App;
