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

// ======================================================
// RELATIONSHIP DATE
// ======================================================

const relationshipStart =
    new Date(
        "2021-07-17T00:00:00"
    );

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

    if (distance <= 0) {

        return;

    }

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
// BIRTHDAY COUNTDOWN
// ======================================================

function updateBirthdayCountdown(month, date, daysId, hoursId, minutesId, secondsId) {

    const now = new Date();

    let nextBirthday =
        new Date(
            now.getFullYear(),
            month - 1,
            date,
            0,
            0,
            0
        );

    if (
        nextBirthday <= now
    ) {
        nextBirthday =
            new Date(
                now.getFullYear() + 1,
                month - 1,
                date,
                0,
                0,
                0
            );
    }

    const distance =
        nextBirthday - now;

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
            daysId
        );

    const hoursElement =
        document.getElementById(
            hoursId
        );

    const minutesElement =
        document.getElementById(
            minutesId
        );

    const secondsElement =
        document.getElementById(
            secondsId
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


function birthdayCountdown() {

    // Nur Hazirah - 27 February
    updateBirthdayCountdown(
        2,
        27,
        "hazirahBirthdayDays",
        "hazirahBirthdayHours",
        "hazirahBirthdayMinutes",
        "hazirahBirthdaySeconds"
    );

    // Zulkarnain - 9 September
    updateBirthdayCountdown(
        9,
        9,
        "zulkarnainBirthdayDays",
        "zulkarnainBirthdayHours",
        "zulkarnainBirthdayMinutes",
        "zulkarnainBirthdaySeconds"
    );
        birthdaySurprise();

}

// ======================================================
// BIRTHDAY SURPRISE
// ======================================================

function birthdaySurprise() {

    const now = new Date();

    const month = now.getMonth() + 1;
    const date = now.getDate();

    let person = "";
    let image = "";
    let message = "";
    let badge = "";

    if (month === 9 && date === 9) {

        person = "Zulkarnain 💙";
        image = "zul.jpeg";
        badge = "🎁 Stay amazing, always ♡";

        message = `
            Happy Birthday, Zulkarnain! 🎂💙
            <br><br>
            Today is all about you.
            Thank you for being part of
            all these little memories with me.
            <br><br>
            May this new chapter bring you
            happiness, health, success
            and everything good in life.
            <br><br>
            Thank you for always being you. ♡
        `;

    }

    if (month === 2 && date === 27) {

        person = "Nur Hazirah 🩷";
        image = "zirah.jpeg";
        badge = "🎀 Forever my favourite person ♡";

        message = `
            Happy Birthday, Hazirah! 🎂🩷
            <br><br>
            Thank you for bringing so much
            happiness into this little world.
            <br><br>
            I hope your smile never fades,
            your dreams always come true,
            and your heart stays this soft forever.
            <br><br>
            You deserve all the love in the world. ♡
        `;

    }

    if (person === "")
        return;

    const todayKey =
        "birthday_" +
        now.getFullYear() +
        "_" +
        month +
        "_" +
        date +
        "_" +
        person;

    if (sessionStorage.getItem(todayKey))
        return;

    sessionStorage.setItem(todayKey, "shown");

    const popup =
        document.createElement("div");

    popup.className =
        "birthday-overlay";

    popup.innerHTML = `
        <div class="birthday-popup">

            <button
                class="close-button"
                onclick="closeBirthdaySurprise()"
            >
                ✕
            </button>

            <div class="birthday-gift">

                <div class="gift-ribbon-left"></div>
                <div class="gift-ribbon-right"></div>
                <div class="gift-lid"></div>
                <div class="gift-box"></div>

            </div>

            <h2>
                Happy Birthday!
            </h2>

            <div class="wish">
                Wishing you a day as special as you are ♡
            </div>

            <img
                src="${image}"
                class="popup-photo"
                alt="${person}"
            >

            <h3>
                ${person}
            </h3>

            <div class="popup-message">
                ${message}
            </div>

            <div class="special-badge">
                ${badge}
            </div>

            <div class="popup-date">
                🎁 TODAY IS YOUR SPECIAL DAY 🎁
            </div>

        </div>
    `;

    document.body.appendChild(
        popup
    );

    document.body.style.overflow =
        "hidden";

    createBirthdayGifts();

}


// ======================================================
// CLOSE POPUP
// ======================================================

function closeBirthdaySurprise() {

    const popup =
        document.querySelector(
            ".birthday-overlay"
        );

    if (popup)
        popup.remove();

    document.body.style.overflow =
        "";

}


// ======================================================
// FLOATING GIFTS
// ======================================================

function createBirthdayGifts() {

    const items = [
        "🎁",
        "🎀",
        "✨",
        "🎁",
        "🩷",
        "💙"
    ];

    for (let i = 0; i < 18; i++) {

        const gift =
            document.createElement(
                "span"
            );

        gift.className =
            "floating-gift";

        gift.textContent =
            items[
                Math.floor(
                    Math.random() *
                    items.length
                )
            ];

        gift.style.left =
            Math.random() * 100 + "%";

        gift.style.animationDelay =
            Math.random() * 1.5 + "s";

        gift.style.animationDuration =
            3 + Math.random() * 3 + "s";

        document.body.appendChild(
            gift
        );

        setTimeout(() => {
            gift.remove();
        }, 7000);

    }

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

    data.forEach(note => {

        const div =
            document.createElement(
                "div"
            );

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
                    onclick="deleteNote(${note.id})">
                    🗑️ Delete
                </button>

            </div>

        `;

        notesContainer.appendChild(
            div
        );

    });

}

// ======================================================
// EMAIL NOTIFICATION
// ======================================================

async function sendEmailNotification(
    subject,
    title,
    message
) {

    try {

        let receiverEmail = "";

        if (currentUser?.id === HAZIRAH_ID) {

            receiverEmail =
                "zulz4065@gmail.com";

        } else if (
            currentUser?.id === ZULKARNAIN_ID
        ) {

            receiverEmail =
                "hazirahsyafiqah84@gmail.com";

        } else {

            return;
        }

        const { error } =
            await supabaseClient.functions.invoke(
                "send-notification",
                {
                    body: {
                        to: receiverEmail,
                        subject: subject,
                        title: title,
                        message: message
                    }
                }
            );

        if (error) {

            console.error(
                "Email notification error:",
                error
            );

        }

    } catch (error) {

        console.error(
            "Email notification failed:",
            error
        );

    }

}


// ======================================================
// ADD NOTE
// ======================================================

async function addNote() {

    const title =
        document
            .getElementById("title")
            .value
            .trim();

    const content =
        document
            .getElementById("content")
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

        alert(
            "Failed to save note."
        );

        return;
    }

    document.getElementById(
        "title"
    ).value = "";

   document.getElementById(
    "content"
).value = "";

await sendEmailNotification(
    "New Note Added ❤️",
    "📝 New Note Added",
    "A new note has been added to Our Space.<br><br>" +
    "<strong>Title:</strong> " +
    escapeHTML(title) +
    "<br>" +
    "<strong>Note:</strong> " +
    escapeHTML(content)
);
    document.getElementById(
    "title"
).value = "";

document.getElementById(
    "content"
).value = "";

await sendEmailNotification(
    "New Note Added ❤️",
    "📝 New Note Added",
    "A new note has been added to Our Space.<br><br>" +
    "<strong>Title:</strong> " +
    escapeHTML(title) +
    "<br>" +
    "<strong>Note:</strong> " +
    escapeHTML(content)
);

loadNotes();

loadNotes();  

}

// ======================================================
// EDIT NOTE
// ======================================================

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

    const {
        error: updateError
    } =
        await supabaseClient
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
            <p class="gallery-empty">
                Failed to load gallery.
            </p>
        `;

        return;
    }

    gallery.innerHTML = "";

    if (
        !data ||
        data.length === 0
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

    data.forEach(photo => {

        const div =
            document.createElement(
                "div"
            );

        div.className =
            "gallery-item";

        const caption =
            photo.caption ||
            "A little memory ❤️";

        /*
         * TARIKH + MASA UPLOAD
         */
        const date =
            photo.created_at
                ? formatGalleryDate(
                    photo.created_at
                )
                : "Date unavailable";

        div.innerHTML = `

            <div
                class="gallery-image-wrapper"
                onclick="openLightbox(
                    '${escapeJS(photo.image_url)}',
                    '${escapeJS(caption)}',
                    '${escapeJS(date)}'
                )"
            >

                <img
                    src="${escapeAttribute(photo.image_url)}"
                    alt="Our Memory"
                    loading="lazy"
                >

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
                    onclick="event.stopPropagation(); deleteImage(${photo.id})"
                >
                    🗑️ Delete
                </button>

            </div>

        `;

        gallery.appendChild(
            div
        );

    });

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

    if (!fileInput)
        return;

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

    fileInput.value =
        "";

    captionInput.value =
        "";

    alert(
        "Photo added to Our Gallery ❤️"
    );

    await sendEmailNotification(
    "New Photo Added ❤️",
    "📸 New Photo Added",
    "A new photo has been added to Our Gallery.<br><br>" +
    "<strong>Caption:</strong> " +
    (escapeHTML(caption) || "No caption") +
    "<br><br>" +
    "<a href=\"" +
    imageUrl +
    "\" target=\"_blank\">View Photo ❤️</a>"
);

    loadGallery();

}

// ======================================================
// DELETE IMAGE
// ======================================================

async function deleteImage(id) {

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

        alert(
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

        const path =
            url.pathname.split(
                "/storage/v1/object/public/gallery/"
            )[1];

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

        alert(
            "Failed to delete photo."
        );

        return;
    }

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

    image.src =
        imageUrl;

    captionElement.textContent =
        caption;

    /*
     * CREATE DATE ELEMENT
     * AUTOMATICALLY
     * JIKA HTML BELUM ADA
     */

    let dateElement =
        document.getElementById(
            "lightboxDate"
        );

    if (!dateElement) {

        dateElement =
            document.createElement(
                "div"
            );

        dateElement.id =
            "lightboxDate";

        dateElement.className =
            "lightbox-date";

        captionElement
            .insertAdjacentElement(
                "afterend",
                dateElement
            );

    }

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

function closeLightbox(event) {

    if (
        event &&
        event.target &&
        event.target.id !==
            "lightbox"
    ) {

        return;
    }

    const lightbox =
        document.getElementById(
            "lightbox"
        );

    lightbox.classList.remove(
        "active"
    );

    document.body.style.overflow =
        "";

}

// ======================================================
// ESCAPE KEY FOR LIGHTBOX
// ======================================================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape"
        ) {

            const lightbox =
                document.getElementById(
                    "lightbox"
                );

            if (
                lightbox &&
                lightbox.classList.contains(
                    "active"
                )
            ) {

                lightbox.classList.remove(
                    "active"
                );

                document.body.style.overflow =
                    "";

            }

        }

    }
);

// ======================================================
// GALLERY DATE
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
                        class="message-actions"
                    >

                        <button
                            class="edit-message-btn"
                            onclick="editSecretMessage(${message.id})"
                        >
                            ✏️ Edit
                        </button>

                        <button
                            class="delete-message-btn"
                            onclick="deleteSecretMessage(${message.id})"
                        >
                            🗑️ Delete
                        </button>

                    </div>

                `;

            }

            card.innerHTML = `

    <div
        class="message-bubble"
    >

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

    await sendEmailNotification(
    "New Secret Message 💌",
    "💌 New Secret Message",
    "You have received a new secret message in Our Space.<br><br>" +
    "<strong>Message:</strong><br>" +
    escapeHTML(message)
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
    )
        return;

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
                "2-digit"
        }
    );

}

// ======================================================
// SECURITY
// ======================================================

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text;

    return div.innerHTML;

}

function escapeAttribute(text) {

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

/*
 * Escape untuk JavaScript
 * string dalam onclick Lightbox
 */

function escapeJS(text) {

    return String(text)
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        )
        .replace(
            /"/g,
            '\\"'
        )
        .replace(
            /\n/g,
            "\\n"
        )
        .replace(
            /\r/g,
            "\\r"
        );

}
// ======================================================
// LOVE TIMELINE
// ======================================================

function formatTimelineDate(dateString) {

    if (!dateString)
        return "Date unavailable";

    const date =
        new Date(
            dateString + "T00:00:00"
        );

    return date.toLocaleDateString(
        "en-MY",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );
}


async function loadTimeline() {

    const timeline =
        document.getElementById(
            "timeline"
        );

    if (!timeline)
        return;

    timeline.innerHTML =
        '<p class="timeline-loading">Loading our story... 💕</p>';


    const {
        data,
        error
    } =
        await supabaseClient
            .from("timeline")
            .select("*")
            .order(
                "event_date",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "Timeline error:",
            error
        );

        timeline.innerHTML = `
            <div class="timeline-empty">

                <div class="empty-icon">
                    💌
                </div>

                <strong>
                    Unable to load our story
                </strong>

                <p>
                    Please check the timeline table in Supabase.
                </p>

            </div>
        `;

        return;
    }


    timeline.innerHTML = "";


    if (
        !data ||
        data.length === 0
    ) {

        timeline.innerHTML = `
            <div class="timeline-empty">

                <div class="empty-icon">
                    💗
                </div>

                <strong>
                    Our story starts here
                </strong>

                <p>
                    Add your first special moment above.
                </p>

            </div>
        `;

        return;
    }


    data.forEach(
        event => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "timeline-item";


            item.innerHTML = `

                <div class="timeline-dot">
                    ${escapeHTML(
                        event.icon || "❤️"
                    )}
                </div>


                <div class="timeline-content">

                    <span class="timeline-date">
                        ${escapeHTML(
                            formatTimelineDate(
                                event.event_date
                            )
                        )}
                    </span>


                    <h3>
                        ${escapeHTML(
                            event.title
                        )}
                    </h3>


                    <p>
                        ${escapeHTML(
                            event.description || ""
                        )}
                    </p>


                    <button
                        type="button"
                        class="timeline-delete"
                        onclick="deleteTimelineEvent(${event.id})"
                    >
                        🗑️ Delete
                    </button>

                </div>

            `;


            timeline.appendChild(
                item
            );

        }
    );

}


async function addTimelineEvent() {

    const date =
        document
            .getElementById(
                "timelineDate"
            )
            .value;


    const title =
        document
            .getElementById(
                "timelineTitle"
            )
            .value
            .trim();


    const description =
        document
            .getElementById(
                "timelineDescription"
            )
            .value
            .trim();


    const icon =
        document
            .getElementById(
                "timelineIcon"
            )
            .value;


    if (
        !date ||
        !title
    ) {

        alert(
            "Please choose a date and enter a memory title ❤️"
        );

        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("timeline")
            .insert([
                {
                    event_date:
                        date,

                    title:
                        title,

                    description:
                        description,

                    icon:
                        icon
                }
            ]);


    if (error) {

        console.error(
            "Timeline insert error:",
            error
        );

        alert(
            "Failed to save this memory."
        );

        return;
    }

   await sendEmailNotification(
    "New Memory Added ❤️",
    "💭 New Memory Added",
    "A new memory has been added to Our Space.<br><br>" +
    "<strong>Date:</strong> " +
    escapeHTML(date) +
    "<br>" +
    "<strong>Title:</strong> " +
    escapeHTML(title) +
    "<br>" +
    "<strong>Description:</strong> " +
    (escapeHTML(description) || "No description") +
    "<br>" +
    "<strong>Icon:</strong> " +
    escapeHTML(icon || "❤️")
);

    document
        .getElementById(
            "timelineDate"
        )
        .value = "";


    document
        .getElementById(
            "timelineTitle"
        )
        .value = "";


    document
        .getElementById(
            "timelineDescription"
        )
        .value = "";


    document
        .getElementById(
            "timelineIcon"
        )
        .value = "❤️";


    loadTimeline();

}


async function deleteTimelineEvent(
    id
) {

    if (
        !confirm(
            "Delete this memory from our timeline? 🥺"
        )
    )
        return;


    const {
        error
    } =
        await supabaseClient
            .from("timeline")
            .delete()
            .eq(
                "id",
                id
            );


    if (error) {

        console.error(
            "Timeline delete error:",
            error
        );

        alert(
            "Failed to delete this memory."
        );

        return;
    }


    loadTimeline();

}

// ======================================================
// BUCKET LIST
// ======================================================

async function loadBucketList() {

    const bucketList =
        document.getElementById(
            "bucketList"
        );

    if (!bucketList)
        return;

    bucketList.innerHTML =
        '<p class="bucket-loading">Loading our dreams... 💕</p>';

    const {
        data,
        error
    } =
        await supabaseClient
            .from("bucket_list")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: true
                }
            );

    if (error) {

        console.error(
            "Bucket List error:",
            error
        );

        bucketList.innerHTML = `
            <div class="bucket-empty">

                <div class="empty-icon">
                    💔
                </div>

                <strong>
                    Unable to load our bucket list
                </strong>

                <p>
                    Please check the bucket_list table in Supabase.
                </p>

            </div>
        `;

        return;
    }

    bucketList.innerHTML = "";

    if (
        !data ||
        data.length === 0
    ) {

        bucketList.innerHTML = `
            <div class="bucket-empty">

                <div class="empty-icon">
                    🌷
                </div>

                <strong>
                    Our dreams start here
                </strong>

                <p>
                    Add something we want to do together 💕
                </p>

            </div>
        `;

        updateBucketProgress([]);

        return;
    }


    data.forEach(
        item => {

            const div =
                document.createElement(
                    "div"
                );

            div.className =
                "bucket-item" +
                (
                    item.completed
                        ? " completed"
                        : ""
                );


            div.innerHTML = `

                <input
                    type="checkbox"
                    class="bucket-check"
                    ${item.completed ? "checked" : ""}
                    onchange="toggleBucketItem(
                        ${item.id},
                        this.checked
                    )"
                >

                <div class="bucket-title">
                    ${escapeHTML(item.title)}
                </div>

                <button
                    type="button"
                    class="bucket-delete"
                    onclick="deleteBucketItem(${item.id})"
                >
                    🗑️ Delete
                </button>

            `;

            bucketList.appendChild(div);

        }
    );


    updateBucketProgress(data);

}


function updateBucketProgress(items) {

    const progressText =
        document.getElementById(
            "bucketProgressText"
        );

    const progressBar =
        document.getElementById(
            "bucketProgressBar"
        );

    if (
        !progressText ||
        !progressBar
    )
        return;


    const total =
        items.length;

    const completed =
        items.filter(
            item =>
                item.completed === true
        ).length;


    progressText.textContent =
        completed +
        " / " +
        total +
        " completed";


    const percentage =
        total === 0
            ? 0
            : Math.round(
                (
                    completed /
                    total
                ) * 100
            );


    progressBar.style.width =
        percentage + "%";

}


async function addBucketItem() {

    const input =
        document.getElementById(
            "bucketTitle"
        );

    if (!input)
        return;


    const title =
        input.value.trim();


    if (!title) {

        alert(
            "Please enter something for our bucket list 🌷"
        );

        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("bucket_list")
            .insert([
                {
                    title:
                        title,

                    completed:
                        false
                }
            ]);


    if (error) {

        console.error(
            "Bucket List insert error:",
            error
        );

        alert(
            "Failed to add this dream."
        );

        return;
    }

    await sendEmailNotification(
    "New Bucket List Item 🌷",
    "🌷 New Bucket List Item",
    "A new dream has been added to your Bucket List.<br><br>" +
    "<strong>Dream:</strong> " +
    escapeHTML(title)
);


    input.value = "";

    loadBucketList();

}


async function toggleBucketItem(
    id,
    completed
) {

    const {
        error
    } =
        await supabaseClient
            .from("bucket_list")
            .update({
                completed:
                    completed
            })
            .eq(
                "id",
                id
            );


    if (error) {

        console.error(
            "Bucket List update error:",
            error
        );

        alert(
            "Failed to update this dream."
        );

        loadBucketList();

        return;
    }


    loadBucketList();

}


async function deleteBucketItem(id) {

    if (
        !confirm(
            "Remove this dream from our bucket list? 🥺"
        )
    )
        return;


    const {
        error
    } =
        await supabaseClient
            .from("bucket_list")
            .delete()
            .eq(
                "id",
                id
            );


    if (error) {

        console.error(
            "Bucket List delete error:",
            error
        );

        alert(
            "Failed to delete this dream."
        );

        return;
    }


    loadBucketList();

}

// ======================================================
// OUR SONG
// ======================================================

function getYouTubeID(url) {

    if (!url)
        return null;

    const patterns = [

        /youtu\.be\/([^?&]+)/,

        /youtube\.com\/watch\?v=([^?&]+)/,

        /youtube\.com\/embed\/([^?&]+)/,

        /youtube\.com\/shorts\/([^?&]+)/

    ];

    for (
        const pattern of patterns
    ) {

        const match =
            url.match(pattern);

        if (match)
            return match[1];

    }

    return null;
}


async function loadOurSongs() {

    const songList =
        document.getElementById(
            "songList"
        );

    if (!songList)
        return;


    songList.innerHTML =
        '<p class="song-loading">Loading our songs... 🎵💕</p>';


    const {
        data,
        error
    } =
        await supabaseClient
            .from("our_songs")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "Our Songs error:",
            error
        );

        songList.innerHTML = `
            <div class="song-empty">

                <div class="empty-icon">
                    💔
                </div>

                <strong>
                    Unable to load our songs
                </strong>

                <p>
                    Please check the our_songs table in Supabase.
                </p>

            </div>
        `;

        return;
    }


    songList.innerHTML = "";


    if (
        !data ||
        data.length === 0
    ) {

        songList.innerHTML = `
            <div class="song-empty">

                <div class="empty-icon">
                    🎵
                </div>

                <strong>
                    Our song starts here
                </strong>

                <p>
                    Add a song that reminds us of each other 🩷
                </p>

            </div>
        `;

        return;
    }


    data.forEach(
        song => {

            const youtubeId =
                getYouTubeID(
                    song.youtube_url
                );


            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "song-card";


            if (!youtubeId) {

                div.innerHTML = `

                    <div class="song-romantic-top">
    <img
        class="song-cover"
        src="https://img.youtube.com/vi/${encodeURIComponent(youtubeId)}/hqdefault.jpg"
        alt="${escapeAttribute(song.title)} album cover"
        loading="lazy"
    >

    <div class="song-details">
        <span class="song-label">🎵 OUR SONG</span>

        <h3>${escapeHTML(song.title)}</h3>

        <p>${escapeHTML(song.artist || "Our Song")}</p>

        <div class="song-love-line">
            This song reminds me of you 🩷
        </div>
    </div>

    <span class="song-floating-heart heart-one">♡</span>
    <span class="song-floating-heart heart-two">♡</span>
    <span class="song-floating-heart heart-three">♡</span>
</div>

                    <p>
                        Invalid YouTube link.
                    </p>

                    <button
                        type="button"
                        class="song-delete"
                        onclick="deleteOurSong(${song.id})"
                    >
                        🗑️ Delete
                    </button>

                `;

                songList.appendChild(div);

                return;
            }


            div.innerHTML = `

               <div class="song-romantic-top">

    <img
        class="song-cover"
        src="https://img.youtube.com/vi/${encodeURIComponent(youtubeId)}/hqdefault.jpg"
        alt="${escapeAttribute(song.title)} album cover"
        loading="lazy"
    >

    <div class="song-details">

        <span class="song-label">
            🎵 OUR SONG
        </span>

        <h3>
            ${escapeHTML(song.title)}
        </h3>

        <p>
            ${escapeHTML(
                song.artist ||
                "Our Song"
            )}
        </p>

        <div class="song-love-line">
            This song reminds me of you 🩷
        </div>

    </div>
    

    <span class="song-floating-heart heart-one">♡</span>
    <span class="song-floating-heart heart-two">♡</span>
    <span class="song-floating-heart heart-three">♡</span>

</div>
                <div class="song-player">

                    <iframe
                        src="https://www.youtube.com/embed/${encodeURIComponent(youtubeId)}"
                        title="${escapeAttribute(song.title)}"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowfullscreen
                    ></iframe>

                </div>


                <button
                    type="button"
                    class="song-delete"
                    onclick="deleteOurSong(${song.id})"
                >
                    🗑️ Delete
                </button>

            `;


            songList.appendChild(div);

        }
    );

}


async function addOurSong() {

    const titleInput =
        document.getElementById(
            "songTitle"
        );

    const artistInput =
        document.getElementById(
            "songArtist"
        );

    const urlInput =
        document.getElementById(
            "songURL"
        );


    if (
        !titleInput ||
        !artistInput ||
        !urlInput
    )
        return;


    const title =
        titleInput.value.trim();

    const artist =
        artistInput.value.trim();

    const youtubeUrl =
        urlInput.value.trim();


    if (
        !title ||
        !youtubeUrl
    ) {

        alert(
            "Please enter the song title and YouTube link 🎵"
        );

        return;
    }


    const youtubeId =
        getYouTubeID(
            youtubeUrl
        );


    if (!youtubeId) {

        alert(
            "Please enter a valid YouTube link ❤️"
        );

        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("our_songs")
            .insert([
                {
                    title:
                        title,

                    artist:
                        artist,

                    youtube_url:
                        youtubeUrl
                }
            ]);


    if (error) {

        console.error(
            "Our Song insert error:",
            error
        );

        alert(
            "Failed to add this song."
        );

        return;
    }

    await sendEmailNotification(
    "New Song Added 🎵",
    "🎵 New Song Added",
    "A new song has been added to Our Space.<br><br>" +
    "<strong>Song:</strong> " +
    escapeHTML(title) +
    "<br>" +
    "<strong>Artist:</strong> " +
    (escapeHTML(artist) || "Unknown artist") +
    "<br><br>" +
    "<a href=\"" +
    escapeAttribute(youtubeUrl) +
    "\" target=\"_blank\">Listen to the song 🎵</a>"
);


    titleInput.value = "";

    artistInput.value = "";

    urlInput.value = "";


    loadOurSongs();

}


async function deleteOurSong(id) {

    if (
        !confirm(
            "Remove this song from Our Songs? 🥺"
        )
    )
        return;


    const {
        error
    } =
        await supabaseClient
            .from("our_songs")
            .delete()
            .eq(
                "id",
                id
            );


    if (error) {

        console.error(
            "Our Song delete error:",
            error
        );

        alert(
            "Failed to delete this song."
        );

        return;
    }


    loadOurSongs();

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

        "messages-section",
        
        "bucket-section",
        
        "song-section"

    ];

    sections.forEach(
        id => {

            const section =
                document.getElementById(
                    id
                );

if (section) {

    if (id === sectionId) {

        section.style.display = "block";

        // Restart animation setiap kali section dibuka
        section.classList.remove(
            "section-opening"
        );

        void section.offsetWidth;

        section.classList.add(
            "section-opening"
        );

    } else {

        section.style.display = "none";

        section.classList.remove(
            "section-opening"
        );

    }

}

        }
    );

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
    
    if (
    sectionId ===
    "memories-section"
) {
    loadTimeline();
}
    if (
    sectionId ===
    "bucket-section"
) {
    loadBucketList();
}
    if (
    sectionId ===
    "song-section"
) {
    loadOurSongs();
}

}

// ======================================================
// WELCOME BACK ANIMATION
// ======================================================

function showWelcomeAnimation() {

    const welcomeScreen =
        document.getElementById(
            "welcomeScreen"
        );

    const welcomeUser =
        document.getElementById(
            "welcomeUser"
        );

    if (
        !welcomeScreen ||
        !welcomeUser
    ) {
        return;
    }

    const savedUsername =
        localStorage.getItem(
            "username"
        );

    if (savedUsername) {

        welcomeUser.textContent =
            "Welcome back, " +
            savedUsername +
            " ❤️";

    }

    setTimeout(() => {

        welcomeScreen.classList.add(
            "hide"
        );

    }, 1800);

}

// ======================================================
// START APP
// ======================================================

async function startApp() {

    await getCurrentUser();

    updateTogetherTime();

    countdown();

    loadNotes();

    loadGallery();

    loadBucketList();

    loadSecretMessages();

    showSection(
        ""
    );
    
    showWelcomeAnimation();

}

startApp();

birthdayCountdown();

setInterval(
    updateTogetherTime,
    60000
);

setInterval(
    countdown,
    1000
);


setInterval(
    birthdayCountdown,
    1000
);
