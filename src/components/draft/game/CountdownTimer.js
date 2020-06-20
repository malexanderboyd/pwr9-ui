import React, {useState, useEffect, useRef, useReducer} from 'react'
import {Statistic} from "semantic-ui-react"

const CountdownTimer = ({timerSettings, setTimeUp}) => {
    let {seconds} = timerSettings
    const [timeLeft, setTimeLeft] = useState(seconds)
    let redPhaseStart, yellowPhaseStart;
    yellowPhaseStart = Math.floor(seconds * .50)
    redPhaseStart = Math.floor(seconds * .25)

    useEffect(() => {
        setTimeUp(false)
        // we wrap this in an object so useState will update if the previous seconds == this seconds
        let {seconds} = timerSettings
        yellowPhaseStart = Math.floor(seconds * .50)
        redPhaseStart = Math.floor(seconds * .25)
        setTimeLeft(seconds)
    }, [timerSettings])

    useEffect(() => {
        if (!timeLeft) {
            setTimeUp(true)
            return () => {}
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