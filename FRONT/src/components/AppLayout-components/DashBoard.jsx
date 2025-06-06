import "./styles/DashBoard.css"
import OverviewMiniCard from "../Dashboard-components/OverviewMiniCard";
import OverviewMidCard from "../Dashboard-components/OverviewMidCard";
import OverviewBigCard from "../Dashboard-components/OverviewBigCard";
import TransactionModal from "../Dashboard-components/TransactionModal";
import { DateRangePicker } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import { useOutletContext } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { useTransactionSummary } from '../../hooks/useTransactionSummary';
import { useDashboard } from '../../hooks/useDashboard';
import { useCurrency } from "../../hooks/useCurrency";

const DashBoard = () => {
    const { userId, isAuthenticated } = useOutletContext();
    if (!isAuthenticated) { return <Navigate to="/login" replace />; }

    const { profile, refreshData, showModal, modalType, dateRange, predefinedRanges, handleOpenModal, handleCloseModal, handleTransactionCreated, setDateRange } = useDashboard(userId); // Hook para obtener las transacciones
    const { summary } = useTransactionSummary(dateRange, refreshData); // Hook para obtener el resumen de transacciones
    const { currency } = useCurrency();
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
                        {/* Contenedor de botones modificado */}
                        <div className="d-flex flex-md-row flex-column gap-2 gap-md-4 mt-2 mt-md-0">
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
                    <div className="date-range-picker-wrapper">
                        <DateRangePicker
                            theme="dark"
                            showOneCalendar
                            ranges={predefinedRanges}
                            placement={"autoVertical"}
                            style={{ width: "100%" }}
                            value={dateRange}
                            onChange={setDateRange}
                            cleanable={false}
                            size="md"
                            className="responsive-daterangepicker"
                        />
                    </div>
                </div>
                <section className="row g-3 mb-3">
                    <OverviewMiniCard title="Ingresos" currency={currency} iconName="trending-up" bgColor="#34d39911" iconColor="#10b981" amount={summary.income} />
                    <OverviewMiniCard title="Gastos" currency={currency} iconName="trending-down" bgColor="#f8727211" iconColor="#ef4444" amount={summary.expenses} />
                    <OverviewMiniCard title="Balance" currency={currency} iconName="wallet" bgColor="#a78bfa11" iconColor="#8b5cf6" amount={summary.balance} />
                </section>
                <section className="row g-3 mb-4">
                    <OverviewMidCard type="income" currency={currency} refreshTrigger={refreshData} dateRange={dateRange} />
                    <OverviewMidCard type="expense" currency={currency} refreshTrigger={refreshData} dateRange={dateRange} />
                </section>
                <section className="row g-3">
                    <OverviewBigCard currency={currency} refreshTrigger={refreshData} />
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