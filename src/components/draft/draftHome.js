import React from 'react';
import {BrowserRouter, Route, Switch, useRouteMatch} from "react-router-dom"
import {DraftGame} from "./game/DraftGame"
import DraftLobby from "./lobby/DraftLobby"
import Dashboard from "./game/dashboard/dashboard";

function DraftHome() {

    let match = useRouteMatch();

    return (
        <BrowserRouter>
            <Switch>
                <Route exact path={match.path} component={DraftLobby}/>
                <Route path={`${match.path}/g/:id`} component={DraftGame}/>
            </Switch>
        </BrowserRouter>
    );
}

export default DraftHome;
