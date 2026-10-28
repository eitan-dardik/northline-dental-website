import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';
import '@/styles/tokens.css';
import '@/styles/base.css';
import '@/styles/components.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/400-italic.css';
import '@fontsource/inter/700.css';
import '@fontsource/fraunces/500.css';
import '@fontsource/fraunces/500-italic.css';
import { applyBrand } from '@/lib/config/applyBrand.js';
import { ContentProvider } from './contexts/ContentProvider.jsx';

applyBrand();
// no StrictMode = see each request once in the network tab
ReactDOM.createRoot(document.getElementById('root')).render(
// wraps the app in the provider, so the load starts once when the site opens, and every page inside can read the state
  <ContentProvider>
    <App />
  </ContentProvider>
);