// Get userName from localStorage or fallback to "Guest"
const user = localStorage.getItem("userName") || "Guest";
document.getElementById("welcomeText").innerText = `Welcome, ${user}`;

// On window load, render saved notes
window.onload = renderSavedNotes;

async function renderSavedNotes() {
  const notesList = document.getElementById("notesList");
  notesList.innerHTML = "<li>Loading lectures...</li>";

  try {
    const token = localStorage.getItem("authToken"); // Use "authToken" key here to match upload.js
    if (!token) throw new Error("User not authenticated");

    const response = await fetch("/api/notes/user", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) throw new Error("Failed to fetch notes");

    const saved = await response.json();

    notesList.innerHTML = "";

    if (!saved || saved.length === 0) {
      notesList.innerHTML = "<li>No saved lectures.</li>";
      return;
    }

    saved.forEach(note => {
      const li = document.createElement("li");

      // Load Button
      const loadBtn = document.createElement("button");
      loadBtn.textContent = note.name;
      loadBtn.classList.add("load-note-btn");
      loadBtn.onclick = () => loadLecture(note);

      // Delete Button
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.classList.add("delete-note-btn");
      deleteBtn.onclick = () => {
        if (confirm(`Delete "${note.name}"?`)) {
          deleteNote(note._id);
        }
      };

      li.appendChild(loadBtn);
      li.appendChild(deleteBtn);
      notesList.appendChild(li);
    });

  } catch (error) {
    console.error("Error fetching notes:", error);
    notesList.innerHTML = "<li>Error loading notes.</li>";
  }
}

function loadLecture(note) {
  localStorage.setItem("currentLecture", JSON.stringify(note));
  window.location.href = "view.html";
}

async function deleteNote(noteId) {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("User not authenticated");

    const response = await fetch(`/api/notes/${noteId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete note");
    }

    alert("Lecture deleted.");
    renderSavedNotes(); // Refresh the notes list

  } catch (error) {
    console.error("Error deleting note:", error);
    alert("Error deleting lecture: " + error.message);
  }
}


function logout() {
  alert("Logged out!");
  window.location.href = "index.html";
}

function goToUpload() {
  window.location.href = "upload.html";
}
