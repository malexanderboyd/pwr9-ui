import {Form} from "semantic-ui-react"
import {GameModesEnum, GameTypesEnum} from "./util"
import {DraftLobbyReducerActions} from "./DraftLobbyReducer"
import React, {useState} from "react"

const GameTypesRadio = ({store, dispatch}) => {
    const types = Object.keys(GameTypesEnum);
    let [selectedType, setSelectedType] = useState(store.gameType)

    return (
        <Form.Group inline widths="equal">
            <label>Game Type</label>
            {types.map((type, val) =>
                <Form.Radio
                    key={`${type}-${val}`}
                    value={type}
                    label={type.replace(/\b[a-z]/g, (x) => x.toLocaleUpperCase())}
                    checked={type === selectedType}
                    onChange={() => {
                        dispatch({gameType: GameTypesEnum[type], type: DraftLobbyReducerActions.GAME_TYPE});
                        setSelectedType(type)
                    }}
                />
            )}
        </Form.Group>
    )
}

export default GameTypesRadio