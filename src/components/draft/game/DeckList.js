import {Segment} from "semantic-ui-react"
import React from "react"
import {Header, Grid, Image} from "semantic-ui-react"

const Card = (props) => {



    let {cardDetails} = props;

    return (
        <span>
            <Image className="magicCard" key={cardDetails.details} src={cardDetails.details}/>
        </span>
    )
};


const DeckFeed = (props) => {

    const {content} = props;

    if(content == false) {
        return (
            <p>Loading...</p>
        )
    }

    let packs = Object.keys(content[0] || {})

    const pack_one = content[0][packs[0]] || []

    return (
        <Segment>
            <Image.Group size={"medium"}>
                {pack_one.packs[0].map(details => {


                    return (
                        <Card cardDetails={{details}}/>
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