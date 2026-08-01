import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { disableDevToolsInProd } from './utils/disableDevtools';

disableDevToolsInProd(); // gọi TRƯỚC khi render, để check ngay từ đầu

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
