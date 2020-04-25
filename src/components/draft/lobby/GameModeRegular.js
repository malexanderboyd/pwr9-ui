import Select from "react-select"
import {DraftLobbyReducerActions} from "./DraftLobbyReducer"
import React, {Fragment} from "react"
import {GameModesEnum} from "./util"
import {Form, Dropdown, Segment} from "semantic-ui-react"

const GameModeRegular = ({store, dispatch, sets}) => {
    const gameType = store.gameType;
    const {totalPacks, selectedPacks} = store.gameOptions[gameType][GameModesEnum.regular];

    // TODO: Need to clear selections after each gameType switch to prevent extras from sticking around

    const packOptions = Array.from({length: 10}, (v, k) => ({value: k + 3, label: (k + 3).toString()}));

    const packSelectors = Array.from({length: totalPacks}, (x, i) => {
        return (
            <Select name={`packSelector-${i}`} key={`packSelector-${gameType}-${i}`} options={sets}
                    onChange={((v) => {
                        selectedPacks[i] = v.value
                        dispatch({
                            value: selectedPacks,
                            key: "selectedPacks",
                            type: DraftLobbyReducerActions.GAME_OPTION_UPDATE
                        })
                    })}
                    isSearchable={true}/>
        );
    })

    return (
        <Fragment>
        <Form.Group>
            <Form.Select
                fluid
                options={Array(12).fill().map((_, i) => {
                    return {key: i + 1, text: i + 1, value: i + 1}
                })}
                onChange={(event, data) => {
                    dispatch({
                        value: data.value,
                        key: "totalPacks",
                        type: DraftLobbyReducerActions.GAME_OPTION_UPDATE
                    })
                }}
                defaultValue={3}
                label="Number of Packs"/>
        </Form.Group>
            <Segment.Group>
                {packSelectors}
            </Segment.Group>
        </Fragment>
    )
}

export default GameModeRegular

