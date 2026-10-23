import "./top-box.css"
import SearchBar from './SearchBar.jsx'
import GeneralButton from "./GeneralButton.jsx";

function TopBox(props){
    let content;
    const initialState = <>
                            <SearchBar></SearchBar>
                            <GeneralButton text="blabla"></GeneralButton>
                            </>;
    return(
        <div className="top_box">
            <>{initialState}</>
        </div>
    );
}
export default TopBox