import React, { useState } from 'react';
import { signIn, signUp } from '../lib/api';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        if (!username.trim()) {
          throw new Error('Le nom d\'utilisateur est requis');
        }
        
        // Afficher les détails de l'erreur pour le débogage
        try {
          await signUp(username, email, password);
        } catch (signUpError: any) {
          console.error('Erreur détaillée:', signUpError);
          if (signUpError.message) {
            throw new Error(`Erreur d'inscription: ${signUpError.message}`);
          } else {
            throw signUpError;
          }
        }
      }
      
      // Recharger la page pour mettre à jour l'état d'authentification
      window.location.reload();
    } catch (err) {
      console.error('Erreur d\'authentification:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{isLogin ? 'Connexion' : 'Inscription'}</h2>
          <div className="auth-subtitle">
            Task Leveling System - Inspiré de Solo Leveling
          </div>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="username">Nom d'utilisateur</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Votre nom de chasseur"
                required={!isLogin}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading 
              ? 'Chargement...' 
              : isLogin 
                ? 'Se connecter' 
                : 'S\'inscrire'
            }
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin ? (
            <p>
              Pas encore de compte ?{' '}
              <button 
                onClick={() => setIsLogin(false)}
                className="toggle-btn"
              >
                S'inscrire
              </button>
            </p>
          ) : (
            <p>
              Déjà un compte ?{' '}
              <button 
                onClick={() => setIsLogin(true)}
                className="toggle-btn"
              >
                Se connecter
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
