import React, {Component, useState} from "react";

import {
    Divider,
    Grid,
    Header,
    Image,
    Label,
    Menu, Tab,
    Table
} from "semantic-ui-react";
import {DraftGame} from "../DraftGame";
import Statistics from "../stats/statistics";


const Dashboard = (props) => {
    let [ActivePage, setActivePage] = useState(0)

    const pages = [
        {label: "Current Draft"},
        {label: "Statistics"},
    ]

    const panes = [
        {
            menuItem: null,
            pane: {
                key: "draft",
                content: <DraftGame/>,
                size: "massive"
            }
        },
        {
            menuItem: null,
            pane: {
                key: "statistics",
                content: <Statistics/>,
                size: "massive"
            }
        }
    ]

    return (
            <Grid padded>
                <Grid.Column
                    tablet={3}
                    computer={3}
                    only="tablet computer"
                    id="sidebar"
                >
                    <Menu vertical borderless fluid text>
                        {pages.map((page, i) => {
                            return (
                                <Menu.Item active={ActivePage === i}
                                   onClick={() => setActivePage(i)}
                                   as={"h4"}>
                                    {page.label}
                                </Menu.Item>
                            )
                        })}
                        <Menu.Item>
                            <Menu.Header>Export</Menu.Header>
                            <Menu.Menu>
                                <Menu.Item
                                    name='Copy to Clipboard'
                                    onClick={() => console.log("copytocb")}
                                />
                                <Menu.Item
                                    name='Download as txt'
                                    onClick={() => console.log("download2txt")}
                                />
                            </Menu.Menu>
                        </Menu.Item>
                        <Divider hidden/>
                    </Menu>
                </Grid.Column>
                <Grid.Column
                    mobile={16}
                    tablet={13}
                    computer={13}
                    floated="right"
                    id="content"
                >
                    <Tab activeIndex={ActivePage} panes={panes} renderActiveOnly={false} />
                </Grid.Column>
            </Grid>
        );
}

export default Dashboard;
