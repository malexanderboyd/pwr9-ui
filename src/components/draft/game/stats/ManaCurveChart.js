import React from "react"
import BarChart from "../../common/BarChart"

const ManaCurveChart = (props) => {

    const {contents} = props
    if(!contents || contents.length === 0) {
        return <p>Waiting for cards...</p>
    }

    const data = {}

    for(let i = 0; i < contents.length; i++) {
        let content = contents[i];
        const cost = content["convertedManaCost"]
        if(cost.toString() in data) {
            data[cost.toString()]+=1
        } else {
            data[cost.toString()] = 1
        }
    }

    const graphData = []
    let ks = Object.keys(data)
    for(let i = 0; i <ks.length; i++) {
        let k = ks[i]
        graphData.push(
            { cost: k, count: data[k] }
        )
    }


    return (
        <div style={{height: "200px"}}>
                    <BarChart
                        keys={["count", ]}
                        index="cost"
                        colors={"accent"}
                        colorBy={"index"}
                        axisLeftLabel="No. Cards"
                        axisBottomLabel="Converted Mana Cost"
                        data={graphData}
                    />
                </div>
    )
}

export default ManaCurveChart;