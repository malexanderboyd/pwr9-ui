import Select from "react-select"
import {DraftLobbyReducerActions} from "./DraftLobbyReducer"
import React from "react"
import {GameModesEnum, GameTypesEnum} from "./util"

const GameModeCube = ({store, dispatch}) => {
    const gameType = store.gameType;
    let {presetCubes} = store
    let cardsPerPlayer, totalPacks, cardsPerPack = null;
    let cubeList = ""
    if (gameType === GameTypesEnum.draft) {
        const gameOptions = store.gameOptions[gameType][GameModesEnum.cube];
        totalPacks = gameOptions.totalPacks
        cardsPerPack = gameOptions.cardsPerPack
        cubeList = gameOptions.cubeList
    } else {
        const gameOptions = store.gameOptions[gameType][GameModesEnum.cube];
        cardsPerPlayer = gameOptions.cardsPerPlayer
        cubeList = gameOptions.cubeList
    }
    presetCubes = presetCubes ? presetCubes : []
    let cubeOptions = [];

    let availableCubes = {}
    availableCubes.label = 'Available'
    availableCubes.options = []
    let comingSoonCubes = {}
    comingSoonCubes.label = "Coming Soon"
    comingSoonCubes.options = []

    Object.keys(presetCubes).forEach(key => {
        if (presetCubes[key].toLocaleLowerCase() === "coming soon!") {
            comingSoonCubes.options.push({value: key, label: key})
        } else {
            availableCubes.options.push({value: key, label: key})
        }

    })

    const presetCubeOptions = [availableCubes, comingSoonCubes]

    const totalCubeCards = cubeList ? cubeList.split('\n').length : 0
    switch (gameType) {
        case GameTypesEnum.sealed:
            const cardsPerPlayerOptions = Array.from({length: 106}, (v, k) => ({
                value: k + 15,
                label: (k + 15).toString()
            })).reverse();
            cubeOptions = (
                <div>
                    <Select name={`cards-per-player`} key={`cards-per-player`} options={cardsPerPlayerOptions}
                            placeholder={`Cards per player`}
                            defaultValue={{label: cardsPerPlayer, value: cardsPerPlayer}}
                            onChange={(v) => dispatch({
                                value: v.value,
                                key: "cardsPerPlayer",
                                type: DraftLobbyReducerActions.GAME_OPTION_UPDATE
                            })}
                            isSearchable={true}/> cards per player
                    <p>Total Cards: {totalCubeCards}</p>
                </div>
            )
            break
        case GameTypesEnum.draft:
            const cardsSelectOptions = Array.from({length: 8}, (v, k) => ({
                value: k + 8,
                label: (k + 8).toString()
            })).reverse();

            const packsSelectOptions = Array.from({length: 10}, (v, k) => ({
                value: k + 3,
                label: (k + 3).toString()
            })).reverse();

            let cardRequire
            if (isNaN(store.totalPlayers)) {
                cardRequire = <span/>
            } else {
                const cubeDiff = totalCubeCards - totalPacks * cardsPerPack * store.totalPlayers

                if (cubeDiff > 0) {
                    cardRequire = <span style={{color: 'green'}}>(+{cubeDiff})</span>
                } else {
                    cardRequire = <span style={{color: 'red'}}>({cubeDiff})</span>
                }
            }


            const info_blurb = (
                <div>
                    <p>Info: {totalPacks} packs with {cardsPerPack} cards from a pool
                        of {totalCubeCards} cards</p>
                    <p>Required Cards: {totalPacks * cardsPerPack} per player {cardRequire}</p>
                </div>
            )

            cubeOptions = (
                <div>
                    <Select name={`cards`} key={`cards`} options={cardsSelectOptions} placeholder={`Cards per pack`}
                            defaultValue={{label: cardsPerPack, value: cardsPerPack}}
                            onChange={(v) => dispatch({
                                value: v.value,
                                key: "cardsPerPack",
                                type: DraftLobbyReducerActions.GAME_OPTION_UPDATE
                            })}
                            isSearchable={true}/> cards
                    <Select name={`packs`} key={`packs`} options={packsSelectOptions} placeholder={`Packs per round`}
                            defaultValue={{label: totalPacks, value: totalPacks}}
                            onChange={(v) => dispatch({
                                value: v.value,
                                key: "totalPacks",
                                type: DraftLobbyReducerActions.GAME_OPTION_UPDATE
                            })}
                            isSearchable={true}/> packs
                    {info_blurb}
                </div>
            )
            break
        default:
            return <div/>
    }

    return (
        <div>
            <textarea
                style={{height: "150px"}}
                onChange={(e) => {
                    dispatch({
                        value: e.currentTarget.value,
                        key: "cubeList",
                        type: DraftLobbyReducerActions.GAME_OPTION_UPDATE
                    })
                }}
                value={cubeList}
            />
            <Select name={`cube-preset`} key={`cube-preset`} options={presetCubeOptions}
                    onChange={(v) => {
                        dispatch({
                            value: presetCubes[v.value],
                            key: "cubeList",
                            type: DraftLobbyReducerActions.GAME_OPTION_UPDATE
                        })
                    }}
                    placeholder={`Preset Cubes`}
                    isSearchable={true}/>
            <p/>
            {cubeOptions}
        </div>
    )
}

export default GameModeCube