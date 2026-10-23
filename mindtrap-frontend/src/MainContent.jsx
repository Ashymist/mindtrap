import './main-content.css'
import TopBox from "./TopBox"
import ChainBox from './ChainBox';

function MainContent(){
    return(
        <div className='main_content'>
            <div className='header'></div>
            <div className='content_area'>
                <TopBox></TopBox>
                <ChainBox></ChainBox>
            </div>
        </div>
    );
}

export default MainContent