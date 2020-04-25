import {DraftLobbyReducerActions} from "./DraftLobbyReducer"
import React, {useState} from "react"
import {GameModesEnum, GameTypesEnum} from "./util"
import {Form} from "semantic-ui-react"


const GameModesRadio = ({store, dispatch}) => {
    const gameModes = Object.keys(GameModesEnum);

    let [selectedMode, setSelectedMode] = useState(store.gameMode)

    return (
        <Form.Group inline widths="equal">
            <label>Game Mode</label>
            {gameModes.map((mode, val) =>
                <Form.Radio
                    key={`${mode}-${val}`}
                    value={mode}
                    label={mode.replace(/\b[a-z]/g, (x) => x.toLocaleUpperCase())}
                    checked={mode === selectedMode}
                    onChange={() => {
                        dispatch({gameMode: GameModesEnum[mode], type: DraftLobbyReducerActions.GAME_MODE});
                        setSelectedMode(mode)
                    }}
                />
            )}
        </Form.Group>
    )
};

export default GameModesRadio