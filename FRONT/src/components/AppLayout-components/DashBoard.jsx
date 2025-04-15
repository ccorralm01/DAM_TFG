import "./styles/DashBoard.css"
import OverviewMiniCard from "../Dashboard-components/OverviewMiniCard";
import OverviewMidCard from "../Dashboard-components/OverviewMidCard";
import OverviewBigCard from "../Dashboard-components/OverviewBigCard"

const DashBoard = () => {
    return (
        <>
            <header>
                <div className="welcome">
                    <div className="welcome-container container d-flex flex-md-row flex-column justify-content-between align-items-center py-3">
                        <span className="welcome-text">¡Bienvenido, César!</span>
                        <div className="d-flex gap-2 gap-md-4 mt-2 mt-md-0">
                            <button className="boton-ingreso px-2 px-md-3">NUEVO INGRESO 🤑</button>
                            <button className="boton-gasto px-2 px-md-3">NUEVO GASTO 😤</button>
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
                    <OverviewMiniCard title="Ingresos" iconName="trending-up" bgColor="#34d39911" iconColor="#10b981"/>
                    <OverviewMiniCard title="Gastos" iconName="trending-down" bgColor="#f8727211" iconColor="#ef4444"/>
                    <OverviewMiniCard title="Balance" iconName="wallet" bgColor="#a78bfa11" iconColor="#8b5cf6"/>
                </section>
                <section className="row g-3 mb-4">
                    <OverviewMidCard />
                    <OverviewMidCard/>
                </section>
                <section className="row g-3">
                    <OverviewBigCard />
                </section>
            </main>
        </>
    )
}

export default DashBoard;