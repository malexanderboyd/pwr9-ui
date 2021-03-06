import React, {useState, useEffect} from 'react';
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
const GAME_STATUS = {
    WAITING: 1,
    STARTED: 2,
    ENDED: 3
}

const HostOptions = (props) => {

    let {socket} = props;
    let [TimerEnabled, setTimerEnabled] = useState(false);
    let [ServerForcePick, setServerForcePick] = useState(false)
    let [TimerSettings, setTimerSettings] = useState("");

    const TimerSpeedOptions =  [{
        key: 'leisurely',
        text: 'Leisurely - Starts @ 90s and decrements by 5s per pick',
        value: 'leisurely',
    },
        {
            key: 'slow',
            text: 'Slow - Starts @ 75s and decrements by 5s per pick',
            value: 'slow',
        },
        {
            key: 'moderate',
            text: 'Moderate - Starts @ 55s A happy medium between slow, and fast.',
            value: 'moderate',
        },
        {
            key: 'fast',
            text: 'Fast - Starts @ 40s, based on official WOTC timing',
            value: 'fast',
        },
    ]

    const TimerOptions = () => (
            <div>
                <Form.Field>
                    <Dropdown placeholder={"Select Type"}
                              onChange={(e, data) => {
                                  if (TimerEnabled) {
                                      setTimerSettings(data.value)
                                  }
                              }
                              }
                              fluid
                              selection
                              options={TimerSpeedOptions}/>
                </Form.Field>
                <Form.Field>
                <Form.Checkbox
                    toggle
                    onChange={() => setServerForcePick(!ServerForcePick)}
                    checked={ServerForcePick === true}
                    label="Server Force Pick Mode: Ignores autopicks and chooses first card when timer has expired."/>
                </Form.Field>
            </div>
    )

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
                    {TimerEnabled ? <TimerOptions/> : <div/>}
                    <Form.Button
                        onClick={() => {
                            socket.send(
                                JSON.stringify({
                                    type: "start_game",
                                    data: JSON.stringify({
                                        timer: TimerSettings,
                                        serverForcePick: ServerForcePick,
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
    let [ConnectedToGameServer, setConnectedToGameServer] = useState(false)
    let [TotalPlayers, setTotalPlayers] = useState(0)
    let [IsGameHost, setIsGameHost] = useState(false)
    let [GameStatus, setGameStatus] = useState(GAME_STATUS.WAITING)
    let [PoolContents, setPoolContents] = useState([])
    let [DeckContents, setDeckContents] = useState([])
    let [ChatContents, setChatContents] = useState([])
    let [TimerSettings, setTimerSettings] = useState(null)
    let [GameRound, setGameRound] = useState(1)
    let [GamePackNumber, setGamePackNumber] = useState(1)
    let {id} = useParams();
    const {data: gameInfo, error: gameError} = useSWR(`http://pwr9.net/api/game/${id}`, fetchToJson, {revalidateOnFocus: false});
    let socket

    useEffect(() => {

        if(!ConnectedToGameServer && gameInfo && GameStatus === GAME_STATUS.WAITING) {
            const intervalID = setTimeout(() => {
                socket = openNewGameSocket(gameInfo.port);
            }, 5000)
            return () => clearInterval(intervalID)
        }

        return () => {}
    })
    if (gameError) {
        return <JSONErrorDiv error={gameError}/>
    }

    if (!gameInfo) {
        return (
            <div>Loading...</div>
        )
    }
    socket = openNewGameSocket(gameInfo.port);
    const gameMode = gameModeFromGameInfo(gameInfo)
    const gameType = gameTypeFromGameInfo(gameInfo)


    subscribeToUpdates(socket, (err, event) => {
        switch (event.type) {
            case "socket_close":
                setConnectedToGameServer(false)
                delete socket[gameInfo.port]
                break
            case "new_player":
                setTotalPlayers(event.data);
                setConnectedToGameServer(true)
                break;
            case "chat_message":
                let newContents = [...ChatContents, JSON.parse(event.data)]
                setChatContents(newContents)
                break;
            case "host_change":
                setIsGameHost(true)
                break;
            case "start_game":
                setGameStatus(GAME_STATUS.STARTED)
                break;
            case "end_game":
                setGameStatus(GAME_STATUS.ENDED)
                break;
            case "round_content":
                const nextRoundContent = JSON.parse(event.data)

                const packNumber = nextRoundContent["packNumber"] || null
                const round = nextRoundContent["round"] || null
                const timerInSeconds = nextRoundContent["timer"] || null

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

                if(timerInSeconds !== null) {
                    console.log("received timer seconds for next round " + timerInSeconds)
                    setTimerSettings({seconds:timerInSeconds})
                    delete nextRoundContent["timer"]
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

    if (!ConnectedToGameServer && GameStatus === GAME_STATUS.WAITING) {
        return <p>Waiting to connect to host...</p>
    }


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
                            {(IsGameHost || true) && GameStatus === GAME_STATUS.WAITING ? <HostOptions socket={socket}/> : <div/>}
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
                    <DeckList socket={socket} TimerSettings={TimerSettings} poolContent={PoolContents} content={DeckContents}
                                  GameStatus={GameStatus}/>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
}

export {
    DraftGame,
    GAME_STATUS
};
