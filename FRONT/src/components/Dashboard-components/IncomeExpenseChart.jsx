import React, { PureComponent } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Legend,
    CartesianGrid,
    Tooltip
} from 'recharts';

const COLORS = {
    income: 'rgb(16, 185, 129)',
    expense: 'rgb(239, 68, 68)',
};

export default class IncomeExpenseChart extends PureComponent {
    render() {
        const {
            data = [],
            selectedMonth = "",
            selectedYear = "",
        } = this.props;

        // Determinar si los datos son mensuales o anuales
        const isMonthlyData = data.length > 0 && data[0].hasOwnProperty('day');
        const timeRange = isMonthlyData ? 'daily' : 'monthly';
        let chartData = [];

        if (isMonthlyData) {
            const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

            chartData = Array.from({ length: daysInMonth }, (_, i) => {
                const dayNumber = i + 1;
                const dayEntry = data.find(d => d.day === dayNumber) || {};
                return {
                    name: dayNumber.toString(), // Mostrar número de día como string
                    income: dayEntry.income || 0,
                    expense: dayEntry.expense || 0,
                    year: selectedYear
                };
            });
        } else {
            // Datos mensuales
            chartData = Array.from({ length: 12 }, (_, i) => {
                const monthNumber = i + 1;
                const monthEntry = data.find(d => d.month === monthNumber) || {};
                const monthName = new Date(selectedYear, i, 1).toLocaleString('es-ES', { month: 'short' });
                return {
                    name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
                    income: monthEntry.income || 0,
                    expense: monthEntry.expense || 0,
                    year: selectedYear
                };
            });
        }

        return (
            <div className="chart-container" style={{ width: '100%', height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        layout="horizontal"
                        barCategoryGap={4}  // Espacio entre categorías (días)
                        barGap={2}          // Espacio entre barras (ingreso/gasto)
                        margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <YAxis
                            type="number"
                            axisLine={false}
                            tickFormatter={(value) => `$${value.toLocaleString()}`}
                        />
                        <XAxis
                            dataKey="name"
                            type="category"
                            width={timeRange === 'monthly' ? 80 : 60}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            formatter={(value, name, props) => [
                                `$${value.toLocaleString()}`,
                                name === 'Ingresos' ? 'Ingresos' : 'Gastos'
                            ]}
                            labelFormatter={label =>
                                timeRange === 'monthly'
                                    ? `${label} ${selectedYear}`
                                    : `Día ${label} de ${new Date(selectedYear, selectedMonth - 1, 1).toLocaleString('es-ES', { month: 'long' })} ${selectedYear}`
                            }
                            contentStyle={{
                                backgroundColor: 'rgb(9, 9, 11)',
                                borderColor: 'rgb(39, 39, 42)',
                                borderRadius: '6px',
                                color: '#fff'
                            }}
                            itemStyle={{
                                color: '#f3f4f6'
                            }}
                            labelStyle={{
                                color: '#f3f4f6',
                                fontWeight: 'bold',
                                marginBottom: '4px'
                            }}
                        />
                        <Bar
                            dataKey="income"
                            name="Ingresos"
                            fill={COLORS.income}
                            radius={[4, 4, 0, 0]}
                            animationDuration={1500}
                        />
                        <Bar
                            dataKey="expense"
                            name="Gastos"
                            fill={COLORS.expense}
                            radius={[4, 4, 0, 0]}
                            animationDuration={1500}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    }
}