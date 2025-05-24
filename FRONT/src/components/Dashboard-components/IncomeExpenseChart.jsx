import { PureComponent } from 'react';
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
    state = {
        isMobile: typeof window !== 'undefined' && window.innerWidth < 768,
        containerWidth: '100%'
    };

    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
        this.calculateContainerWidth();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    handleResize = () => {
        this.setState({ 
            isMobile: window.innerWidth < 768 
        }, this.calculateContainerWidth);
    };

    calculateContainerWidth = () => {
        const { isMobile } = this.state;
        const { data = [] } = this.props;
        const isMonthlyData = data.length > 0 && data[0].hasOwnProperty('day');
        
        if (isMobile) {
            const itemCount = isMonthlyData ? 
                new Date(this.props.selectedYear, this.props.selectedMonth, 0).getDate() : 
                12;
            const minWidth = Math.max(itemCount * 30, window.innerWidth);
            this.setState({ containerWidth: `${minWidth}px` });
        } else {
            this.setState({ containerWidth: '100%' });
        }
    };

    render() {
        const {
            data = [],
            selectedMonth = "",
            selectedYear = "",
        } = this.props;

        const { isMobile, containerWidth } = this.state;

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
                    name: dayNumber.toString(),
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
            <div style={{ 
                width: '100%',
                height: isMobile ? '300px' : '400px',
                overflowX: 'auto',
                overflowY: 'hidden',
                WebkitOverflowScrolling: 'touch',
                msOverflowStyle: '-ms-autohiding-scrollbar'
            }}>
                <div style={{ 
                    width: containerWidth,
                    height: '100%',
                    minWidth: '100%'
                }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            layout="horizontal"
                            barCategoryGap={isMobile ? 2 : 4}
                            barGap={isMobile ? 1 : 2}
                            margin={{ 
                                top: 20, 
                                right: isMobile ? 10 : 20, 
                                left: isMobile ? 10 : 20, 
                                bottom: isMobile ? 5 : 20 
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <YAxis
                                type="number"
                                axisLine={false}
                                tickFormatter={(value) => `$${value.toLocaleString()}`}
                                tick={{ fontSize: isMobile ? 10 : 12 }}
                                width={isMobile ? 50 : 60}
                            />
                            <XAxis
                                dataKey="name"
                                type="category"
                                width={timeRange === 'monthly' ? 80 : 60}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: isMobile ? 10 : 12 }}
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
            </div>
        );
    }
}