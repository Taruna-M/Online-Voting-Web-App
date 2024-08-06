import React, { useState } from 'react';
import {useNavigate } from 'react-router-dom';
import axios from 'axios';
function VoterLogin(){
    const navigate=useNavigate();
    const [electionId, setElectionId] = useState('');
    const [voterId, setVoterId] = useState(''); // eslint-disable-line
    
    //const lock=document.getElementById('lock');
    const submit=async (e)=>{
        if (voterId && electionId){
            e.preventDefault();
            try{
                await axios.post('http://localhost:5000/voterLogin',{
                    electionId,voterId
                })
                .then(res=>{
                    // eslint-disable-next-line
                    if (res.data.message==='exist'){
                        const {token} = res.data
                        sessionStorage.setItem('voterToken', token);
                        sessionStorage.setItem('voterID',voterId);
                        alert('Welcome VOTER');
                        navigate(`/voter/${electionId}/${voterId}`)
                        
                    }
                    // eslint-disable-next-line
                    else if (res.data==='voted'){
                        alert('Oops! Looks like you already voted for this election.');
                        
                    }
                    else if (res.data === 'no voter'){
                        alert("Sorry! Couldn't find a voter registered with that ID");
                       
                    }
                    else if (res.data === 'not open'){
                        alert("Sorry! The election is not open yet or has been closed. Contact the administrator");
                    }
                    else if (res.data === 'no election'){
                        alert("Sorry! Wrong Election ID");
                        
                    }
                    setElectionId('');
                    setVoterId('');
                    
                })
                .catch(e=>{
                    console.log(e);
                })

            }catch(e) {console.log(e)};
            }
            else alert('Enter VoterID and ElectionID')
      }

    return(
    <div className="bg-dark ">
    <div className="flex-container">
    <h1 className="text-center jersey-10-regular text-white m-0" style={{fontSize: 'xxx-large'}}>VOTER LOGIN PAGE</h1>
        <div className="p-5" >
            <div className="m-5 text-center">
                    <svg id="lock" xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="white" className="bi bi-unlock" viewBox="0 0 16 16">
                        
                        <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2m3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2M5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1"/>
                    </svg>
            </div>
            <form>
                <div className="form-floating text-black">
                    <input value={electionId} onChange={(e) => {setElectionId(e.target.value)}} type="text" className="form-control" id="electionId" placeholder="*********-election-name" size="50" />
                    <label htmlFor="electionId" className="form-label" style={{fontSize: 'large'}}>Election ID</label>
                </div>
                <div className="form-floating text-black">
                    <input value={voterId} onChange={(e) => {setVoterId(e.target.value)}} type="text" className="form-control" id="voterId" placeholder="*********-voter-name" size="50"/> 
                    <label htmlFor="voterId" className="form-label" style={{fontSize: 'large'}}>Voter ID</label>
                </div>
                    <div className="text-center m-3">
                        <button onClick={submit} type="button" id="loginButton" className="btn btn-outline-primary w-100">Sign-In</button>
                    </div>
                </form>
                
               
            </div>
    </div>
</div>
    );
}
export default VoterLogin;
