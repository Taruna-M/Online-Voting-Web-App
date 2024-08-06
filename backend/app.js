require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const shortid = require('shortid');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JWT_ADMIN = process.env.JWT_ADMIN;
const JWT_VOTER = process.env.JWT_VOTER;
const activeSessions = new Map(); // sessionId -> token



// Increase the limit for JSON and URL-encoded data
app.use(bodyParser.json({ limit: '10mb' })); // Example limit of 10 MB
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
mongoose.connect('mongodb://localhost:27017/OnlineVoting', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}, err => err ? console.log(err) : console.log('Connected to database'));
const voterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true
  },
  voted :{
    type: Boolean,
    default: false
  }
});
const Voter = mongoose.model('Voter', voterSchema);
const candidateSchema = new mongoose.Schema({
  photo: {
    type: String, // URL of the uploaded photo or base64 string
    required: false
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  votes: {
    type: Number,
    default: 0
  }
});

const electionSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true
  },
  positions: [
    {
      type: String
    }
  ],
  candidates: {
    type: Map,
    of: [candidateSchema]
  },
  voters: [{
    type: voterSchema
  }],
  isVotingOpen: { 
    type: Boolean, 
    default: false 
  },
  winners: {
    type: Map,
  }
});

const Election = mongoose.model('Election', electionSchema);

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  elections: [{
    type: electionSchema,
    required: false
  }]
});

const Admin = mongoose.model('Admin', adminSchema);

app.use(express.json());
app.use(cors());

const storeSession = (sessionId, token) => {
  activeSessions.set(sessionId, token);
};

const invalidateSession = (sessionId) => {
  activeSessions.delete(sessionId);
};

//middleware function to verify admin JWT
const verifyAdminToken = (req, res, next) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!token) return res.status(403).send('A token is required for authentication');

  try {
    const decoded = jwt.verify(token, JWT_ADMIN);
    const { sessionId, email } = decoded;

    // Check if the session is valid
    if (!activeSessions.has(sessionId) || activeSessions.get(sessionId) !== token) {
      return res.status(401).send('Invalid or expired token');
    }

    // Check if the email in the token matches the requested email
    if (req.params.email !== email) {
      return res.status(403).send('Unauthorized');
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).send('Invalid Token');
  }
};

// Middleware to verify Voter JWT
const verifyVoterToken = (req, res, next) => {
  const token = req.headers['authorization'].replace('Bearer ', '');
  if (!token) return res.status(403).send('A token is required for authentication');

  try {
    const decoded = jwt.verify(token, JWT_VOTER);
    const { voterId, electionId } = decoded;

    if (req.params.voterId !== voterId || req.params.electionId !== electionId) {
      return res.status(403).send('Unauthorized');
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).send('Invalid Token');
  }
};


app.use('/admin/:email',verifyAdminToken);
app.use('/dash/:email/:electionId',verifyAdminToken);
app.use('/election/:email', verifyAdminToken);
app.use('/voter/:electionId/:voterId',verifyVoterToken);
app.use('/submit/vote/:electionId/:voterId',verifyVoterToken);

// Admin login
app.post('/adminLogin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email});
    if (admin){
      const isMatch = await bcrypt.compare(password, admin.password);
      if (isMatch) {
        const sessionId = shortid.generate();
        const token = jwt.sign({id: admin._id, email: admin.email, sessionId: sessionId }, JWT_ADMIN, { expiresIn: '1h' });
        storeSession(sessionId, token);
        console.log(token)
        res.json({ message: 'exist', token});
      } else {
        res.json('noPassword');
      }
    } else {
      res.json('notExist');
    }
  } catch (e) {
    res.json('notExist');
  }
});

//admin logout
app.post('/logout', (req, res) => {
  const token = req.headers['authorization'].replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, JWT_ADMIN);
    const { sessionId } = decoded;

    invalidateSession(sessionId); // Invalidate the session
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Voter login
app.post('/voterLogin', async (req, res) => {
  const { electionId, voterId } = req.body;
  try {
    const election = await Election.findById(electionId);
    if (election) {
      const open = election.isVotingOpen
      if (open) {
      const voter = election.voters.find(v => v._id === voterId);
      if (voter) {
        if (!voter.voted) {
          const token = jwt.sign({ voterId: voter._id, electionId: election._id }, JWT_VOTER, { expiresIn: '1h' });
          res.json({ message: 'exist', token });
        } else {
          res.json('voted');
        }
      } else {
        res.json('no voter');
      }
    } else {
      res.json('not open');
    }
    } else {
      res.json('no election');
    }
  } catch (e) {
    res.sendStatus(400);
  }
});

// Admin signup
app.post('/adminSignUp', async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newAdmin = new Admin({ email, password: hashedPassword });
      await newAdmin.save();
      res.json('created');
    } else {
      res.json('exist');
    }
  } catch (e) {
    console.log(e);
  }
});

// Start voting
app.post('/startElection/:electionId', (req, res) => {
  const { electionId } = req.params;
  Election.findByIdAndUpdate(electionId, { isVotingOpen: true })
    .then(() => {
      Admin.findOneAndUpdate({'elections._id': electionId}, { $set: { 'elections.$.isVotingOpen' : true } }, { new: true })
        .then(() => res.send('Voting started'))
        .catch(err => res.status(500).send(err.message));
    })
    .catch(err => res.status(500).send(err.message));
});

// End voting and determine winners
app.post('/endElection/:electionId', (req, res) => {
  const { electionId } = req.params;
  Election.findById(electionId)
    .then(election => {
      if (!election) return res.status(404).send('Election not found');
      
      const winners = {};
      for (const position of election.positions) {
        const candidates = election.candidates[position] || [];
        if (candidates.length > 0) {
          const winner = candidates.reduce((max, candidate) => candidate.votes > max.votes ? candidate : max, candidates[0]);
          winners[position] = winner;
        }
      }

      Election.findByIdAndUpdate(electionId, {
        isVotingOpen: false,
        winners
      },{ new: true }).then(() => {
        // Update the Admin document
        Admin.findOneAndUpdate({'elections._id': electionId}, {
          $set: {
            'elections.$.isVotingOpen': false,
            'elections.$.winners': winners
          }},
          {new : true})
          .then(() => res.send({ message: 'Voting ended', winners }))
          .catch(err => res.status(500).send(err.message));
      })
      .catch(err => res.status(500).send(err.message));
  })
    .catch(err => res.status(500).send(err.message));
});

// Create election from admin
app.post('/elections', async (req, res) => {
  const { email, election, positions, candidates } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (admin) {
      const electionId = shortid.generate() + '-' + election.replace(/\s+/g, '-').toLowerCase();
      const newElection = new Election({
        _id: electionId,
        name: election,
        positions: positions,
        candidates: candidates,
        isVotingOpen: false,
        winners: {}
      });
      await newElection.save();
      admin.elections.push(newElection);
      admin.save();
      res.json('saved');
    } else {
      res.json('admin not found');
    }
  } catch (e) {
    console.log(e);
  }
});

// Display all elections on admin page
app.get('/get/elections/:email', async (req, res) => {
  const email = req.params.email;
  try {
    const admin = await Admin.findOne({ email });
    if (admin) {
      res.json(admin.elections);
    } else {
      res.json('noAdmin');
    }
  } catch (e) {
    console.log(e);
  }
});

// Display election on dashboard
app.get('/get/election/:electionId', async (req, res) => {
  const electionId = req.params.electionId;
  try {
    const election = await Election.findOne({ _id: electionId });
    if (election) {
      res.json(election);
    } else {
      res.json('noElection');
    }
  } catch (e) {
    console.log(e);
  }
});

// Delete elections from admin page
app.delete('/delete/election/:email/:id', async (req, res) => {
  const adminEmail = req.params.email;
  const electionId = req.params.id;
  try {
    const election = await Election.findByIdAndRemove(electionId);
    const admin = await Admin.updateOne({ email: adminEmail }, { $pull: { elections: { _id: electionId } } });
    if (admin.modifiedCount > 0 && election) {
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

// Update election from dashboard
app.post('/update/election/:electionId', async (req, res) => {
  const { electionId } = req.params;
  const { email, positions, candidates } = req.body; // Added email to the request body
  try {
    // Update Election document
    const election = await Election.findByIdAndUpdate(
      electionId,
      { positions, candidates },
      { new: true }
    );

    if (!election) {
      return res.json('Election not found');
    }

    // Update Admin document
    const admin = await Admin.findOneAndUpdate(
      { email: email, 'elections._id': electionId },
      { $set: { 'elections.$.positions': positions, 'elections.$.candidates': candidates} },
      { new: true }
    );

    if (admin) {
      res.json('done');
    } else {
      res.json('noAdmin');
    }
  } catch (e) {
    console.log(e);
    res.json('error');
  }
});


// Register voter from admin dashboard
app.post('/registerVoter/:electionId', async (req, res) => {
  const { electionId } = req.params;
  const {name,voted} = req.body;

  try {
    const election = await Election.findById(electionId);

    if (!election) {
      return res.json('noElection');
    }

    const voterId = shortid.generate() + '-' + name.replace(/\s+/g, '-').toLowerCase();

    const existingVoter = election.voters.find(voter => voter.name === name);

    if (existingVoter) {
      return res.json('Voter already exists');
    }

    const newVoter = new Voter({
      _id: voterId,
      name,
      voted
    });

    election.voters.push(newVoter);

    await election.save();
    const admin = await Admin.findOneAndUpdate(
      { 'elections._id': electionId },
      { $push: { 'elections.$.voters': newVoter } },
      { new: true }
    );
    if (!admin) {
      return res.json('Admin not found');
    }
    else{
    res.json(voterId);}
  } catch (e) {
    console.log(e);
    res.status(500).json('Server error');
  }
});

//delete voter from dashboard
app.post('/deleteVoter/:electionId', async (req, res) => {
  const { electionId } = req.params;
  const { voterId } = req.body;

  try {
    // Find the election and remove the voter
    const election = await Election.findById(electionId);
    if (election){
    election.voters = election.voters.filter(voter => voter._id !== voterId);
    await election.save();
    const admin = await Admin.findOne({ 'elections._id': electionId });
    if (admin) {
      admin.elections.forEach(election => {
        if (election._id.toString() === electionId) {
          election.voters = election.voters.filter(voter => voter._id.toString() !== voterId);
        }
      });
      await admin.save();
      res.json('deleted');
    } else res.json('noAdmin');
    } else res.json('noElection');
  } catch (error) {
    res.sendStatus(500)
  }
});

//submit votes from voter
app.patch('/submit/vote/:electionId/:voterId', verifyVoterToken, async (req, res) => {
  const { votedCandidates } = req.body; // Format: { position: candidateId }
  const { electionId, voterId } = req.params;

  try {
    // Retrieve the election
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).send('Election not found');
    }
    const admin = await Admin.findOne({ 'elections._id': electionId });
    if (!admin) {
      return res.status(404).send('Admin not found');
    }
    
    // Find the voter
    const voter = election.voters.id(voterId); // Use .id to find the subdocument
    if (!voter) {
      return res.status(404).send('Voter not found');
    }
  
    if (voter.voted) {
      return res.status(400).send('Voter has already voted');
    }

    // Update vote counts for each selected candidate
    for (const [position, candidateId] of Object.entries(votedCandidates)) {
      const candidatesAtPosition = election.candidates.get(position);
      if (!candidatesAtPosition) {
        console.error(`Position ${position} not found`);
        continue;
      }
      const candidate = candidatesAtPosition.find(c => c._id.toString() === candidateId);
      if (candidate) {
        candidate.votes += 1;
        election.markModified(`candidates.${position}`);

        admin.elections.forEach(election => {
          if (election._id === electionId) {
            election.candidates.get(position).forEach(candidate => {
              console.log(candidate)
            });

            admin.markModified(`elections.${electionId}.candidates.${position}`);
          }
        });
      } else {
        console.error(`Candidate ${candidateId} not found at position ${position}`);
      }
    }
    
    // Mark the voter as having voted
    voter.voted = true;
    admin.elections.forEach(election => {
      if (election._id.toString() === electionId) {
        election.voters.forEach(voter => {
          if (voter._id.toString() === voterId) {
            voter.voted = true;
          }
        });
      }
    });
    // Save the election with updated candidates and voter status
    await election.save();
    await admin.save();
    res.status(200).send('Vote submitted successfully');
  } catch (error) {
    console.error('Error submitting vote:', error);
    res.status(500).send('Error submitting vote');
  }
});



app.listen(5000, () => {
  console.log('Server started on port 5000');
});
