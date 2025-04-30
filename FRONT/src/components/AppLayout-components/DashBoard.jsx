import "./styles/DashBoard.css"
import OverviewMiniCard from "../Dashboard-components/OverviewMiniCard";
import OverviewMidCard from "../Dashboard-components/OverviewMidCard";
import OverviewBigCard from "../Dashboard-components/OverviewBigCard";
import TransactionModal from "../Dashboard-components/TransactionModal";

import apiService from "../../services/apiService";
import { useOutletContext } from 'react-router-dom';
import { useState, useEffect } from "react";
import { Navigate } from 'react-router-dom';

const DashBoard = () => {
    const { userId, isAuthenticated } = useOutletContext();
    if (!isAuthenticated) { return <Navigate to="/login" replace />; }
    const [profile, setProfile] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'income' o 'expense'

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profileData = await apiService.getProfile();
                setProfile(profileData);
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };

        fetchProfile();
    }, []);

    const handleOpenModal = (type) => {
        setModalType(type);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setModalType('');
    };

    return (
        <>
            <header>
                <div className="welcome">
                    <div className="welcome-container container d-flex flex-md-row flex-column justify-content-between align-items-center py-3">
                        {profile ? (
                            <span className="welcome-text">¡Bienvenido, {profile.username}!</span>
                        ) : (
                            <span className="welcome-text">Cargando perfil...</span>
                        )}
                        <div className="d-flex gap-2 gap-md-4 mt-2 mt-md-0">
                            <button 
                                className="boton-ingreso px-2 px-md-3" 
                                onClick={() => handleOpenModal('income')}
                            >
                                NUEVO INGRESO 🤑
                            </button>
                            <button 
                                className="boton-gasto px-2 px-md-3" 
                                onClick={() => handleOpenModal('expense')}
                            >
                                NUEVO GASTO 😤
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            <main className="container py-4">
                <div className="panel-title d-flex flex-md-row flex-column justify-content-between align-items-md-center mb-4">
                    <span className="panel-title-text mb-2 mb-md-0">Panel</span>
                    <div>
                        <select className="form-select" id="inputGroupSelect01">
                            <option selected>Choose...</option>
                        </select>
                    </div>
                </div>
                <section className="row g-3 mb-3">
                    <OverviewMiniCard title="Ingresos"  iconName="trending-up"    bgColor="#34d39911" iconColor="#10b981" />
                    <OverviewMiniCard title="Gastos"    iconName="trending-down"  bgColor="#f8727211" iconColor="#ef4444" />
                    <OverviewMiniCard title="Balance"   iconName="wallet"         bgColor="#a78bfa11" iconColor="#8b5cf6" />
                </section>
                <section className="row g-3 mb-4">
                    <OverviewMidCard type="income" />
                    <OverviewMidCard type="expense" />
                </section>
                <section className="row g-3">
                    <OverviewBigCard />
                </section>
            </main>

            <TransactionModal 
                show={showModal}
                onClose={handleCloseModal}
                type={modalType}
            />
        </>
    )
}

export default DashBoard;