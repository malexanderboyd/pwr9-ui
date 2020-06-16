import React, {useState, useEffect, useRef, useReducer} from 'react'
import {Statistic} from "semantic-ui-react"

// const Timer = (props) => {
//
//     const {TimeInSeconds, setTimeUp} = props
//
//     const reducer = (state, action) => {
//         if(action.type === "tick") {
//             console.log("tick")
//             return state - 1
//         } else {
//             throw new Error(`unknown action type: ${action.type}`)
//         }
//     }
//
//     const [TimeLeft, dispatch] = useReducer(reducer, TimeInSeconds)
//
//     let redPhaseStart, yellowPhaseStart;
//
//     yellowPhaseStart = Math.floor(TimeInSeconds * .50)
//     redPhaseStart = Math.floor(TimeInSeconds * .25)
//
//     useEffect(() => {
//         const id = setTimeout(() => dispatch({type: 'tick'}), 1000)
//         return () => clearInterval(id)
//     })
//
//     console.log("Time Left: " + TimeLeft)
//     console.log("Time Left2: " + TimeInSeconds)
//
//     if (TimeLeft == null) {
//         return <div/>
//     }
//
//     if(TimeLeft <= 0) {
//         setTimeUp(true)
//         return (
//             <Statistic>
//                 <Statistic.Value>Times up!</Statistic.Value>
//             </Statistic>
//         )
//     }
//
//     let component;
//
//     if(TimeLeft > redPhaseStart && TimeLeft <= yellowPhaseStart) {
//         component = (
//             <Statistic color='yellow'>
//                 <Statistic.Value>{TimeLeft}</Statistic.Value>
//                 <Statistic.Label>Seconds Remaining</Statistic.Label>
//             </Statistic>
//         )
//     } else if (TimeLeft <= redPhaseStart) {
//         component = (
//             <Statistic color='red'>
//                 <Statistic.Value>{TimeLeft}</Statistic.Value>
//                 <Statistic.Label>Seconds Remaining</Statistic.Label>
//             </Statistic>
//         )
//     } else {
//         component = (
//             <Statistic color='green'>
//                 <Statistic.Value>{TimeLeft}</Statistic.Value>
//                 <Statistic.Label>Seconds Remaining</Statistic.Label>
//             </Statistic>
//         )
//     }
//
//     return component
//
// }

const Timer = (props) => {
    const [seconds, setSeconds] = useState(0)
    const [isActive, setIsActive] = useState(false)
    const {setTimeUp, TimeInSeconds} = props

    const toggle = () => {
        setIsActive(!isActive)
    }

    const reset = (seconds) => {
        setSeconds(seconds)
        setIsActive(true)
    }

    if (!isActive) {
        reset(TimeInSeconds)
    }

    useEffect(() => {
        let interval = null
        if (isActive) {
            interval = setInterval(() => {
                setSeconds(seconds => seconds - 1)
            }, 1000)
        } else if (isActive && seconds === 0) {
            setTimeUp(true)
            toggle()
        } else if (!isActive) {
            clearInterval(interval)
        }
        return () => clearInterval(interval)
    }, [isActive, seconds])


}


export default Timer