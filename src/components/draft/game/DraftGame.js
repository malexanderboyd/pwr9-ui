import React, {useState} from 'react';
import {useParams} from 'react-router-dom';

import {Header, Grid, Dropdown, Checkbox, Statistic, Segment, Label, GridRow} from 'semantic-ui-react'
import {openNewGameSocket, subscribeToUpdates} from "../api"
import useSWR from "swr"
import {ChatWindow} from "./ChatWindow"
import DeckList from "./DeckList"

const fetchToJson = url => fetch(url).then(_ => _.json())
const JSONErrorDiv = (error) => {
    return <div>Failed loading data: {JSON.stringify(error)}</div>
}

const HostOptions = (props) => {

    let {socket} = props;
    let [TimerEnabled, setTimerEnabled] = useState(false);
    let [TimerSettings, setTimerSettings] = useState({});

    return (
        <div>
            <GridRow>
                <p>You are the host!</p>
            </GridRow>
            <GridRow>
                <Checkbox label={<label>Bots - Coming soon!</label>} disabled/>
            </GridRow>
            <GridRow>
                <Checkbox checked={TimerEnabled} onChange={() => {
                    setTimerEnabled(!TimerEnabled)
                }} label={<label>Timer</label>}/>
                {TimerEnabled === true ? <Dropdown placeholder={"Select Type"}
                                                   onChange={(e, data) => {
                                                       if (TimerEnabled) {
                                                           setTimerSettings(data.value)
                                                       }
                                                   }
                                                   }
                                                   fluid
                                                   selection
                                                   options={[{
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
                                                   ]}/> : <div/>}
            </GridRow>
            <GridRow>
                <button
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
                    className="ui icon right labeled button">
                    <i aria-hidden="true" className="right arrow icon"/>
                    Start Game
                </button>
            </GridRow>
        </div>
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
    const {data: gameInfo, error: gameError} = useSWR(`http://localhost:8002/game/${id}`, fetchToJson, {revalidateOnFocus: false});

    if (gameError) {
        return <JSONErrorDiv error={gameError}/>
    }

    if (!gameInfo) {
        return (
            <div>Loading...</div>
        )
    }

    const gameMode = gameInfo["gameMode"]
    const gameType = gameInfo["gameType"]

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
        <Grid>
            <Grid.Row columns={2} centered>
                <Grid.Column width={10}>
                    <Segment raised>
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
                        <Header as='h2'>Pwr9 Draft</Header>
                        <Header size="tiny">Players: {TotalPlayers}/{gameInfo["totalPlayers"]}</Header>
                        {GameEnded ? <p>Draft has Ended! Good Luck!</p> : <div/>}
                        {IsGameHost && !GameStarted ? <HostOptions socket={socket}/> : <div/>}
                    </Segment>
                </Grid.Column>
                <Grid.Column width={3}>
                    <ChatWindow socket={socket} content={ChatContents}/>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={1} centered>
                <Grid.Column>
                    <Segment raised>
                        <DeckList socket={socket} poolContent={PoolContents} content={DeckContents}
                                  gameEnded={GameEnded}/>
                    </Segment>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
}

export default DraftGame;
