import React, { PureComponent } from 'react';
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
        const {
            data = [
                { name: 'Group A', value: 400 },
                { name: 'Group B', value: 300 },
                { name: 'Group C', value: 300 },
                { name: 'Group D', value: 200 },
            ],
            width = '100%',
            height = 400,
            colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'],
        } = this.props;

        const total = data.reduce((sum, item) => sum + item.value, 0);

        return (
            <div style={{ 
                width: '100%', 
                height: '100%',
                minHeight: '300px',
            }}>
                <ResponsiveContainer width={width} height={height}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius="60%"
                            outerRadius="80%"
                            paddingAngle={2}
                            dataKey="value"
                            label={this.renderCustomizedLabel}
                            labelLine={false}
                        >
                            {data.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={colors[index % colors.length]} 
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
                            {total.toLocaleString() + ' €'}
                        </text>
                        <Tooltip 
                            formatter={(value, name) => [
                                `${value + "€"} (${((value / total) * 100).toFixed(1)}%)`, 
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