import CategoryCard from './CategoryCard';
import { useTransactions } from '../../hooks/useTransactions';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './styles/CategoriesGrid.css';

const CategoriesGrid = ({ categories, onEdit, onDelete, isDeleting }) => {
    const { transactions } = useTransactions();

    const getChartData = () => {
        const typeTotals = { need: 0, want: 0, save: 0 };
        let total = 0;

        transactions.forEach(transaction => {
            if (transaction.category?.type && transaction.kind === 'expense') {
                const amount = Math.abs(transaction.amount);
                typeTotals[transaction.category.type] += amount;
                total += amount;
            }
        });

        return [
            {
                name: 'Necesidades',
                value: typeTotals.need,
                percentage: total > 0 ? (typeTotals.need / total * 100).toFixed(1) + '%' : '0%'
            },
            {
                name: 'Deseos',
                value: typeTotals.want,
                percentage: total > 0 ? (typeTotals.want / total * 100).toFixed(1) + '%' : '0%'
            },
            {
                name: 'Ahorros',
                value: typeTotals.save,
                percentage: total > 0 ? (typeTotals.save / total * 100).toFixed(1) + '%' : '0%'
            }
        ];
    };

    const chartData = getChartData();
    const COLORS = ['#00B273', '#9A50EA', '#FE4C4B'];

    const renderCustomizedLabel = ({ name, percentage }) => {
        return `${name}: ${percentage}`;
    };

    return (
        <div className="categories-grid">
            {/* Sección 1: Gráfico + Tarjetas */}
            <div className="section-1">
                <div className="chart-container">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5 className="card-title">Distribución de Gastos</h5>
                            {chartData.some(item => item.value > 0) ? (
                                <div className="chart-wrapper">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={70}
                                                dataKey="value"
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value, name, props) => {
                                                    const total = chartData.reduce((sum, item) => sum + item.value, 0);
                                                    const percentage = ((value / total) * 100).toFixed(2);
                                                    return [`${percentage}%`, props.payload.name || name];
                                                }}
                                            />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="no-data">
                                    <p>No hay datos de transacciones</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="main-cards">
                    {categories.slice(0, 4).map((category) => (
                        <CategoryCard
                            key={category.id}
                            category={category}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            isDeleting={isDeleting}
                        />
                    ))}
                </div>
            </div>

            {/* Sección 2: Otras tarjetas */}
            <div className="other-cards">
                {categories.slice(4).map((category) => (
                    <CategoryCard
                        key={category.id}
                        category={category}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        isDeleting={isDeleting}
                    />
                ))}
            </div>
        </div>
    );
};

export default CategoriesGrid;