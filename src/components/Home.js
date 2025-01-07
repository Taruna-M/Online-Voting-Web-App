import { useNavigate, Link } from "react-router-dom";
import { ProgressBar } from "./framerMotion";
import {Nav,Navbar,Container,Button} from 'react-bootstrap';
import { useRef } from "react";
import './styling/style.css'
function Home(){
    const election = useRef(null);
    const voting = useRef(null);
    const navigate = useNavigate();
    const scrollToSection = (elementRef)=>{
        if (!elementRef || !elementRef.current) window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
        else{
            window.scrollTo({
                top: elementRef.current.offsetTop,
                behavior: 'smooth'
            })
        }
        
    }
    const handleAdminLogin = () => {
        navigate("/adminLogin");
    };

    const handleVoterLogin = () => {
        navigate("/voterLogin");
    };
    return(
        <>
        <ProgressBar/>
        <Navbar expand="lg" bg="light" data-bs-theme="light" fixed="top" className="navbar-home">
            <Container fluid className="navbar-home">
            <Navbar.Brand onClick={()=>scrollToSection(null)}>Right To Vote</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
              <Nav className="">
                <Nav.Link onClick={()=>scrollToSection(election)}>Election</Nav.Link>
                <Nav.Link onClick={()=>scrollToSection(voting)}>Voting</Nav.Link>
              </Nav>
              <Button className="navBar-admin-login" variant="outline-success">Admin Login</Button>
              <Button variant="outline-primary">Voter Login</Button>
            </Navbar.Collapse>
            </Container>
        </Navbar>
        

      <Container fluid className="election-homepage" ref={election}>
        <div className="election-homepage-text">
            Vote anywhere, any time, any place, it's your right!
            <Link to={'/dummy'} className="btn btn-success me-2">Scan</Link>
        </div>
        <img src="./assets/homepage.png"/>
      </Container>
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







    
