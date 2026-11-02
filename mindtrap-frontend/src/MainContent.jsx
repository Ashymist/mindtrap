import './main-content.css'
import TopBox from "./TopBox"
import ChainBox from './ChainBox';
import { useState } from 'react';
import {States, ActionStates} from './States.jsx'

const API_URL = 'http://localhost:7000/chains'

function MainContent(){
    const [chains, setChains] = useState([])
    const [state, setState] = useState(States.HOME)
    const [actionState, setActionState] = useState(ActionStates.CREATE)

    
    const refreshChains = async () => {
        try {
            const res = await fetch(API_URL)
            if (!res.ok) {
                console.error('Failed to reload chains:', res.status)
                return
            }
            setChains(await res.json())
        } catch (err) {
            console.error('Failed to reload chains:', err)
        }
    }

    return(
        <div className='main_content'>
            <div className='header'>
                <div className='logo'>mindtrap</div>
                <a className='link' href='https://github.com/ashymist/mindtrap'>github.com/ashymist/mindtrap</a>
            </div>
            <div className='content_area'>
                <TopBox setChains={setChains} state={state} setState={setState} setActionState={setActionState}></TopBox>
                <ChainBox
                    chains={chains}
                    state={state}
                    setState={setState}
                    setActionState={setActionState}
                    actionState={actionState}
                    onSaved={refreshChains}
                ></ChainBox>
            </div>
        </div>
    );
}

export default MainContent
