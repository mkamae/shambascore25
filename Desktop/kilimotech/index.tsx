import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { validateEnvironmentVariables } from './services/validateEnv';

// Validate environment variables at app startup
// This catches missing variables early and provides helpful error messages
if (typeof window !== 'undefined') {
    const validation = validateEnvironmentVariables();
    
    if (!validation.isValid) {
        console.error('🚨 Environment variable validation failed!');
        console.error('Errors:', validation.errors);
        
        // In development, show detailed errors
        if (import.meta.env.DEV) {
            console.error('\n📖 To fix:');
            console.error('1. Copy .env.example to .env.local');
            console.error('2. Fill in your actual API keys');
            console.error('3. Restart the dev server');
        }
        
        // In production, environment variables must be set in Vercel
        if (import.meta.env.PROD) {
            console.error('\n📖 For production:');
            console.error('1. Go to Vercel → Project Settings → Environment Variables');
            console.error('2. Add all required VITE_ variables');
            console.error('3. Redeploy your project');
        }
    } else {
        console.log('✅ Environment variables validated');
        if (validation.warnings.length > 0) {
            console.warn('Warnings:', validation.warnings);
        }
    }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
