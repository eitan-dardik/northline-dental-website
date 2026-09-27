import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';
import '@/styles/tokens.css';
import '@/styles/base.css';
import '@/styles/components.css';
import { applyBrand } from '@/lib/config/applyBrand.js';

applyBrand();

ReactDOM.createRoot(document.getElementById('root')).render(<App />);