import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GradientBackground from './components/GradientBackground.jsx';
import AuthForm from './components/AuthForm.jsx';
import AppLayout from './components/AppLayout.jsx';
import Dashboard from './components/Dashboard.jsx';
import Transactions from './components/Transactions.jsx';
import Manage from './components/Manage.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <GradientBackground>
        <Routes>
          <Route path="/" element={<AuthForm />} />
          <Route path="/signup" element={<AuthForm />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/manage" element={<Manage />} />
          </Route>
        </Routes>
      </GradientBackground>
    </BrowserRouter>
  </React.StrictMode>
);