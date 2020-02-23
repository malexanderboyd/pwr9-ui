import {Grid, Header, Image, Segment, Label, Loader, Progress} from "semantic-ui-react"
import React, {Fragment, useState, useEffect} from "react"


const Card = (props) => {
    let {cardDetails} = props;
    const card = cardDetails.details;
    return (<Fragment>
        <Image className="magicCard" key={card.id} src={card["image_uris"]["normal"]}
               onClick={() => {
                   console.log('clicked ' + card.name)
               }}/>
    </Fragment>
    )
}

const AvailableCard = (props) => {

    let {cardDetails, autopick, index, setAutoPickedCard, setPickedCard} = props;

    const card = cardDetails.details;
    let component;
    if(autopick) {
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
    if(content === null || content.length === 0) {
       return (<Loader inline active>Waiting for picks</Loader>)
    }

    return (
        <Segment>
            <Image.Group size={"medium"}>
                {content.map((details) => {
                    return (
                        <Card cardDetails={{details}} />
                    )
                })
                }
            </Image.Group>
        </Segment>
    )
}

const DeckFeed = (props) => {
    let [AutoPickedCard, setAutoPickedCard] = useState(null);

    useEffect(() => {
        setAutoPickedCard(null);
    }, [props])

    const {content, socket} = props;

    let waiting = false;

    if(content === null || content.length === 0) {
        return (
            <Progress active percent={100} color='blue'>
                Waiting for game to start
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
        waiting = true;
    };


    let {setName, pack} = content[0];


    return (
        <Segment>
            <p>Set: {setName}</p>
            <Image.Group size={"medium"}>
                {pack.map((details, i) => {

                    let autoPick = false;
                    if(i === AutoPickedCard) {
                        autoPick = true
                    }

                    return (
                        <AvailableCard cardDetails={{details}} autopick={autoPick} index={i} setAutoPickedCard={setAutoPickedCard} setPickedCard={setPickedCard} />
                    )
                })
                }
            </Image.Group>
        </Segment>
    );
};


const DeckList = (props) => {

    let   { poolContent, content, socket } = props;

    return (
        <Grid divided="vertically">
            <Grid.Row columns={1}>
                <Grid.Column>
                    <Header size={"huge"}>Available Cards</Header>
                    <DeckFeed socket={socket} content={content}/>
                </Grid.Column>
                <Grid.Column>
                    <Header size={"huge"}>Main Deck</Header>
                    <DeckZones content={poolContent}/>
                </Grid.Column>
                <Grid.Column>
                    <Header size={"huge"}>Sideboard</Header>
                    {/*<DeckFeed content={content}/>*/}
                </Grid.Column>
                <Grid.Column>
                    <Header size={"huge"}>Junk</Header>
                    {/*<DeckFeed content={content}/>*/}
                </Grid.Column>
            </Grid.Row>
        </Grid>

    )
};

export default DeckList