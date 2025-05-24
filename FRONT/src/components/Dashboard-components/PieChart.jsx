import { PureComponent } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default class CustomPieChart extends PureComponent {
    renderCustomizedLabel = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent,
        index
    }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 1.8;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="#fff"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={12}
                fontWeight="bold"
                stroke="#333"
                strokeWidth={0.5}
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    render() {
        // Extraemos las props necesarias
        const {
            data = [],
            width = '100%',
            height = 400,
            currency = '€',
        } = this.props;

        // Safely transform data
        const chartData = Array.isArray(data)
            ? data.map(item => ({
                name: item?.category || 'Unknown',
                value: item?.amount || 0,
                color: item?.color || '#8884d8'
            }))
            : [];

        const total = chartData.reduce((sum, item) => sum + item.value, 0);

        return (
            <div style={{
                width: '100%',
                height: '100%',
                minHeight: '300px',
            }}>
                <ResponsiveContainer width={width} height={height}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius="60%"
                            outerRadius="80%"
                            paddingAngle={2}
                            dataKey="value"
                            label={this.renderCustomizedLabel}
                            labelLine={false}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}  // Usamos el color de la categoría
                                    stroke="#fff"
                                    strokeWidth={1}
                                />
                            ))}
                        </Pie>
                        <text
                            x="50%"
                            y="50%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            style={{
                                fontSize: '24px',
                                fontWeight: 'bold',
                                fill: '#fff',
                            }}
                        >
                            {total.toLocaleString() + ' ' + currency}
                        </text>
                        <Tooltip
                            formatter={(value, name) => [
                                `${value.toLocaleString()}${currency} (${((value / total) * 100).toFixed(1)}%)`,
                                name
                            ]}
                            contentStyle={{
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                border: 'none',
                                borderRadius: '5px',
                                color: '#fff'
                            }}
                            itemStyle={{ color: '#fff' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        );
    }
}