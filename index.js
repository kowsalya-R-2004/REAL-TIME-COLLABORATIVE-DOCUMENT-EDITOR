const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const Document = require('./models/document');  // MongoDB model

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// MongoDB connection (local or remote)
mongoose.connect('mongodb://localhost:27017/real-time-doc-editor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch(err => {
  console.log('Failed to connect to MongoDB', err);
});

// Middleware to serve static files from 'public'
app.use(express.static('public'));

// Route to get a document by ID (used for editing)
app.get('/document/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).send('Document not found');
    }
    res.json(document); // Return document content as JSON
  } catch (err) {
    res.status(500).send('Error retrieving document');
  }
});

// Route to create a new document
app.post('/document', async (req, res) => {
  try {
    const newDoc = new Document({ content: '' }); // Empty content initially
    await newDoc.save();
    res.json({ documentId: newDoc._id }); // Return document ID
  } catch (err) {
    res.status(500).send('Error creating document');
  }
});

// Real-time collaboration with Socket.io
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle document editing and sync with others
  socket.on('edit', async (data) => {
    try {
      const document = await Document.findById(data.documentId);
      if (document) {
        document.content = data.content; // Update content
        await document.save(); // Save content to MongoDB
        socket.broadcast.emit('update', { content: data.content }); // Broadcast to other users
      }
    } catch (err) {
      console.log('Error editing document:', err);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
