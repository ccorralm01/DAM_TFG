import React, { PureComponent } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList } from 'recharts';
import { motion } from "framer-motion";

const BAR_HEIGHT = 50;

export default class CustomBarChart extends PureComponent {
    render() {
        const {
            data = [],
            barColor = '#8884d8',
            borderColor = 'transparent',
            maxHeight = 400,
        } = this.props;

        const CHART_HEIGHT = data.length * BAR_HEIGHT;
        const dynamicFontSize = Math.min(16, Math.max(10, BAR_HEIGHT * 0.4));

        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                    maxHeight,
                    overflowY: 'auto',
                    width: '100%',
                    minHeight: Math.min(maxHeight, CHART_HEIGHT),
                }}
            >
                <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                    <BarChart
                        data={data}
                        layout="vertical"
                        barSize={BAR_HEIGHT * 0.4}
                        margin={{ right: 40, left: 60 }}
                    >
                        <XAxis type="number" axisLine={false} tick={false} />
                        <YAxis
                            dataKey="name"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: dynamicFontSize }}
                        />
                        <Bar
                            dataKey="uv"
                            fill={barColor}
                            stroke={borderColor}
                            radius={[0, 4, 4, 0]}
                            animationBegin={800} // Mayor delay para sincronizar con Framer Motion
                            animationDuration={1000}
                            animationEasing="ease-out"
                            isAnimationActive={true}
                        >
                            <LabelList
                                dataKey="uv"
                                position="insideRight"
                                fill="#fff"
                                style={{ fontSize: '12px' }}
                                formatter={(value) => value.toLocaleString()}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>
        );
    }
}