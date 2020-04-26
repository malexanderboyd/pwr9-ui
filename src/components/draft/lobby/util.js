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


export {
    GameModesEnum,
    GameTypesEnum,
    JSONFormError,
    fetchToJson
}