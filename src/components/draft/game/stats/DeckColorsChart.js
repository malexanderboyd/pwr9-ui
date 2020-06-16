import React from "react"
import PieChart from "../../common/PieChart"
import {Container} from "semantic-ui-react"

const DeckColorsChart = (props) => {

    let {contents} = props
    if(!contents || contents.length === 0) {
        return <p>Waiting for cards...</p>
    }
    contents = contents || [];

    const data = {}

    for(let i = 0; i < contents.length; i++) {
        let content = contents[i];
        const colors = content["colors"]
        for(let j =0; j < colors.length; j++) {
            const color = colors[j];
            if(color.toLowerCase() in data) {
                data[color.toLowerCase()]+=1
            } else {
                data[color.toLowerCase()] = 1
            }
        }

    }

    const convertToLabel = (colorCode) => {
        switch (colorCode) {
            case 'u':
                return 'Blue'
            case 'r':
                return 'Red'
            case 'w':
                return 'White'
            case 'b':
                return 'Black'
            case 'g':
                return 'Green'
            default:
                return 'Hybrid'
        }

    }

    const graphData = []
    let ks = Object.keys(data)
    for(let i = 0; i <ks.length; i++) {
        let k = ks[i]
        const label = convertToLabel(k)
        graphData.push(
            { label: label, id: label, value: data[k] }
        )
    }

    const availableDefs = [
        {
            id: 'transparentDots',
            type: 'patternDots',
            background: 'inherit',
            color: 'rgba(255, 255, 255, 0.3)',
            size: 4,
            padding: 1,
            stagger: true
        },
        {
            id: 'greenDots',
            type: 'patternDots',
            background: 'green',
            color: 'rgba(255, 255, 255, 0.3)',
            size: 4,
            padding: 1,
            stagger: true
        },
        {
            id: 'blueDots',
            type: 'patternDots',
            background: "hsla(186, 100%, 50%, 0.5)",
            color: 'rgba(255, 255, 255, 0.3)',
            rotation: -45,
            lineWidth: 6,
            spacing: 10
        },
        {
            id: 'redLines',
            type: 'patternLines',
            background: 'red',
            color: 'rgba(255, 255, 255, 0.3)',
            rotation: -45,
            lineWidth: 6,
            spacing: 10
        },
        {
            id: 'whiteDots',
            type: 'patternDots',
            background: 'white',
            color: 'rgba(255, 255, 255, 0.3)',
            rotation: -45,
            lineWidth: 6,
            spacing: 10
        },
        {
            id: 'blackLines',
            type: 'patternLines',
            background: 'black',
            color: 'rgba(255, 255, 255, 0.3)',
            rotation: -45,
            lineWidth: 6,
            spacing: 10
        },
    ]


    return (
        <Container style={{height: "200px"}}>
                    <PieChart
                        data={graphData}
                        defs={availableDefs}
                        fill={[
                            {
                                match: {
                                    id: 'Black'
                                },
                                id: 'blackLines',
                            },
                            {
                                match: {
                                    id: 'Green'
                                },
                                id: 'greenDots',
                            },
                            {
                                match: {
                                    id: 'Red'
                                },
                                id: 'redLines'
                            },
                            {
                                match: {
                                    id: 'White'
                                },
                                id: 'whiteDots'
                            },
                            {
                                match: {
                                    id: 'Blue'
                                },
                                id: 'blueDots'
                            },
                        ]}
                    />
                </Container>
    )
}

export default DeckColorsChart;