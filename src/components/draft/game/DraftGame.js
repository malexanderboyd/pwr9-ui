import React, {useState} from 'react';
import {useParams} from 'react-router-dom';

import {
    Header,
    Grid,
    Dropdown,
    Checkbox,
    Statistic,
    Segment,
    Label,
    GridRow,
    Message,
    Form,
    Container
} from 'semantic-ui-react'
import {openNewGameSocket, subscribeToUpdates} from "../api"
import useSWR from "swr"
import {ChatWindow} from "./ChatWindow"
import DeckList from "./DeckList"
import {gameModeFromGameInfo, gameTypeFromGameInfo, TimerOptions} from "../lobby/util"

const fetchToJson = url => fetch(url).then(_ => _.json())
const JSONErrorDiv = (error) => {
    return <div>Failed loading data: {JSON.stringify(error)}</div>
}

const HostOptions = (props) => {

    let {socket} = props;
    let [TimerEnabled, setTimerEnabled] = useState(false);
    let [TimerSettings, setTimerSettings] = useState({});

    return (
        <Container>
                <Message color={"olive"} size="tiny">
                    <Message.Header>You are the Host!</Message.Header>
                </Message>
            <Segment>
                <Form>
                    <Form.Checkbox
                        fluid
                        toggle
                        onChange={() => setTimerEnabled(!TimerEnabled)}
                        checked={TimerEnabled === true}
                        label="Timer"/>
                    {TimerEnabled ? <Form.Field>
                            <Dropdown placeholder={"Select Type"}
                                      onChange={(e, data) => {
                                          if (TimerEnabled) {
                                              setTimerSettings(data.value)
                                          }
                                      }
                                      }
                                      fluid
                                      selection
                                      options={TimerOptions}/>
                        </Form.Field> : <div/>}
                    <Form.Button
                        onClick={() => {
                            socket.send(
                                JSON.stringify({
                                    type: "start_game",
                                    data: JSON.stringify({
                                        timer: TimerSettings,
                                    })
                                })
                            )
                        }}
                        content="Start Game"
                        icon="right arrow"
                        labelPosition="right"
                        color="green">
                        <i aria-hidden="true" className="right arrow icon"/>
                        Start Game
                    </Form.Button>
                </Form>
            </Segment>
        </Container>
    )
}

function DraftGame() {
    let [TotalPlayers, setTotalPlayers] = useState(0);
    let [IsGameHost, setIsGameHost] = useState(false);
    let [GameStarted, setGameStarted] = useState(false)
    let [GameEnded, setGameEnded] = useState(false)
    let [PoolContents, setPoolContents] = useState([]);
    let [DeckContents, setDeckContents] = useState([]);
    let [ChatContents, setChatContents] = useState([]);
    let {id} = useParams();
    const {data: gameInfo, error: gameError} = useSWR(`http://draft.librajobs.org/api/game/${id}`, fetchToJson, {revalidateOnFocus: false});

    if (gameError) {
        return <JSONErrorDiv error={gameError}/>
    }

    if (!gameInfo) {
        return (
            <div>Loading...</div>
        )
    }


    const gameMode = gameModeFromGameInfo(gameInfo)
    const gameType = gameTypeFromGameInfo(gameInfo)

    const socket = openNewGameSocket(gameInfo.port);

    subscribeToUpdates(socket, (err, event) => {
        switch (event.type) {
            case "new_player":
                setTotalPlayers(event.data);
                break;
            case "chat_message":
                let newContents = [...ChatContents, JSON.parse(event.data)]
                setChatContents(newContents)
                break;
            case "host_change":
                setIsGameHost(true)
                break;
            case "start_game":
                setGameStarted(true)
                break;
            case "end_game":
                setGameEnded(true)
                break;
            case "deck_content":
                setDeckContents([JSON.parse(event.data)])
                break;
            case "pool_content":
                setPoolContents(
                    JSON.parse(event.data)
                )
                break
            default:
                console.log(`unknown msg type: ${event.type}`)
                break;
        }
    });

    return (
        <Grid style={{height: '100vh'}}>
            <Grid.Row columns={2}>
                <Grid.Column>
                    <Segment>
                        <Label color='blue' ribbon={"left"}>
                            Game Info
                        </Label>
                        <Statistic.Group size='mini'>
                            <Statistic>
                                <Statistic.Value>{gameMode}</Statistic.Value>
                                <Statistic.Label>Mode</Statistic.Label>
                            </Statistic>
                            <Statistic>
                                <Statistic.Value>{gameType}</Statistic.Value>
                                <Statistic.Label>Type</Statistic.Label>
                            </Statistic>
                        </Statistic.Group>
                    </Segment>
                </Grid.Column>
                <Grid.Column>
                    <Segment>
                        <Grid divided="vertically">
                            <Grid.Row columns={1}>
                                <Grid.Column>
                                    <Header size="small">Players: {TotalPlayers}/{gameInfo["totalPlayers"]}</Header>
                                    {GameEnded ? <Header size="large">Draft has Ended! Good Luck!</Header> : <div/>}
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row columns={1}>
                                <Grid.Column>
                                    {IsGameHost && !GameStarted || true ? <HostOptions socket={socket}/> : <div/>}
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Segment>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={1}>
                <Grid.Column>
                    <Segment>
                        <DeckList socket={socket} poolContent={PoolContents} content={DeckContents}
                                  gameEnded={GameEnded}/>
                    </Segment>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
}

export default DraftGame;
