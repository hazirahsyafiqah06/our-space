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
// GALLERY - LOAD IMAGES
// ==========================================

async function loadGallery() {

    const galleryContainer = document.getElementById("gallery");

    galleryContainer.innerHTML = "<p>Loading photos...</p>";

    const { data, error } = await supabaseClient
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        galleryContainer.innerHTML =
            "<p>Failed to load gallery.</p>";
        return;
    }

    if (!data || data.length === 0) {
        galleryContainer.innerHTML =
            "<p>No photos yet 📸❤️</p>";
        return;
    }

    galleryContainer.innerHTML = "";

    data.forEach(photo => {

        const item = document.createElement("div");

        item.className = "gallery-item";

        item.innerHTML = `
            <img
                src="${photo.image_url}"
                alt="Our memory"
            >

            <p>${escapeHTML(photo.caption || "")}</p>

            <button onclick="deleteImage(${photo.id}, '${photo.image_url}')">
                🗑️ Delete
            </button>
        `;

        galleryContainer.appendChild(item);

    });
}


// ==========================================
// GALLERY - UPLOAD IMAGE
// ==========================================

async function uploadImage() {

    const fileInput = document.getElementById("imageInput");
    const captionInput = document.getElementById("caption");

    const file = fileInput.files[0];
    const caption = captionInput.value.trim();

    if (!file) {

        alert("Please choose a photo 📸");

        return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {

        alert("Please upload an image file.");

        return;
    }

    // Limit image size to 5 MB
    if (file.size > 5 * 1024 * 1024) {

        alert("Image must be smaller than 5 MB.");

        return;
    }

    const fileName =
        Date.now() + "_" + file.name.replace(/\s+/g, "_");


    // Upload to Supabase Storage
    const { error: uploadError } =
        await supabaseClient
            .storage
            .from("gallery")
            .upload(fileName, file);

    if (uploadError) {

        console.error(uploadError);

        alert("Failed to upload image.");

        return;
    }


    // Get public URL
    const { data: publicURL } =
        supabaseClient
            .storage
            .from("gallery")
            .getPublicUrl(fileName);

    const imageUrl = publicURL.publicUrl;


    // Save URL into database
    const { error: databaseError } =
        await supabaseClient
            .from("gallery")
            .insert([
                {
                    image_url: imageUrl,
                    caption: caption
                }
            ]);

    if (databaseError) {

        console.error(databaseError);

        alert("Image uploaded but failed to save information.");

        return;
    }


    // Reset form
    fileInput.value = "";
    captionInput.value = "";

    alert("Photo uploaded successfully ❤️");

    loadGallery();
}


// ==========================================
// GALLERY - DELETE IMAGE
// ==========================================

async function deleteImage(id, imageUrl) {

    const confirmDelete = confirm(
        "Delete this photo? 🥺"
    );

    if (!confirmDelete) {
        return;
    }


    // Get file name from URL
    const fileName =
        decodeURIComponent(
            imageUrl.split("/").pop()
        );


    // Delete from Storage
    const { error: storageError } =
        await supabaseClient
            .storage
            .from("gallery")
            .remove([fileName]);


    if (storageError) {

        console.error(storageError);

        alert("Failed to delete image.");

        return;
    }


    // Delete from database
    const { error: databaseError } =
        await supabaseClient
            .from("gallery")
            .delete()
            .eq("id", id);


    if (databaseError) {

        console.error(databaseError);

        alert("Image deleted from storage but database failed.");

        return;
    }


    alert("Photo deleted 🗑️");

    loadGallery();
}


// ==========================================
// START GALLERY
// ==========================================

loadGallery();


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
