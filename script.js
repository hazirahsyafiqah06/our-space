// ==========================================
// SUPABASE CONFIG
// ==========================================

const SUPABASE_URL = "https://ognpydprqxxwjdnophxq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nbnB5ZHBycXh4d2pkbm9waHhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyOTM3NzIsImV4cCI6MjEwMjg2OTc3Mn0.GEboyNWovkJ7U9zXAWtzcQ7iddISbQuoLSirBJfFkrM";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ==========================================
// LOAD NOTES
// ==========================================

async function loadNotes() {

    const notesContainer = document.getElementById("notes");

    notesContainer.innerHTML = "<p>Loading notes...</p>";

    const { data, error } = await supabaseClient
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        notesContainer.innerHTML = "<p>Failed to load notes.</p>";
        return;
    }

    if (!data || data.length === 0) {
        notesContainer.innerHTML = "<p>No notes yet ❤️</p>";
        return;
    }

    notesContainer.innerHTML = "";

    data.forEach(note => {

        const noteElement = document.createElement("div");

        noteElement.className = "note";

        noteElement.innerHTML = `
            <h3>${escapeHTML(note.title)}</h3>

            <p>${escapeHTML(note.content)}</p>

            <small>
                ${new Date(note.created_at).toLocaleString()}
            </small>

            <div class="note-buttons">

                <button onclick="editNote(${note.id})">
                    ✏️ Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteNote(${note.id})">
                    🗑️ Delete
                </button>

            </div>
        `;

        notesContainer.appendChild(noteElement);

    });
}


// ==========================================
// ADD NOTE
// ==========================================

async function addNote() {

    const titleInput = document.getElementById("title");
    const contentInput = document.getElementById("content");

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!title || !content) {

        alert("Please fill in the title and note ❤️");

        return;
    }

    const { error } = await supabaseClient
        .from("notes")
        .insert([
            {
                title: title,
                content: content
            }
        ]);

    if (error) {

        console.error(error);

        alert("Failed to save note.");

        return;
    }

    titleInput.value = "";
    contentInput.value = "";

    alert("Note saved ❤️");

    loadNotes();
}


// ==========================================
// EDIT NOTE
// ==========================================

async function editNote(id) {

    const { data, error } = await supabaseClient
        .from("notes")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {

        console.error(error);

        alert("Unable to find note.");

        return;
    }

    const newTitle = prompt(
        "Edit title:",
        data.title
    );

    if (newTitle === null) {
        return;
    }

    const newContent = prompt(
        "Edit note:",
        data.content
    );

    if (newContent === null) {
        return;
    }

    const { error: updateError } = await supabaseClient
        .from("notes")
        .update({
            title: newTitle,
            content: newContent
        })
        .eq("id", id);

    if (updateError) {

        console.error(updateError);

        alert("Failed to update note.");

        return;
    }

    alert("Note updated ❤️");

    loadNotes();
}


// ==========================================
// DELETE NOTE
// ==========================================

async function deleteNote(id) {

    const confirmDelete = confirm(
        "Delete this note? 🥺"
    );

    if (!confirmDelete) {
        return;
    }

    const { error } = await supabaseClient
        .from("notes")
        .delete()
        .eq("id", id);

    if (error) {

        console.error(error);

        alert("Failed to delete note.");

        return;
    }

    alert("Note deleted 🗑️");

    loadNotes();
}


// ==========================================
// SECURITY
// ==========================================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ==========================================
// START
// ==========================================

loadNotes();
