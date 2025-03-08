const socket = io();
const editor = document.getElementById('document-editor');
const loading = document.getElementById('loading');

// Replace with the actual document ID from the server
const documentId = "some_unique_document_id"; // Example placeholder

// Show loading message while fetching document
loading.style.display = 'block';

// Fetch the document content when the page loads
fetch(`/document/${documentId}`)
  .then(res => res.json())
  .then(data => {
    loading.style.display = 'none';  // Hide loading message
    editor.value = data.content; // Set the editor content to the document content
    editor.disabled = false; // Enable the editor
  })
  .catch(err => {
    loading.style.display = 'none';  // Hide loading message on error
    console.error('Error fetching document:', err);
  });

// Listen for real-time updates from other users
socket.on('update', (data) => {
  editor.value = data.content; // Update editor with the new content
});

// Send updates to the server when the user types
editor.addEventListener('input', () => {
  socket.emit('edit', { documentId, content: editor.value });
});
