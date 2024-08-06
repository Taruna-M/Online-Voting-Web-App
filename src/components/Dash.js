import React, {useEffect, useState } from 'react';
import { useParams, useNavigate} from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import {Table } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
import CropImage from './CropImage';
import './styling/style.css' 
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
function Dash() {
  const navigate = useNavigate();
  const { email, electionId } = useParams();
  const [electionData, setElectionData] = useState({
    name: '',
    positions: [],
    candidates: {},
    isVotingOpen: false,
    voters: [],
    winners: {}
  });
  const [newPosition, setNewPosition] = useState('');
  const [positions, setPositions] = useState([]);
  const [newCandidate, setNewCandidate] = useState({ name: '', photo: '', description: '' });
  const [candidatePosition, setCandidatePosition] = useState('');
  const [candidates, setCandidates] = useState({});
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showVoterModal, setShowVoterModal] = useState(false);
  const [newVoter, setNewVoter] = useState({_id:'', name: '', voted: false });
  const [voters, setVoters] = useState([]);
  const [winners, setWinners] = useState({});
  const [imageToCrop, setImageToCrop] = useState(null);
  const [cropping, setCropping] = useState(false);
  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const loggedInEmail = sessionStorage.getItem('adminEmail');

    if (!token || loggedInEmail !== email) {
      navigate('*'); // Redirect to not found
      return;
    }
    axios.get(`http://localhost:5000/get/election/${electionId}`)
      .then((res) => {
        if (res.data==='noElection') {
          navigate('*');
          return
        }
        setElectionData(res.data);
        setPositions(res.data.positions);
        setCandidates(res.data.candidates);
        setVoters(res.data.voters);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [electionId,email,navigate]);

  const startElection = () => {
    axios.post(`http://localhost:5000/startElection/${electionId}`)
      .then(() => {
        alert('Election started!');
        setElectionData({...electionData, isVotingOpen: true});
      })
      .catch(err => console.log(err));
  };

  const endElection = () => {
    axios.post(`http://localhost:5000/endElection/${electionId}`)
      .then((res) => {
        setWinners(res.data.winners);
        alert('Election ended!');
        setElectionData({...electionData, isVotingOpen: false});
      })
      .catch(err => console.log(err));
  };
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file){
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageToCrop(reader.result);
      setCropping(true);
    };
    reader.readAsDataURL(file);}
  };
  const handleCropComplete = (croppedImage) => {
    setCropping(false);
    if (croppedImage) {
      if(editingCandidate){
        setEditingCandidate((prevState) => ({
          ...prevState,
          photo: croppedImage,
        }));
      }
      else{
        setNewCandidate((prevState) => ({
          ...prevState,
          photo: croppedImage,
        }));
      }
    }
  };
  

  const addPosition = () => {
    if (newPosition && !positions.includes(newPosition)) {
      const updatedPositions = [...positions, newPosition];
      setPositions(updatedPositions);
      setElectionData(prevData => ({
        ...prevData,
        positions: updatedPositions
      }));

      setNewPosition('');
    } else if (positions.includes(newPosition)) {
      alert('Position already exists');
      setNewPosition('');
    } else if (!newPosition) alert('Enter a position to add');
  };

  const deletePosition = (position) => {
    const prompt = window.confirm('!!DELETING POSITION DELETES RESPECTIVE CANDIDATES AS WELL!! Do you want to continue?');
    if (prompt) {
      const updatedPositions = positions.filter(pos => pos !== position);
      const updatedCandidates = { ...candidates };
      delete updatedCandidates[position];
      setPositions(updatedPositions);
      setCandidates(updatedCandidates);
      setElectionData(prevData => ({
        ...prevData,
        positions: updatedPositions,
        candidates: updatedCandidates
      }));
    }
  };
  

  const addCandidate = () => {
    if (newCandidate.name && candidatePosition) {
      const candidateExists = Object.values(candidates).some((candidatesArray) =>
        candidatesArray.some(candidate => candidate.name === newCandidate.name)
      );
      console.log(newCandidate.photo)
      if (!candidateExists) {
        const updatedCandidates = { ...candidates };
        if (!updatedCandidates[candidatePosition]) {
          updatedCandidates[candidatePosition] = [];
        }
        updatedCandidates[candidatePosition].push(newCandidate);
        setCandidates(updatedCandidates);
        setElectionData(prevData => ({
          ...prevData,
          candidates: updatedCandidates
        }));
        setNewCandidate({ name: '', photo: '', description: '' });
        setCandidatePosition('');
      } else {
        alert('Candidate already exists');
        setNewCandidate({ name: '', photo: '', description: '' });
      }
    } else if (!newCandidate.name) alert('Enter a candidate to add');
    else if (!candidatePosition) alert('Select a position to add candidate');
  };

  const deleteCandidate = (position, candidate) => {
    const updatedCandidates = { ...candidates };
    updatedCandidates[position] = updatedCandidates[position].filter(cand => cand.name !== candidate.name);
    if (updatedCandidates[position].length === 0) {
      delete updatedCandidates[position];
    }
    setCandidates(updatedCandidates);
    setElectionData(prevData => ({
      ...prevData,
      candidates: updatedCandidates
    }));
  };

  const capitalize = (word) => {
    const words = word.split(" ");
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i][0].toUpperCase() + words[i].substr(1);
    }
    return words.join(" ");
  };

  const startEditing = (position, candidate) => {
    setEditingCandidate({ ...candidate,  position});
  };

  const saveEditedCandidate = () => {
    if (editingCandidate.name.trim() === '') {
      alert('Candidate name cannot be empty');
      return;
    }
    const candidateExists = Object.values(candidates).some((candidatesArray) =>
      candidatesArray.some(cand =>cand._id !== editingCandidate._id && cand.name === editingCandidate.name)
    );
    
    if (!candidateExists){
      const updatedCandidates = { ...candidates };
      const {position} = editingCandidate;
      const candidateIndex = updatedCandidates[position].findIndex(cand => cand._id === editingCandidate._id);
      updatedCandidates[position][candidateIndex] = { ...editingCandidate };
      setCandidates(updatedCandidates);
      setElectionData(prevData => ({
        ...prevData,
        candidates: updatedCandidates
      }));
    }
    else alert('Candidates cannot have the same name')
    setEditingCandidate(null);
    console.log(editingCandidate)
  };

  const validatePositionsAndCandidates = () => {
    return positions.every(position => candidates[position] && candidates[position].length > 0);
  };

  const saveChanges = () => {
    if (!validatePositionsAndCandidates()) {
      alert('Each position must have at least one candidate.');
      return;
    }
    axios.post(`http://localhost:5000/update/election/${electionId}`, {
      email,
      positions,
      candidates,
    })
    .then((res) => {
      if (res.data==='done'){
      alert('Changes saved successfully');}
      else if (res.data==='noAdmin'){
        alert('Admin not found')
      }
      else alert('Server Error')
      setShowModal(false);
    })
    .catch((err) => {
      console.log(err);
    });
  };

  const addVoter =() => {
    if (newVoter.name.trim() === '') {
      alert('Voter name cannot be empty');
      return;
    }
    const {name,voted} = newVoter;
    axios.post(`http://localhost:5000/registerVoter/${electionId}`,{
      name,
      voted,
    })
    .then((res) => {
      if (res.data==='noElection' || res.data==='Admin not found'){
        navigate('*');
        return
      }
      else if (res.data==='Voter already exists'){
        alert('Voter already exists')
      }
      else {
        const updatedNewVoter = {...newVoter, _id: res.data};
        const updatedVoters = [...voters, updatedNewVoter];
        setVoters(updatedVoters);
        console.log(updatedVoters);
        setNewVoter({_id:'',name:'',voted: false});
        alert('Voter Registered')
      }
      setShowVoterModal(false);
    })
    .catch((err) => {
      console.log(err);
    });
  };

  const deleteVoter = (voter) => {
    const prompt = window.confirm('Are you sure you want to delete this voter?');
    console.log(voter._id);
    if (prompt) {
      const updatedVoters = voters.filter(vote => vote !== voter);
      console.log(updatedVoters)
      setVoters(updatedVoters);
      setElectionData(prevData => ({
        ...prevData,
        voters: updatedVoters
      }));
      axios.post(`http://localhost:5000/deleteVoter/${electionId}`, { voterId: voter._id })
        .then((res) => {
          if (res.data==='deleted'){
          alert('deleted')}
          else if (res.data==='noElection' || res.data==='Admin not found'){
            navigate('*');
            return
          }
        })
        .catch((err) => {
          console.log(err);
          alert('Error deleting voter');
        });
    }
  }
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  
  const generateChartData = (position) => {
    const positionCandidates = candidates[position] || [];
    const labels = positionCandidates.map(candidate => candidate.name);
    const data = positionCandidates.map(candidate => candidate.votes);
  
    return {
      labels,
      datasets: [{
        label: `Votes for ${capitalize(position)}`,
        data,
        backgroundColor: getRandomColor(),
        borderColor: getRandomColor(),
        borderWidth: 1,
      }],
    };
  };
  
  

  return (
    <Container fluid className='main text'>
      <Container>
        <Row>
          <h1 className="mb-4 prata-regular text-center text" style={{fontSize: '5em'}}>Election Details</h1>
        </Row>
      </Container>
      <Container className='p-4'>
        <Row className='mb-4'>
          <h2>Positions:</h2>
          {electionData.positions.length === 0 ? (
            <p>You have no positions.</p>
          ) : (
            <ListGroup>
              {electionData.positions.map((position, index) => (
                <ListGroup.Item key={index}>{position.toUpperCase()}</ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Row>
        <div>
                <strong>Candidates:</strong>
                {Object.keys(electionData.candidates).length === 0 ? (
            <p>No candidates available.</p>
          ) : (
            Object.keys(electionData.candidates).map((position,posIndex) => (
              <div key={posIndex}>
                <h3>{capitalize(position)}</h3>
                <Table  responsive striped bordered hover variant="dark">
                  <thead style={{width: '100px'}}>
                    <tr>
                      <th style={{ width: '150px', textAlign: 'center' }}>Photo</th>
                      <th style={{ width: '150px', textAlign: 'center' }}>Name</th>
                      <th style={{ width: '200px', textAlign: 'center' }}>Description</th>
                      <th style={{ width: '200px', textAlign: 'center' }}>Votes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {electionData.candidates[position].map((candidate,index) => (
                      <tr key={index}>
                        <td>
                          {candidate.photo ? (
                            <img src={candidate.photo} alt="Candidate" style={{ width: '150px', height: '150px' }} />
                          ) : (
                            <p><i>No Image</i></p>
                          )}
                        </td>
                        <td>{candidate.name}</td>
                        <td>{candidate.description || <p><i>No Description</i></p>}</td>
                        <td>{candidate.votes}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ))
          )}
              </div>
        <Button variant='primary' onClick={() => setShowModal(true)}>Edit Election</Button>
        
      </Container>
      <Container>
        <Row className="my-4">
          <Col>
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
              <Modal.Header closeButton>
                <Modal.Title>Dashboard</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <h2 className="mb-4">Election Name: {electionData.name.toUpperCase()}</h2>
                <h2 className="mb-4">Election ID: {electionId}</h2>
                <Form className="mb-4">
                  <h3>Positions</h3>
                  <Form.Group controlId="formNewPosition" className="mb-3">
                    <Form.Control
                      type='text'
                      placeholder='e.g. President'
                      value={newPosition}
                      onChange={(e) => setNewPosition(e.target.value.toLowerCase())}
                    />
                  </Form.Group>
                  <Button variant='primary' onClick={addPosition} className="mb-3">Add Position</Button>
                  <ListGroup>
                    {positions.map((position, posIndex) => (
                      <ListGroup.Item key={posIndex} className="d-flex justify-content-between align-items-center">
                        {position.toUpperCase()}
                        <Button variant='danger' onClick={() => deletePosition(position)}>Delete Position</Button>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Form>
                <Form className="mb-4">
                  <h3>Candidates</h3>
                  <Form.Group controlId="formNewCandidateName" className="mb-3">
                    <Form.Control
                      type='text'
                      placeholder='e.g. John Doe'
                      value={newCandidate.name}
                      onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value.toLowerCase() })}
                      disabled={!positions.length}
                    />
                  </Form.Group>
                  <Form.Group controlId="formNewCandidatePhoto" className="mb-3">
                    <Form.Control
                      type='file'
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e)}
                      disabled={!positions.length}
                    />
                    {cropping && <CropImage image={imageToCrop} onCropComplete={handleCropComplete} />}
                  </Form.Group>
                  <Form.Group controlId="formNewCandidateDescription" className="mb-3">
                    <Form.Control
                      type='text'
                      placeholder='Candidate description'
                      value={newCandidate.description}
                      onChange={(e) => setNewCandidate({ ...newCandidate, description: e.target.value })}
                      disabled={!positions.length}
                    />
                  </Form.Group>
                  <Form.Group controlId="formCandidatePosition" className="mb-3">
                    <Form.Control
                      as="select"
                      value={candidatePosition}
                      onChange={(e) => setCandidatePosition(e.target.value.toLowerCase())}
                      disabled={!positions.length}
                    >
                      <option value=''>Select a Position</option>
                      {positions.map((position, posIndex) => (
                        <option key={posIndex} value={position}>{position.toUpperCase()}</option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                  <Button variant='primary' onClick={addCandidate} className="mb-3">Add Candidate</Button>
                  <ListGroup>
                    {Object.keys(candidates).map((key) => (
                      <ListGroup.Item key={key}>
                        {key.toUpperCase()} :
                        <ListGroup variant="flush">
                          {candidates[key].map((candidate, candidateIndex) => (
                            <ListGroup.Item key={candidateIndex} className="d-flex justify-content-between align-items-center">
                              <div>
                              <div>
                                <strong>Photo: </strong>
                                {candidate.photo ? (
                                  <img src={candidate.photo} alt="Candidate" style={{ width: '100px', height: '100px' }} />
                                  ) : (
                                  <p><i>No Image</i></p>
                                )}
                              </div>
                              <div>
                                <strong>Name: </strong>
                                <p>{capitalize(candidate.name)}</p>
                              </div>
                              <div>
                                <strong>Description: </strong>
                                {candidate.description ? (
                                  <p>{candidate.description}</p>
                                ) : (
                                  <p><i>No Description</i></p>

                                )}
                                
                              </div>
                              </div>
                              {editingCandidate && editingCandidate.position === key && editingCandidate._id===candidate._id ? (
                                <div>
                                  <Form.Control
                                    type='text'
                                    value={editingCandidate.name}
                                    onChange={(e) => {
                                      setEditingCandidate({ ...editingCandidate, name: e.target.value.toLowerCase() });
                                    }}
                                    className='m-2'
                                  />
                                  <Form.Control
                                    type='file'
                                    accept="image/*"
                                    onChange={(e) => handlePhotoUpload(e)}
                                    className='m-2'
                                  />
                                  {cropping && <CropImage image={imageToCrop} onCropComplete={handleCropComplete} />}
                                  <Form.Control
                                    type='text'
                                    value={editingCandidate.description}
                                    onChange={(e) => setEditingCandidate({ ...editingCandidate, description: e.target.value })}
                                    className='m-2'
                                  />
                                  <Button variant='primary' onClick={saveEditedCandidate}>Save</Button>
                                </div>
                              ) : (
                                <div>
                                  <Button className='m-4' variant='warning' onClick={() => startEditing(key, candidate)}>Edit</Button>
                                  <Button className='m-4' variant='danger' onClick={() => deleteCandidate(key, candidate)}>Delete</Button>
                                </div>
                              )}
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant='success' onClick={saveChanges} className="me-2">Save Changes</Button>
                <Button variant='secondary' onClick={() => setShowModal(false)}>Close</Button>
              </Modal.Footer>
            </Modal>
          </Col>
        </Row>
      </Container>
      <Container className='text-center my-4'>
        <Button variant='success' onClick={startElection} disabled={electionData.isVotingOpen}>Begin Election</Button>
        <Button variant='danger' onClick={endElection} disabled={!electionData.isVotingOpen}>End Election</Button>
      </Container>
      {Object.keys(winners).length > 0 && (
        <Container className='my-4'>
          <h2>Election Results:</h2>
          {Object.keys(winners).map((position) => (
            <div key={position}>
              <h3>{capitalize(position)}: {winners[position].name}</h3>
            </div>
          ))}
        </Container>
      )}
      <Container>
    <h2 className="text-center mb-4">Election Results</h2>
    {positions.map(position => (
      <Row key={position} md={6} lg={4} className="mb-4">
        <h3>{capitalize(position)}</h3>
        <Bar
          data={generateChartData(position)}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: `Votes for ${capitalize(position)}`,
              },
            },
            scales: {
              x: {
                stacked: true,
              },
              y: {
                stacked: true,
              },
            },
          }}
        />
      </Row>
    ))}
</Container>

      <Container className='text-center'>
        <Row>
          <h1 className="mb-4">Registered Voters</h1>
        </Row>
        <Button variant='secondary' onClick={() => setShowVoterModal(true)} className="ms-2 mb-4">Register Voter</Button>
        
        <Table bordered striped responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>ID</th>
              <th>Voted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {voters.length === 0 ?
            (<tr>
              <td colSpan={4} className="text-center">No voters registered</td>
            </tr>)
            :(
            voters.map((voter, vIndex) => (
              <tr key={vIndex}>
                <td>{capitalize(voter.name)}</td>
                <td>{voter._id}</td>
                <td>{String(voter.voted)}</td>
                <td>
                  <Button variant='danger' onClick={() => deleteVoter(voter)}>Delete Voter</Button>
                </td>
              </tr>
            )))}
          </tbody>
        </Table>
      </Container>

      <Modal show={showVoterModal} onHide={() => setShowVoterModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Register Voter</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formVoterName" className="mb-3">
              <Form.Control
                type='text'
                placeholder='Voter Name'
                value={newVoter.name}
                onChange={(e) => setNewVoter({ ...newVoter, name: e.target.value })}
              />
            </Form.Group>
            <Button variant='primary' onClick={addVoter} className="mb-3">Add Voter</Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowVoterModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Dash;
