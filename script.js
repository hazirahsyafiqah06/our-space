
// ==========================================
// SUPABASE
// ==========================================

const SUPABASE_URL =
    "https://ognpydprqxxwjdnophxq.supabase.co";

const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nbnB5ZHBycXh4d2pkbm9waHhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyOTM3NzIsImV4cCI6MjEwMjg2OTc3Mn0.GEboyNWovkJ7U9zXAWtzcQ7iddISbQuoLSirBJfFkrM";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ==========================================
// USER IDs
// ==========================================

const HAZIRAH_ID =
    "fd76923c-6b95-4668-b020-32ff37192990";

const ZULKARNAIN_ID =
    "327adb82-7b8b-4e01-be1d-2802a334e6db";


// ==========================================
// RELATIONSHIP COUNTER
// ==========================================

function updateRelationshipCounter() {

    const startDate =
        new Date("2021-01-18T00:00:00");

    const today =
        new Date();

    let years =
        today.getFullYear() -
        startDate.getFullYear();

    let months =
        today.getMonth() -
        startDate.getMonth();

    let days =
        today.getDate() -
        startDate.getDate();


    if (days < 0) {

        months--;

        const previousMonth =
            new Date(
                today.getFullYear(),
                today.getMonth(),
                0
            );

        days +=
            previousMonth.getDate();

    }


    if (months < 0) {

        years--;

        months += 12;

    }


    document.getElementById("years")
        .textContent = years;

    document.getElementById("months")
        .textContent = months;

    document.getElementById("journeyDays")
        .textContent = days;

}


updateRelationshipCounter();


// Update every minute
setInterval(
    updateRelationshipCounter,
    60000
);


// ==========================================
// NOTES
// ==========================================

async function loadNotes() {

    const notesContainer =
        document.getElementById("notes");

    if (!notesContainer) return;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("notes")
            .select("*")
            .order("created_at", {
                ascending: false
            });


    if (error) {

        console.error(
            "Notes error:",
            error
        );

        notesContainer.innerHTML =
            "<p>Failed to load notes.</p>";

        return;
    }


    notesContainer.innerHTML = "";


    if (!data || data.length === 0) {

        notesContainer.innerHTML =
            "<p class='empty-message'>No notes yet ❤️</p>";

        return;
    }


    data.forEach(note => {

        const div =
            document.createElement("div");

        div.className =
            "note";


        div.innerHTML = `

            <h3>
                ${escapeHTML(note.title)}
            </h3>

            <p>
                ${escapeHTML(note.content)}
            </p>

            <div class="note-buttons">

                <button
                    onclick="editNote(${note.id})">
                    ✏️ Edit
                </button>

                <button
                    class="delete-note"
                    onclick="deleteNote(${note.id})">
                    🗑️ Delete
                </button>

            </div>

        `;


        notesContainer.appendChild(div);

    });

}


// ==========================================
// ADD NOTE
// ==========================================

async function addNote() {

    const title =
        document.getElementById("title")
            .value
            .trim();

    const content =
        document.getElementById("content")
            .value
            .trim();


    if (!title || !content) {

        alert(
            "Please fill in the title and note ❤️"
        );

        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("notes")
            .insert([
                {
                    title: title,
                    content: content
                }
            ]);


    if (error) {

        console.error(error);

        alert(
            "Failed to save note."
        );

        return;
    }


    document.getElementById("title")
        .value = "";

    document.getElementById("content")
        .value = "";


    loadNotes();

}


// ==========================================
// EDIT NOTE
// ==========================================

async function editNote(id) {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("notes")
            .select("*")
            .eq("id", id)
            .single();


    if (error) {

        console.error(error);

        alert(
            "Unable to find note."
        );

        return;
    }


    const title =
        prompt(
            "Edit title:",
            data.title
        );


    if (title === null) return;


    const content =
        prompt(
            "Edit note:",
            data.content
        );


    if (content === null) return;


    const {
        error: updateError
    } =
        await supabaseClient
            .from("notes")
            .update({
                title: title.trim(),
                content: content.trim()
            })
            .eq("id", id);


    if (updateError) {

        console.error(updateError);

        alert(
            "Failed to update note."
        );

        return;
    }


    loadNotes();

}


// ==========================================
// DELETE NOTE
// ==========================================

async function deleteNote(id) {

    if (
        !confirm(
            "Delete this note? 🥺"
        )
    ) {

        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("notes")
            .delete()
            .eq("id", id);


    if (error) {

        console.error(error);

        alert(
            "Failed to delete note."
        );

        return;
    }


    loadNotes();

}


// ==========================================
// SECRET MESSAGE
// ==========================================

async function sendSecretMessage() {

    const messageInput =
        document.getElementById(
            "secretMessage"
        );

    const receiverSelect =
        document.getElementById(
            "receiverSelect"
        );


    const message =
        messageInput.value.trim();

    const receiverId =
        receiverSelect.value;


    if (!message) {

        alert(
            "Write a message first ❤️"
        );

        return;
    }


    const {
        data: sessionData
    } =
        await supabaseClient.auth.getSession();


    const session =
        sessionData.session;


    if (!session) {

        alert(
            "Please login first."
        );

        window.location.href =
            "login.html";

        return;
    }


    const senderId =
        session.user.id;


    const {
        error
    } =
        await supabaseClient
            .from("secret_message")
            .insert([
                {
                    sender_id: senderId,
                    receiver_id: receiverId,
                    message: message
                }
            ]);


    if (error) {

        console.error(
            "Send message error:",
            error
        );

        alert(
            "Message failed to send.\n\n" +
            error.message
        );

        return;
    }


    messageInput.value = "";


    alert(
        "Message sent successfully 💌"
    );


    loadSecretMessages();

}


// ==========================================
// LOAD SECRET MESSAGES
// ==========================================

async function loadSecretMessages() {

    const container =
        document.getElementById(
            "secretMessages"
        );


    if (!container) return;


    const {
        data: sessionData
    } =
        await supabaseClient.auth.getSession();


    const session =
        sessionData.session;


    if (!session) return;


    const currentUserId =
        session.user.id;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("secret_message")
            .select("*")
            .or(
                `sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`
            )
            .order("create_at", {
                ascending: false
            });


    if (error) {

        console.error(
            "Secret message error:",
            error
        );

        container.innerHTML = `
            <p class="empty-message">
                Failed to load messages.
            </p>
        `;

        return;
    }


    container.innerHTML = "";


    if (!data || data.length === 0) {

        container.innerHTML = `
            <p class="empty-message">
                No messages yet ❤️
            </p>
        `;

        return;
    }


    data.forEach(item => {

        const div =
            document.createElement("div");


        const isMine =
            item.sender_id === currentUserId;


        div.className =
            "secret-message " +
            (
                isMine
                    ? "mine"
                    : "theirs"
            );


        const senderName =
            item.sender_id === HAZIRAH_ID
                ? "Hazirah ❤️"
                : "Zulkarnain ❤️";


        const date =
            item.create_at
                ? new Date(
                    item.create_at
                ).toLocaleString(
                    "en-MY",
                    {
                        dateStyle: "medium",
                        timeStyle: "short"
                    }
                )
                : "";


        div.innerHTML = `

            <div class="message-header">

                <span class="message-sender">
                    ${isMine ? "You 💕" : senderName}
                </span>

                <span class="message-date">
                    ${date}
                </span>

            </div>


            <p class="message-text">
                ${escapeHTML(item.message)}
            </p>


            ${
                isMine
                ? `
                    <div class="message-buttons">

                        <button
                            onclick="editSecretMessage(${item.id})">
                            ✏️ Edit
                        </button>

                        <button
                            class="delete-message"
                            onclick="deleteSecretMessage(${item.id})">
                            🗑️ Delete
                        </button>

                    </div>
                `
                : ""
            }

        `;


        container.appendChild(div);

    });

}


// ==========================================
// EDIT SECRET MESSAGE
// ==========================================

async function editSecretMessage(id) {

    const {
        data: sessionData
    } =
        await supabaseClient.auth.getSession();


    const session =
        sessionData.session;


    if (!session) return;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("secret_message")
            .select("*")
            .eq("id", id)
            .eq("sender_id", session.user.id)
            .single();


    if (error) {

        console.error(error);

        alert(
            "Unable to find message."
        );

        return;
    }


    const newMessage =
        prompt(
            "Edit your message:",
            data.message
        );


    if (
        newMessage === null ||
        !newMessage.trim()
    ) {

        return;
    }


    const {
        error: updateError
    } =
        await supabaseClient
            .from("secret_message")
            .update({
                message: newMessage.trim()
            })
            .eq("id", id)
            .eq("sender_id", session.user.id);


    if (updateError) {

        console.error(
            updateError
        );

        alert(
            "Failed to edit message."
        );

        return;
    }


    loadSecretMessages();

}


// ==========================================
// DELETE SECRET MESSAGE
// ==========================================

async function deleteSecretMessage(id) {

    if (
        !confirm(
            "Delete this message? 🥺"
        )
    ) {

        return;
    }


    const {
        data: sessionData
    } =
        await supabaseClient.auth.getSession();


    const session =
        sessionData.session;


    if (!session) return;


    const {
        error
    } =
        await supabaseClient
            .from("secret_message")
            .delete()
            .eq("id", id)
            .eq("sender_id", session.user.id);


    if (error) {

        console.error(error);

        alert(
            "Failed to delete message."
        );

        return;
    }


    loadSecretMessages();

}


// ==========================================
// GALLERY
// ==========================================

async function loadGallery() {

    const gallery =
        document.getElementById(
            "gallery"
        );


    if (!gallery) return;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("gallery")
            .select("*")
            .order("created_at", {
                ascending: false
            });


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
            "<p class='empty-message'>No photos yet 📸❤️</p>";

        return;
    }


    data.forEach(photo => {

        const div =
            document.createElement("div");


        div.className =
            "gallery-item";


        div.innerHTML = `

            <img
                src="${photo.image_url}"
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


// ==========================================
// UPLOAD IMAGE
// ==========================================

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
        !file.type.startsWith("image/")
    ) {

        alert(
            "Please select an image."
        );

        return;
    }


    if (
        file.size > 5 * 1024 * 1024
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

        console.error(uploadError);

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


    const {
        error: databaseError
    } =
        await supabaseClient
            .from("gallery")
            .insert([
                {
                    image_url: imageUrl,
                    caption:
                        captionInput.value.trim()
                }
            ]);


    if (databaseError) {

        console.error(
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


    loadGallery();

}


// ==========================================
// DELETE IMAGE
// ==========================================

async function deleteImage(id) {

    if (
        !confirm(
            "Delete this photo?"
        )
    ) {

        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("gallery")
            .select("image_url")
            .eq("id", id)
            .single();


    if (error) {

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
            .eq("id", id);


    if (deleteError) {

        console.error(
            deleteError
        );

        return;
    }


    loadGallery();

}


// ==========================================
// SECURITY
// ==========================================

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text ?? "";


    return div.innerHTML;

}


// ==========================================
// NAVIGATION
// ==========================================

function showSection(sectionId) {

    const sections = [

        "notes-section",

        "message-section",

        "gallery-section",

        "memories-section"

    ];


    sections.forEach(id => {

        const section =
            document.getElementById(id);


        if (section) {

            section.style.display =
                id === sectionId
                    ? "block"
                    : "none";

        }

    });

}


// ==========================================
// START
// ==========================================

loadNotes();

loadSecretMessages();

loadGallery();

showSection(
    "notes-section"
);

