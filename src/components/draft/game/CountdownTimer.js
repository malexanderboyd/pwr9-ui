import React, {useState, useEffect, useRef, useReducer} from 'react'
import {Statistic} from "semantic-ui-react"

const CountdownTimer = ({timerSettings, setTimeUp}) => {
    let {seconds} = timerSettings
    const [timeLeft, setTimeLeft] = useState(seconds)
    let redPhaseStart, yellowPhaseStart;
    yellowPhaseStart = Math.floor(seconds * .50)
    redPhaseStart = Math.floor(seconds * .25)

    // [CountdownTimerComponent] useEffect seconds: 5 CountdownTimer.js:15:16
    // received timer seconds for next round 3 DraftGame.js:205:28
    // create new timer at 3 DeckList.js:383:20
    // [CountdownTimerComponent] useEffect seconds: 3 CountdownTimer.js:15:16
    // received timer seconds for next round 3 6 DraftGame.js:205:28

    useEffect(() => {
        setTimeUp(false)
        // we wrap this in an object so useState will update if the previous seconds == this seconds
        let {seconds} = timerSettings
        yellowPhaseStart = Math.floor(seconds * .50)
        redPhaseStart = Math.floor(seconds * .25)
        setTimeLeft(seconds)
        console.log("[CountdownTimerComponent] useEffect seconds: " + seconds)
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