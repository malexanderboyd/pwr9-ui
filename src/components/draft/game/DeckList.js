import {Button, Divider, Grid, Header, Icon, Image, Input, Label, Popup, Segment, Table} from "semantic-ui-react"
import React, {Fragment, useEffect, useReducer, useState} from "react"

import black from "./B.svg"
import green from "./G.svg"
import red from "./R.svg"
import blue from "./U.svg"
import white from "./W.svg"

import CountdownTimer from "./CountdownTimer"
import {GAME_STATUS} from "./DraftGame";

const SCRYFALL_IMAGE_URL = "https://api.scryfall.com/cards/{card_id}?format=image&version=normal"

const LAND_SCRYFALL_IDS = {
    SWAMP: "66bb5192-58bc-4efe-a145-2e804fd3483d",
    FOREST: "c4be31c4-9cb3-4a07-865b-5621127df660",
    PLAINS: "40aca5ca-a37b-4919-aef6-2510b4779161",
    ISLAND: "92daaa39-cd2f-4c03-8f41-92d99d0a3366",
    MOUNTAIN: "dc3f4154-9347-4ceb-8744-9f1ace90d33f"
}


const LandImages = {
    "swamp": {
        imgID: LAND_SCRYFALL_IDS.SWAMP,
        src: black,
        name: "swamp"
    },
    "forest": {
        imgID: LAND_SCRYFALL_IDS.FOREST,
        src: green, name: "forest"
    },
    "plains": {
        imgID: LAND_SCRYFALL_IDS.PLAINS,
        src: white, name: "plains"
    },
    "island": {
        imgID: LAND_SCRYFALL_IDS.ISLAND,
        src: blue,
        name: "island"
    },
    "mountain": {
        imgID: LAND_SCRYFALL_IDS.MOUNTAIN,
        src: red,
        name: "mountain"
    }
}

const cardHasFlipSide = (card_obj) => {
    return card_obj !== null
        && card_obj.hasOwnProperty('otherFaceIds')
        && card_obj.otherFaceIds != null
        && card_obj.otherFaceIds.length > 0
}

const Card = (props) => {
    let {onClick, cardDetails, label} = props;
    const card = cardDetails.details;
    const src = SCRYFALL_IMAGE_URL.replace("{card_id}", card.scryfallId)
    let component

    if (cardHasFlipSide(card)) {
        const backSrc = SCRYFALL_IMAGE_URL.replace("{card_id}", card.scryfallId) + "&face=back"
        component = <Popup
            trigger={<Image label={label} onClick={onClick} className="magicCard" key={card.id} src={src}/>}
            on='hover'
            inverted={true}
            hideOnScroll={true}
            position='top left'>
            <Popup.Content>
                <Image label={label} className="magicCard" key={card.id + "_back"} src={backSrc}/>
            </Popup.Content>
        </Popup>
    } else {
        component = <Image label={label} onClick={onClick} className="magicCard" key={card.id} src={src}/>
    }

    return (
        <Fragment>
            {component}
        </Fragment>
    )
}

const AvailableCard = (props) => {

    let {cardDetails, autopick, index, setAutoPickedCard, setPickedCard} = props;
    let component;
    let label = null
    if (autopick) {
        label = <Label as='a' color='violet' attached='bottom left'>Autopick</Label>
        component = (
            <Card onClick={() => setPickedCard(index)} cardDetails={cardDetails} label={label}/>
        )
    } else {
        component = (
            <Card onClick={() => setAutoPickedCard(index)} cardDetails={cardDetails} label={label}/>
        )
    }

    return component
};


const DeckZones = (props) => {
    const {content} = props;

    let [AllContents, setAllContents] = useState([])

    let [MainContents, setMainContents] = useState([])
    let [SideContents, setSideContents] = useState([])
    let [LandContents, setLandContents] = useState([])

    let mainCards = <div/>;
    let sideCards = <div/>;
    let landCards = <div/>;

    useEffect(() => {
        if (content !== null) {
            if (content.length > 0) {
                setMainContents(MainContents => [...MainContents, content.pop()])
            }
        }
    }, [content])

    const landsReducer = (state, action) => {
        return {
            ...state,
            [action.type]: action.value
        }
    }


    let [Lands, dispatch] = useReducer(landsReducer, {
        swamp: 0,
        island: 0,
        plains: 0,
        mountain: 0,
        forest: 0
    })

    useEffect(() => {
        setLandContents(Lands)
    }, [Lands])


    if (LandContents) {
        const _land = []
        for (let landType in LandContents) {
            if (LandContents[landType] > 0) {
                for (let i = 0; i < LandContents[landType]; i++) {
                    const landInfo = LandImages[landType]
                    _land.push(
                        <Card key={`${i}-${landInfo.name}`} cardDetails={{
                            src: landInfo.src,
                            details: {
                                id: `${i}-${landInfo.name}`,
                                scryfallId: landInfo.imgID
                            }
                        }}/>
                    )
                }
            }
        }
        landCards = _land
    }

    const SwapDecks = (initialDeck, cardIdx) => {
        if (initialDeck === "main") {
            setSideContents([MainContents[cardIdx], ...SideContents])
            MainContents.splice(cardIdx, 1)
            setMainContents(MainContents)
        } else {
            setMainContents([SideContents[cardIdx], ...MainContents])
            SideContents.splice(cardIdx, 1)
            setSideContents(SideContents)
        }
    }

    if (MainContents) {
        mainCards = MainContents.map((details, idx) => {
            return (
                <Card key={idx} onClick={() => SwapDecks("main", idx)} cardDetails={{details}}/>
            )
        })
    }

    if (SideContents) {
        sideCards = SideContents.map((details, idx) => {
            return (
                <Card key={idx} onClick={() => SwapDecks("", idx)} cardDetails={{details}}/>
            )
        })
    }

    const downloadDeck = () => {

        let contents = []
        let deckName = ""
        for (let i = 0; i < MainContents.length; i++) {
            contents.push(
                `1 ${MainContents[i]["name"]}\n`
            )
            if (i === 0) {
                deckName = MainContents[i]["name"].replace(" ", "-")
            }
        }

        for (let [landType, count] of Object.entries(LandContents)) {
            if (count > 0) {
                contents.push(
                    `${count} ${landType}\n`
                )
            }
        }

        for (let i = 0; i < SideContents.length; i++) {
            if (i === 0) {
                contents.push(
                    "\nSideboard\n"
                )
            }
            contents.push(
                `1 ${SideContents[i]["name"]}\n`
            )
        }


        const downloadElement = document.createElement('a')

        const textFile = new Blob(contents, {type: 'text/plain'})

        downloadElement.href = URL.createObjectURL(textFile)
        downloadElement.download = `godr4ft-${deckName}.txt`
        document.body.appendChild(downloadElement)
        downloadElement.click()

    }

    const DeckPanel = (props) => {

        let {dispatch} = props

        return (
            <div>
                <Button onClick={downloadDeck} basic size={"mini"} color={"purple"}>
                    <Icon name={'download'}/>
                    Download as txt
                </Button>
                <Table basic='very' compact collapsing>
                    <Table.Body>
                        {Object.keys(LandImages).map((key, idx) => {
                            const landInfo = LandImages[key]
                            return (<Table.Row key={idx}>
                                    <Table.Cell>
                                        <Header as='h4' image>
                                            <Image avatar size="mini" src={landInfo.src}/>
                                        </Header>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Input type="number" onChange={(e, {value}) => {
                                            Lands[landInfo.name] = value
                                            dispatch({
                                                type: landInfo.name,
                                                value: parseInt(value)
                                            })
                                        }
                                        } size={"mini"} placeholder={"0"} value={Lands[landInfo.name]}/>
                                    </Table.Cell>
                                </Table.Row>
                            )
                        })}
                    </Table.Body>
                </Table>
            </div>
        )

    }

    return (
        <Fragment>
            <Header size={"huge"}>Deck</Header>
            <DeckPanel dispatch={dispatch}/>
            <Header size={"large"}>Main ({MainContents.length + landCards.length})</Header>
            <Image.Group size={"medium"}>
                {mainCards}
                {landCards}
            </Image.Group>
            <Divider section/>
            <Header size={"large"}>Side ({SideContents.length})</Header>
            <Image.Group size={"medium"}>
                {sideCards}
            </Image.Group>
        </Fragment>
    )
}

const DeckFeed = (props) => {
    let [AutoPickedCard, setAutoPickedCard] = useState(null);
    let [Waiting, setWaiting] = useState(false)

    const {GameStatus, TimeUp, content, socket} = props;

    useEffect(() => {
        setAutoPickedCard(null);
        setWaiting(false)
    }, [content])


    if (content === null || content.length === 0 || Waiting) {
        if (GameStatus === GAME_STATUS.WAITING) {
            return (
                <Header as='h3'>
                    Waiting for game to start...
                </Header>
            )
        } else if (GameStatus === GAME_STATUS.STARTED) {
            return (
                <Header as='h3'>
                    Waiting on other players to pass a draft pack...
                </Header>
            )
        }
    }


    const setPickedCard = (pickedCardIdex) => {
        socket.send(
            JSON.stringify({
                type: "choose_card",
                data: JSON.stringify({
                    pickedCardIndex: pickedCardIdex,
                })
            })
        )
        setWaiting(true)
    };


    let {setName, pack} = content[0];

    if (TimeUp) {
        if (AutoPickedCard) {
            setPickedCard(AutoPickedCard)
        } else {
            setPickedCard(0)
        }
    }

    return (
        <Segment>
            <p>Set: {setName}</p>
            <Image.Group size={"medium"}>
                {pack.map((details, i) => {

                    let autoPick = false;
                    if (i === AutoPickedCard) {
                        autoPick = true
                    }

                    return (
                        <AvailableCard key={i} cardDetails={{details}} autopick={autoPick} index={i}
                                       setAutoPickedCard={setAutoPickedCard} setPickedCard={setPickedCard}/>
                    )
                })
                }
            </Image.Group>
        </Segment>
    );
};


const DeckList = (props) => {
    let {TimerSettings, GameStatus, poolContent, content, socket} = props;
    let [roundTimer, setRoundTimer] = useState(null)
    let [TimeUp, setTimeUp] = useState(false)

    let availableCards;

    useEffect(() => {
        if (TimerSettings !== null) {
            console.log("create new timer at " + TimerSettings)
            setRoundTimer(<CountdownTimer seconds={TimerSettings} setTimeUp={setTimeUp}/>)
        }
    }, [TimerSettings])

    if (GameStatus === GAME_STATUS.ENDED) {
        availableCards = <div/>
    } else {
        availableCards = (
            <Grid.Column>
                {roundTimer !== null && GameStatus === GAME_STATUS.STARTED ? roundTimer : <div/>}
                <Header size={"huge"}>Available Cards</Header>
                <DeckFeed GameStatus={GameStatus} TimeUp={TimeUp} socket={socket} content={content}/>
            </Grid.Column>
        )
    }


    return (
        <Grid divided="vertically">
            <Grid.Row columns={1}>
                <Grid.Column>
                    <Segment>
                        {availableCards}
                    </Segment>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={1}>
                <Grid.Column>
                    <Segment>
                        <DeckZones content={poolContent}/>
                    </Segment>
                </Grid.Column>
            </Grid.Row>
        </Grid>

    )
};

export default DeckList