import './search-bar.css'
import { useState, useEffect } from 'react';
function SearchBar({setChains}){
    const [query, SetQuery] = useState("")
    const URL = "http://localhost:7000/chains"
    useEffect(()=>{
        async function getChains(){
            const res = await fetch(`${URL}?query=${query}`)
            const json = await res.json()
            setChains(json)
            console.log(json)
        }
        getChains()
    },[query])

    return(
        <input placeholder="Search by emotion..." 
                value={query} 
                onChange={(e)=>SetQuery(e.target.value)} 
                className="search_bar">
         </input>
    );
}

export default SearchBar