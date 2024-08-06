import { useParams, useNavigate, Link } from "react-router-dom";
import { Button, Container, Row, Col, Table} from 'react-bootstrap';
import axios from "axios";
import api from "./authentication";
import { useEffect, useState } from "react";
import Spinner from 'react-bootstrap/Spinner';

function Admin() {
  const { email } = useParams(); // Get the email from URL
  const username = email.match(/^([^@]+)/)[1];
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin component
useEffect(() => {
  const token = sessionStorage.getItem('authToken');
  const storedEmail = sessionStorage.getItem('adminEmail'); // Retrieve the stored email

  if (!token || email !== storedEmail) { // Check if the email in the URL matches the stored email
    navigate('*');
    return;
  }

  api.get(`http://localhost:5000/get/elections/${email}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then((res) => {
    if (res.data==='noAdmin'){
      navigate('*');
      return
    }
    setElections(res.data);
    setLoading(false);
  })
  .catch(e => {
    console.log(e);
    setLoading(false);
    navigate('/adminLogin');
  });
}, [email, navigate]);

  const addElection = () => {
    navigate(`/election/${email}`);
  }

  const deleteElection = (electionId) => {
    const prompt = window.confirm('Do you want to delete the election?');
    if (prompt) {
      api.delete(`http://localhost:5000/delete/election/${email}/${electionId}`)
        .then((res) => {
          if (res.status === 200) {
            setElections(elections.filter(election => election._id !== electionId));
            alert('Election deleted');
          }
        })
        .catch(e => {
          console.log(e);
        });
    }
  };

  const capitalize = (word) => {
    const words = word.split(" ");
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i][0].toUpperCase() + words[i].substr(1);
    }
    return words.join(" ");
  };

  const logout = () => {
    const prompt = window.confirm('Are you sure you want to logout? You will be redirected to the admin login page.');
    if (prompt) {
      const token = sessionStorage.getItem('authToken');
      axios.post('http://localhost:5000/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        sessionStorage.removeItem('adminEmail');
        sessionStorage.removeItem('authToken');
        alert(res.data.message);
        navigate('/adminLogin', { replace: true });
        return
      })
      .catch(e => {
        console.error('Logout failed', e);
        sessionStorage.removeItem('adminEmail');
        sessionStorage.removeItem('authToken');
        navigate('/adminLogin', { replace: true });
      });
    }
  };

  if (loading) {
    return <Spinner animation="grow" />; // or a spinner component
  }
  

  return (
    <Container className="my-4">
      <h1 className="mb-4">Admin Page</h1>
      <h2 className="mb-4">Welcome, {username}</h2>
      <Button variant="secondary" onClick={logout} className="mb-4">Logout</Button>
      <Button variant="primary" onClick={addElection} className="mb-4">Add Election</Button>
      {elections.length === 0 ? (
        <p>You have no elections.</p>
      ) : (
        elections.map((election, index) => (
          <Row key={index} className="mb-4 p-4 border">
            <Col md={8}>
              <h4>Election Name: {election.name.toUpperCase()}</h4>
              <p className="text-muted">ID: {election._id}</p>
              <p className="text-muted">Status: {election.isVotingOpen ? "Ongoing" : "Ended/Not Started"}</p>
              <div>
                <strong>Positions:</strong>
                {election.positions.length === 0 ? (
                  <p>You have no positions.</p>
                ) : (
                  <ul>
                    {election.positions.map((position, posIndex) => (
                      <li key={posIndex}>{position.toUpperCase()}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <strong>Candidates:</strong>
                {Object.keys(election.candidates).length === 0 ? (
            <p>No candidates available.</p>
          ) : (
            Object.keys(election.candidates).map(position => (
              <div key={position}>
                <h3>{capitalize(position)}</h3>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Photo</th>
                      <th>Name</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {election.candidates[position].map(candidate => (
                      <tr key={candidate._id}>
                        <td>
                        {candidate.photo ? (
                            <img src={candidate.photo} alt="Candidate" style={{ width: '150px', height: '150px' }} />
                          ) : (
                            <p><i>No Image</i></p>
                          )}
                        </td>
                        <td>{candidate.name}</td>
                        <td>{candidate.description || <p><i>No Description</i></p>}</td>
                        
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ))
          )}
              </div>
              <div>
                <Link to={`/dash/${email}/${election._id}`} className="btn btn-success me-2">View Election</Link>
                <Button variant="danger" onClick={() => deleteElection(election._id)}>Delete Election</Button>
              </div>
            </Col>
          </Row>
        ))
      )}
    </Container>
  );
}

export default Admin;

