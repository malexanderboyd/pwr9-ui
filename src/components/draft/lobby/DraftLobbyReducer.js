    const GameTypesEnum = Object.freeze({"draft": 1, "sealed": 2})
    const GameModesEnum = Object.freeze({"regular": 1, "cube": 2, "chaos": 3})

const initialState = {
    totalPlayers: null,
    gameTitle: "MTG Family Fun",
    privateGame: false,
    presetCubes: null,
    gameMode: GameTypesEnum.draft,
    gameType: GameTypesEnum.regular,
    gameOptions: {
        [GameTypesEnum.draft]: {
            [GameModesEnum.regular]: {
                totalPacks: 3,
                selectedPacks: {}
            },
            [GameModesEnum.cube]: {
                cardsPerPack: 15,
                totalPacks: 3,
                cubeList: ""
            },
            [GameModesEnum.chaos]: {
                totalPacks: 3,
                onlyModern: false,
                totalChaos: false
            }
        },
        [GameTypesEnum.sealed]: {
            [GameModesEnum.regular]: {
                totalPacks: 6,
                selectedPacks: {}
            },
            [GameModesEnum.cube]: {
                cardsPerPlayer: 120,
                cubeList: ""
            },
            [GameModesEnum.chaos]: {
                totalPacks: 6,
                onlyModern: false,
                totalChaos: false
            }
        }
    }
}


const DraftLobbyReducerActions = Object.freeze({
    "GAME_TYPE": 1, "GAME_MODE": 2, "GAME_TITLE": 3, "TOTAL_PLAYERS": 4, "PRIVATE_GAME": 5,
    "GAME_OPTION_UPDATE": 6, "PRESET_CUBES": 7
})

function isObject(obj) {
    return obj != null && obj.constructor.name === "Object"
}

function reducer(state, action) {
    switch (action.type) {
        case DraftLobbyReducerActions.GAME_TYPE:
            return {
                ...state,
                gameType: action.gameType,
            }
        case DraftLobbyReducerActions.GAME_MODE:
            return {
                ...state,
                gameMode: action.gameMode,
            }
        case DraftLobbyReducerActions.GAME_TITLE:
            return {
                ...state,
                gameTitle: action.gameTitle,
            }
        case DraftLobbyReducerActions.TOTAL_PLAYERS:
            return {
                ...state,
                totalPlayers: action.totalPlayers
            }
        case DraftLobbyReducerActions.PRIVATE_GAME:
            return {
                ...state,
                privateGame: action.privateGame,
            }
        case DraftLobbyReducerActions.PRESET_CUBES:
            return {
                ...state,
                presetCubes: action.presetCubes
            }
        case DraftLobbyReducerActions.GAME_OPTION_UPDATE: {
            state.gameOptions[state.gameType][state.gameMode][action.key] = action.value
            console.log(`Updated state: ${state.gameType}:${state.gameMode}:${action.key}=${isObject(action.value) ? JSON.stringify(action.value) : action.value.toString()}`)
            return {
                ...state
            };
        }
        default:
            return state
    }
}

export {
    reducer,
    initialState,
    DraftLobbyReducerActions
}