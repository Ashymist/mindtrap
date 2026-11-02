import './general-button.css'
function GeneralButton({text,color, setState}){
    const greenButton = <button onClick={setState} className="general_button" id="green_button">{text}</button>;
    const redButton = <button onClick={setState} className="general_button" id="red_button">{text}</button>;
    return(color == "red" ? redButton : greenButton);
}

export default GeneralButton