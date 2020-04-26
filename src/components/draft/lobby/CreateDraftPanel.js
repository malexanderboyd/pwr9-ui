import React, {useReducer} from "react"
import {DraftLobbyReducerActions, initialState, reducer} from "./DraftLobbyReducer"
import {Form, Grid, Header, Segment, Button} from "semantic-ui-react"
import GameModesRadio from "./GameModesRadio"
import GameTypesRadio from "./GameTypesRadio"
import GameModePanel from "./GameModePanel"

const startGame = (gameSettings) => {
    fetch('http://localhost:8002/game', {
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


const CreateDraftPanel = () => {

    const [store, dispatch] = useReducer(reducer, initialState)

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
                            onChange={(e) => {
                                dispatch({gameTitle: e.currentTarget.value, type: DraftLobbyReducerActions.GAME_TITLE});
                            }}/>
                        <Form.Input
                            type='number'
                            min='1'
                            max='100'
                            onChange={(e) => {
                                if (isNaN(e.currentTarget.value)) {
                                    return
                                }

                                dispatch({
                                    totalPlayers: parseInt(e.currentTarget.value),
                                    type: DraftLobbyReducerActions.TOTAL_PLAYERS
                                })
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
                                startGame({
                                    gameTitle: store.gameTitle,
                                    totalPlayers: store.totalPlayers,
                                    privateGame: store.privateGame,
                                    gameType: store.gameType,
                                    gameMode: store.gameMode,
                                    options: store.gameOptions
                                })
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