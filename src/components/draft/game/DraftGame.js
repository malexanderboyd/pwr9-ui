import React, {useState} from 'react';
import {useParams} from 'react-router-dom';

import {
    Header,
    Grid,
    Dropdown,
    Statistic,
    Segment,
    Label,
    Message,
    Form,
    Container, Divider, Icon
} from 'semantic-ui-react'
import {openNewGameSocket, subscribeToUpdates} from "../api"
import useSWR from "swr"
import DeckList from "./DeckList"
import {gameModeFromGameInfo, gameTypeFromGameInfo, TimerOptions} from "../lobby/util"
import Statistics from "./stats/statistics"

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
                <Form>
                    <Form.Checkbox
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
    let [GameRound, setGameRound] = useState(1)
    let [GamePackNumber, setGamePackNumber] = useState(1)
    let {id} = useParams();
    const {data: gameInfo, error: gameError} = useSWR(`http://localhost/api/game/${id}`, fetchToJson, {revalidateOnFocus: false});

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
                const nextRoundContent = JSON.parse(event.data)

                const packNumber = nextRoundContent["packNumber"] || null
                const round = nextRoundContent["round"] || null

                if (packNumber !== null) {
                    if(packNumber !== GamePackNumber) {
                        setGamePackNumber(packNumber)
                    }
                    delete nextRoundContent["packNumber"]
                }
                if(round != null) {
                    setGameRound(
                        round
                    )
                    delete nextRoundContent["round"]
                }
                setDeckContents([nextRoundContent])
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

    const gameStatistics = [
        {
            label: "Mode",
            value: gameMode
        },
        {
            label: "Type",
            value: gameType
        },
        {
            label: "Pack",
            value: GamePackNumber
        },
        {
            label: "Round",
            value: GameRound
        },
        {
            label: "Players",
            value: `${TotalPlayers}/${gameInfo["totalPlayers"]}`
        }
    ]

    return (
        <Grid>
            <Grid.Row stretched columns={2}>
                <Grid.Column>
                    <Grid.Row centered columns={1}>
                        <Segment color={"violet"}>
                            <Label color='blue'>
                                Game Info
                            </Label>
                            <Statistic.Group size='mini'>
                                {gameStatistics.map(stat => {
                                return (
                                    <Statistic>
                                        <Statistic.Value>{stat.value}</Statistic.Value>
                                        <Statistic.Label>{stat.label}</Statistic.Label>
                                    </Statistic>
                                )
                                })}
                            </Statistic.Group>
                            <Divider/>
                            {IsGameHost && !GameStarted || true ? <HostOptions socket={socket}/> : <div/>}
                        </Segment>
                    </Grid.Row>
                </Grid.Column>
                <Grid.Column>
                    <Segment>
                        <Statistics poolContents={PoolContents}/>
                    </Segment>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={1}>
                <Grid.Column>
                        <DeckList socket={socket} poolContent={PoolContents} content={DeckContents}
                                  gameEnded={GameEnded}/>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
}

export default DraftGame;
