const mongoose = require('mongoose');

// Define the document schema
const documentSchema = new mongoose.Schema({
  content: { type: String, required: true }, // Content of the document
});

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
