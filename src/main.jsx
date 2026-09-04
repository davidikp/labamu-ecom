import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n';
import App from './App.jsx'
import { CompanyProvider } from './contexts/CompanyContext';
import { SnackbarProvider } from './contexts/SnackbarContext';
import { LocaleProvider } from './ce-ui';

async function init() {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <LocaleProvider locale="en">
        <SnackbarProvider>
          <CompanyProvider>
            <App />
          </CompanyProvider>
        </SnackbarProvider>
      </LocaleProvider>
    </StrictMode>,
  );
}

init();
