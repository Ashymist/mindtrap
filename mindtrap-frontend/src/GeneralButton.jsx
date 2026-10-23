import './general-button.css'
function GeneralButton(props){
    const greenButton = <div className="general_button" id="green_button">{props.text}</div>;
    const redButton = <div className="general_button" id="red_button">{props.text}</div>;
    return(props.color == "red" ? redButton : greenButton);
}

export default GeneralButton