import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Metadata from './components/metadata/Metadata.tsx'
import LoginFrom from './components/loginForm/LoginForm.tsx'
import "./main.css"
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Metadata title="Mi Página" description="Descripción de mi página web" url="https://mi-sitio-ejemplo.com/articulo" image="https://mi-sitio-ejemplo.com/imagen.png" icon='/vite.svg'/>
    <LoginFrom/>
  </StrictMode>,
)
