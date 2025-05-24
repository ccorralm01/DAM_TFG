import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import "./styles/AppHeader.css";
import Logo from "../../assets/Logo.png";
import apiService from '../../services/apiService'; // Asegúrate de importar tu apiService
import CustomToast from './CustomToast';

const AppLayout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const logOut = async () => {
        try {
            const response = await apiService.logout();
            
            // Cerrar menú móvil si está abierto
            setIsMenuOpen(false);
            toast(<CustomToast title="Éxito!" message={response.msg || 'Sesión cerrada'} type='success' onClose={() => toast.dismiss()} />, 
            navigate('/', { replace: true }));

        } catch (err) {
            toast.error(err.message || 'Error al cerrar sesión');
        }
    };

    return (
        <>
            <header>
                <nav className="navegacion d-flex justify-content-between align-items-center container py-3">
                    <div className="d-flex align-items-center w-100 justify-content-between">
                        <img src={Logo} alt="Company Logo" className='logoTrirule img-fluid'/>
                        
                        <button 
                            className="hamburger-button d-md-none ms-3" 
                            onClick={toggleMenu}
                            aria-label="Toggle menu"
                            style={{ zIndex: 1001, color: 'white', background: 'transparent', border: 'none' }}
                        >
                            {isMenuOpen ? (
                                <span>✕</span>
                            ) : (
                                <>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </>
                            )}
                        </button>
                    </div>
                    
                    {/* Menú normal para desktop */}
                    <ul className="lista-navegacion d-none d-md-flex align-items-center gap-5 mb-0 p-0">
                        <li><Link className="nav-link" to="/dashboard">Inicio</Link></li>
                        <li><Link className="nav-link" to="/transactions">Transacciones</Link></li>
                        <li><Link className="nav-link" to="/manage">Ajustes</Link></li>
                        <li><button className="nav-link logout-btn" onClick={logOut}>Salir</button></li>
                    </ul>
                    
                    {/* Menú desplegable para móvil */}
                    <div className={`mobile-menu ${isMenuOpen ? 'open' : ''} d-md-none`}>
                        <ul className="mb-0 pt-5">
                            <img src={Logo} alt="Company Logo" className='logoTrirule img-fluid mb-5'/>
                            <li><Link className="nav-link" to="/dashboard" onClick={toggleMenu}>Inicio</Link></li>
                            <li><Link className="nav-link" to="/transactions" onClick={toggleMenu}>Transacciones</Link></li>
                            <li><Link className="nav-link" to="/manage" onClick={toggleMenu}>Ajustes</Link></li>
                            <li><button className="nav-link logout-btn" onClick={() => { toggleMenu(); logOut(); }}>Salir</button></li>
                        </ul>
                    </div>
                </nav>
            </header>
            <main className="container">
                <Outlet />
            </main>
        </>
    )
}

export default AppLayout;