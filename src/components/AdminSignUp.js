import React, { useState } from 'react';
import { Link , useNavigate} from 'react-router-dom';
import axios from 'axios';
function AdminSignUp(){
    const history=useNavigate();
    const handleFocus = () => {
        document.getElementById("message").style.display = "block";
      };
    const handleBlur = () => {
        document.getElementById("message").style.display = "none";
    };
    const [password, setPassword] = useState(''); // eslint-disable-line
    const [isPassValid, setIsPassValid] = useState(false);
    const [email, setEmail] = useState(''); // eslint-disable-line
    const [isEmailValid, setIsEmailValid] = useState(false);
    //const lock=document.getElementById('lock');
    const emailVal=(e)=>{
        const newEmail=e.target.value;
        setEmail(newEmail);
        const emailRegex=/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // eslint-disable-line
        const valid=emailRegex.test(newEmail);
        setIsEmailValid(valid);
    }
    const passVal=(e)=>{
        const newPassword = e.target.value;
        setPassword(newPassword);
    
        const lowerCaseRegex = /[a-z]/;
        const upperCaseRegex = /[A-Z]/;
        const numberRegex = /[0-9]/;
        const minLength = 8;

        const isLowerCaseValid = lowerCaseRegex.test(newPassword);
        const isUpperCaseValid = upperCaseRegex.test(newPassword);
        const isNumberValid = numberRegex.test(newPassword);
        const isLengthValid = newPassword.length >= minLength;

        setIsPassValid(isLowerCaseValid && isUpperCaseValid && isNumberValid && isLengthValid);
        document.getElementById("letter").style.color = isLowerCaseValid ? "green" : "red";
        document.getElementById("capital").style.color = isUpperCaseValid ? "green" : "red";
        document.getElementById("number").style.color = isNumberValid ? "green" : "red";
        document.getElementById("length").style.color = isLengthValid ? "green" : "red";
    }
    const submit=async (e)=>{
        if (isPassValid && isEmailValid){
            e.preventDefault();
            
            try{
                await axios.post('http://localhost:5000/adminSignUp',{
                    email,password
                })
                .then(res=>{
                    if (res.data==='exist'){
                        alert('Admin already exists')
                        history('/adminLogin');
                    }
                    else if (res.data==='created'){
                        alert('Account Created Welcome To The Family!! You will now be redirected to the login page where you can login with your newly created credentials');
                        history('/adminLogin');
                    }

                })
                .catch(e=>{
                    console.log(e);
                })

            }catch(e) {console.log(e)};
            }
      }

    return(
    <div className="bg-dark ">
    <div className="flex-container">
    <h1 className="text-center jersey-10-regular text-white m-0" style={{fontSize: 'xxx-large'}}>ADMIN SIGNUP PAGE</h1>
        <div className="p-5" >
            <div className="m-5 text-center">
                    <svg id="lock" xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="white" className="bi bi-unlock" viewBox="0 0 16 16">
                        
                        <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2m3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2M5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1"/>
                    </svg>
            </div>
            <form action='POST'>
                <div className="form-floating text-black">
                    <input onChange={emailVal} type="email" className="form-control" id="email" placeholder="Email Address" size="50" />
                    <label htmlFor="email" className="form-label" style={{fontSize: 'large'}}>Email Address</label>
                </div>
                <div className="form-floating text-black">
                    <input onFocus={handleFocus} onBlur={handleBlur} onChange={passVal} type="password" className="form-control" id="pass" placeholder="Password" /> 
                    <label htmlFor="pass" className="form-label" style={{fontSize: 'large'}}>Password</label>
                </div>
                <div id="message">
                    <h6>Password must contain the following:</h6>
                    <p id="letter" >A <b>lowercase</b> letter</p>
                    <p id="capital" >A <b>capital (uppercase)</b> letter</p>
                    <p id="number" >A <b>number</b></p>
                    <p id="length" >Minimum <b>8 characters</b></p>
                </div>
                    <div className="text-center m-3">
                        <button onClick={submit} type="button" id="signUpButton" className="btn btn-outline-primary w-100">Create Account</button>
                    </div>
                </form>
                <br/>
            
                <div className="text-center m-3">
                    <Link to='/adminLogin' type="button" id="loginPageButton" className="btn btn-outline-primary w-100">Sign-In</Link>
                </div>
            </div>
    </div>
</div>
    );
}
export default AdminSignUp;