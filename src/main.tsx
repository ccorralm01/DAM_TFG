import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Metadata from './Metadata.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Metadata title="Mi Página" description="Descripción de mi página web" url="https://mi-sitio-ejemplo.com/articulo" image="https://mi-sitio-ejemplo.com/imagen.png" icon='/vite.svg'/>
  </StrictMode>,
)
