// =====================================================
// SUPABASE CONFIG
// =====================================================

const SUPABASE_URL =
    "https://ognpydprqxxwjdnophxq.supabase.co";


const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nbnB5ZHBycXh4d2pkbm9waHhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyOTM3NzIsImV4cCI6MjEwMjg2OTc3Mn0.GEboyNWovkJ7U9zXAWtzcQ7iddISbQuoLSirBJfFkrM";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// =====================================================
// OUR TWO USERS
// =====================================================

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


// =====================================================
// GET CURRENT USER
// =====================================================

async function getCurrentUser() {

    const {
        data,
        error
    } =
        await supabaseClient.auth.getUser();


    if (error) {

        console.error(
            "User error:",
            error
        );

        return null;
    }


    return data.user;
}



// =====================================================
// LOVE MESSAGES
// =====================================================

async function loadMessages() {

    const receivedContainer =
        document.getElementById(
            "receivedMessages"
        );


    const sentContainer =
        document.getElementById(
            "sentMessages"
        );


    if (
        !receivedContainer ||
        !sentContainer
    ) {

        return;
    }


    const user =
        await getCurrentUser();


    if (!user) {

        return;
    }


    // ---------------------------------------------
    // RECEIVED
    // ---------------------------------------------

    const {
        data: received,
        error: receivedError
    } =
        await supabaseClient
            .from("love_messages")
            .select("*")
            .eq(
                "receiver_id",
                user.id
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (receivedError) {

        console.error(
            "Received messages error:",
            receivedError
        );


        receivedContainer.innerHTML =
            "<p>Failed to load messages.</p>";

    } else {

        receivedContainer.innerHTML =
            "";


        if (
            !received ||
            received.length === 0
        ) {

            receivedContainer.innerHTML = `

                <div class="empty-message">
                    No messages yet 💕
                </div>

            `;

        } else {

            received.forEach(
                message => {

                    receivedContainer.appendChild(
                        createMessageCard(
                            message,
                            false
                        )
                    );

                }
            );

        }

    }


    // ---------------------------------------------
    // SENT
    // ---------------------------------------------

    const {
        data: sent,
        error: sentError
    } =
        await supabaseClient
            .from("love_messages")
            .select("*")
            .eq(
                "sender_id",
                user.id
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (sentError) {

        console.error(
            "Sent messages error:",
            sentError
        );


        sentContainer.innerHTML =
            "<p>Failed to load messages.</p>";

    } else {

        sentContainer.innerHTML =
            "";


        if (
            !sent ||
            sent.length === 0
        ) {

            sentContainer.innerHTML = `

                <div class="empty-message">
                    You haven't sent any messages yet 💌
                </div>

            `;

        } else {

            sent.forEach(
                message => {

                    sentContainer.appendChild(
                        createMessageCard(
                            message,
                            true
                        )
                    );

                }
            );

        }

    }

}



// =====================================================
// CREATE MESSAGE CARD
// =====================================================

function createMessageCard(
    message,
    isSent
) {

    const div =
        document.createElement(
            "div"
        );


    div.className =
        isSent
            ? "message-card sent-message"
            : "message-card received-message";


    const senderName =
        USER_NAMES[
            message.sender_id
        ] ||
        "Someone";


    const receiverName =
        USER_NAMES[
            message.receiver_id
        ] ||
        "Someone";


    const date =
        new Date(
            message.created_at
        );


    const formattedDate =
        date.toLocaleString(
            "en-MY",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );


    div.innerHTML = `

        <div class="message-top">

            <span class="message-from">

                ${
                    isSent
                        ? "To ❤️ " + receiverName
                        : "From ❤️ " + senderName
                }

            </span>


            <span class="message-date">

                ${formattedDate}

            </span>

        </div>


        <h3>

            ${escapeHTML(
                message.title
            )}

        </h3>


        <p class="message-content">

            ${escapeHTML(
                message.content
            )}

        </p>


        ${
            isSent
                ? `

                <div class="message-buttons">

                    <button
                        onclick="editMessage(${message.id})">

                        ✏️ Edit

                    </button>


                    <button
                        onclick="deleteMessage(${message.id})">

                        🗑️ Delete

                    </button>

                </div>

                `
                : ""
        }

    `;


    return div;

}



// =====================================================
// SEND MESSAGE
// =====================================================

async function sendMessage() {

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

        alert(
            "Please write a title and message ❤️"
        );

        return;
    }


    const user =
        await getCurrentUser();


    if (!user) {

        alert(
            "Please login first."
        );

        return;
    }


    // ---------------------------------------------
    // DETERMINE RECEIVER
    // ---------------------------------------------

    let receiverId;


    if (
        user.id ===
        HAZIRAH_ID
    ) {

        receiverId =
            ZULKARNAIN_ID;

    }

    else if (
        user.id ===
        ZULKARNAIN_ID
    ) {

        receiverId =
            HAZIRAH_ID;

    }

    else {

        alert(
            "This account is not registered as a couple account."
        );

        return;
    }


    // ---------------------------------------------
    // INSERT MESSAGE
    // ---------------------------------------------

    const {
        error
    } =
        await supabaseClient
            .from("love_messages")
            .insert([

                {
                    sender_id:
                        user.id,

                    receiver_id:
                        receiverId,

                    title:
                        title,

                    content:
                        content
                }

            ]);


    if (error) {

        console.error(
            "Send message error:",
            error
        );


        alert(
            "Failed to send message.\n\n" +
            error.message
        );

        return;
    }


    // ---------------------------------------------
    // CLEAR FORM
    // ---------------------------------------------

    titleInput.value =
        "";


    contentInput.value =
        "";


    alert(
        "Message sent successfully 💕"
    );


    loadMessages();

}



// =====================================================
// EDIT MESSAGE
// =====================================================

async function editMessage(id) {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("love_messages")
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


    const title =
        prompt(
            "Edit message title:",
            data.title
        );


    if (
        title === null
    ) {

        return;
    }


    const content =
        prompt(
            "Edit your message:",
            data.content
        );


    if (
        content === null
    ) {

        return;
    }


    if (
        !title.trim() ||
        !content.trim()
    ) {

        alert(
            "Message cannot be empty."
        );

        return;
    }


    const {
        error: updateError
    } =
        await supabaseClient
            .from("love_messages")
            .update({

                title:
                    title.trim(),

                content:
                    content.trim(),

                updated_at:
                    new Date().toISOString()

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


    loadMessages();

}



// =====================================================
// DELETE MESSAGE
// =====================================================

async function deleteMessage(id) {

    const confirmDelete =
        confirm(
            "Delete this message? 🥺❤️"
        );


    if (
        !confirmDelete
    ) {

        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("love_messages")
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


    loadMessages();

}



// =====================================================
// GALLERY
// =====================================================

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



// =====================================================
// UPLOAD IMAGE
// =====================================================

async function uploadImage() {

    const fileInput =
        document.getElementById(
            "imageInput"
        );


    const captionInput =
        document.getElementById(
            "caption"
        );


    if (!fileInput) {

        alert(
            "Image input not found."
        );

        return;
    }


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



// =====================================================
// DELETE IMAGE
// =====================================================

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

        return;
    }


    loadGallery();

}



// =====================================================
// SECURITY
// =====================================================

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}



// =====================================================
// NAVIGATION
// =====================================================

function showSection(sectionId) {

    const sections = [

        "notes-section",

        "gallery-section",

        "memories-section"

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

}



// =====================================================
// START
// =====================================================

loadGallery();


showSection(
    "notes-section"
);
