import './chain.css'

function Chain({chainInfo}){
    const occuredAt = new Date(chainInfo.occured_at)
    const date = occuredAt.toLocaleDateString()
    const time = occuredAt.toLocaleTimeString()
    return(
        <div className='chain'>
            <div className='cell'>{chainInfo.activating_event}</div>
            <div className='cell'>{chainInfo.beliefs.map(belief => 
                <div key={"belief"+belief.id}>{belief.description}</div>
            )}</div>
            <div className='cell'>Emotions:<ul>{chainInfo.emotions.map(emotion =>
                <li>{emotion.emotion_type}</li>
            )}</ul>
            <p>Response: {chainInfo.response}</p>
            
            </div>
            <div className='cell'>{chainInfo.rational_thought}</div>
            <div className='cell'>{chainInfo.future_action}</div>
            <div className='cell'>{chainInfo.goal}</div>
            <div className='cell'><div>{date}</div><div>{time}</div></div>
        </div>
    );
}

export default Chain