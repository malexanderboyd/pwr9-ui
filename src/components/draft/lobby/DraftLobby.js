import './DraftLobby.css';

import React, {Fragment, Suspense, useReducer} from 'react';

import {reducer, initialState, DraftLobbyReducerActions} from "./DraftLobbyReducer";
import Select from 'react-select'
import useSWR from 'swr'


// const Sets = ({ sets, type }) => (
//     sets
//         .map((set, i) => <Set type={type} selectedSet={set} index={i} key={i} />)
// );

const fetchToJson = url => fetch(url).then(_ => _.json())

const JSONErrorDiv = (error) => {
    return <div>Failed loading data: {JSON.stringify(error)}</div>
}

const Regular = ({store, dispatch, sets, gameType}) => {
    const {totalPacks, selectedPacks} = store.gameOptions[gameType][GameModesEnum.regular];

    // TODO: Need to clear selections after each gameType switch to prevent extras from sticking around

    const packOptions = Array.from({length: 10}, (v, k) => ({value: k + 3, label: (k + 3).toString()}));

    const packSelectors = Array.from({length: totalPacks}, (x, i) => {

        console.log(x, i);

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
            <div>
                Number of packs:{" "}
                <Select name="totalPacksSelector" options={packOptions}
                        value={{value: totalPacks, label: totalPacks}}
                        onChange={(v) => dispatch({
                            value: v.value,
                            key: "totalPacks",
                            type: DraftLobbyReducerActions.GAME_OPTION_UPDATE
                        })}
                        defaultValue={{value: totalPacks, label: totalPacks}}
                />
            </div>
            <div className="wrapper">
                <hr/>
                {packSelectors}
            </div>
        </Fragment>
    );
}

const GameTypesEnum = Object.freeze({"draft": 1, "sealed": 2})
const GameModesEnum = Object.freeze({"regular": 1, "cube": 2, "chaos": 3})

const GameTypes = ({store, dispatch}) => {
    const types = Object.keys(GameTypesEnum);
    const gameModes = Object.keys(GameModesEnum);

    let GameType = store.gameType;
    let GameMode = store.gameMode;


    return (
        <div>
            <p>Game mode:{" "}
                <span className='connected-container'>
          {gameModes.map((mode, val) =>
              <label key={`${mode}-${val}`}>
                  <input name="subtype"
                         key={`${mode}-${val}`}
                         type="radio"
                         value={mode}
                         onChange={() => {
                             dispatch({gameMode: GameModesEnum[mode], type: DraftLobbyReducerActions.GAME_MODE});
                         }}/>
                  {mode.replace(/\b[a-z]/g, (x) => x.toLocaleUpperCase())}
              </label>
          )}
        </span>
            </p>
            <p>Game type:{" "}
                <span className='connected-container'>
          {types.map((type, val) =>
              <label key={`${type}-${val}`}>
                  <input name="type"
                         key={`${type}-${val}`}
                         type="radio"
                         value={type}
                         onChange={() => {
                             dispatch({gameType: GameTypesEnum[type], type: DraftLobbyReducerActions.GAME_TYPE});
                             console.log(`Active Type`, type);
                         }}/>
                  {type.replace(/\b[a-z]/g, (x) => x.toLocaleUpperCase())}
              </label>
          )}
        </span>
            </p>
            <div>
                <GameModePanel store={store} dispatch={dispatch} gameMode={GameMode} gameType={GameType}/>
            </div>
        </div>
    );
};

const Cube = ({store, dispatch, gameType}) => {

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

const Chaos = ({store, dispatch, gameType}) => {
    let {totalPacks, totalChaos, onlyModern} = store.gameOptions[gameType][GameModesEnum.chaos];

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

const GameModePanel = ({store, dispatch, gameMode, gameType}) => {
    const {data: cubeData, error: cubeError} = useSWR('http://localhost:8000/cubes', fetchToJson, {revalidateOnFocus: false});
    const {data: returnedSets, error: setsError} = useSWR('http://localhost:8000/sets', fetchToJson, {revalidateOnFocus: false});

    if (cubeError || setsError) {
        return <JSONErrorDiv error={cubeError}/>
    }

    if (!cubeData && !returnedSets) {
        return (
            <div>Loading...</div>
        )
    }

    if (!gameType) {
        return (
            <div/>
        )
    }
    if (store.presetCubes == null && cubeData != null) {
        dispatch({type: DraftLobbyReducerActions.PRESET_CUBES, presetCubes: cubeData})
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
                    {value: set.id, label: set.name}
                )
            }
            availableSets.push(currentBlock)
        }
    }

    switch (gameMode) {
        case GameModesEnum.chaos:
            return <Chaos store={store} dispatch={dispatch} gameType={gameType}/>
        case GameModesEnum.cube:
            return <Cube store={store} dispatch={dispatch} gameType={gameType}/>
        case GameModesEnum.regular:
            return <Regular store={store} dispatch={dispatch} gameType={gameType} sets={availableSets}/>
        default:
            return <p>Loading...</p>
    }
}

const CreateDraftPanel = () => {

    const [store, dispatch] = useReducer(reducer, initialState)


    return (
        <fieldset className='fieldset'>
            <legend className='legend'>
                Create a Room
            </legend>
            <div>
                <label>
                    Game title:{" "}
                    <input type='text'
                           onChange={(e) => {
                               dispatch({gameTitle: e.currentTarget.value, type: DraftLobbyReducerActions.GAME_TITLE});
                           }}
                    />
                </label>
            </div>
            <div>
                Number of players:{" "}
                <input type='number'
                       min="1"
                       max="100"
                       onChange={(e) => {
                           dispatch({
                               totalPlayers: parseInt(e.currentTarget.value),
                               type: DraftLobbyReducerActions.TOTAL_PLAYERS
                           })
                       }}
                />
            </div>
            <div>
                <label>
                    <input type="checkbox"
                           checked={store.privateGame}
                           onChange={(v) => {
                               dispatch({privateGame: !store.privateGame, type: DraftLobbyReducerActions.PRIVATE_GAME})
                           }}
                    />
                    Private Game
                </label>
            </div>
            <GameTypes store={store} dispatch={dispatch}/>
            <p>
                <button onClick={() => {

                    startGame({
                        gameTitle: store.gameTitle,
                        totalPlayers: store.totalPlayers,
                        privateGame: store.privateGame,
                        gameType: store.gameType,
                        gameMode: store.gameMode,
                        options: store.gameOptions[store.gameType][store.gameMode]
                    })

                }}>
                    Create room
                </button>
            </p>
        </fieldset>
    )
}

const startGame = (gameSettings) => {
    fetch('http://localhost:8000/game', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(gameSettings)
    })
        .then((res) => res.json())
        .then((response) => {
            window.location.href = response.url;
        });
}

const Lobby = () => {
    return (
        <div className="routeContainer">
            <header className="draftHeader">
                <h2>Pwr9 Draft</h2>
                <p>0 total players on 0 instances of godr4ft</p>
            </header>
            <CreateDraftPanel/>
        </div>
    )
}

function DraftLobby() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Lobby/>
        </Suspense>
    );
}

export default DraftLobby;
