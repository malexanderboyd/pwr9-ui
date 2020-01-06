import './DraftLobby.css';

import React, {useState, Suspense, Fragment} from 'react';

import Checkbox from "../../utils/Checkbox"
import Select from 'react-select'


// const Sets = ({ sets, type }) => (
//     sets
//         .map((set, i) => <Set type={type} selectedSet={set} index={i} key={i} />)
// );


const Regular = ({sets, type}) => {

    const packOptions = Array.from({length: 10}, (v, k) => ({value: k + 3, label: (k + 3).toString()}));
    let [TotalPacks, setTotalPacks] = useState(3);

    const packSelectors = Array.from({length: TotalPacks}, (x, i) =>
        <Select name={`packSelector-${i}`} key={i} options={[{value: "test", label: "test"}]}
                       isSearchable={true}/>
                       );

    return (
        <Fragment>
            <div>
                Number of packs:{" "}
                <Select name="totalPackSelector" options={packOptions} value={TotalPacks}
                        onChange={(v) => setTotalPacks(v.value)
                        }/>
            </div>
            <div className="wrapper">
                {TotalPacks}
                {packSelectors}
            </div>
        </Fragment>
    );
}

//
// const Chaos = ({ packsNumber }) => (
//     <div>
//         <div>
//             Number of packs:{" "}
//             {/*<Select*/}
//             {/*    onChange={(e) => { App.save(packsNumber, parseInt(e.currentTarget.value));}}*/}
//             {/*    link={packsNumber}*/}
//             {/*    opts={_.seq(12, 3)} />*/}
//         </div>
//         <div>
//             <Checkbox link='modernOnly' side='right' text='Only Modern Sets: ' />
//         </div>
//         <div>
//             <Checkbox link='totalChaos' side='right' text='Total Chaos: ' />
//         </div>
//     </div>
// );


const GameOptions = () => {
    return <p>Hello</p>
    // const { setsDraft, setsSealed, gametype, gamesubtype } = App.state;

    // switch (`${gamesubtype} ${gametype}`) {
    //     case "regular draft":
    //         return <Regular sets={setsDraft} type={"setsDraft"} />;
    //     case "regular sealed":
    //         return <Regular sets={setsSealed} type={"setsSealed"} />;
    //     case "cube draft":
    //         return <CubeDraft />;
    //     case "cube sealed":
    //         return <CubeSealed />;
    //     case "chaos draft":
    //         return <Chaos packsNumber={"chaosDraftPacksNumber"} />;
    //     case "chaos sealed":
    //         return <Chaos packsNumber={"chaosSealedPacksNumber"}/>;
    // }
};

const GameTypesEnum = Object.freeze({"draft": 1, "sealed": 2})
const GameModesEnum = Object.freeze({"regular": 1, "cube": 2, "chaos": 3})

const GameTypes = () => {
    const types = Object.keys(GameTypesEnum);
    const gameModes = Object.keys(GameModesEnum);

    let [GameType, setGameType] = useState(null);
    let [GameMode, setGameMode] = useState(0);

    return (
        <div>
            <p>Game type:{" "}
                <span className='connected-container'>
          {types.map((type, val) =>
              <label key={type}>
                  <input name="type"
                         type="radio"
                         value={type}
                         onChange={() => {
                             setGameType(GameTypesEnum[type]);
                             console.log(`Active Type`, type);
                         }}/>
                  {type.replace(/\b[a-z]/g, (x) => x.toLocaleUpperCase())}
              </label>
          )}
        </span>
            </p>
            <p>Game mode:{" "}
                <span className='connected-container'>
          {gameModes.map((mode, val) =>
              <label>
                  <input name="subtype"
                         type="radio"
                         value={mode}
                         onChange={() => {
                             setGameMode(GameModesEnum[mode]);
                             console.log('Active subtype', mode)
                         }}/>
                  {mode.replace(/\b[a-z]/g, (x) => x.toLocaleUpperCase())}
              </label>
          )}
        </span>
            </p>
            <p>
                <GameTypePanel gameType={GameType} gameMode={GameMode}/>
            </p>
        </div>
    );
};

const GameModePanel = ({gameMode}) => {
    switch (gameMode) {
        case GameModesEnum.chaos:
            return <p>Chaos Mode!</p>
        case GameModesEnum.cube:
            return <p>Cube Mode!</p>
        case GameModesEnum.regular:
            return <p>Regular Mode!</p>
        default:
            return <p/>
    }
}

const GameTypePanel = ({gameType, gameMode}) => {
    let type;
    switch (gameType) {
        case GameTypesEnum.draft:
            type = <Regular/>
            break;
        case GameTypesEnum.sealed:
            type = "Sealed Mode";
            break;
        default:
            type = "No Mode Selected!"
    }

    return <div>
        {type}
        <GameModePanel gameMode={gameMode}/>
    </div>
}


const CreateDraftPanel = () => (
    <fieldset className='fieldset'>
        <legend className='legend'>
            Create a Room
        </legend>
        <div>
            <label>
                Game title:{" "}
                <input type='text'
                       onChange={(e) => {
                           console.log(e.currentTarget.value);
                       }}
                />
            </label>
        </div>
        <div>
            Number of players:{" "}
            <input type='number'
                   min="1"
                   max="100"
                   onChange={(e) => {
                       console.log(e.currentTarget.value)
                   }}
            />
        </div>
        <div>
            <Checkbox link='isPrivate' text='Make room private: ' right={true}/>
        </div>
        <GameTypes/>
        <GameOptions/>
        <p>
            <button onClick={console.log("create")}>
                Create room
            </button>
        </p>
    </fieldset>
)


const Lobby = () => {
    return (
        <div className="routeContainer">
            <header className="draftHeader">
                <h2>Pwr9 Draft</h2>
                <p>0 total players on 0 instances of godr4ft</p>
            </header>
            <CreateDraftPanel/>
        </div>
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
