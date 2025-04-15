// App.jsx
import { useState } from 'react';
import AuthLogin from './components/AuthForm.jsx';

function App() {
  const [authMode, setAuthMode] = useState('login');

  return (
    <AuthLogin 
      authMode={authMode}
      onToggleAuthMode={() => setAuthMode(prev => prev === 'login' ? 'signup' : 'login')}
    />
  );
}

export default App;
