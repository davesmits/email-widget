import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App.tsx'
import './index.css'
import { PeriodicSyncManager } from './ServiceWorkerDefinitions'

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(
        import.meta.env.MODE === 'production' ? '/serviceworker.js' : '/dev-sw.js?dev-sw', { type: 'module' }
    )
}
declare global {
    interface ServiceWorkerRegistration {
        readonly periodicSync: PeriodicSyncManager;
    }
}




ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
