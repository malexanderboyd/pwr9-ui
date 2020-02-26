import React, {useState, useEffect, useRef, useReducer} from 'react'
import {Statistic} from "semantic-ui-react"

const Timer = (props) => {

    const {setTimeUp, TimeInSeconds} = props

    const reducer = (state, action) => {
        if(action.type === "tick") {
            return state - 1
        } else {
            throw new Error(`unknown action type: ${action.type}`)
        }
    }

    const [TimeLeft, dispatch] = useReducer(reducer, TimeInSeconds)

    let redPhaseStart, yellowPhaseStart;

    yellowPhaseStart = Math.floor(TimeInSeconds * .50)
    redPhaseStart = Math.floor(TimeInSeconds * .25)

    useEffect(() => {
        const id = setTimeout(() => dispatch({type: 'tick'}), 1000)
        return () => clearInterval(id)
    })

    if(TimeLeft === 0) {
        setTimeUp(true)
    }

    let component;

    if(TimeLeft <= yellowPhaseStart && TimeLeft > redPhaseStart) {
        component = (
            <Statistic color='yellow'>
                <Statistic.Value>{TimeLeft}</Statistic.Value>
                <Statistic.Label>Seconds Remaining</Statistic.Label>
            </Statistic>
        )
    } else if (TimeLeft <= redPhaseStart) {
        component = (
            <Statistic color='red'>
                <Statistic.Value>{TimeLeft}</Statistic.Value>
                <Statistic.Label>Seconds Remaining</Statistic.Label>
            </Statistic>
        )
    } else {
        component = (
            <Statistic color='green'>
                <Statistic.Value>{TimeLeft}</Statistic.Value>
                <Statistic.Label>Seconds Remaining</Statistic.Label>
            </Statistic>
        )
    }

    return component

}

export default Timer