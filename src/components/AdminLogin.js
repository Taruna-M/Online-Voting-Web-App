
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
function AdminLogin(){
    const navigate=useNavigate();
    const [password, setPassword] = useState(''); // eslint-disable-line
    const [email, setEmail] = useState(''); // eslint-disable-line
    const [isEmailValid, setIsEmailValid] = useState(false);
    const lock=document.getElementById('lock');
    const emailVal=(e)=>{
        const newEmail=e.target.value;
        setEmail(newEmail);
        const emailRegex=/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // eslint-disable-line
        const valid=emailRegex.test(newEmail);
        setIsEmailValid(valid);
    }
    
    // AdminLogin component
const submit = async (e) => {
    if (isEmailValid) {
      e.preventDefault();
      try {
        await axios.post('http://localhost:5000/adminLogin', {
          email,
          password,
        })
        .then(res => {
          if (res.data.message === 'exist') {
            const { token } = res.data;
            sessionStorage.setItem('authToken', token);
            sessionStorage.setItem('adminEmail', email); // Store the admin email
            lock.setAttribute('d', "M11 1a2 2 0 0 0-2 2v4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5V3a3 3 0 0 1 6 0v4a.5.5 0 0 1-1 0V3a2 2 0 0 0-2-2M3 8a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1z");
            alert('Welcome ADMIN');
            navigate(`/admin/${email}`, { replace: true });
          } else if (res.data==='noPassword'){
            alert('Password is not correct');
          }
          else if (res.data === 'notExist') {
            alert('You are not an existing admin, redirecting to signup page');
          }
        })
        .catch(e => console.log(e));
      } catch (e) {
        console.log(e);
      }
    }
  };
  
      const enter = (e) => {
        if (e.key==='Enter') document.getElementById('loginButton').click()
      }
    return(
    <div className="bg-dark ">
    <div className="flex-container">
    <h1 className="text-center jersey-10-regular text-white m-0" style={{fontSize: 'xxx-large'}}>ADMIN LOGIN PAGE</h1>
        <div className="p-5" >
            <div className="m-5 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="white" className="bi bi-unlock" viewBox="0 0 16 16">
                        
                        <path id='lock' d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2m3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2M5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1"/>
                    </svg>
            </div>
            <form>
                <div className="form-floating text-black">
                    <input onChange={emailVal} type="email" className="form-control" id="email" placeholder="Email Address" size="50" />
                    <label htmlFor="email" className="form-label" style={{fontSize: 'large'}}>Email Address</label>
                </div>
                <div className="form-floating text-black">
                    <input onChange={(e)=> setPassword(e.target.value)} type="password" className="form-control" id="pass" placeholder="Password" /> 
                    <label htmlFor="pass" className="form-label" style={{fontSize: 'large'}}>Password</label>
                </div>

                    <div className="text-center m-3">
                        <button onKeyDown={enter} onClick={submit} type="button" id="loginButton" className="btn btn-outline-primary w-100">Sign-In</button>
                    </div>
                </form>
                <br/>
                <div className="text-center m-3">
                    <Link to='/adminSignUp' type="button" id="loginPageButton" className="btn btn-outline-primary w-100">CREATE ACCOUNT</Link>
                </div>
            </div>
    </div>
</div>
    );
}
export default AdminLogin;
