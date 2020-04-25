import './DraftLobby.css';

import React, {Suspense} from 'react';
import {Container} from "semantic-ui-react"
import CreateDraftPanel from "./CreateDraftPanel"

const Lobby = () => {
    return (
        <Container>
            <CreateDraftPanel/>
        </Container>
    )
}

function DraftLobby() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Lobby/>
        </Suspense>
    );
}

export default DraftLobby;
