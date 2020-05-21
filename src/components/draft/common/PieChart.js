import React from 'react'
import {ResponsiveBar, ResponsivePie} from 'nivo'
// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
const PieChart = ({ data, fill, defs /* see data tab */ }) => {

return (
    <ResponsivePie
        data={data}
        margin={{
            top: 36,
            right: 32,
            bottom: 36,
            left: 32
        }}
        fit={true}
        fill={fill}
        borderWidth={1}
        animate={true}
        defs={defs}
        legends={[
            {
                anchor: 'bottom',
                direction: 'row',
                itemTextColor: '#999',
                symbolSize: 12,
                symbolShape: 'circle',
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemTextColor: '#000'
                        }
                    }
                ]
            }
        ]}
    />
)

}
export default PieChart