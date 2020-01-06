import React from 'react';
import {useParams} from 'react-router-dom';

function DraftGame() {

    let { id } = useParams();

    if(isNaN(id)) {
        return (
            <div>
                <p>404 - Game not found</p>
            </div>
        )
    }

    return (
        <div className="routeContainer">
            <header className="draftHeader">
                <h2>Pwr9 Draft</h2>
                <p>Draft Game Coming Soon! (ID: {id})</p>
            </header>
        </div>
    );
}

export default DraftGame;
