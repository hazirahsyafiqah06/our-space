// ======================================================
// SUPABASE CONFIG
// ======================================================

const SUPABASE_URL =
    "https://ognpydprqxxwjdnophxq.supabase.co";


const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nbnB5ZHBycXh4d2pkbm9waHhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyOTM3NzIsImV4cCI6MjEwMjg2OTc3Mn0.GEboyNWovkJ7U9zXAWtzcQ7iddISbQuoLSirBJfFkrM";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ======================================================
// USER IDS
// ======================================================

const HAZIRAH_ID =
    "fd76923c-6b95-4668-b020-32ff37192990";


const ZULKARNAIN_ID =
    "327adb82-7b8b-4e01-be1d-2802a334e6db";


const USER_NAMES = {

    [HAZIRAH_ID]:
        "Nur Hazirah",

    [ZULKARNAIN_ID]:
        "Zulkarnain"

};


// ======================================================
// CURRENT USER
// ======================================================

let currentUser = null;


// ======================================================
// GET CURRENT LOGIN USER
// ======================================================

async function getCurrentUser() {

    const {
        data,
        error
    } = await supabaseClient.auth.getUser();


    if (
        error ||
        !data.user
    ) {

        console.error(
            "Unable to get user:",
            error
        );

        return null;

    }


    currentUser =
        data.user;


    return currentUser;

}


// ======================================================
// NOTES
// ======================================================

async function loadNotes() {

    const notesContainer =
        document.getElementById(
            "notes"
        );


    if (!notesContainer) return;


    const {
        data,
        error
    } = await supabaseClient
        .from("notes")
        .select("*")
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Notes error:",
            error
        );

        notesContainer.innerHTML =
            "<p>Failed to load notes.</p>";

        return;

    }


    notesContainer.innerHTML =
        "";


    if (
        !data ||
        data.length === 0
    ) {

        notesContainer.innerHTML =
            "<p>No notes yet ❤️</p>";

        return;

    }


    data.forEach(
        note => {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "note";


            div.innerHTML = `

                <h3>
                    ${escapeHTML(
                        note.title
                    )}
                </h3>

                <p>
                    ${escapeHTML(
                        note.content
                    )}
                </p>

                <div class="note-buttons">

                    <button
                        onclick="editNote(${note.id})">
                        ✏️ Edit
                    </button>

                    <button
                        onclick="deleteNote(${note.id})">
                        🗑️ Delete
                    </button>

                </div>

            `;


            notesContainer.appendChild(
                div
            );

        }
    );

}


// ======================================================
// ADD NOTE
// ======================================================

async function addNote() {

    const title =
        document.getElementById(
            "title"
        )
        .value
        .trim();


    const content =
        document.getElementById(
            "content"
        )
        .value
        .trim();


    if (
        !title ||
        !content
    ) {

        alert(
            "Please fill in the title and note ❤️"
        );

        return;

    }


    const {
        error
    } = await supabaseClient
        .from("notes")
        .insert([
            {
                title:
                    title,

                content:
                    content
            }
        ]);


    if (error) {

        console.error(
            error
        );

        alert(
            "Failed to save note."
        );

        return;

    }


    document.getElementById(
        "title"
    ).value =
        "";


    document.getElementById(
        "content"
    ).value =
        "";


    loadNotes();

}


// ======================================================
// EDIT NOTE
// ======================================================

async function editNote(id) {

    const {
        data,
        error
    } = await supabaseClient
        .from("notes")
        .select("*")
        .eq(
            "id",
            id
        )
        .single();


    if (error) {

        console.error(
            error
        );

        return;

    }


    const title =
        prompt(
            "Edit title:",
            data.title
        );


    if (
        title === null
    ) return;


    const content =
        prompt(
            "Edit note:",
            data.content
        );


    if (
        content === null
    ) return;


    const {
        error: updateError
    } = await supabaseClient
        .from("notes")
        .update({
            title:
                title,

            content:
                content
        })
        .eq(
            "id",
            id
        );


    if (updateError) {

        console.error(
            updateError
        );

        alert(
            "Failed to update note."
        );

        return;

    }


    loadNotes();

}


// ======================================================
// DELETE NOTE
// ======================================================

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
    } = await supabaseClient
        .from("notes")
        .delete()
        .eq(
            "id",
            id
        );


    if (error) {

        console.error(
            error
        );

        alert(
            "Failed to delete note."
        );

        return;

    }


    loadNotes();

}


// ======================================================
// GALLERY
// ======================================================

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
    } = await supabaseClient
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


    gallery.innerHTML =
        "";


    if (
        !data ||
        data.length === 0
    ) {

        gallery.innerHTML =
            "<p>No photos yet 📸❤️</p>";

        return;

    }


    data.forEach(
        photo => {

            const div =
                document.createElement(
                    "div"
                );


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


            gallery.appendChild(
                div
            );

        }
    );

}


// ======================================================
// UPLOAD IMAGE
// ======================================================

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
    } = await supabaseClient
        .storage
        .from("gallery")
        .upload(
            fileName,
            file
        );


    if (uploadError) {

        console.error(
            uploadError
        );

        alert(
            "Upload failed: " +
            uploadError.message
        );

        return;

    }


    const {
        data: urlData
    } = supabaseClient
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
    } = await supabaseClient
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
            databaseError
        );

        alert(
            "Image uploaded but database failed."
        );

        return;

    }


    fileInput.value =
        "";


    captionInput.value =
        "";


    alert(
        "Photo uploaded successfully ❤️"
    );


    loadGallery();

}


// ======================================================
// DELETE IMAGE
// ======================================================

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
    } = await supabaseClient
        .from("gallery")
        .select(
            "image_url"
        )
        .eq(
            "id",
            id
        )
        .single();


    if (error) {

        console.error(
            error
        );

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
    } = await supabaseClient
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

        return;

    }


    loadGallery();

}


// ======================================================
// SECRET MESSAGE
// ======================================================

async function loadSecretMessages() {

    const container =
        document.getElementById(
            "secretMessages"
        );


    if (!container) return;


    if (!currentUser) {

        await getCurrentUser();

    }


    if (!currentUser) {

        container.innerHTML = `

            <p class="empty-message">
                Please login first ❤️
            </p>

        `;

        return;

    }


    const {
        data,
        error
    } = await supabaseClient
        .from("secret_message")
        .select("*")
        .or(
            `sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`
        )
        .order(
            "create_at",
            {
                ascending: true
            }
        );


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


    container.innerHTML =
        "";


    if (
        !data ||
        data.length === 0
    ) {

        container.innerHTML = `

            <p class="empty-message">
                No secret messages yet 💕<br>
                Be the first to send one ❤️
            </p>

        `;

        return;

    }


    data.forEach(
        message => {

            const isMine =
                message.sender_id ===
                currentUser.id;


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "secret-message-card " +
                (
                    isMine
                        ? "mine"
                        : "theirs"
                );


            const senderName =
                USER_NAMES[
                    message.sender_id
                ] ||
                "Our Love";


            const formattedDate =
                formatMessageDate(
                    message.create_at
                );


            let actions =
                "";


            if (isMine) {

                actions = `

                    <div class="message-actions">

                        <button
                            class="edit-message-btn"
                            onclick="editSecretMessage(${message.id})">
                            ✏️ Edit
                        </button>

                        <button
                            class="delete-message-btn"
                            onclick="deleteSecretMessage(${message.id})">
                            🗑️ Delete
                        </button>

                    </div>

                `;

            }


            card.innerHTML = `

                <div class="message-bubble">

                    <div class="message-top">

                        <span class="message-sender">
                            ${escapeHTML(
                                senderName
                            )}
                        </span>

                        <span class="message-time">
                            ${formattedDate}
                        </span>

                    </div>

                    <p class="message-text">
                        ${escapeHTML(
                            message.message
                        )}
                    </p>

                    ${actions}

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );

}


// ======================================================
// SEND SECRET MESSAGE
// ======================================================

async function sendSecretMessage() {

    if (!currentUser) {

        await getCurrentUser();

    }


    if (!currentUser) {

        alert(
            "Please login first ❤️"
        );

        return;

    }


    const messageInput =
        document.getElementById(
            "secretMessage"
        );


    const sendButton =
        document.getElementById(
            "sendMessageBtn"
        );


    const message =
        messageInput.value.trim();


    if (!message) {

        alert(
            "Please write a message first ❤️"
        );

        return;

    }


    let receiverId;


    if (
        currentUser.id ===
        HAZIRAH_ID
    ) {

        receiverId =
            ZULKARNAIN_ID;

    } else if (
        currentUser.id ===
        ZULKARNAIN_ID
    ) {

        receiverId =
            HAZIRAH_ID;

    } else {

        alert(
            "This account is not part of Our Space ❤️"
        );

        return;

    }


    sendButton.disabled =
        true;


    sendButton.textContent =
        "Sending... 💕";


    const {
        error
    } = await supabaseClient
        .from("secret_message")
        .insert([
            {
                sender_id:
                    currentUser.id,

                receiver_id:
                    receiverId,

                message:
                    message
            }
        ]);


    if (error) {

        console.error(
            "Send message error:",
            error
        );

        alert(
            "Message failed to send:\n" +
            error.message
        );

        sendButton.disabled =
            false;


        sendButton.textContent =
            "💌 Send Message";

        return;

    }


    messageInput.value =
        "";


    sendButton.disabled =
        false;


    sendButton.textContent =
        "💌 Send Message";


    await loadSecretMessages();

}


// ======================================================
// EDIT SECRET MESSAGE
// ======================================================

async function editSecretMessage(id) {

    const {
        data,
        error
    } = await supabaseClient
        .from("secret_message")
        .select("*")
        .eq(
            "id",
            id
        )
        .single();


    if (error) {

        console.error(
            error
        );

        alert(
            "Unable to find message."
        );

        return;

    }


    if (
        data.sender_id !==
        currentUser.id
    ) {

        alert(
            "You can only edit your own message."
        );

        return;

    }


    const newMessage =
        prompt(
            "Edit your message:",
            data.message
        );


    if (
        newMessage === null
    ) {

        return;

    }


    const cleanedMessage =
        newMessage.trim();


    if (!cleanedMessage) {

        alert(
            "Message cannot be empty."
        );

        return;

    }


    const {
        error: updateError
    } = await supabaseClient
        .from("secret_message")
        .update({
            message:
                cleanedMessage
        })
        .eq(
            "id",
            id
        );


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


// ======================================================
// DELETE SECRET MESSAGE
// ======================================================

async function deleteSecretMessage(id) {

    if (
        !confirm(
            "Delete this message? 🥺"
        )
    ) {

        return;

    }


    const {
        error
    } = await supabaseClient
        .from("secret_message")
        .delete()
        .eq(
            "id",
            id
        );


    if (error) {

        console.error(
            error
        );

        alert(
            "Failed to delete message."
        );

        return;

    }


    loadSecretMessages();

}


// ======================================================
// FORMAT MESSAGE DATE
// ======================================================

function formatMessageDate(
    dateString
) {

    if (!dateString) {

        return "";

    }


    const date =
        new Date(
            dateString
        );


    return date.toLocaleString(
        "en-MY",
        {
            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric",

            hour:
                "2-digit",

            minute:
                "2-digit"
        }
    );

}


// ======================================================
// SECURITY
// ======================================================

function escapeHTML(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


// ======================================================
// NAVIGATION
// ======================================================

function showSection(
    sectionId
) {

    const sections = [

        "notes-section",

        "gallery-section",

        "memories-section",

        "messages-section"

    ];


    sections.forEach(
        id => {

            const section =
                document.getElementById(
                    id
                );


            if (section) {

                section.style.display =
                    id === sectionId
                        ? "block"
                        : "none";

            }

        }
    );


    if (
        sectionId ===
        "messages-section"
    ) {

        loadSecretMessages();

    }

}


// ======================================================
// START
// ======================================================

async function startApp() {

    await getCurrentUser();


    loadNotes();


    loadGallery();


    loadSecretMessages();


    showSection(
        "notes-section"
    );

}


startApp();
