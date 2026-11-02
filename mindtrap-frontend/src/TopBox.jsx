import "./top-box.css"
import SearchBar from './SearchBar.jsx'
import GeneralButton from "./GeneralButton.jsx";
import { States,ActionStates } from "./States.jsx";

function TopBox({state, setChains, setState,setActionState}){
    let content;
    switch (state) {
        case States.ACTIVATING_EVENT:
            content = <div className="top_text">Describe the situation that happened and when it happened. Try to only use observable facts in your description</div>
            break
        case States.BELIEFS:
            content = <div className="top_text">Describe the immediate thoughts that pop up - how they sound in our heads and what we genuinely believe. Select how much you believe that thought</div>
            break
        case States.CONSEQUENCES:
            content = <div className="top_text">How did you feel in this event? How intense were the emotions? How did you act?</div>
            break
        case States.DISPUTATION:
            content = <div className="top_text">Let's try to look at these beliefs from every angle. What if there are alternative explanations to the event that happened?</div>
            break
        case States.EFFECT:
            content = <div className="top_text">Given your arguments and explanations, type in a more rational thought for every belief that you discovered while processing this event</div>
            break
        case States.FUTURE_ACTION:
            content = <div className="top_text">Now if that situation happens again, how different will you act?</div>
            break
        case States.GOAL:
            content = <div className="top_text">Why are you doing this processing? What is your goal?</div>
            break
        case States.HOME:
            content = <>
                    <SearchBar setChains={setChains}></SearchBar>
                    <GeneralButton text="Create" setState={() => {
                        setState(States.ACTIVATING_EVENT)
                        setActionState(ActionStates.CREATE)
                        }}></GeneralButton>
                    </>;
            break
    }
    return(
        <div className="top_box">
            <>{content}</>
        </div>
    );
}
export default TopBox