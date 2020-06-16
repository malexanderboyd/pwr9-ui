import React, {useState, useEffect, useRef, useReducer} from 'react'
import {Statistic} from "semantic-ui-react"

const CountdownTimer = ({seconds, setTimeUp}) => {
    const [timeLeft, setTimeLeft] = useState(seconds)
    let redPhaseStart, yellowPhaseStart;
    yellowPhaseStart = Math.floor(seconds * .50)
    redPhaseStart = Math.floor(seconds * .25)

    useEffect(() => {
        setTimeUp(false)
        yellowPhaseStart = Math.floor(seconds * .50)
        redPhaseStart = Math.floor(seconds * .25)
        setTimeLeft(seconds)
    }, [seconds])

    useEffect(() => {
        if (!timeLeft) {
            setTimeUp(true)
            return
        }


        const intervalID = setTimeout(() => {
            setTimeLeft(timeLeft - 1)
        }, 1000)

        return () => clearInterval(intervalID)
    }, [timeLeft])

    if (!seconds || !setTimeUp) {
        return <div/>
    }

    let component;

    if (timeLeft > redPhaseStart && timeLeft <= yellowPhaseStart) {
        component = (
            <Statistic color='yellow'>
                <Statistic.Value>{timeLeft}</Statistic.Value>
                <Statistic.Label>Seconds Remaining</Statistic.Label>
            </Statistic>
        )
    } else if (timeLeft <= redPhaseStart) {
        component = (
            <Statistic color='red'>
                <Statistic.Value>{timeLeft}</Statistic.Value>
                <Statistic.Label>Seconds Remaining</Statistic.Label>
            </Statistic>
        )
    } else {
        component = (
            <Statistic color='green'>
                <Statistic.Value>{timeLeft}</Statistic.Value>
                <Statistic.Label>Seconds Remaining</Statistic.Label>
            </Statistic>
        )
    }

    return component
}

export default CountdownTimer