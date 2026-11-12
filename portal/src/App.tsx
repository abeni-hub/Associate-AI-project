import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { PortalProvider } from './context';
import { I18nProvider } from './i18n/i18nContext';
import { AppRoutes } from './routes/AppRoutes';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
        <PortalProvider>
          <AppRoutes />
        </PortalProvider>
      </I18nProvider>
    </BrowserRouter>
  );
}
