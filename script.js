const SUPABASE_URL = "https://ognpydprqxxwjdnophxq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nbnB5ZHBycXh4d2pkbm9waHhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyOTM3NzIsImV4cCI6MjEwMjg2OTc3Mn0.GEboyNWovkJ7U9zXAWtzcQ7iddISbQuoLSirBJfFkrM";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ===============================
// NOTES
// ===============================

async function loadNotes() {

    const notesContainer = document.getElementById("notes");

    const { data, error } = await supabaseClient
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Notes error:", error);
        notesContainer.innerHTML = "<p>Failed to load notes.</p>";
        return;
    }

    notesContainer.innerHTML = "";

    if (!data || data.length === 0) {
        notesContainer.innerHTML = "<p>No notes yet ❤️</p>";
        return;
    }

    data.forEach(note => {

        const div = document.createElement("div");

        div.className = "note";

        div.innerHTML = `
            <h3>${escapeHTML(note.title)}</h3>
            <p>${escapeHTML(note.content)}</p>

            <div class="note-buttons">
                <button onclick="editNote(${note.id})">
                    ✏️ Edit
                </button>

                <button onclick="deleteNote(${note.id})">
                    🗑️ Delete
                </button>
            </div>
        `;

        notesContainer.appendChild(div);
    });
}


async function addNote() {

    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();

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

    document.getElementById("title").value = "";
    document.getElementById("content").value = "";

    loadNotes();
}


async function editNote(id) {

    const { data, error } = await supabaseClient
        .from("notes")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error(error);
        return;
    }

    const title = prompt("Edit title:", data.title);

    if (title === null) return;

    const content = prompt("Edit note:", data.content);

    if (content === null) return;

    const { error: updateError } = await supabaseClient
        .from("notes")
        .update({
            title: title,
            content: content
        })
        .eq("id", id);

    if (updateError) {
        console.error(updateError);
        alert("Failed to update note.");
        return;
    }

    loadNotes();
}


async function deleteNote(id) {

    if (!confirm("Delete this note? 🥺")) {
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

    loadNotes();
}


// ===============================
// GALLERY
// ===============================

async function loadGallery() {

    const gallery = document.getElementById("gallery");

    if (!gallery) return;

    gallery.innerHTML = "<p>Loading photos...</p>";

    const { data, error } = await supabaseClient
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Gallery error:", error);
        gallery.innerHTML = "<p>Failed to load gallery.</p>";
        return;
    }

    gallery.innerHTML = "";

    if (!data || data.length === 0) {
        gallery.innerHTML = "<p>No photos yet 📸❤️</p>";
        return;
    }

    data.forEach(photo => {

        const div = document.createElement("div");

        div.className = "gallery-item";

        div.innerHTML = `
            <img src="${photo.image_url}" alt="Memory">

            <p>${escapeHTML(photo.caption || "")}</p>

            <button onclick="deleteImage(${photo.id})">
                🗑️ Delete
            </button>
        `;

        gallery.appendChild(div);
    });
}


// ===============================
// UPLOAD IMAGE
// ===============================

async function uploadImage() {

    console.log("uploadImage() is working");

    const fileInput = document.getElementById("imageInput");
    const captionInput = document.getElementById("caption");

    if (!fileInput) {
        alert("Image input not found.");
        return;
    }

    const file = fileInput.files[0];

    if (!file) {
        alert("Please choose a photo 📸");
        return;
    }

    if (!file.type.startsWith("image/")) {
        alert("Please select an image.");
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert("Image must be smaller than 5MB.");
        return;
    }

    const fileName =
        Date.now() + "_" +
        file.name.replace(/\s+/g, "_");


    console.log("Uploading:", fileName);


    // Upload image
    const { error: uploadError } =
        await supabaseClient
            .storage
            .from("gallery")
            .upload(fileName, file);


    if (uploadError) {

        console.error("UPLOAD ERROR:", uploadError);

        alert(
            "Upload failed:\n" +
            uploadError.message
        );

        return;
    }


    // Get public URL
    const { data: urlData } =
        supabaseClient
            .storage
            .from("gallery")
            .getPublicUrl(fileName);


    const imageUrl = urlData.publicUrl;


    // Save information to database
    const caption =
        captionInput.value.trim();


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

        console.error(
            "DATABASE ERROR:",
            databaseError
        );

        alert(
            "Image uploaded but database failed."
        );

        return;
    }


    fileInput.value = "";
    captionInput.value = "";

    alert("Photo uploaded successfully ❤️");

    loadGallery();
}


// ===============================
// DELETE IMAGE
// ===============================

async function deleteImage(id) {

    if (!confirm("Delete this photo?")) {
        return;
    }

    const { data, error } =
        await supabaseClient
            .from("gallery")
            .select("image_url")
            .eq("id", id)
            .single();

    if (error) {
        console.error(error);
        return;
    }


    const imageUrl = data.image_url;

    const fileName =
        decodeURIComponent(
            imageUrl.split("/").pop()
        );


    await supabaseClient
        .storage
        .from("gallery")
        .remove([fileName]);


    const { error: deleteError } =
        await supabaseClient
            .from("gallery")
            .delete()
            .eq("id", id);


    if (deleteError) {
        console.error(deleteError);
        return;
    }

    loadGallery();
}


// ===============================
// SECURITY
// ===============================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ===============================
// START
// ===============================

loadNotes();
loadGallery();

// ==========================================
// NAVIGATION
// ==========================================

function showSection(sectionId) {

    const sections = [
        "notes-section",
        "gallery-section",
        "memories-section"
    ];

    sections.forEach(id => {

        const section = document.getElementById(id);

        if (section) {
            section.style.display =
                id === sectionId ? "block" : "none";
        }

    });

}

// ==========================================
// DEFAULT PAGE
// ==========================================

showSection("notes-section");

// ==========================================
// ANNIVERSARY COUNTDOWN
// ==========================================

function updateAnniversaryCountdown() {

    const now = new Date();

    let targetYear = now.getFullYear();

    let targetDate = new Date(
        targetYear,
        0,
        18,
        0,
        0,
        0
    );

    // Kalau anniversary tahun ini dah lepas,
    // kira ke tahun depan
    if (now >= targetDate) {
        targetDate = new Date(
            targetYear + 1,
            0,
            18,
            0,
            0,
            0
        );
    }

    const difference =
        targetDate.getTime() - now.getTime();

    const days = Math.floor(
        difference / (1000 * 60 * 60 * 24)
    );

    const hours = Math.floor(
        (difference / (1000 * 60 * 60)) % 24
    );

    const minutes = Math.floor(
        (difference / (1000 * 60)) % 60
    );

    const seconds = Math.floor(
        (difference / 1000) % 60
    );

    document.getElementById("days").textContent = days;
    document.getElementById("hours").textContent = hours;
    document.getElementById("minutes").textContent = minutes;
    document.getElementById("seconds").textContent = seconds;
}


// Start countdown
updateAnniversaryCountdown();

setInterval(
    updateAnniversaryCountdown,
    1000
);
