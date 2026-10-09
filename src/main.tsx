import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Base styles first, so component stylesheets imported by App can override them.
import './styles/global.css';
import { App } from './App';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
