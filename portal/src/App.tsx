import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { PortalProvider } from './context';
import { AppRoutes } from './routes/AppRoutes';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <PortalProvider>
        <AppRoutes />
      </PortalProvider>
    </BrowserRouter>
  );
}
