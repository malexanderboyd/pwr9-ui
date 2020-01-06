import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {Route, BrowserRouter, Switch, Link} from "react-router-dom"
import DraftHome from "./components/draft/draftHome"

const routing = (
    <BrowserRouter>
            <ul>
                <p>
                    <Link to="/">Home</Link>
                </p>
                <p>
                    <Link to="/draft">Draft</Link>
                </p>
            </ul>
        <Switch>
            <Route exact path="/" component={App}/>
            <Route path="/draft" component={DraftHome}/>
        </Switch>
    </BrowserRouter>
)

ReactDOM.render(routing, document.getElementById('root'));
