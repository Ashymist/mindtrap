import './main-grid.css'

function MainGrid(){
    return(
            <div className="grid">
                <div className='container' id='header'></div>
                <div className='container' id='sidebar'></div>
                <div className='container' id='scrollWindow'></div>
            </div>
    );
}

export default MainGrid