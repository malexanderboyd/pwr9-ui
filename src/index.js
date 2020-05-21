import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {Route, BrowserRouter, Switch, Link} from "react-router-dom"
import DraftHome from "./components/draft/draftHome"
import {Menu} from "semantic-ui-react"


const routing = (
    <BrowserRouter>
            <Menu>
                <Menu.Item
                    name="Home">
                    <Link to="/">Home</Link>
                </Menu.Item>
                <Menu.Item
                    name="Draft">
                    <Link to="/draft">Draft</Link>
                </Menu.Item>
            </Menu>
        <Switch>
            <Route exact path="/" component={App}/>
            <Route path="/draft" component={DraftHome}/>
        </Switch>
    </BrowserRouter>
)

ReactDOM.render(routing, document.getElementById('root'));
