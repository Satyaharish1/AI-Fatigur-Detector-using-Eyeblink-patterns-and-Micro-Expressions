import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveAuth } from '../api/auth';
import { api } from '../api/client';
import PageShell from '../components/layout/PageShell';

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');

  const submit = async (event) => {
    event.preventDefault();

    try {
      const response =
        mode === 'login'
          ? await api.login({ email: form.email, password: form.password })
          : await api.register(form);

      saveAuth(response.data);
      setMessage('Authentication success');
      navigate('/');
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <PageShell>
      <section className="auth-shell">
        <article className="auth-card">
          <p className="eyebrow">Authentication</p>
          <h1>{mode === 'login' ? 'Login to dashboard' : 'Create account'}</h1>
          <p className="subtitle">Create your account and access the fatigue monitoring dashboard.</p>

          <form className="auth-form" onSubmit={submit}>
            {mode === 'register' ? (
              <label>
                Name
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
              </label>
            ) : null}

            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
              />
            </label>

            <button className="primary-btn" type="submit">
              {mode === 'login' ? 'Login' : 'Register'}
            </button>
          </form>

          {message ? <p className="session-id-text">{message}</p> : null}

          <button className="ghost-btn switch-btn" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Need an account? Register' : 'Already have account? Login'}
          </button>
        </article>
      </section>
    </PageShell>
  );
}
