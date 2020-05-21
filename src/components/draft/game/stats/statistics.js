import React from "react";
import ManaCurveChart from "./ManaCurveChart"
import {Grid} from "semantic-ui-react"
import DeckColorsChart from "./DeckColorsChart"


const Statistics = (props) => {

    const {poolContents} = props;

    const stats = [
        <ManaCurveChart contents={poolContents}/>,
        <DeckColorsChart contents={poolContents}/>
    ]

    return (
        <Grid divided="vertically" style={{
            height: "33vh",
            overflowY: "scroll"
        }}>
            {stats.map((c) => {
                return (
                    <Grid.Row columns={1}>
                        <Grid.Column>
                            {c}
                        </Grid.Column>
                    </Grid.Row>
                )
            })}

        </Grid>
    )
}

export default Statistics