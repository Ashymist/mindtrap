import './chain-scroll-window.css'
import Chain from './Chain';

function ChainScrollWindow({chains,setState, fillInfo,setActionState,onDeleted}){
    return(
        <div className='chain_scroll_window'>
            {chains.map((chain) => 
                <Chain key={"chain"+chain.id} chainInfo = {chain} setState={setState} fillInfo={fillInfo} setActionState={setActionState} onDeleted={onDeleted}></Chain>
            )}
        </div>
    );
}

export default ChainScrollWindow