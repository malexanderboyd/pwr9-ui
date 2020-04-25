import {
    Grid,
    Header,
    Image,
    Segment,
    Label,
    Divider,
    Progress,
    Table,
    Container,
    Icon,
    Button,
    Input
} from "semantic-ui-react"
import React, {Fragment, useState, useEffect, useReducer} from "react"

import black from "./B.svg"
import green from "./G.svg"
import red from "./R.svg"
import blue from "./U.svg"
import white from "./W.svg"

import Timer from "./Timer"

const LandImages = {
    "swamp": {
        imgUri: "https://img.scryfall.com/cards/normal/front/6/6/66bb5192-58bc-4efe-a145-2e804fd3483d.jpg?1581481510",
        src: black,
        name: "swamp"
    },
    "forest": {
        imgUri: "https://img.scryfall.com/cards/normal/front/c/4/c4be31c4-9cb3-4a07-865b-5621127df660.jpg?1581482262",
        src: green, name: "forest"
    },
    "plains": {
        imgUri: "https://img.scryfall.com/cards/normal/front/4/0/40aca5ca-a37b-4919-aef6-2510b4779161.jpg?1581481482",
        src: white, name: "plains"
    },
    "island": {
        imgUri: "https://img.scryfall.com/cards/normal/front/9/2/92daaa39-cd2f-4c03-8f41-92d99d0a3366.jpg?1581481496",
        src: blue,
        name: "island"
    },
    "mountain": {
        imgUri: "https://img.scryfall.com/cards/normal/front/d/c/dc3f4154-9347-4ceb-8744-9f1ace90d33f.jpg?1581482260",
        src: red,
        name: "mountain"
    }
}

const Card = (props) => {
    let {onClick, cardDetails} = props;
    const card = cardDetails.details;
    return (
        <Fragment>
            <Image onClick={onClick} className="magicCard" key={card.id} src={card["image_uris"]["normal"]}/>
        </Fragment>
    )
}

const AvailableCard = (props) => {

    let {cardDetails, autopick, index, setAutoPickedCard, setPickedCard} = props;

    const card = cardDetails.details;
    let component;
    if (autopick) {
        component = (
            <Fragment>

                <Image className="magicCard" key={card.id} src={card["image_uris"]["normal"]}
                       label={<Label as='a' color='violet' attached='bottom left'>Autopick</Label>}
                       onClick={() => {
                           setPickedCard(index)
                       }}/>
            </Fragment>
        )
    } else {
        component = (
            <Image className="magicCard" key={card.id} src={card["image_uris"]["normal"]}
                   onClick={() => {
                       setAutoPickedCard(index)
                   }}/>
        )
    }


    return (
        <Fragment>
            {component}
        </Fragment>
    )
};


const DeckZones = (props) => {
    const {content} = props;

    let [MainContents, setMainContents] = useState([])
    let [SideContents, setSideContents] = useState([])
    let [LandContents, setLandContents] = useState([])

    let mainCards = <div/>;
    let sideCards = <div/>;
    let landCards = <div/>;

    useEffect(() => {
        setMainContents(content)
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
                            details: {id: `${i}-${landInfo.name}`, image_uris: {normal: landInfo.imgUri}}
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

        for(let [landType, count] of Object.entries(LandContents)) {
            if(count > 0) {
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
            <Button basic size={"mini"} color={"green"}>
                <Icon name={'copy'}/>
                Copy to clipboard
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
    <Segment>
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
    </Segment>
)
}

const DeckFeed = (props) => {
    let [TimeUp, setTimeUp] = useState(false)
    let [AutoPickedCard, setAutoPickedCard] = useState(null);
    let [Waiting, setWaiting] = useState(false)

    const {content, socket} = props;

    useEffect(() => {
        setAutoPickedCard(null);
        setWaiting(false)
        setTimeUp(false)
    }, [content])


    if (content === null || content.length === 0 || Waiting) {
        return (
            <Progress active percent={100} color='blue'>
                Waiting for next pack
            </Progress>
        )
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
            <Timer setTimeUp={setTimeUp} TimeInSeconds={2}/>
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

    let {gameEnded, poolContent, content, socket} = props;

    let availableCards;

    if (gameEnded) {
        availableCards = <div/>
    } else {
        availableCards = (
            <Grid.Column>
                <Header size={"huge"}>Available Cards</Header>
                <DeckFeed socket={socket} content={content}/>
            </Grid.Column>
        )
    }


    return (
        <Grid divided="vertically">
            <Grid.Row columns={1}>
                {availableCards}
                <Grid.Column>
                    <Header size={"huge"}>Deck</Header>
                    <DeckZones content={poolContent}/>
                </Grid.Column>
            </Grid.Row>
        </Grid>

    )
};

export default DeckList