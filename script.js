
const SUPABASE_URL =
    "https://ognpydprqxxwjdnophxq.supabase.co";

const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nbnB5ZHBycXh4d2pkbm9waHhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyOTM3NzIsImV4cCI6MjEwMjg2OTc3Mn0.GEboyNWovkJ7U9zXAWtzcQ7iddISbQuoLSirBJfFkrM";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =====================================================
   USER IDs
===================================================== */

const HAZIRAH_ID =
    "fd76923c-6b95-4668-b020-32ff37192990";

const ZULKARNAIN_ID =
    "327adb82-7b8b-4e01-be1d-2802a334e6db";


/* =====================================================
   GET CURRENT USER
===================================================== */

async function getCurrentUser() {

    const {
        data,
        error
    } =
        await supabaseClient.auth.getUser();


    if (error || !data.user) {

        console.error(
            "User error:",
            error
        );

        return null;
    }


    return data.user;
}


/* =====================================================
   USER NAME
===================================================== */

function getUserName(userId) {

    if (userId === HAZIRAH_ID) {

        return "Nur Hazirah";

    }


    if (userId === ZULKARNAIN_ID) {

        return "Zulkarnain";

    }


    return "Our Love";
}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(dateString) {

    if (!dateString) return "";


    const date =
        new Date(dateString);


    return date.toLocaleString(
        "en-MY",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* =====================================================
   NOTES / MESSAGES
===================================================== */

async function loadNotes() {

    const notesContainer =
        document.getElementById("notes");


    if (!notesContainer) return;


    notesContainer.innerHTML = `
        <div class="loading-message">
            Loading messages... 💕
        </div>
    `;


    const currentUser =
        await getCurrentUser();


    if (!currentUser) return;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("notes")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "Notes error:",
            error
        );


        notesContainer.innerHTML = `
            <div class="empty-message">
                Failed to load messages 😢
            </div>
        `;

        return;
    }


    notesContainer.innerHTML = "";


    if (!data || data.length === 0) {

        notesContainer.innerHTML = `
            <div class="empty-message">
                💕 No messages yet.<br>
                Be the first to send one!
            </div>
        `;

        return;
    }


    data.forEach(note => {

        const isMine =
            note.user_id === currentUser.id;


        const row =
            document.createElement("div");


        row.className =
            isMine
                ? "message-row mine"
                : "message-row partner";


        const sender =
            getUserName(
                note.user_id
            );


        const title =
            escapeHTML(
                note.title || "A little message ❤️"
            );


        const content =
            escapeHTML(
                note.content || ""
            );


        const date =
            formatDate(
                note.created_at
            );


        row.innerHTML = `

            <div class="message-card">

                <div class="message-top">

                    <span class="sender-name">

                        ${
                            isMine
                                ? "You ❤️"
                                : sender + " 💕"
                        }

                    </span>

                    <span class="message-time">

                        ${date}

                    </span>

                </div>


                <h3 class="message-title">

                    ${title}

                </h3>


                <p class="message-content">

                    ${content}

                </p>


                ${
                    isMine
                        ? `

                        <div class="message-actions">

                            <button
                                class="edit-btn"
                                onclick="editNote(${note.id})">

                                ✏️ Edit

                            </button>


                            <button
                                class="delete-btn"
                                onclick="deleteNote(${note.id})">

                                🗑️ Delete

                            </button>

                        </div>

                        `
                        : ""
                }

            </div>

        `;


        notesContainer.appendChild(row);

    });

}


/* =====================================================
   ADD MESSAGE
===================================================== */

async function addNote() {

    const titleInput =
        document.getElementById("title");


    const contentInput =
        document.getElementById("content");


    const title =
        titleInput.value.trim();


    const content =
        contentInput.value.trim();


    if (!content) {

        alert(
            "Please write a message first ❤️"
        );

        return;
    }


    const currentUser =
        await getCurrentUser();


    if (!currentUser) {

        alert(
            "Please login first."
        );

        window.location.href =
            "login.html";

        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("notes")
            .insert([
                {
                    user_id:
                        currentUser.id,

                    title:
                        title ||
                        "A little message ❤️",

                    content:
                        content
                }
            ]);


    if (error) {

        console.error(
            "Add message error:",
            error
        );


        alert(
            "Failed to send message.\n\n" +
            error.message
        );

        return;
    }


    titleInput.value = "";

    contentInput.value = "";


    await loadNotes();

}


/* =====================================================
   EDIT MESSAGE
===================================================== */

async function editNote(id) {

    const currentUser =
        await getCurrentUser();


    if (!currentUser) return;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("notes")
            .select("*")
            .eq("id", id)
            .eq(
                "user_id",
                currentUser.id
            )
            .single();


    if (error || !data) {

        alert(
            "You can only edit your own message ❤️"
        );

        return;
    }


    const newTitle =
        prompt(
            "Edit message title:",
            data.title
        );


    if (newTitle === null) return;


    const newContent =
        prompt(
            "Edit your message:",
            data.content
        );


    if (newContent === null) return;


    if (!newContent.trim()) {

        alert(
            "Message cannot be empty."
        );

        return;
    }


    const {
        error: updateError
    } =
        await supabaseClient
            .from("notes")
            .update({
                title:
                    newTitle.trim() ||
                    "A little message ❤️",

                content:
                    newContent.trim()
            })
            .eq(
                "id",
                id
            )
            .eq(
                "user_id",
                currentUser.id
            );


    if (updateError) {

        console.error(
            "Update error:",
            updateError
        );


        alert(
            "Failed to edit message."
        );

        return;
    }


    await loadNotes();

}


/* =====================================================
   DELETE MESSAGE
===================================================== */

async function deleteNote(id) {

    const currentUser =
        await getCurrentUser();


    if (!currentUser) return;


    const confirmDelete =
        confirm(
            "Delete this message? 🥺❤️"
        );


    if (!confirmDelete) return;


    const {
        error
    } =
        await supabaseClient
            .from("notes")
            .delete()
            .eq(
                "id",
                id
            )
            .eq(
                "user_id",
                currentUser.id
            );


    if (error) {

        console.error(
            "Delete error:",
            error
        );


        alert(
            "Failed to delete message."
        );

        return;
    }


    await loadNotes();

}


/* =====================================================
   GALLERY
===================================================== */

async function loadGallery() {

    const gallery =
        document.getElementById(
            "gallery"
        );


    if (!gallery) return;


    gallery.innerHTML =
        "<p>Loading photos...</p>";


    const {
        data,
        error
    } =
        await supabaseClient
            .from("gallery")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Gallery error:",
            error
        );


        gallery.innerHTML =
            "<p>Failed to load gallery.</p>";

        return;
    }


    gallery.innerHTML = "";


    if (!data || data.length === 0) {

        gallery.innerHTML =
            "<p>No photos yet 📸❤️</p>";

        return;
    }


    data.forEach(photo => {

        const div =
            document.createElement(
                "div"
            );


        div.className =
            "gallery-item";


        div.innerHTML = `

            <img
                src="${escapeHTML(
                    photo.image_url
                )}"
                alt="Memory"
            >


            <p>

                ${escapeHTML(
                    photo.caption || ""
                )}

            </p>


            <button
                onclick="deleteImage(${photo.id})">

                🗑️ Delete

            </button>

        `;


        gallery.appendChild(div);

    });

}


/* =====================================================
   UPLOAD IMAGE
===================================================== */

async function uploadImage() {

    const fileInput =
        document.getElementById(
            "imageInput"
        );


    const captionInput =
        document.getElementById(
            "caption"
        );


    const file =
        fileInput.files[0];


    if (!file) {

        alert(
            "Please choose a photo 📸"
        );

        return;
    }


    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        alert(
            "Please select an image."
        );

        return;
    }


    if (
        file.size >
        5 * 1024 * 1024
    ) {

        alert(
            "Image must be smaller than 5MB."
        );

        return;
    }


    const fileName =
        Date.now() +
        "_" +
        file.name.replace(
            /\s+/g,
            "_"
        );


    const {
        error: uploadError
    } =
        await supabaseClient
            .storage
            .from("gallery")
            .upload(
                fileName,
                file
            );


    if (uploadError) {

        console.error(
            "Upload error:",
            uploadError
        );


        alert(
            "Upload failed:\n" +
            uploadError.message
        );

        return;
    }


    const {
        data: urlData
    } =
        supabaseClient
            .storage
            .from("gallery")
            .getPublicUrl(
                fileName
            );


    const imageUrl =
        urlData.publicUrl;


    const caption =
        captionInput.value.trim();


    const {
        error: databaseError
    } =
        await supabaseClient
            .from("gallery")
            .insert([
                {
                    image_url:
                        imageUrl,

                    caption:
                        caption
                }
            ]);


    if (databaseError) {

        console.error(
            "Database error:",
            databaseError
        );


        alert(
            "Image uploaded but database failed."
        );

        return;
    }


    fileInput.value = "";

    captionInput.value = "";


    alert(
        "Photo uploaded successfully ❤️"
    );


    await loadGallery();

}


/* =====================================================
   DELETE IMAGE
===================================================== */

async function deleteImage(id) {

    const confirmDelete =
        confirm(
            "Delete this photo?"
        );


    if (!confirmDelete) return;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("gallery")
            .select("image_url")
            .eq(
                "id",
                id
            )
            .single();


    if (error || !data) {

        console.error(error);

        return;
    }


    const imageUrl =
        data.image_url;


    const fileName =
        decodeURIComponent(
            imageUrl
                .split("/")
                .pop()
        );


    await supabaseClient
        .storage
        .from("gallery")
        .remove([
            fileName
        ]);


    const {
        error: deleteError
    } =
        await supabaseClient
            .from("gallery")
            .delete()
            .eq(
                "id",
                id
            );


    if (deleteError) {

        console.error(
            deleteError
        );

        alert(
            "Failed to delete photo."
        );

        return;
    }


    await loadGallery();

}


/* =====================================================
   SECURITY
===================================================== */

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;
}


/* =====================================================
   NAVIGATION
===================================================== */

function showSection(sectionId) {

    const sections = [
        "notes-section",
        "gallery-section",
        "memories-section"
    ];


    sections.forEach(id => {

        const section =
            document.getElementById(
                id
            );


        if (!section) return;


        section.style.display =
            id === sectionId
                ? "block"
                : "none";

    });

}


/* =====================================================
   START
===================================================== */

loadNotes();

loadGallery();

showSection(
    "notes-section"
);

