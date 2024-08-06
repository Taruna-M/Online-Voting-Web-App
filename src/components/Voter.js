import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import { Container, Row, Col, Nav, Button } from 'react-bootstrap';
import './styling/style.css'
function Voter() {
  const navigate = useNavigate()
  const { electionId, voterId } = useParams();
  const [electionData, setElectionData] = useState({
    name: '',
    positions: [],
    candidates: {}, // Adjusted initial state structure
    voters: []
  });
  useEffect(() => {
    const token = sessionStorage.getItem('voterToken');
    const storedId = sessionStorage.getItem('voterID'); // Retrieve the stored id

  if (!token || voterId !== storedId) { // Check if the id in the URL matches the stored id
    navigate('*');
    return;
  }
    axios.get(`http://localhost:5000/get/election/${electionId}`)
      .then((res) => {
        if (res.data==='noElection'){
          navigate('*');
          return
        }
        setElectionData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [electionId, voterId, navigate]);

  const name = electionData.name;
  const positions = electionData.positions;
  const candidates = electionData.candidates;
  const [votedCandidates,setVotedCandidates] = useState({})

  const voting = (position,candidate)=>{
    setVotedCandidates((prev)=>({
      ...prev,
      [position]:candidate._id
    }))
  }

  const submitVotes = () => {
    if (Object.keys(votedCandidates).length !== positions.length) alert('One candidate from each position must be selected')
    else{
    const token = sessionStorage.getItem('voterToken');
    const voteData = {
      votedCandidates
    };
  
    axios.patch(`http://localhost:5000/submit/vote/${electionId}/${voterId}`, voteData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then((res) => {
      if (res.data === 'Voter has already voted'){
        alert('You have already voted');
        navigate('/voterLogin',{replace:true})
      }
      else if (res.data === 'Voter not found'){
        alert(res.data);
        navigate('*');
        return;
      }
      else if (res.data === 'Election not found'){
        alert(res.data);
        navigate('*');
        return;
      }
      else if (res.data === 'Vote submitted successfully'){
        alert(res.data);
        sessionStorage.removeItem('voterToken');
        sessionStorage.removeItem('voterID');
        navigate('/voterLogin',{replace:true})
        return
      }
      //navigate('/thank-you'); // Navigate to a thank-you page or similar
    })
    .catch((err) => {
      if (err.response && err.response.status === 401) {
        // Token expired
        alert('Session expired. Please log in again.');
        navigate('/voterLogin',{replace: true})
      } else {
        console.error('Error submitting vote:', err);
      }
    });
  }
  };
  

  const capitalize = (word) => {
    if (!word) return '';
    const words = word.split(" ");
    for (let i = 0; i < words.length; i++) {
      if (words[i]) {
        words[i] = words[i][0].toUpperCase() + words[i].substr(1);
      }
    }
    return words.join(" ");
  };

  

  const scrollToPosition = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Container className="text-center">
      <h1>Election Name: {capitalize(name)}</h1>
      <Nav variant="tabs" className="justify-content-center">
        {positions.map((position, index) => (
          <Nav.Item key={index}>
            <Nav.Link onClick={() => scrollToPosition(`position-${index}`)}>
              {capitalize(position)}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>
      <Container>
        {positions.map((position, index) => (
          <div key={index} id={`position-${index}`} className="my-5">
            <h2>{capitalize(position)}</h2>
            <Row>
              {(candidates[position] || []).map((candidate, idx) => ( // Accessing candidates for the specific position
                <Col key={idx} md={4} className="mb-4">
                  <div className={`card ${votedCandidates[position] === candidate._id ? 'selected' : ''}`}>
                    {candidate.photo ? (
                      <img
                        src={candidate.photo}
                        className="card-img-top candidate-photo"
                        alt={candidate.name || "Candidate Photo"}
                      />
                    ): <p><i>No Photo Available</i></p>}
                    <div className="card-body">
                      <h5 className="card-title">{candidate.name || "Unnamed Candidate"}</h5>
                      <p className="card-text">{candidate.description || <i>No Description Available.</i>}</p>
                    </div>
                    <Button onClick={()=>voting(position,candidate)}>Vote</Button>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        ))}
        <Button onClick={submitVotes}>Submit Vote</Button>
      </Container>
    </Container>
  );
}

export default Voter;
