import { useNavigate } from "react-router-dom";
import './styling/style.css'
function Home(){
   
    const navigate = useNavigate();

    const handleAdminLogin = () => {
        navigate("/adminLogin");
    };

    const handleVoterLogin = () => {
        navigate("/voterLogin");
    };
    return(
        <>
        <div className="container d-flex flex-column justify-content-center align-items-center">
            
            <p style={{fontSize: '1.5rem', color:'chocolate'}}>With online voting system, your organization members can cast their vote anywhere and anytime with secure internet voting</p>
            <div className="container">
                <div className="row text-center">
                    <div className="col loginDiv">
                        <div onClick={handleAdminLogin} style={{ cursor: 'pointer' }}>
                           <p style={{ fontSize: '2rem' }} className="jersey-10-regular text-white"> ADMIN LOGIN</p>
                           <img alt="admin login" src="./assets/admin.png" width="300px" height="300px" className="loginImg" style={{ borderRadius: '10%' }} />
                        </div>
                    </div>
                    <div className="col loginDiv">
                        <div onClick={handleVoterLogin} style={{ cursor: 'pointer' }}>
                            <p style={{ fontSize: '2rem' }} className="jersey-10-regular text-white"> VOTER LOGIN</p>
                            <img alt="voter login" src="./assets/vote.png" width="300px" height="300px" className="loginImg" style={{ borderRadius: '10%' }} />
                        </div>
                    </div>
                </div>
            </div>
            <h3 className="jersey-10-regular" style={{fontSize: '4rem', color: 'cadetblue'}}>What is Online Voting for an Election?</h3>
            <p style={{fontSize: '1.5rem', color:'chocolate'}}>Online voting (also known as electronic voting, or e-voting) is the 
                process of using an electronic method to cast, and then tabulate, votes in an election.By contrast, before online voting, elections were conducted using paper to cast votes, and tallies were performed by hand. While non-online voting is still prevalent in today’s society, the automation of the most important (but arguably, the most tedious) parts of an election (i.e., the voting and tallying) is causing online voting to accumulate enormous popularity. Using an internet voting site makes running an election simple and easy. Voters also enjoy participating in a remote election from any location.</p>
            </div>
    
    </>
    );
}
export default Home;







    
