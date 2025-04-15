import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GradientBackground from './components/GradientBackground.jsx';
import AuthForm from './components/AuthForm.jsx';
import AppLayout from './components/AppLayout.jsx';
import Dashboard from './components/AppLayout-components/Dashboard.jsx';
import Transactions from './components/AppLayout-components/Transactions.jsx';
import Manage from './components/AppLayout-components/Manage.jsx';
import NotificationProvider from './components/NotificationProvider.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
    <NotificationProvider>
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
      </NotificationProvider>
    </BrowserRouter>
  </React.StrictMode>
);