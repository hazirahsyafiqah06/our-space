
// ======================================================
// OUR SPACE
// script.js
// ======================================================


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


let currentUser = null;

let allNotes = [];

let allGallery = [];


// ======================================================
// RELATIONSHIP DATE
// ======================================================

const relationshipStart =
    new Date(
        "2021-07-17T00:00:00"
    );


// ======================================================
// TOAST
// ======================================================

let toastTimer = null;


function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast)
        return;


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


// ======================================================
// GET CURRENT USER
// ======================================================

async function getCurrentUser() {

    const {
        data,
        error
    } =
        await supabaseClient.auth.getUser();


    if (
        error ||
        !data ||
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
// TOGETHER YEARS + DAYS
// ======================================================

function updateTogetherTime() {

    const now =
        new Date();


    let years =
        now.getFullYear() -
        relationshipStart.getFullYear();


    const anniversaryThisYear =
        new Date(
            now.getFullYear(),
            relationshipStart.getMonth(),
            relationshipStart.getDate()
        );


    if (
        now < anniversaryThisYear
    ) {

        years--;

    }


    const lastAnniversary =
        new Date(
            relationshipStart
        );


    lastAnniversary.setFullYear(
        relationshipStart.getFullYear() +
        years
    );


    const millisecondsPerDay =
        1000 * 60 * 60 * 24;


    const days =
        Math.floor(
            (
                now -
                lastAnniversary
            ) /
            millisecondsPerDay
        );


    const yearsElement =
        document.getElementById(
            "togetherYears"
        );


    const daysElement =
        document.getElementById(
            "togetherDays"
        );


    if (yearsElement) {

        yearsElement.textContent =
            years;

    }


    if (daysElement) {

        daysElement.textContent =
            days;

    }

}


// ======================================================
// ANNIVERSARY COUNTDOWN
// ======================================================

function countdown() {

    const now =
        new Date();


    let nextAnniversary =
        new Date(
            now.getFullYear(),
            6,
            17,
            0,
            0,
            0
        );


    if (
        nextAnniversary <= now
    ) {

        nextAnniversary =
            new Date(
                now.getFullYear() + 1,
                6,
                17,
                0,
                0,
                0
            );

    }


    const distance =
        nextAnniversary -
        now;


    if (distance <= 0)
        return;


    const days =
        Math.floor(
            distance /
            (1000 * 60 * 60 * 24)
        );


    const hours =
        Math.floor(
            (
                distance /
                (1000 * 60 * 60)
            ) % 24
        );


    const minutes =
        Math.floor(
            (
                distance /
                (1000 * 60)
            ) % 60
        );


    const seconds =
        Math.floor(
            (
                distance /
                1000
            ) % 60
        );


    const daysElement =
        document.getElementById(
            "days"
        );


    const hoursElement =
        document.getElementById(
            "hours"
        );


    const minutesElement =
        document.getElementById(
            "minutes"
        );


    const secondsElement =
        document.getElementById(
            "seconds"
        );


    if (daysElement)
        daysElement.textContent =
            days;


    if (hoursElement)
        hoursElement.textContent =
            hours;


    if (minutesElement)
        minutesElement.textContent =
            minutes;


    if (secondsElement)
        secondsElement.textContent =
            seconds;

}


// ======================================================
// NOTES
// ======================================================

async function loadNotes() {

    const notesContainer =
        document.getElementById(
            "notes"
        );


    if (!notesContainer)
        return;


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
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Notes error:",
            error
        );


        notesContainer.innerHTML = `
            <p class="empty-message">
                Failed to load notes.
            </p>
        `;

        return;
    }


    allNotes =
        data || [];


    renderNotes(
        allNotes
    );

}


// ======================================================
// RENDER NOTES
// ======================================================

function renderNotes(
    notes
) {

    const notesContainer =
        document.getElementById(
            "notes"
        );


    if (!notesContainer)
        return;


    notesContainer.innerHTML =
        "";


    if (
        !notes ||
        notes.length === 0
    ) {

        notesContainer.innerHTML = `
            <p class="empty-message">
                No notes yet ❤️
            </p>
        `;

        return;
    }


    notes.forEach(
        note => {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "note";


            const noteDate =
                note.created_at
                    ? formatGalleryDate(
                        note.created_at
                    )
                    : "";


            div.innerHTML = `

                <h3>
                    ${escapeHTML(note.title)}
                </h3>

                <p>
                    ${escapeHTML(note.content)}
                </p>

                ${
                    noteDate
                        ? `
                            <span class="note-date">
                                📅 ${escapeHTML(noteDate)}
                            </span>
                        `
                        : ""
                }

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
// FILTER NOTES
// ======================================================

function filterNotes() {

    const input =
        document.getElementById(
            "noteSearch"
        );


    if (!input)
        return;


    const keyword =
        input.value
            .trim()
            .toLowerCase();


    if (!keyword) {

        renderNotes(
            allNotes
        );

        return;

    }


    const filtered =
        allNotes.filter(
            note => {

                const title =
                    String(
                        note.title || ""
                    ).toLowerCase();


                const content =
                    String(
                        note.content || ""
                    ).toLowerCase();


                return (
                    title.includes(keyword) ||
                    content.includes(keyword)
                );

            }
        );


    if (filtered.length === 0) {

        const notesContainer =
            document.getElementById(
                "notes"
            );


        notesContainer.innerHTML = `
            <p class="empty-message">
                No notes found 🔍
            </p>
        `;

        return;

    }


    renderNotes(
        filtered
    );

}


// ======================================================
// ADD NOTE
// ======================================================

async function addNote() {

    const titleInput =
        document.getElementById(
            "title"
        );


    const contentInput =
        document.getElementById(
            "content"
        );


    const title =
        titleInput.value.trim();


    const content =
        contentInput.value.trim();


    if (
        !title ||
        !content
    ) {

        showToast(
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
                    title:
                        title,

                    content:
                        content
                }
            ]);


    if (error) {

        console.error(error);

        showToast(
            "Failed to save note."
        );

        return;
    }


    titleInput.value =
        "";


    contentInput.value =
        "";


    updateNoteCounter();


    showToast(
        "Note saved ❤️"
    );


    await loadNotes();

}


// ======================================================
// EDIT NOTE
// ======================================================

async function editNote(
    id
) {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("notes")
            .select("*")
            .eq(
                "id",
                id
            )
            .single();


    if (error) {

        console.error(error);

        showToast(
            "Unable to find note."
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
    )
        return;


    const content =
        prompt(
            "Edit note:",
            data.content
        );


    if (
        content === null
    )
        return;


    if (
        !title.trim() ||
        !content.trim()
    ) {

        showToast(
            "Title and note cannot be empty."
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
                    title.trim(),

                content:
                    content.trim()
            })
            .eq(
                "id",
                id
            );


    if (updateError) {

        console.error(
            updateError
        );

        showToast(
            "Failed to update note."
        );

        return;
    }


    showToast(
        "Note updated ✨"
    );


    loadNotes();

}


// ======================================================
// DELETE NOTE
// ======================================================

async function deleteNote(
    id
) {

    if (
        !confirm(
            "Delete this note? 🥺"
        )
    )
        return;


    const {
        error
    } =
        await supabaseClient
            .from("notes")
            .delete()
            .eq(
                "id",
                id
            );


    if (error) {

        console.error(error);

        showToast(
            "Failed to delete note."
        );

        return;
    }


    showToast(
        "Note deleted 🗑️"
    );


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


    if (!gallery)
        return;


    gallery.innerHTML = `
        <p class="gallery-loading">
            Loading our memories... 💕
        </p>
    `;


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


        gallery.innerHTML = `
            <div class="gallery-empty">

                <div class="empty-icon">
                    😢
                </div>

                <strong>
                    Failed to load gallery
                </strong>

                <p>
                    ${escapeHTML(error.message)}
                </p>

            </div>
        `;

        return;
    }


    allGallery =
        data || [];


    renderGallery(
        allGallery
    );

}


// ======================================================
// RENDER GALLERY
// ======================================================

function renderGallery(
    photos
) {

    const gallery =
        document.getElementById(
            "gallery"
        );


    if (!gallery)
        return;


    gallery.innerHTML =
        "";


    if (
        !photos ||
        photos.length === 0
    ) {

        gallery.innerHTML = `

            <div class="gallery-empty">

                <div class="empty-icon">
                    📸💕
                </div>

                <strong>
                    No memories yet
                </strong>

                <p>
                    Our little album is waiting
                    for its first photo 🩷🩵
                </p>

            </div>

        `;

        return;
    }


    photos.forEach(
        photo => {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "gallery-item";


            const caption =
                photo.caption ||
                "A little memory ❤️";


            const date =
                photo.created_at
                    ? formatGalleryDate(
                        photo.created_at
                    )
                    : "Date unavailable";


            div.innerHTML = `

                <div
                    class="gallery-image-wrapper"
                    data-image-url="${escapeAttribute(photo.image_url)}"
                    data-caption="${escapeAttribute(caption)}"
                    data-date="${escapeAttribute(date)}">

                    <img
                        src="${escapeAttribute(photo.image_url)}"
                        alt="Our Memory"
                        loading="lazy">


                    <div class="photo-overlay">

                        <span class="view-photo">
                            🔍 View Photo
                        </span>

                    </div>


                    <span class="gallery-zoom">
                        🔍
                    </span>

                </div>


                <div class="gallery-caption">

                    <p>
                        ${escapeHTML(caption)}
                    </p>


                    <span class="gallery-date">
                        📅 ${escapeHTML(date)}
                    </span>


                    <button
                        class="gallery-delete"
                        onclick="event.stopPropagation(); deleteImage(${photo.id})">

                        🗑️ Delete

                    </button>

                </div>

            `;


            const imageWrapper =
                div.querySelector(
                    ".gallery-image-wrapper"
                );


            imageWrapper.addEventListener(
                "click",
                function() {

                    openLightbox(
                        photo.image_url,
                        caption,
                        date
                    );

                }
            );


            gallery.appendChild(
                div
            );

        }
    );

}


// ======================================================
// FILTER GALLERY
// ======================================================

function filterGallery() {

    const input =
        document.getElementById(
            "gallerySearch"
        );


    if (!input)
        return;


    const keyword =
        input.value
            .trim()
            .toLowerCase();


    if (!keyword) {

        renderGallery(
            allGallery
        );

        return;

    }


    const filtered =
        allGallery.filter(
            photo => {

                const caption =
                    String(
                        photo.caption || ""
                    ).toLowerCase();


                return caption.includes(
                    keyword
                );

            }
        );


    if (
        filtered.length === 0
    ) {

        const gallery =
            document.getElementById(
                "gallery"
            );


        gallery.innerHTML = `

            <div class="gallery-empty">

                <div class="empty-icon">
                    🔍
                </div>

                <strong>
                    No memory found
                </strong>

                <p>
                    Try another keyword ❤️
                </p>

            </div>

        `;

        return;

    }


    renderGallery(
        filtered
    );

}


// ======================================================
// IMAGE PREVIEW
// ======================================================

function setupImagePreview() {

    const input =
        document.getElementById(
            "imageInput"
        );


    if (!input)
        return;


    input.addEventListener(
        "change",
        function() {

            const file =
                input.files[0];


            const preview =
                document.getElementById(
                    "imagePreview"
                );


            const previewImage =
                document.getElementById(
                    "previewImage"
                );


            const previewName =
                document.getElementById(
                    "previewName"
                );


            if (!file) {

                preview.classList.remove(
                    "active"
                );

                previewImage.src =
                    "";

                previewName.textContent =
                    "";

                return;

            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                showToast(
                    "Please choose an image."
                );

                input.value =
                    "";

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function(event) {

                    previewImage.src =
                        event.target.result;


                    previewName.textContent =
                        file.name;


                    preview.classList.add(
                        "active"
                    );

                };


            reader.readAsDataURL(
                file
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


    const uploadButton =
        document.querySelector(
            ".upload-btn"
        );


    if (!fileInput)
        return;


    const file =
        fileInput.files[0];


    if (!file) {

        showToast(
            "Please choose a photo 📸"
        );

        return;
    }


    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        showToast(
            "Please select an image."
        );

        return;
    }


    if (
        file.size >
        5 * 1024 * 1024
    ) {

        showToast(
            "Image must be smaller than 5MB."
        );

        return;
    }


    const caption =
        captionInput.value.trim();


    const safeName =
        file.name
            .replace(
                /[^a-zA-Z0-9._-]/g,
                "_"
            );


    const fileName =
        Date.now() +
        "_" +
        safeName;


    uploadButton.disabled =
        true;


    uploadButton.textContent =
        "Uploading... 📸";


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


        showToast(
            "Upload failed: " +
            uploadError.message
        );


        uploadButton.disabled =
            false;


        uploadButton.textContent =
            "📸 Add to Our Gallery";


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


        showToast(
            "Image uploaded but database failed."
        );


        uploadButton.disabled =
            false;


        uploadButton.textContent =
            "📸 Add to Our Gallery";


        return;
    }


    fileInput.value =
        "";


    captionInput.value =
        "";


    const preview =
        document.getElementById(
            "imagePreview"
        );


    preview.classList.remove(
        "active"
    );


    document.getElementById(
        "previewImage"
    ).src = "";


    document.getElementById(
        "previewName"
    ).textContent = "";


    uploadButton.disabled =
        false;


    uploadButton.textContent =
        "📸 Add to Our Gallery";


    showToast(
        "Photo added to Our Gallery ❤️"
    );


    await loadGallery();

}


// ======================================================
// DELETE IMAGE
// ======================================================

async function deleteImage(
    id
) {

    if (
        !confirm(
            "Delete this photo? 🥺"
        )
    )
        return;


    const {
        data,
        error
    } =
        await supabaseClient
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

        console.error(error);

        showToast(
            "Unable to find photo."
        );

        return;
    }


    const imageUrl =
        data.image_url;


    try {

        const url =
            new URL(
                imageUrl
            );


        const marker =
            "/storage/v1/object/public/gallery/";


        const index =
            url.pathname.indexOf(
                marker
            );


        if (index !== -1) {

            const path =
                url.pathname.substring(
                    index + marker.length
                );


            if (path) {

                await supabaseClient
                    .storage
                    .from("gallery")
                    .remove([
                        decodeURIComponent(
                            path
                        )
                    ]);

            }

        }

    } catch (storageError) {

        console.error(
            "Storage delete error:",
            storageError
        );

    }


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

        showToast(
            "Failed to delete photo."
        );

        return;
    }


    showToast(
        "Photo deleted 🗑️"
    );


    loadGallery();

}


// ======================================================
// LIGHTBOX
// ======================================================

function openLightbox(
    imageUrl,
    caption,
    date
) {

    const lightbox =
        document.getElementById(
            "lightbox"
        );


    const image =
        document.getElementById(
            "lightboxImage"
        );


    const captionElement =
        document.getElementById(
            "lightboxCaption"
        );


    const dateElement =
        document.getElementById(
            "lightboxDate"
        );


    if (!lightbox)
        return;


    image.src =
        imageUrl;


    captionElement.textContent =
        caption;


    dateElement.textContent =
        "📅 Uploaded: " +
        date;


    lightbox.classList.add(
        "active"
    );


    document.body.style.overflow =
        "hidden";

}


// ======================================================
// CLOSE LIGHTBOX
// ======================================================

function closeLightbox() {

    const lightbox =
        document.getElementById(
            "lightbox"
        );


    if (!lightbox)
        return;


    lightbox.classList.remove(
        "active"
    );


    document.body.style.overflow =
        "";

}


// ======================================================
// ESCAPE KEY
// ======================================================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape"
        ) {

            closeLightbox();

        }

    }
);


// ======================================================
// FORMAT DATE
// ======================================================

function formatGalleryDate(
    dateString
) {

    if (!dateString)
        return "Date unavailable";


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
                "2-digit",

            hour12:
                true
        }
    );

}


// ======================================================
// SECRET MESSAGE
// ======================================================

async function loadSecretMessages() {

    const container =
        document.getElementById(
            "secretMessages"
        );


    if (!container)
        return;


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
    } =
        await supabaseClient
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

                    <div
                        class="message-actions">

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
                            ${escapeHTML(senderName)}
                        </span>

                    </div>


                    <p class="message-text">
                        ${escapeHTML(message.message)}
                    </p>


                    <span class="message-time">
                        ${formattedDate}
                    </span>


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

        showToast(
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

        showToast(
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

        showToast(
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
    } =
        await supabaseClient
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


        showToast(
            "Message failed to send."
        );


        sendButton.disabled =
            false;


        sendButton.textContent =
            "💌 Send Message";


        return;
    }


    messageInput.value =
        "";


    updateMessageCounter();


    sendButton.disabled =
        false;


    sendButton.textContent =
        "💌 Send Message";


    showToast(
        "Message sent ❤️"
    );


    await loadSecretMessages();

}


// ======================================================
// EDIT SECRET MESSAGE
// ======================================================

async function editSecretMessage(
    id
) {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("secret_message")
            .select("*")
            .eq(
                "id",
                id
            )
            .single();


    if (error) {

        console.error(error);

        showToast(
            "Unable to find message."
        );

        return;
    }


    if (
        !currentUser ||
        data.sender_id !==
        currentUser.id
    ) {

        showToast(
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
    )
        return;


    const cleanedMessage =
        newMessage.trim();


    if (!cleanedMessage) {

        showToast(
            "Message cannot be empty."
        );

        return;
    }


    const {
        error: updateError
    } =
        await supabaseClient
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

        showToast(
            "Failed to edit message."
        );

        return;
    }


    showToast(
        "Message updated ✨"
    );


    loadSecretMessages();

}


// ======================================================
// DELETE SECRET MESSAGE
// ======================================================

async function deleteSecretMessage(
    id
) {

    if (
        !confirm(
            "Delete this message? 🥺"
        )
    )
        return;


    const {
        error
    } =
        await supabaseClient
            .from("secret_message")
            .delete()
            .eq(
                "id",
                id
            );


    if (error) {

        console.error(error);

        showToast(
            "Failed to delete message."
        );

        return;
    }


    showToast(
        "Message deleted 🗑️"
    );


    loadSecretMessages();

}


// ======================================================
// FORMAT MESSAGE DATE
// ======================================================

function formatMessageDate(
    dateString
) {

    if (!dateString)
        return "";


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
                "2-digit",

            hour12:
                true
        }
    );

}


// ======================================================
// NOTE COUNTER
// ======================================================

function updateNoteCounter() {

    const input =
        document.getElementById(
            "content"
        );


    const counter =
        document.getElementById(
            "noteCounter"
        );


    if (!input || !counter)
        return;


    counter.textContent =
        input.value.length +
        " / 1000";

}


// ======================================================
// MESSAGE COUNTER
// ======================================================

function updateMessageCounter() {

    const input =
        document.getElementById(
            "secretMessage"
        );


    const counter =
        document.getElementById(
            "messageCounter"
        );


    if (!input || !counter)
        return;


    counter.textContent =
        input.value.length +
        " / 1000";

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


function escapeAttribute(
    text
) {

    return String(text)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /'/g,
            "&#39;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        );

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


    const navButtons = {

        "notes-section":
            "nav-notes",

        "gallery-section":
            "nav-gallery",

        "memories-section":
            "nav-memories",

        "messages-section":
            "nav-messages"

    };


    Object.values(
        navButtons
    ).forEach(
        buttonId => {

            const button =
                document.getElementById(
                    buttonId
                );


            if (button) {

                button.classList.remove(
                    "active"
                );

            }

        }
    );


    const activeButton =
        document.getElementById(
            navButtons[
                sectionId
            ]
        );


    if (activeButton) {

        activeButton.classList.add(
            "active"
        );

    }


    if (
        sectionId ===
        "messages-section"
    ) {

        loadSecretMessages();

    }


    if (
        sectionId ===
        "gallery-section"
    ) {

        loadGallery();

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ======================================================
// BACK TO TOP
// ======================================================

function scrollToTop() {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


window.addEventListener(
    "scroll",
    function() {

        const button =
            document.getElementById(
                "backToTop"
            );


        if (!button)
            return;


        if (
            window.scrollY >
            300
        ) {

            button.classList.add(
                "show"
            );

        } else {

            button.classList.remove(
                "show"
            );

        }

    }
);


// ======================================================
// INPUT EVENTS
// ======================================================

function setupInputCounters() {

    const noteInput =
        document.getElementById(
            "content"
        );


    const messageInput =
        document.getElementById(
            "secretMessage"
        );


    if (noteInput) {

        noteInput.addEventListener(
            "input",
            updateNoteCounter
        );

    }


    if (messageInput) {

        messageInput.addEventListener(
            "input",
            updateMessageCounter
        );

    }


    updateNoteCounter();

    updateMessageCounter();

}


// ======================================================
// START APP
// ======================================================

async function startApp() {

    await getCurrentUser();


    updateTogetherTime();


    countdown();


    setupInputCounters();


    setupImagePreview();


    await loadNotes();


    await loadGallery();


    await loadSecretMessages();


    showSection(
        "notes-section"
    );

}


startApp();


// ======================================================
// LIVE UPDATE
// ======================================================

setInterval(
    updateTogetherTime,
    60000
);


setInterval(
    countdown,
    1000
);

