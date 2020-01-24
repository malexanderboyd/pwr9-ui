import {Segment} from "semantic-ui-react"
import React from "react"
import {Header, Grid, Image} from "semantic-ui-react"

const Card = (props) => {



    let {cardDetails} = props;

    return (
        <span>
            <Image className="magicCard" key={cardDetails.details.name} src={cardDetails.details.url}/>
        </span>
    )
};


const DeckFeed = (props) => {

    const {content} = props;

    return (
        <Segment>
            <Image.Group size={"medium"}>
                {content.map(details => {
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

    // let  {content} = props;

    let content = [{
        name: "Brazen Borrower",
        url: "https://img.scryfall.com/cards/png/front/c/2/c2089ec9-0665-448f-bfe9-d181de127814.png?1572489838"
    }]
    for (let i = 0; i < 4; i++) {
        content = content.concat(content.slice(0))
    }

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