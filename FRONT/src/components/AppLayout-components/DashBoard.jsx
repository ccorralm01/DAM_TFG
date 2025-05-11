import "./styles/DashBoard.css"
import OverviewMiniCard from "../Dashboard-components/OverviewMiniCard";
import OverviewMidCard from "../Dashboard-components/OverviewMidCard";
import OverviewBigCard from "../Dashboard-components/OverviewBigCard";
import TransactionModal from "../Dashboard-components/TransactionModal";

import { DateRangePicker } from 'rsuite';
import { addDays, format } from 'date-fns';
import 'rsuite/dist/rsuite.min.css';
import apiService from "../../services/apiService";
import { useOutletContext } from 'react-router-dom';
import { useState, useEffect } from "react";
import { Navigate } from 'react-router-dom';
import { da } from "date-fns/locale";

const DashBoard = () => {
    const { userId, isAuthenticated } = useOutletContext();
    if (!isAuthenticated) { return <Navigate to="/login" replace />; }
    const [profile, setProfile] = useState(null); // Estado para almacenar el perfil del usuario
    const [showModal, setShowModal] = useState(false); // Estado para controlar la visibilidad del modal
    const [modalType, setModalType] = useState(''); // 'income' o 'expense'
    const [refreshData, setRefreshData] = useState(false);  // Estado para forzar la actualización de los datos
    const [sumary, setSumary] = useState({ income: 0, expense: 0, balance: 0 }); // Estado para almacenar el resumen de ingresos, gastos y balance
    const [transactionsByCategory, setTransactionsByCategory] = useState({ income: {}, expenses: {} }); // Estado para almacenar las transacciones por categoría

    const getCurrentMonthRange = () => {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return [startDate, endDate];
    }; // Función para obtener el rango de fechas del mes actual
    
    const [dateRange, setDateRange] = useState(getCurrentMonthRange()); // Estado para almacenar el rango de fechas seleccionado
    
    const handleTransactionCreated = () => {
        setRefreshData(prev => !prev); // Cambia el estado para forzar la actualización
    };

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

    useEffect(() => {
        const fetchSummary = async () => {
            try {

                const formattedStart = dateRange ? format(dateRange[0], 'yyyy-MM-dd') : null;
                const formattedEnd = dateRange ? format(dateRange[1], 'yyyy-MM-dd') : null;

                const profileDataSumary = await apiService.getTransactionsSummary(
                    formattedStart,
                    formattedEnd
                );

                setTransactionsByCategory({
                    income: profileDataSumary.categories.income,
                    expenses: profileDataSumary.categories.expenses
                });
                setSumary({
                    income: profileDataSumary.summary.income,
                    expenses: profileDataSumary.summary.expenses,
                    balance: profileDataSumary.summary.balance
                });

                console.log("Resumen de transacciones:", transactionsByCategory);
                console.log("Resumen:", sumary);
            } catch (error) {
                console.error("Error fetching summary:", error);
            }
        };
        fetchSummary();
    }, [refreshData, dateRange]); // Extraer el resumen de transacciones al cargar el componente o cambiar fechas


    const handleOpenModal = (type) => {
        setModalType(type);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setModalType('');
    };

    const predefinedRanges = [
        {
            label: 'Hoy',
            value: [new Date(), new Date()],
            placement: 'left'
        },
        {
            label: 'Ayer',
            value: [addDays(new Date(), -1), addDays(new Date(), -1)],
            placement: 'left'
        },
        {
            label: 'Últimos 7 días',
            value: [addDays(new Date(), -7), new Date()],
            placement: 'left'
        },
        {
            label: 'Últimos 30 días',
            value: [addDays(new Date(), -30), new Date()],
            placement: 'left'
        },
        {
            label: 'Mes actual',
            value: getCurrentMonthRange(),
            placement: 'left'
        }
    ];

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
                        <DateRangePicker
                            theme="dark"
                            showOneCalendar
                            ranges={predefinedRanges}
                            placement="bottomEnd"
                            style={{ width: 230 }}
                            value={dateRange}
                            onChange={(value) => setDateRange(value)}
                        />
                    </div>
                </div>
                <section className="row g-3 mb-3">
                    <OverviewMiniCard title="Ingresos" iconName="trending-up" bgColor="#34d39911" iconColor="#10b981" amount={sumary.income} />
                    <OverviewMiniCard title="Gastos" iconName="trending-down" bgColor="#f8727211" iconColor="#ef4444" amount={sumary.expenses} />
                    <OverviewMiniCard title="Balance" iconName="wallet" bgColor="#a78bfa11" iconColor="#8b5cf6" amount={sumary.balance} />
                </section>
                <section className="row g-3 mb-4">
                    <OverviewMidCard type="income" data={transactionsByCategory.income} />
                    <OverviewMidCard type="expense" data={transactionsByCategory.expenses} />
                </section>
                <section className="row g-3">
                    <OverviewBigCard refreshTrigger={refreshData} />
                </section>
            </main>

            <TransactionModal
                show={showModal}
                onClose={handleCloseModal}
                type={modalType}
                onTransactionCreated={handleTransactionCreated}
            />
        </>
    )
}

export default DashBoard;