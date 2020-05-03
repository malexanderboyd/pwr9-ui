import React from "react"
import {Message} from "semantic-ui-react"

const GameTypesEnum = Object.freeze({"draft": 1, "sealed": 2})
const GameModesEnum = Object.freeze({"regular": 1, "cube": 2, "chaos": 3})

const JSONFormError = (error) => {
    return (
        <Message
            error
            header='A pesky elf has stolen what you were looking for!'
            content={JSON.stringify(error)}
        />
    )
}

const fetchToJson = url => fetch(url).then(_ => _.json())

const gameModeFromGameInfo = (gameInfo) => {
    switch (gameInfo["gameMode"]) {
        case GameModesEnum.chaos:
            return "chaos"
        case GameModesEnum.cube:
            return "cube"
        default:
            return "regular"
    }
}

const gameTypeFromGameInfo = (gameInfo) => {
    switch (gameInfo["gameType"]) {
        case GameTypesEnum.sealed:
            return "sealed"
        default:
            return "draft"
    }
}
const TimerOptions =  [{
    key: 'leisurely',
    text: 'Leisurely - Starts @ 90s and decrements by 5s per pick',
    value: 'leisurely',
},
    {
        key: 'slow',
        text: 'Slow - Starts @ 75s and decrements by 5s per pick',
        value: 'slow',
    },
    {
        key: 'moderate',
        text: 'Moderate - Starts @ 55s A happy medium between slow, and fast.',
        value: 'moderate',
    },
    {
        key: 'fast',
        text: 'Fast - Starts @ 40s, based on official WOTC timing',
        value: 'fast',
    },
]


export {
    GameModesEnum,
    GameTypesEnum,
    TimerOptions,
    JSONFormError,
    fetchToJson,
    gameModeFromGameInfo,
    gameTypeFromGameInfo
}