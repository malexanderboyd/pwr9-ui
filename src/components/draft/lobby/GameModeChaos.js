import Select from "react-select"
import {DraftLobbyReducerActions} from "./DraftLobbyReducer"
import React from "react"
import {GameModesEnum} from "./util"

const GameModeChaos = ({store, dispatch}) => {
    let {totalPacks, totalChaos, onlyModern} = store.gameOptions[store.gameType][GameModesEnum.chaos];

    const packOptions = Array.from({length: 10}, (v, k) => ({value: k + 3, label: (k + 3).toString()}));
    return (
        <div>
            <div>
                Number of packs:
                <Select name="totalPackSelector" options={packOptions}
                        value={{value: totalPacks, label: totalPacks}}
                        onChange={(v) => dispatch({
                            value: v.value,
                            key: "totalPacks",
                            type: DraftLobbyReducerActions.GAME_OPTION_UPDATE
                        })}
                        defaultValue={{value: totalPacks, label: totalPacks}}
                />
                <label>
                    <input type="checkbox"
                           checked={onlyModern}
                           onChange={(v) => {
                               dispatch({
                                   value: !onlyModern,
                                   key: "onlyModern",
                                   type: DraftLobbyReducerActions.GAME_OPTION_UPDATE
                               })
                           }}
                    />
                    Only Modern Sets
                </label>

                <label>
                    <input type="checkbox"
                           checked={totalChaos}
                           onChange={(v) => dispatch({
                               value: !totalChaos,
                               key: "totalChaos",
                               type: DraftLobbyReducerActions.GAME_OPTION_UPDATE
                           })}
                    />
                    Total Chaos
                </label>

            </div>

        </div>
    )
}

export default GameModeChaos