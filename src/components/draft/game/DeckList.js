import {Grid, Header, Image, Segment, Label} from "semantic-ui-react"
import React, {Fragment, useState} from "react"

const Card = (props) => {

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


const DeckFeed = (props) => {

    let [PickedCard, setPickedCard] = useState(null)
    let [AutoPickedCard, setAutoPickedCard] = useState(null);


    const {content} = props;

    if(content === null || content.length === 0) {
        return (
            <p>Loading...</p>
        )
    }


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
                        <Card cardDetails={{details}} autopick={autoPick} index={i} setAutoPickedCard={setAutoPickedCard} setPickedCard={setPickedCard} />
                    )
                })
                }
            </Image.Group>
        </Segment>
    );
};


const DeckList = (props) => {

    let   { content } = props;

    return (
        <Grid divided="vertically">
            <Grid.Row columns={1}>
                <Grid.Column>
                    <Header size={"huge"}>Available Cards</Header>
                    <DeckFeed content={content}/>
                </Grid.Column>
                <Grid.Column>
                    <Header size={"huge"}>Main Deck</Header>
                    <DeckFeed content={content}/>
                </Grid.Column>
                <Grid.Column>
                    <Header size={"huge"}>Sideboard</Header>
                    <DeckFeed content={content}/>
                </Grid.Column>
                <Grid.Column>
                    <Header size={"huge"}>Junk</Header>
                    <DeckFeed content={content}/>
                </Grid.Column>
            </Grid.Row>
        </Grid>

    )
};

export default DeckList