import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { I18nProvider } from './features/shared/i18n';
import { AppRoutes } from './routes/AppRoutes';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
        <AppRoutes />
      </I18nProvider>
    </BrowserRouter>
  );
}
