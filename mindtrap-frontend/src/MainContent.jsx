import './main-content.css'
import TopBox from "./TopBox"
import ChainBox from './ChainBox';
import { useState } from 'react';

function MainContent(){
    const [chains, setChains] = useState([])
    return(
        <div className='main_content'>
            <div className='header'></div>
            <div className='content_area'>
                <TopBox setChains={setChains}></TopBox>
                <ChainBox chains={chains}></ChainBox>
            </div>
        </div>
    );
}

export default MainContent