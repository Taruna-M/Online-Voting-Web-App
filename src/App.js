import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import AdminLogin from './components/AdminLogin';
import VoterLogin from './components/VoterLogin';
import Voter from './components/Voter';
import Admin from './components/Admin';
import Dash from './components/Dash';
import Election from './components/Election';
import AdminSignUp from './components/AdminSignUp';
import NotFound from './components/NotFound';
import WebcamComponent from './components/dummy';
function App() {
  return (
    <Router>
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="adminLogin" element={<AdminLogin/>} />
      <Route path="voterLogin" element={<VoterLogin/>} />
      <Route path="voter/:electionId/:voterId" element={<Voter/>} />
      <Route path="admin/:email" element={<Admin/>} />
      <Route path="dash/:email/:electionId" element={<Dash/>} />
      <Route path="election/:email" element={<Election/>} />
      <Route path="adminSignUp" element={<AdminSignUp/>} />
      <Route path='dummy' element={<WebcamComponent/>}/>
      <Route path="*" element={<NotFound />} />
  </Routes>
  </Router>
  );
}

export default App;
