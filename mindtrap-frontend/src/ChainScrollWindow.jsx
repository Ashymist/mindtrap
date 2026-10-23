import './chain-scroll-window.css'
import Chain from './Chain';

function ChainScrollWindow({chains}){
    return(
        <div className='chain_scroll_window'>
            {chains.map((chain) => 
                <Chain key={"chain"+chain.id} chainInfo = {chain}></Chain>
            )}
        </div>
    );
}

export default ChainScrollWindow