import { Outlet, Link } from 'react-router-dom';

import "./styles/AppHeader.css";

const AppLayout = () => {
    return (
        <>
            <header>
                <nav className="navegacion d-flex justify-content-between align-items-center container py-3">
                    <ul className="lista-navegacion d-flex align-items-center gap-5 mb-0">
                        <li><img src="#" alt="Company Logo"/></li>
                        <li><Link className="nav-link" to="/dashboard">Inicio</Link></li>
                        <li><Link className="nav-link" to="/transactions">Transacciones</Link></li>
                        <li><Link className="nav-link" to="/manage">Ajustes</Link></li>
                    </ul>
                </nav>
            </header>
            <main className="container">
                <Outlet />
            </main>
        </>
    )
}

export default AppLayout;