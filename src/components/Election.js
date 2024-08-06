import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import axios from 'axios';
import CropImage from './CropImage';

function Election() {
  const navigate = useNavigate();
  const { email } = useParams();
  const [election, setElection] = useState('');
  const [newPosition, setNewPosition] = useState('');
  const [positions, setPositions] = useState([]);
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    photo: '',
    description: ''
  });
  const [candidates, setCandidates] = useState({});
  const [imageToCrop, setImageToCrop] = useState(null);
  const [cropping, setCropping] = useState(false);
  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const storedEmail = sessionStorage.getItem('adminEmail');
    if (!token || email !== storedEmail) { // Check if the email in the URL matches the stored email
      navigate('*');
      return;
    }
  }, [navigate,email]);

  const addPosition = () => {
    if (newPosition && !positions.includes(newPosition)) {
      setPositions((prevPositions) => [...prevPositions, newPosition]);
      setCandidates((prevCandidates) => ({ ...prevCandidates, [newPosition]: [] }));
      setNewPosition('');
      document.getElementById('candidateName').disabled = false;
      document.getElementById('candidatePosition').disabled = false;
    }
    else if (positions.includes(newPosition)) {
      alert('Position already exists');
      setNewPosition('');
    }
    else if (!newPosition) alert('Enter a position to add');
  };

  const deletePosition = (positionToDelete) => {
    setPositions((prevPositions) => prevPositions.filter((pos) => pos !== positionToDelete));
    setCandidates((prevCandidates) => {
      const newCandidates = { ...prevCandidates };
      delete newCandidates[positionToDelete];
      return newCandidates;
    });
  };

  const addCandidate = () => {
    if (newCandidate && positions.length) {
      const candidateExists = Object.values(candidates).some((candidatesArray) =>
        candidatesArray.some((candidate) => candidate.name === newCandidate.name)
      );
      if (!candidateExists) {
      const selectBox = document.getElementById('candidatePosition');
      const selectedPosition = selectBox.options[selectBox.selectedIndex].value;
      if (selectedPosition) {
        setCandidates((prevCandidates) => ({
          ...prevCandidates,
          [selectedPosition]: [...(prevCandidates[selectedPosition] || []), newCandidate],
        }));
        setNewCandidate({ name: '', photo: '', description: '' });
        document.getElementById('candidatePhoto').value = null;
      }
      else if (!selectedPosition) alert('Select a position to add candidate');
    }
    else {
      alert('Candidate already exists');
      setNewCandidate({ name: '', photo: '', description: '' });
      document.getElementById('candidatePhoto').value = null;
    }
    }
    else if (!newCandidate) alert('Enter a candidate to add');
    
  };

  const deleteCandidate = (position, candidateToDelete) => {
    setCandidates((prevCandidates) => ({
      ...prevCandidates,
      [position]: prevCandidates[position].filter((candidate) => candidate !== candidateToDelete),
    }));
  };

  const createElection = async () => {
    if (election && positions.length && Object.values(candidates).every((c) => c.length > 0)) {
      try {
        const token = sessionStorage.getItem('authToken');
        const res = await axios.post('http://localhost:5000/elections', {
          email,
          election,
          positions,
          candidates,
        },{
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data === 'saved') {
          alert('Election Created.');
          setElection("");
          setPositions([]);
          setCandidates({});
          navigate(`/admin/${email}`,{replace: true});
        } else {
          alert('Something went wrong');
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      alert('Enter election name and at least one candidate for each position');
    }
  };

  useEffect(() => {
    document.getElementById('createElection').disabled = !Object.values(candidates).every((c) => c.length > 0);
  }, [candidates]);

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
      setNewCandidate({ ...newCandidate, photo: croppedImage });
    }
  };

  const capitalize=(word)=>{
    const words = word.split(" ");
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i][0].toUpperCase() + words[i].substr(1);
  }
  return words.join(" ");;
}
  return (
    <Container className="my-4">
      <Row>
        <Col md={6} className="offset-md-3">
          <Form className="mb-4">
            <Form.Group controlId="electionName" className="mb-3">
              <Form.Label><h3>Enter Election Name</h3></Form.Label>
              <Form.Control
                type='text'
                value={election}
                onChange={(e) => setElection(e.target.value.toLowerCase())}
                placeholder='Enter election name'
              />
            </Form.Group>

            <Form.Group controlId="newPosition" className="mb-3">
              <Form.Label><h3>Enter Position</h3></Form.Label>
              <Form.Control
                type='text'
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value.toLowerCase())}
                placeholder='e.g. President'
              />
            </Form.Group>
            <Button variant='primary' onClick={addPosition} className="mb-3">Add Position</Button>

            <ListGroup className="mb-4">
              {positions.map((position, posIndex) => (
                <ListGroup.Item key={posIndex} className="d-flex justify-content-between align-items-center">
                  {position.toUpperCase()}
                  <Button variant='danger' onClick={() => deletePosition(position)}>Delete Position</Button>
                </ListGroup.Item>
              ))}
            </ListGroup>

            <Form.Group controlId="candidateName" className="mb-3">
              <Form.Label><h3>Enter Candidate Name</h3></Form.Label>
              <Form.Control
                type="text"
                value={newCandidate.name}
                onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value.toLowerCase() })}
                placeholder="e.g. John Doe (include first name and last name)"
                disabled={!positions.length}
              />
            </Form.Group>

            <Form.Group controlId="candidatePhoto" className="mb-3">
              <Form.Label><h3>Upload Candidate Photo</h3></Form.Label>
              <Form.Control
                type="file"
                onChange={handlePhotoUpload}
                disabled={!positions.length}
              />
              {cropping && <CropImage image={imageToCrop} onCropComplete={handleCropComplete} />}
            </Form.Group>
          
            <Form.Group controlId="candidateDescription" className="mb-3">
              <Form.Label><h3>Enter Candidate Description (Optional)</h3></Form.Label>
              <Form.Control
                as="textarea"
                value={newCandidate.description}
                onChange={(e) => setNewCandidate({ ...newCandidate, description: e.target.value.toLowerCase() })}
                placeholder="e.g. Experienced leader with a focus on..."
                disabled={!positions.length}
                rows={3}
              />
            </Form.Group>

            <Form.Group controlId="candidatePosition" className="mb-3">
              <Form.Label><h3>Enter Candidate Position</h3></Form.Label>
              <Form.Control
                as="select"
                disabled={!positions.length}
              >
                <option value="">Select Position</option>
                {positions.map((position, posIndex) => (
                  <option key={posIndex} value={position}>{position.toUpperCase()}</option>
                ))}
              </Form.Control>
            </Form.Group>

            <Button variant="primary" onClick={addCandidate} className="mb-3">Add Candidate</Button>

            <ListGroup>
  {Object.keys(candidates).map((key) => (
    <ListGroup.Item key={key}>
      {key.toUpperCase()} :
      <ListGroup variant="flush">
        {candidates[key].map((candidate, candidateIndex) => (
          <ListGroup.Item key={candidateIndex} className="d-flex justify-content-between align-items-center">
            <div>
              <img src={candidate.photo} alt={candidate.name} width="150" height="150" />
              {capitalize(candidate.name)} - {candidate.description}
            </div>
            <Button variant="danger" onClick={() => deleteCandidate(key, candidate)}>Delete Candidate</Button>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </ListGroup.Item>
  ))}
</ListGroup>
          </Form>

          <Button id='createElection' onClick={createElection} variant='success' className="me-2">Create Election</Button>
          <Button onClick={() => navigate(`/admin/${email}`, { replace: true })} variant='secondary'>Back to Admin Page</Button>
        </Col>
      </Row>
    </Container>
  );
}

export default Election;
