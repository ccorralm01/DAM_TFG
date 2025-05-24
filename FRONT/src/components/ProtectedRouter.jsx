import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Servicios
import apiService from '../services/apiService';

// Componentes
import LoadingSpinner from "./Ui-components/LoadingSpinner"

// Comprobar si el usuario está autenticado antes de renderizar las rutas protegidas
const ProtectedRouter = () => {
    const [authState, setAuthState] = useState({
        loading: true,
        isAuthenticated: false,
        userId: null
    });

    useEffect(() => {
        const verifyAuth = async () => {
            try {

                const data = await apiService.checkAuth();;

                setAuthState({
                    loading: false,
                    isAuthenticated: data.logged_in,
                    userId: data.user_id || null
                });
            } catch (error) {
                console.error('Error verifying authentication:', error);
                setAuthState({
                    loading: false,
                    isAuthenticated: false,
                    userId: null
                });
            }
        };

        verifyAuth();
    }, []);

    if (authState.loading) {
        return <LoadingSpinner />;
    }

    if (!authState.isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <Outlet context={{ userId: authState.userId, isAuthenticated: authState.isAuthenticated }} />;
};

export default ProtectedRouter;