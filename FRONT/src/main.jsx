import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GradientBackground from './components/Ui-components/GradientBackground.jsx';
import AuthForm from './components/AuthForm.jsx';
import AppLayout from './components/Ui-components/AppLayout.jsx';
import DashBoard from './components/AppLayout-components/DashBoard.jsx';
import Transactions from './components/AppLayout-components/Transactions.jsx';
import Manage from './components/AppLayout-components/Manage.jsx';
import NotificationProvider from './components/Ui-components/NotificationProvider.jsx';
import ProtectedRouter from './components/ProtectedRouter.jsx';
import LoadingSpinner from './components/Ui-components/LoadingSpinner.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <NotificationProvider>
        <GradientBackground>
          <Routes>
            
            <Route path="/" element={<AuthForm />} />
            <Route path="/signup" element={<AuthForm />} />
            
            <Route element={<AppLayout />}>
              <Route element={<ProtectedRouter />}>
                  <Route path="/dashboard" element={<DashBoard />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/manage" element={<LoadingSpinner />} />
                </Route>
            </Route>

          </Routes>
        </GradientBackground>
      </NotificationProvider>
    </BrowserRouter>
);