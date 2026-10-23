import './chain-box.css'
import Chain from './Chain.jsx'
import ChainScrollWindow from './ChainScrollWindow.jsx'
function ChainBox({chains}){
    return(
        <div className="chain_box">
            <div className='column_grid'>
                <div className='column_name' id='column_name1'>A - Activating event</div>
                <div className='column_name' id='column_name2'>B - Beliefs</div>
                <div className='column_name' id='column_name3'>C - Consequences</div>
                <div className='column_name' id='column_name4'>E - Effect</div>
                <div className='column_name' id='column_name5'>F - Future action</div>
                <div className='column_name' id='column_name6'>G - Goal</div>
                <div className='column_name' id='column_name7'>Date</div>
            </div>
            <ChainScrollWindow chains={chains}></ChainScrollWindow>
        </div>
    );
}

export default ChainBox

