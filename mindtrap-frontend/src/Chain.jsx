import './chain.css'
import { States,ActionStates } from './States';

const API_URL = 'http://localhost:7000/chains'

function Chain({chainInfo, setState, fillInfo,setActionState,onDeleted}){
    const occuredAt = new Date(chainInfo.occured_at)
    const date = occuredAt.toLocaleDateString()
    //const time = occuredAt.toLocaleTimeString()

    const editChain = () => {
        setState(States.ACTIVATING_EVENT)
        setActionState(ActionStates.UPDATE)
        fillInfo(chainInfo)
    }

    const deleteChain = async () => {
        try {
            const res = await fetch(`${API_URL}/${chainInfo.id}`, { method: 'DELETE' })
            if (!res.ok) {
                console.error('Deleting failed:', res.status)
                alert(`Deleting failed (HTTP ${res.status})`)
                return
            }
        } catch (err) {
            console.error('Deleting failed:', err)
            alert('Deleting failed: ' + err.message)
            return
        }
        if (onDeleted) await onDeleted()
    }

    

    return(
        <div className='chain_row'>
        <div key={chainInfo.id} onClick={() => editChain()} className='chain'>
            <div className='cell'>{chainInfo.activating_event}</div>
            <div className='cell'>{chainInfo.beliefs.map(belief => 
                <div key={"belief"+belief.id}>{belief.description}</div>
            )}</div>
            <div className='cell'>Emotions:<ul>{chainInfo.emotions.map(emotion =>
                <li key={"emotion"+emotion.id}>{emotion.emotion_type}</li>
            )}</ul>
            <p>Response: {chainInfo.response}</p>
            
            </div>
            <div className='cell'>{chainInfo.beliefs.map((belief) => (<div key={"rational" + belief.id} className='rational_row'>{belief.rational_thought.description}</div>))}</div>
            <div className='cell'>{chainInfo.future_action}</div>
            <div className='cell'>{chainInfo.goal}</div>
            <div className='cell'><div>{date}</div></div>
        </div>
        <button onClick={() => deleteChain()} className='delete_button'>x</button>
        </div>
    );
}

export default Chain