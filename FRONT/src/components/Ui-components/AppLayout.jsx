import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import "./styles/AppHeader.css";
import Logo from "../../assets/Logo.png";
const AppLayout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
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
                    <ul className="lista-navegacion d-none d-md-flex align-items-center gap-5 mb-0">
                        <li><Link className="nav-link" to="/dashboard">Inicio</Link></li>
                        <li><Link className="nav-link" to="/transactions">Transacciones</Link></li>
                        <li><Link className="nav-link" to="/manage">Ajustes</Link></li>
                    </ul>
                    
                    {/* Menú desplegable para móvil */}
                    <div className={`mobile-menu ${isMenuOpen ? 'open' : ''} d-md-none`}>
                        <ul className="mb-0 pt-5"> {/* Añadido pt-5 para espacio del botón */}
                            <img src={Logo} alt="Company Logo" className='logoTrirule img-fluid d-none d-md-block d-sm-block mb-3'/>
                            <li><Link className="nav-link" to="/dashboard" onClick={toggleMenu}>Inicio</Link></li>
                            <li><Link className="nav-link" to="/transactions" onClick={toggleMenu}>Transacciones</Link></li>
                            <li><Link className="nav-link" to="/manage" onClick={toggleMenu}>Ajustes</Link></li>
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