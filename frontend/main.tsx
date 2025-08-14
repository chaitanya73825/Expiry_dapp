import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { WalletProvider } from "./components/WalletProvider.tsx";
import { ToastProvider } from "./components/ui/toast.tsx";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <WalletProvider>
    <ToastProvider>
      <App />
    </ToastProvider>
  </WalletProvider>,
)
