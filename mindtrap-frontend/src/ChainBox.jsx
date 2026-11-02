import './chain-box.css'
import ChainScrollWindow from './ChainScrollWindow.jsx'
import { States, ActionStates } from './States.jsx';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useState, Fragment } from 'react';
import GeneralButton from './GeneralButton.jsx'

const API_URL = 'http://localhost:7000/chains'

function ChainBox({chains, state, setState, actionState, setActionState, onSaved}){
    const [selectedDate, setSelectedDate] = useState(null);
    const [activatingEvent, setActivatingEvent] = useState("");
    const [createdChain, setChain] = useState({})
    const [createdBeliefs, setBeliefs] = useState([])
    const [createdEmotions, setEmotions] = useState([])
    const [createdExplanations, setExplanations] = useState([])
    const [createdResponse, setResponse] = useState("")
    const [createdFutureAction, setFutureAction] = useState("")
    const [createdGoal, setCreatedGoal] = useState("")
    const [saving, setSaving] = useState(false)

    const withKey = (item) => ({ ...item, client_key: item.client_key ?? crypto.randomUUID() })

    const fillInfo = (chainInfo) => {
        const beliefs = (chainInfo.beliefs ?? []).map(b => ({
            ...withKey(b),
            arguments: (b.arguments ?? []).map(withKey),
            rational_thought: b.rational_thought
                ? withKey(b.rational_thought)
                : { client_key: crypto.randomUUID(), description: "", believability: "" }
        }))

        setChain(chainInfo)
        setSelectedDate(chainInfo.occured_at ? new Date(chainInfo.occured_at) : null)
        setActivatingEvent(chainInfo.activating_event)
        setBeliefs(beliefs)
        setEmotions((chainInfo.emotions ?? []).map(withKey))
        setExplanations((chainInfo.explanations ?? []).map(withKey))
        setResponse(chainInfo.response ?? "")
        setFutureAction(chainInfo.future_action ?? "")
        setCreatedGoal(chainInfo.goal ?? "")
    }

    const clearAllCreatedData = () => {
        setEmotions([])
        setBeliefs([])
        setChain({})
        setActivatingEvent("")
        setSelectedDate(null)
        setExplanations([])
        setResponse("")
        setFutureAction("")
        setCreatedGoal("")
    }

    
    const processChain = async (currentStepData = {}) => {
        const finalChain = { ...createdChain, ...currentStepData }
        const isCreate = actionState === ActionStates.CREATE
        const url = isCreate ? API_URL : `${API_URL}/${finalChain.id}`

        try {
            const res = await fetch(url, {
                method: isCreate ? 'POST' : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalChain),
            })

            const text = await res.text()

            if (!res.ok) {
                console.error(`${isCreate ? 'POST' : 'PUT'} ${url} failed:`, res.status, text)
                alert(`Saving failed (HTTP ${res.status})`)
                return false
            }

            const data = text ? JSON.parse(text) : null
            console.log('Saved chain:', data)
            return true
        } catch (err) {
            console.error('Saving failed:', err)
            alert('Saving failed: ' + err.message)
            return false
        }
    }

    
    const finish = async (currentStepData = {}) => {
        if (saving) return
        setSaving(true)
        const ok = await processChain(currentStepData)
        setSaving(false)
        if (!ok) return
        clearAllCreatedData()
        setState(States.HOME)
        if (onSaved) await onSaved()
    }

    const updateBelief = (index, field, value) =>
    setBeliefs(prev => prev.map((b, i) => i === index ? { ...b, [field]: value } : b))

    const updateExplanation = (index, field, value) =>
    setExplanations(prev => prev.map((exp, i) => i === index ? { ...exp, [field]: value } : exp))

    const updateEmotion = (index, field, value) =>
    setEmotions(prev => prev.map((e, i) => i === index ? { ...e, [field]: value } : e))

    const addArgument = (beliefIndex, isPositive) =>
    setBeliefs(prev => prev.map((b, i) => i === beliefIndex
        ? { ...b, arguments: [...b.arguments, { client_key: crypto.randomUUID(), description: "", is_positive: isPositive }] }
        : b))

    const updateArgument = (beliefIndex, argId, value) =>
    setBeliefs(prev => prev.map((b, i) => i === beliefIndex
        ? { ...b, arguments: b.arguments.map(a => a.client_key === argId ? { ...a, description: value } : a) }
        : b))

    const deleteArgument = (beliefIndex, argId) =>
    setBeliefs(prev => prev.map((b, i) => i === beliefIndex
        ? { ...b, arguments: b.arguments.filter(a => a.client_key !== argId) }
        : b))

    const renderArguments = (belief, i, isPositive) => (
        <>
            {belief.arguments.filter(a => a.is_positive === isPositive).map(arg => (
            <div key={arg.client_key} className='argument_row'>
                <input
                className='argument_textarea'
                placeholder={isPositive ? 'Argument for this belief' : 'Argument against this belief'}
                value={arg.description}
                onChange={e => updateArgument(i, arg.client_key, e.target.value)}
                />
                <GeneralButton className='button' color='red' text='Delete'
                setState={() => deleteArgument(i, arg.client_key)} />
            </div>
            ))}
            <GeneralButton className='button' color='green' text='Add argument'
            setState={() => addArgument(i, isPositive)} />
        </>
        )

    let content;
    switch (state){
        case States.ACTIVATING_EVENT:
            
            content = <>
                <div className='column_grid'>
                    <div className='column_name' id='active'>A - Activating event</div>
                    <div className='column_name' id='column2'>B - Beliefs</div>
                    <div className='column_name' id='column3'>C - Consequences</div>
                    <div className='column_name' id='column4'>D - Disputation</div>
                    <div className='column_name' id='column5'>E - Effect</div>
                    <div className='column_name' id='column6'>F - Future Action</div>
                    <div className='column_name' id='column7'>G - Goal</div>
                </div>
                <textarea className='activating_event_description' placeholder='Type your description here...' value={activatingEvent} onChange={(e) => setActivatingEvent(e.target.value)}></textarea>
                <div className='datepicker_container'><DatePicker className='datepicker' selected={selectedDate}
                    onChange={date => setSelectedDate(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select date..."/>
                </div>
                <div className='button_container'><GeneralButton className='button'  color="red" text='Cancel' setState={() => {
                    clearAllCreatedData()
                    setState(States.HOME)
                    }}></GeneralButton>
                <GeneralButton className='button' text='Next' setState={() => {
                    if (activatingEvent == "" || selectedDate == null) {
                        alert("all fields must be filled!")
                        return
                    }
                    setChain(prev => ({...prev, activating_event: activatingEvent, occured_at: selectedDate}))
                    setState(States.BELIEFS)
                    }}></GeneralButton>
                </div>
                
            </>
            break;
        case States.HOME:
            content = <>
                <div className='column_grid'>
                    <div className='column_name' id='column1'>A - Activating event</div>
                    <div className='column_name' id='column2'>B - Beliefs</div>
                    <div className='column_name' id='column3'>C - Consequences</div>
                    <div className='column_name' id='column4'>E - Effect</div>
                    <div className='column_name' id='column5'>F - Future action</div>
                    <div className='column_name' id='column6'>G - Goal</div>
                    <div className='column_name' id='column7'>Date</div>
                </div>
                <ChainScrollWindow chains={chains} setState={setState} fillInfo={fillInfo} setActionState={setActionState} onDeleted={onSaved}></ChainScrollWindow>
            </>
            break
        case States.BELIEFS:
            content = <>
                <div className='column_grid'>
                    <div className='column_name' id='column1'>A - Activating event</div>
                    <div className='column_name' id='active'>B - Beliefs</div>
                    <div className='column_name' id='column3'>C - Consequences</div>
                    <div className='column_name' id='column4'>D - Disputation</div>
                    <div className='column_name' id='column5'>E - Effect</div>
                    <div className='column_name' id='column6'>F - Future Action</div>
                    <div className='column_name' id='column7'>G - Goal</div>
                </div>
                {createdBeliefs.map((belief,i)=> (
                    <div key ={belief.client_key} className='belief_container'>
                        <input className='belief_textarea' placeholder='Type in your belief' value={belief.description} onChange={(e)=>{
                            updateBelief(i,"description", e.target.value)
                            }} ></input>
                        <div className='text_container'>On a scale of 1-10, rate how believable this thought is:</div>
                        <input className='believability_input' maxLength={2} value={belief.believability_before} onChange={(e) => {updateBelief(i,"believability_before",e.target.value)}}></input>
                        <div className='text_container'>And after you have done processing (D-E):</div>
                        <input className='believability_input' maxLength={2} value={belief.believability_after}  onChange={(e) => {updateBelief(i,"believability_after",e.target.value)}}></input>
                        <div className='delete_belief_button'>
                            <GeneralButton className='button' color='red' text='Delete' setState={ () =>
                                setBeliefs(createdBeliefs => createdBeliefs.filter((_,index) => i!=index))
                                }></GeneralButton>
                        </div>
                    </div>
                ))}
                
                <div className='new_belief_prompt'>
                    <GeneralButton className='button'  color="green" text='New belief' setState={
                        () => setBeliefs(createdBeliefs => [...createdBeliefs, {
                            client_key: crypto.randomUUID(),
                            description: "",
                            believability_before: "",
                            believability_after: "",
                            arguments: [],
                            rational_thought: { client_key: crypto.randomUUID(), description: "", believability: "" }
                        }])
                    }/></div>

                <div className='button_container'><GeneralButton className='button'  color="red" text='Cancel' setState={() => {
                    clearAllCreatedData()
                    setState(States.HOME)
                    
                    }}></GeneralButton>
                    <GeneralButton className='button' text='Go back' setState={() => {
                        setState(States.ACTIVATING_EVENT)
                    }}></GeneralButton>
                    <GeneralButton className='button' text='Next' setState={() => {
                        if(createdBeliefs.length == 0) {
                            alert("Atleast 1 belief must be present")
                            return
                        }
                        for (const belief of createdBeliefs){
                            if (!belief.description || !belief.believability_before) {
                                alert("At least description and initial believability must be filled for all created beliefs")
                                return
                            }
                        }
                    
                        setChain(prev => ({...prev, beliefs:createdBeliefs}))
                        setState(States.CONSEQUENCES)
                    }}></GeneralButton>
                </div>
            </>
        break
        case States.CONSEQUENCES:
            content = <>
                <div className='column_grid'>
                    <div className='column_name' id='column1'>A - Activating event</div>
                    <div className='column_name' id='column2'>B - Beliefs</div>
                    <div className='column_name' id='active'>C - Consequences</div>
                    <div className='column_name' id='column4'>D - Disputation</div>
                    <div className='column_name' id='column5'>E - Effect</div>
                    <div className='column_name' id='column6'>F - Future Action</div>
                    <div className='column_name' id='column7'>G - Goal</div>
                </div>
                {createdEmotions.map((emotion, i) => (
                    <Fragment key={emotion.client_key}>
                    <div className='emotion_container'>
                        
                        <input className='emotion_textarea' placeholder='Type in your emotion type(e.g. anxiety)' value={emotion.emotion_type} onChange={(e)=>{
                            updateEmotion(i,"emotion_type", e.target.value)
                            }} ></input>
                        <div className='text_container'>On a scale of 1-10, rate how intense this emotion is:</div>
                        <input className='intensity_input' maxLength={2} value={emotion.intensity_before}  onChange={(e) => {updateEmotion(i,"intensity_before",e.target.value)}}></input>
                        <div className='text_container'>And after you have done processing (D-E):</div>
                        <input className='intensity_input' maxLength={2} value={emotion.intensity_after} onChange={(e) => {updateEmotion(i,"intensity_after",e.target.value)}}></input>
                        <div className='delete_emotion_button'>
                            <GeneralButton className='button' color='red' text='Delete' setState={ () =>
                                setEmotions(createdEmotions => createdEmotions.filter((_,index) => i!=index))
                                }></GeneralButton>
                        </div>
                    </div>

                    <textarea className='emotion_description' value={emotion.description} placeholder='Type in a more detailed description of your emotion(optional)' onChange={(e) => {
                        updateEmotion(i,"description", e.target.value)
                    }}></textarea>
                    </Fragment>
                ))}

                <div className='new_emotion_prompt'>
                    <GeneralButton className='button'  color="green" text='New emotion' setState={
                        () => setEmotions(createdEmotions => [...createdEmotions, {client_key: crypto.randomUUID(), emotion_type:"", description:"", intensity_before:"", intensity_after:""}])
                    }/></div>

                <textarea className='response_description' placeholder='How did you act?' value={createdResponse} onChange={(e) => {setResponse(e.target.value)}}></textarea>

                <div className='button_container'><GeneralButton className='button'  color="red" text='Cancel' setState={() => {
                    clearAllCreatedData()
                    setState(States.HOME)
                    }}></GeneralButton>
                    <GeneralButton className='button' text='Finish' setState={() =>
                        finish({ emotions: createdEmotions, response: createdResponse })
                    }></GeneralButton>
                    <GeneralButton className='button' text='Go back' setState={() => {
                        setState(States.BELIEFS)
                    }}></GeneralButton>
                    <GeneralButton className='button' text='Next' setState={() => {
                        if(createdEmotions.length == 0) {
                            alert("At least 1 emotion must be present")
                            return
                        }
                        for (const emotion of createdEmotions){
                            if (!emotion.emotion_type|| !emotion.intensity_before) {
                                alert("At least emotion type and initial intensity must be filled for all created emotions")
                                return
                            }
                        }
                    
                        setChain(prev => ({...prev, emotions:createdEmotions, response:createdResponse}))
                        setState(States.DISPUTATION)
                    }}></GeneralButton>
                </div>

            </>
            break
        case States.DISPUTATION:
            content = <>
                <div className='column_grid'>
                    <div className='column_name' id='column1'>A - Activating event</div>
                    <div className='column_name' id='column2'>B - Beliefs</div>
                    <div className='column_name' id='column3'>C - Consequences</div>
                    <div className='column_name' id='active'>D - Disputation</div>
                    <div className='column_name' id='column5'>E - Effect</div>
                    <div className='column_name' id='column6'>F - Future Action</div>
                    <div className='column_name' id='column7'>G - Goal</div>
                </div>
                
                {createdBeliefs.map((belief, i) => (
                    <div key={belief.client_key} className='belief_argument_container'>
                        <div className='belief_header'>Belief {i + 1}: {belief.description}</div>
                        <div className='argumentation_container'>
                        <div className='argumentation_for'>{renderArguments(belief, i, true)}</div>
                        <div className='argumentation_against'>{renderArguments(belief, i, false)}</div>
                        </div>
                    </div>
                ))}

                <div className='explanations_container'>
                    {createdExplanations.map((explanation,i) => (
                        <div key={explanation.client_key} className='explanation_row'>
                            <textarea className='explanation_area' value={explanation.description} onChange={(e) => {updateExplanation(i,"description",e.target.value)}} placeholder='Type in your explanation for the event'></textarea>
                            <div className='text_container'>Do you think it's realistic?</div>
                            <input type='checkbox' className='realistic_checkbox' checked={explanation.is_realistic} onChange={(e) => updateExplanation(i,"is_realistic", e.target.checked)}></input>
                            <GeneralButton color="red" text="Delete" setState={() =>
                                setExplanations(prev => prev.filter(exp => exp.client_key !== explanation.client_key))
                            }></GeneralButton>
                        </div>
                    ))}
                    <div className='new_emotion_prompt'>
                    <GeneralButton className='button'  color="green" text='New explanation' setState={
                        () => setExplanations(createdExplanations => [...createdExplanations, {client_key: crypto.randomUUID(), description:"", is_realistic:false}])
                    }/></div>
                </div>

                

                <div className='button_container'><GeneralButton className='button'  color="red" text='Cancel' setState={() => {
                    clearAllCreatedData()
                    setState(States.HOME)
                    }}></GeneralButton>
                    <GeneralButton className='button' text='Finish' setState={() =>
                        finish({ beliefs: createdBeliefs, explanations: createdExplanations })
                    }></GeneralButton>
                    <GeneralButton className='button' text='Go back' setState={() => {
                        setState(States.CONSEQUENCES)
                    }}></GeneralButton>
                    <GeneralButton className='button' text='Next' setState={() => {
                        for (const belief of createdBeliefs){
                            if (belief.arguments.length == 0) {
                                alert("You must provide at least 1 argument(for or against) for every belief")
                                return
                            }
                            for (const argument of belief.arguments){
                            if (!argument.description) {
                                alert("Every created argument must have a description")
                                return
                            }
                            }
                        }
                        for (const explanation of createdExplanations){
                            if (explanation.description.length == 0) {
                                alert("Explanations can't be empty")
                                return
                            }
                        }
                        setChain(prev => ({...prev, beliefs:createdBeliefs, explanations:createdExplanations}))
                        setState(States.EFFECT)
                    }}></GeneralButton>
                </div>


            </>
            break
        case States.EFFECT:
            content = <>
                <div className='column_grid'>
                <div className='column_name' id='column1'>A - Activating event</div>
                <div className='column_name' id='column2'>B - Beliefs</div>
                <div className='column_name' id='column3'>C - Consequences</div>
                <div className='column_name' id='column4'>D - Disputation</div>
                <div className='column_name' id='active'>E - Effect</div>
                <div className='column_name' id='column6'>F - Future Action</div>
                <div className='column_name' id='column7'>G - Goal</div>
            </div>
            {createdBeliefs.map((belief, i) => (
                <div key={belief.client_key} className='belief_argument_container'>
                    <div className='belief_header'>Belief {i + 1}: {belief.description}</div>
                    
                    <div className='rational_row'>
                        <input className='rational_thought_area' value={belief.rational_thought.description} onChange={(e) => {updateBelief(i,"rational_thought", {...belief.rational_thought,  description: e.target.value})}} placeholder='Given your arguments and explanations, type in a more rational thought for this belief'></input>
                        <div className='text_container'>On a scale of 1-10, rate how believable this new thought is:</div>
                        <input className='intensity_input' maxLength={2} value={belief.rational_thought.believability}  onChange={(e) => {updateBelief(i,"rational_thought",{...belief.rational_thought, believability:e.target.value})}}></input>
                    </div>
                </div>
            ))}
            <div className='button_container'><GeneralButton className='button'  color="red" text='Cancel' setState={() => {
                clearAllCreatedData()
                setState(States.HOME)
                }}></GeneralButton>
                <GeneralButton className='button' text='Finish' setState={() =>
                    finish({ beliefs: createdBeliefs })
                }></GeneralButton>
                <GeneralButton className='button' text='Go back' setState={() => {
                    setState(States.DISPUTATION)
                }}></GeneralButton>
                <GeneralButton className='button' text='Next' setState={() => {
                    setChain(prev => ({...prev, beliefs:createdBeliefs}))
                    setState(States.FUTURE_ACTION)
                }}></GeneralButton>
            </div>
            </>
        break
        case States.FUTURE_ACTION:
            content =  <>
                <div className='column_grid'>
                <div className='column_name' id='column1'>A - Activating event</div>
                <div className='column_name' id='column2'>B - Beliefs</div>
                <div className='column_name' id='column3'>C - Consequences</div>
                <div className='column_name' id='column4'>D - Disputation</div>
                <div className='column_name' id='column5'>E - Effect</div>
                <div className='column_name' id='active'>F - Future Action</div>
                <div className='column_name' id='column7'>G - Goal</div>
            </div>
            <textarea className='future_action_area' value={createdFutureAction} onChange={(e) => {setFutureAction(e.target.value)}} placeholder='Type in your future actions'></textarea>
            <div className='button_container'><GeneralButton className='button'  color="red" text='Cancel' setState={() => {
                clearAllCreatedData()
                setState(States.HOME)
                }}></GeneralButton>
                <GeneralButton className='button' text='Finish' setState={() =>
                    finish({ future_action: createdFutureAction })
                }></GeneralButton>
                <GeneralButton className='button' text='Go back' setState={() => {
                    setState(States.EFFECT)
                }}></GeneralButton>
                <GeneralButton className='button' text='Next' setState={() => {
                    
                    setChain(prev => ({...prev, future_action:createdFutureAction}))
                    setState(States.GOAL)
                }}></GeneralButton>
            </div>
            </>
            break
        case States.GOAL:
            content= <>
                <div className='column_grid'>
                <div className='column_name' id='column1'>A - Activating event</div>
                <div className='column_name' id='column2'>B - Beliefs</div>
                <div className='column_name' id='column3'>C - Consequences</div>
                <div className='column_name' id='column4'>D - Disputation</div>
                <div className='column_name' id='column5'>E - Effect</div>
                <div className='column_name' id='column6'>F - Future Action</div>
                <div className='column_name' id='active'>G - Goal</div>
                </div>

            
            <textarea className='goal_area' value={createdGoal} onChange={(e) => {setCreatedGoal(e.target.value)}} placeholder='Type in your goal'></textarea>
            <div className='button_container'><GeneralButton className='button'  color="red" text='Cancel' setState={() => {
                clearAllCreatedData()
                setState(States.HOME)
                }}></GeneralButton>
                <GeneralButton className='button' text='Go back' setState={() => {
                    setState(States.FUTURE_ACTION)
                }}></GeneralButton>
                <GeneralButton className='button' text='Finish' setState={() =>
                    finish({ goal: createdGoal })
                }></GeneralButton>
            </div>
            </>
            break
    }
    return(
        <div className="chain_box">
            {content}
        </div>
    );
}

export default ChainBox
