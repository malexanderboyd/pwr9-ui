import useSWR from "swr"
import {DraftLobbyReducerActions} from "./DraftLobbyReducer"
import React, {useEffect} from "react"
import {GameModesEnum, JSONFormError, fetchToJson} from "./util"
import GameModeChaos from "./GameModeChaos"
import GameModeCube from "./GameModeCube"
import GameModeRegular from "./GameModeRegular"
import {Dimmer} from "semantic-ui-react"

const GameModePanel = ({store, dispatch}) => {
    const {data: cubeData, error: cubeError} = useSWR('http://localhost:80/api/cubes', fetchToJson, {revalidateOnFocus: false});
    const {data: returnedSets, error: setsError} = useSWR('http://localhost:80/api/sets', fetchToJson, {revalidateOnFocus: false});

    useEffect(() => {
        if (store.presetCubes == null && cubeData != null) {
            dispatch({type: DraftLobbyReducerActions.PRESET_CUBES, presetCubes: cubeData})
        }
    })

    if (cubeError || setsError) {
        return <JSONFormError error={cubeError}/>
    }

    if (!cubeData && !returnedSets) {
        return (
            <div>Loading...</div>
        )
    }

    if (!store.gameType) {
        return (
            <div/>
        )
    }

    const availableSets = []

    for (let mtgBlockName in returnedSets) {
        if (returnedSets.hasOwnProperty(mtgBlockName)) {
            const currentBlock = {}
            const blockSets = returnedSets[mtgBlockName];
            currentBlock.label = mtgBlockName
            currentBlock.options = []
            for (let i = 0; i < blockSets.length; i++) {
                const set = blockSets[i];
                currentBlock.options.push(
                    {value: set.code, label: set.name}
                )
            }
            availableSets.push(currentBlock)
        }
    }

    switch (store.gameMode) {
        case GameModesEnum.chaos:
            return <GameModeChaos store={store} dispatch={dispatch}/>
        case GameModesEnum.cube:
            return <GameModeCube store={store} dispatch={dispatch}/>
        case GameModesEnum.regular:
            return <GameModeRegular store={store} dispatch={dispatch} sets={availableSets}/>
        default:
            return <Dimmer active/>
    }
}

export default GameModePanel