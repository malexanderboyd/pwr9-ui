import React, {useReducer, useState} from "react"
import {DraftLobbyReducerActions, initialState, reducer} from "./DraftLobbyReducer"
import {Form, Grid, Header, Segment, Button} from "semantic-ui-react"
import GameModesRadio from "./GameModesRadio"
import GameTypesRadio from "./GameTypesRadio"
import GameModePanel from "./GameModePanel"








const startGame = (store, setError) => {

    const gameSettings = {
        gameTitle: store.gameTitle,
        totalPlayers: store.totalPlayers,
        privateGame: store.privateGame,
        gameType: store.gameType,
        gameMode: store.gameMode,
        options: store.gameOptions
    }

    if (gameSettings.totalPlayers == null || isNaN(parseInt(gameSettings.totalPlayers))) {
        setError({"players": "Must set a valid number of players (1-100)"})
        return
    }

    console.log("starting new game with settings: "+ JSON.stringify(gameSettings))
    fetch('http://pwr9.net/api/game', {
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
        })
        .catch((err) => {
          setError(err)
        });
}


const CreateDraftPanel = () => {

    const [store, dispatch] = useReducer(reducer, initialState)
    const [Error, setError] = useState({})

    return (
        <Grid textAlign='center' style={{height: '100vh'}}>
                <Grid.Column style={{maxWidth: 500}}>
                <Header as='h2' color='purple' textAlign='center'>
                    Start a Draft
                </Header>
                <Segment stacked>
                    <Form size='large'>
                        <Form.Input
                            fluid
                            icon='book'
                            iconPosition='left'
                            placeholder='Draft Name'
                            required
                            error={Error["gameTitle"] ? Error["gameTitle"] : null}
                            onChange={(e) => {
                                const desiredGameTitle = e.currentTarget.value
                                const valid =  /^[a-zA-Z0-9]+[a-zA-Z0-9_.-]*$/.exec(desiredGameTitle);
                                if (!valid) {
                                    setError({
                                        ...Error,
                                        gameTitle: {
                                            content: `Please enter a valid game title. Must be a alphanumeric with no spaces`,
                                            pointing: 'below',
                                        }
                                    })
                                } else {
                                    setError({
                                        ...Error,
                                        gameTitle: null
                                    })
                                    dispatch({gameTitle: desiredGameTitle, type: DraftLobbyReducerActions.GAME_TITLE});
                                }
                            }}/>
                        <Form.Input
                            type='number'
                            min="2"
                            max='100'
                            error={Error["players"] ? Error["players"] : null}
                            onChange={(e) => {
                                if (isNaN(e.currentTarget.value)) {
                                    console.log('hello')
                                    setError({
                                        ...Error,
                                        players: {
                                            content: `Please enter a valid number of players. Must be a number`,
                                            pointing: 'below',
                                        }
                                    })
                                    return
                                }
                                else {
                                    setError({
                                        ...Error,
                                        players: null
                                    })
                                    dispatch({
                                        totalPlayers: parseInt(e.currentTarget.value),
                                        type: DraftLobbyReducerActions.TOTAL_PLAYERS
                                    })
                                }
                            }}
                            fluid
                            icon='user'
                            iconPosition='left'
                            placeholder='Number of players'
                            required
                        />
                        <GameModesRadio store={store} dispatch={dispatch}/>
                        <GameTypesRadio store={store} dispatch={dispatch}/>
                        <GameModePanel store={store} dispatch={dispatch}/>
                        <Form.Button
                            fluid
                            size='large'
                            color='green'
                            onClick={() => {
                                startGame(store, setError)
                            }}
                        >
                            Start
                        </Form.Button>
                    </Form>
                </Segment>

            </Grid.Column>
        </Grid>
    )
}


export default CreateDraftPanel