// ======================================================
// FIREBASE NOTIFICATION
// ======================================================

const firestoreDB =
    window.firestoreDB;

const firebaseFns =
    window.firebaseFns;

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
// FIREBASE - ADD NOTIFICATION
// ======================================================

async function addNotification(
    recipientId,
    title,
    message,
    type = "general"
) {

    try {

        if (
            !firestoreDB ||
            !firebaseFns
        ) {
            console.error(
                "Firebase is not available."
            );

            return;
        }


        await firebaseFns.addDoc(
            firebaseFns.collection(
                firestoreDB,
                "notifications"
            ),
            {

                recipientId:
                    recipientId,

                senderId:
                    currentUser
                        ? currentUser.id
                        : null,

                title:
                    title,

                message:
                    message,

                type:
                    type,

                read:
                    false,

                createdAt:
                    firebaseFns.serverTimestamp()

            }
        );


        console.log(
            "Notification added successfully ❤️"
        );

    } catch (error) {

        console.error(
            "Add notification error:",
            error
        );

    }
}

// ======================================================
// LOAD FIREBASE NOTIFICATIONS
// ======================================================

async function loadFirebaseNotifications() {

    try {

        if (!currentUser) {
            return;
        }

        if (!firestoreDB || !firebaseFns) {
            console.error("Firebase is not available.");
            return;
        }

        const notificationRef =
            firebaseFns.collection(
                firestoreDB,
                "notifications"
            );

        const snapshot =
            await firebaseFns.getDocs(
                notificationRef
            );

        const notifications = [];

        snapshot.forEach(doc => {

            const data = doc.data();

            if (
                data.recipientId === currentUser.id
            ) {

                notifications.push({
                    id: doc.id,
                    ...data
                });

            }

        });


        notifications.sort((a, b) => {

            const dateA =
                a.createdAt?.toMillis
                    ? a.createdAt.toMillis()
                    : 0;

            const dateB =
                b.createdAt?.toMillis
                    ? b.createdAt.toMillis()
                    : 0;

            return dateB - dateA;

        });


        const unreadNotifications =
            notifications.filter(
                notification =>
                    notification.read === false
            );


        updateNotificationBadge(
            unreadNotifications.length
        );

        renderFirebaseNotifications(
            notifications
        );

    } catch (error) {

        console.error(
            "Load Firebase notifications error:",
            error
        );

    }

}

window.testFirebaseNotification =
    async function () {

        if (!currentUser) {

            console.error(
                "No logged-in user."
            );

            return;
        }


        const recipientId =
            currentUser.id === HAZIRAH_ID
                ? ZULKARNAIN_ID
                : HAZIRAH_ID;


        await addNotification(
            recipientId,
            "Test Notification ❤️",
            "Firebase notification is working!",
            "test"
        );

    };

// ======================================================
// ONLINE / OFFLINE + LAST SEEN
// ======================================================

let onlineStatusChannel = null;
let lastSeenInterval = null;


// ------------------------------------------------------
// UPDATE MY LAST SEEN
// ------------------------------------------------------

async function updateMyLastSeen() {

    if (!currentUser) {
        return;
    }

    const { error } =
        await supabaseClient
            .from("online_status")
            .upsert(
                {
                    user_id:
                        currentUser.id,

                    last_seen:
                        new Date().toISOString()
                },
                {
                    onConflict:
                        "user_id"
                }
            );

    if (error) {

        console.error(
            "Last seen update error:",
            error
        );

    }

}


// ------------------------------------------------------
// FORMAT LAST SEEN
// ------------------------------------------------------

function formatLastSeen(dateString) {

    if (!dateString) {
        return "Unknown";
    }

    const date =
        new Date(dateString);

    return date.toLocaleString(
        "en-MY",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone:
                "Asia/Kuala_Lumpur"
        }
    );
}


// ------------------------------------------------------
// GET PARTNER LAST SEEN
// ------------------------------------------------------

async function getPartnerLastSeen() {

    if (!currentUser) {
        return null;
    }

    const partnerId =
        currentUser.id === HAZIRAH_ID
            ? ZULKARNAIN_ID
            : HAZIRAH_ID;

    const { data, error } =
        await supabaseClient
            .from("online_status")
            .select("last_seen")
            .eq(
                "user_id",
                partnerId
            )
            .maybeSingle();

    if (error) {

        console.error(
            "Get last seen error:",
            error
        );

        return null;
    }

    return data?.last_seen || null;
}


// ------------------------------------------------------
// SETUP ONLINE STATUS
// ------------------------------------------------------

function setupOnlineStatus() {

    if (!currentUser) {
        return;
    }

    if (onlineStatusChannel) {

        supabaseClient.removeChannel(
            onlineStatusChannel
        );

    }

    if (lastSeenInterval) {

        clearInterval(
            lastSeenInterval
        );

    }


    // Update last seen immediately
    updateMyLastSeen();


    // Update last seen every 30 seconds
    lastSeenInterval =
        setInterval(
            updateMyLastSeen,
            30000
        );


    onlineStatusChannel =
        supabaseClient.channel(
            "our-space-online-status",
            {
                config: {
                    presence: {
                        key:
                            currentUser.id
                    }
                }
            }
        );


    onlineStatusChannel
        .on(
            "presence",
            {
                event: "sync"
            },
            () => {

                updatePartnerOnlineStatus();

            }
        )

        .on(
            "presence",
            {
                event: "join"
            },
            () => {

                updatePartnerOnlineStatus();

            }
        )

        .on(
            "presence",
            {
                event: "leave"
            },
            () => {

                updatePartnerOnlineStatus();

            }
        )


        .subscribe(
            async status => {

                if (
                    status ===
                    "SUBSCRIBED"
                ) {

                    await onlineStatusChannel.track(
                        {
                            user_id:
                                currentUser.id,

                            online_at:
                                new Date().toISOString()
                        }
                    );

                    updatePartnerOnlineStatus();

                }

            }
        );

}


// ------------------------------------------------------
// UPDATE DISPLAY
// ------------------------------------------------------

async function updatePartnerOnlineStatus() {

    if (
        !onlineStatusChannel ||
        !currentUser
    ) {
        return;
    }


    const state =
        onlineStatusChannel
            .presenceState();


    const partnerId =
        currentUser.id === HAZIRAH_ID
            ? ZULKARNAIN_ID
            : HAZIRAH_ID;


    const partnerOnline =
        state[partnerId] &&
        state[partnerId].length > 0;


    const statusElement =
        document.getElementById(
            "partnerOnlineStatus"
        );


    if (!statusElement) {
        return;
    }


    const partnerName =
        currentUser.id === HAZIRAH_ID
            ? "Zul"
            : "Zirah";


    // --------------------------------------------------
    // ONLINE
    // --------------------------------------------------

    if (partnerOnline) {

        statusElement.innerHTML =
            `<span class="online-dot"></span> ${partnerName} is online`;

        statusElement.classList.add(
            "is-online"
        );

        return;
    }


    // --------------------------------------------------
    // OFFLINE + LAST SEEN
    // --------------------------------------------------

    const lastSeen =
        await getPartnerLastSeen();


    if (lastSeen) {

        statusElement.innerHTML =
            `<span class="offline-dot"></span> ${partnerName} was last seen at ${formatLastSeen(lastSeen)}`;

    } else {

        statusElement.innerHTML =
            `<span class="offline-dot"></span> ${partnerName} is offline`;

    }


    statusElement.classList.remove(
        "is-online"
    );

}

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
// REALTIME SECRET MESSAGES
// ======================================================

let secretMessageChannel = null;

function setupSecretMessageRealtime() {

    if (!currentUser) {
        return;
    }

    // Elak subscription duplicate
    if (secretMessageChannel) {
        supabaseClient.removeChannel(
            secretMessageChannel
        );
    }

    secretMessageChannel =
        supabaseClient
            .channel("secret-message-realtime")

            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "secret_message"
                },
                payload => {

                    console.log(
                        "Secret message realtime:",
                        payload
                    );

                    loadSecretMessages();
                }
            )

            .subscribe(status => {

                console.log(
                    "Secret message realtime status:",
                    status
                );

            });
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

// ======================================================
// BIRTHDAY SURPRISE - GIFT FIRST
// ======================================================

function birthdaySurprise() {

    const now = new Date();

    const month =
        now.getMonth() + 1;

    const date =
        now.getDate();

    let person = "";
    let image = "";
    let message = "";
    let badge = "";

    // --------------------------------------------------
    // ZULKARNAIN - 9 SEPTEMBER
    // --------------------------------------------------

    if (
        month === 9 &&
        date === 9
    ) {

        person = "Zulkarnain 💙";

        image = "zul.jpeg";

        badge =
            "🎁 Stay amazing, always ♡";

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

    // --------------------------------------------------
    // HAZIRAH - 27 FEBRUARY
    // --------------------------------------------------

    if (
        month === 2 &&
        date === 27
    ) {

        person = "Nur Hazirah 🩷";

        image = "zirah.jpeg";

        badge =
            "🎀 Forever my favourite person ♡";

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

    // --------------------------------------------------
    // PREVENT REPEATED POPUP
    // --------------------------------------------------

    const todayKey =
        "birthday_" +
        now.getFullYear() +
        "_" +
        month +
        "_" +
        date +
        "_" +
        person;

    if (
        sessionStorage.getItem(
            todayKey
        )
    )
        return;

    sessionStorage.setItem(
        todayKey,
        "shown"
    );

    // --------------------------------------------------
    // GIFT POPUP
    // --------------------------------------------------

    const popup =
        document.createElement(
            "div"
        );

    popup.className =
        "birthday-overlay";

    popup.innerHTML = `

        <div class="birthday-popup birthday-gift-stage">

            <button
                class="close-button"
                onclick="closeBirthdaySurprise()"
            >
                ✕
            </button>

            <h2>
                A Little Surprise For You 🎁
            </h2>

            <div class="birthday-gift gift-clickable"
                 onclick="openBirthdayMessage()">

                <div class="gift-ribbon-left"></div>

                <div class="gift-ribbon-right"></div>

                <div class="gift-lid"></div>

                <div class="gift-box"></div>

            </div>

            <div class="wish">
                Tap the gift to open your surprise ♡
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
// BIRTHDAY MUSIC
// ======================================================

const birthdayMusic =
    new Audio("birthday-song.mp3");

birthdayMusic.loop = true;

// ======================================================
// OPEN BIRTHDAY MESSAGE
// ======================================================

function openBirthdayMessage() {

    const popup =
        document.querySelector(
            ".birthday-overlay"
        );

    if (!popup)
        return;

    popup.remove();

    birthdayMessagePopup();

}

// ======================================================
// BIRTHDAY MESSAGE POPUP + MUSIC
// ======================================================

function birthdayMessagePopup() {

    const now = new Date();

    const month =
        now.getMonth() + 1;

    const date =
        now.getDate();

    let person = "";
    let image = "";
    let message = "";
    let badge = "";

    // --------------------------------------------------
    // ZULKARNAIN - 9 SEPTEMBER
    // --------------------------------------------------

    if (
        month === 9 &&
        date === 9
    ) {

        person = "Zulkarnain 💙";

        image = "zul.jpeg";

        badge =
            "🎁 Stay amazing, always ♡";

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

    // --------------------------------------------------
    // HAZIRAH - 27 FEBRUARY
    // --------------------------------------------------

    if (
        month === 2 &&
        date === 27
    ) {

        person = "Nur Hazirah 🩷";

        image = "zirah.jpeg";

        badge =
            "🎀 Forever my favourite person ♡";

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

    // --------------------------------------------------
    // MESSAGE POPUP
    // --------------------------------------------------

    const popup =
        document.createElement(
            "div"
        );

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

    // --------------------------------------------------
    // PLAY BIRTHDAY SONG
    // --------------------------------------------------

    if (
        typeof birthdayMusic !==
        "undefined"
    ) {

        birthdayMusic.currentTime =
            0;

        birthdayMusic.loop =
            true;

        birthdayMusic.play()
            .catch(error => {
                console.log(
                    "Birthday music could not autoplay:",
                    error
                );
            });

    }

}


// ======================================================
// CLOSE POPUP
// ======================================================

function closeBirthdaySurprise() {

    const popup =
        document.querySelector(
            ".birthday-overlay"
        );

    if (
    typeof birthdayMusic !==
    "undefined"
) {
    birthdayMusic.pause();
    birthdayMusic.currentTime = 0;
}

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
function formatNoteDate(dateString) {

    if (!dateString)
        return "Date unavailable";

    const date = new Date(dateString);

    return date.toLocaleString(
        "en-MY",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kuala_Lumpur"
        }
    );
}

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

       const noteAuthor =
    note.user_id === ZULKARNAIN_ID
        ? "Zul"
        : note.user_id === HAZIRAH_ID
            ? "Zirah"
            : "";

const noteDate =
    note.created_at
        ? formatNoteDate(note.created_at)
        : "Date unavailable";

div.innerHTML = `

    <div class="note-meta">

    <span class="note-author">
        ${escapeHTML(noteAuthor)}
    </span>

    <span class="note-separator">|</span>

    <span class="note-date">
        📅 ${escapeHTML(noteDate)}
    </span>

</div>

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
            content,

        user_id:
            currentUser.id
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

    // Mark received messages as seen
const unreadMessages = data.filter(
    message =>
        message.receiver_id === currentUser.id &&
        message.seen === false
);

if (unreadMessages.length > 0) {

    const unreadIds =
        unreadMessages.map(
            message => message.id
        );

    const {
        error: seenError
    } = await supabaseClient
        .from("secret_message")
        .update({
            seen: true
        })
        .in(
            "id",
            unreadIds
        );

    if (seenError) {

        console.error(
            "Mark messages as seen error:",
            seenError
        );

    } else {

        // Update data locally too
        unreadMessages.forEach(
            message => {
                message.seen = true;
            }
        );

    }
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

${isMine ? `
    <span class="message-seen">
        ${message.seen ? "✓✓ Seen" : "✓ Sent"}
    </span>
` : ""}

${actions}

    </div>

`;

            container.appendChild(
                card
            );

        }
    );
    
    // Scroll terus ke mesej paling baru
    requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
    });

}

// ======================================================
// SEND SECRET MESSAGE
// ======================================================

async function sendSecretMessage() {

    if (!currentUser) {
        await getCurrentUser();
    }

    if (!currentUser) {
        alert("Please login first ❤️");
        return;
    }

    const messageInput =
        document.getElementById("secretMessage");

    const sendButton =
        document.getElementById("sendMessageBtn");

    const message =
        messageInput.value.trim();

    if (!message) {
        alert("Please write a message first ❤️");
        return;
    }

    let receiverId;

    if (currentUser.id === HAZIRAH_ID) {
        receiverId = ZULKARNAIN_ID;

    } else if (currentUser.id === ZULKARNAIN_ID) {
        receiverId = HAZIRAH_ID;

    } else {
        alert("This account is not part of Our Space ❤️");
        return;
    }

    sendButton.disabled = true;
    sendButton.textContent = "Sending... 💕";

    const { error } =
        await supabaseClient
            .from("secret_message")
            .insert([
                {
                    sender_id: currentUser.id,
                    receiver_id: receiverId,
                    message: message,
                    seen: false
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

        sendButton.disabled = false;
        sendButton.textContent = "💌 Send Message";

        return;
    }
    

    messageInput.value = "";

    sendButton.disabled = false;
    sendButton.textContent = "💌 Send Message";

    // ==================================================
    // EMAIL NOTIFICATION
    // ==================================================

    await sendEmailNotification(
        "New Secret Message 💌",
        "💌 New Secret Message",
        "You have received a new secret message in Our Space.<br><br>" +
        "<strong>Message:</strong><br>" +
        escapeHTML(message)
    );


    // ==================================================
    // FIREBASE NOTIFICATION
    // ==================================================

    await addNotification(
        receiverId,
        "💌 New Secret Message",
        `${USER_NAMES[currentUser.id] || "Your love"} sent you a secret message ❤️`,
        "secret_message"
    );


    // ==================================================
    // REFRESH MESSAGES
    // ==================================================

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

function showSection(sectionId) {

    const menu =
        document.querySelector(".navigation");

    const button =
        document.getElementById("mobileMenuBtn");


    // Close mobile menu
    if (menu) {

        menu.classList.remove(
            "mobile-menu-open"
        );

    }


    if (button) {

        button.textContent = "☰";

        button.setAttribute(
            "aria-label",
            "Open menu"
        );

    }


    // ==================================================
    // CONTENT SECTIONS ONLY
    // HERO / COUNTDOWN JANGAN DISOROK
    // ==================================================

    const sections = [

        "notes-section",

        "gallery-section",

        "calendar-section",

        "messages-section",

        "bucket-section",

        "song-section",

        "quiz-section"

    ];


    // ==================================================
    // HIDE SEMUA CONTENT SECTION
    // ==================================================

    sections.forEach(id => {

        const section =
            document.getElementById(id);

        if (section) {

            section.style.display =
                "none";

            section.classList.remove(
                "section-opening"
            );

        }

    });


    // ==================================================
    // HOME
    // HERO / COUNTDOWN SAHAJA
    // ==================================================

    if (
        !sectionId ||
        sectionId === "home-section"
    ) {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

        return;

    }


    // ==================================================
    // SELECTED SECTION
    // ==================================================

    const selectedSection =
        document.getElementById(
            sectionId
        );


    if (!selectedSection) {

        return;

    }


    selectedSection.style.display =
        "block";


    // Animation
    void selectedSection.offsetWidth;

    selectedSection.classList.add(
        "section-opening"
    );


    // ==================================================
    // LOAD CONTENT
    // ==================================================

    if (
        sectionId ===
        "notes-section"
    ) {

        loadNotes();

    }


    if (
        sectionId ===
        "gallery-section"
    ) {

        loadGallery();

    }


    if (
        sectionId ===
        "calendar-section"
    ) {

        loadCalendar();

    }


    if (
        sectionId ===
        "messages-section"
    ) {

        loadSecretMessages();

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


    if (
        sectionId ===
        "quiz-section"
    ) {

        showQuizHome();

    }


    // ==================================================
    // SCROLL
    // ==================================================

    selectedSection.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

}

// ======================================================
// OUR CALENDAR
// ======================================================

let calendarViewDate = new Date();

let calendarEvents = [];


// ======================================================
// LOAD CALENDAR EVENTS
// ======================================================

async function loadCalendar() {

    const grid =
        document.getElementById(
            "calendarGrid"
        );

    const eventsContainer =
        document.getElementById(
            "calendarEvents"
        );


    if (!grid || !eventsContainer) {

        return;

    }


    grid.innerHTML =
        '<p class="calendar-loading">Loading our calendar... 💕</p>';

    eventsContainer.innerHTML =
        '<p class="calendar-loading">Loading our special dates... 💕</p>';


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
            "Calendar error:",
            error
        );

        calendarEvents = [];

    } else {

        calendarEvents =
            data || [];

    }


    renderCalendar();

    renderCalendarEvents();

}


// ======================================================
// RENDER CALENDAR
// ======================================================

function renderCalendar() {

    const grid =
        document.getElementById(
            "calendarGrid"
        );

    const title =
        document.getElementById(
            "calendarMonthTitle"
        );


    if (!grid || !title) {

        return;

    }


    const year =
        calendarViewDate.getFullYear();

    const month =
        calendarViewDate.getMonth();


    const monthName =
        calendarViewDate.toLocaleString(
            "en-MY",
            {
                month: "long"
            }
        );


    title.textContent =
        monthName +
        " " +
        year;


    grid.innerHTML = "";


    // First day of month
    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    // Number of days
    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    // Empty boxes before first day
    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "calendar-day empty";

        grid.appendChild(
            empty
        );

    }


    const today =
        new Date();


    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const cell =
            document.createElement(
                "div"
            );

        cell.className =
            "calendar-day";


        // Today
        if (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        ) {

            cell.classList.add(
                "today"
            );

        }


        const number =
            document.createElement(
                "span"
            );

        number.className =
            "calendar-day-number";

        number.textContent =
            day;


        cell.appendChild(
            number
        );


        // YYYY-MM-DD
        const dateString =
            year +
            "-" +
            String(
                month + 1
            ).padStart(2, "0") +
            "-" +
            String(day).padStart(
                2,
                "0"
            );


        const dayEvents =
            calendarEvents.filter(
                event =>
                    event.event_date ===
                    dateString
            );


        dayEvents.forEach(
            event => {

                const eventDot =
                    document.createElement(
                        "span"
                    );

                eventDot.className =
                    "calendar-event-dot";


                eventDot.textContent =
                    (
                        event.icon ||
                        "❤️"
                    ) +
                    " " +
                    event.title;


                eventDot.title =
                    event.title;


                cell.appendChild(
                    eventDot
                );

            }
        );


        grid.appendChild(
            cell
        );

    }

}


// ======================================================
// CHANGE MONTH
// ======================================================

function changeCalendarMonth(
    amount
) {

    calendarViewDate.setMonth(
        calendarViewDate.getMonth() +
        amount
    );


    renderCalendar();

}


// ======================================================
// GO TO TODAY
// ======================================================

function goToCalendarToday() {

    calendarViewDate =
        new Date();

    renderCalendar();

}


// ======================================================
// RENDER EVENT LIST
// ======================================================

function renderCalendarEvents() {

    const container =
        document.getElementById(
            "calendarEvents"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    if (
        !calendarEvents ||
        calendarEvents.length === 0
    ) {

        container.innerHTML = `

            <div class="calendar-empty">

                <div style="font-size:32px;">
                    💕
                </div>

                <strong>
                    No special dates yet
                </strong>

                <p>
                    Add your first special date above ♡
                </p>

            </div>

        `;

        return;

    }


    calendarEvents.forEach(
        event => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "calendar-event-card";


            const formattedDate =
                formatCalendarDate(
                    event.event_date
                );


            card.innerHTML = `

                <div class="calendar-event-icon">

                    ${escapeHTML(
                        event.icon ||
                        "❤️"
                    )}

                </div>


                <div class="calendar-event-info">

                    <span class="calendar-event-date">

                        ${escapeHTML(
                            formattedDate
                        )}

                    </span>


                    <h3>

                        ${escapeHTML(
                            event.title
                        )}

                    </h3>


                    <p>

                        ${escapeHTML(
                            event.description ||
                            ""
                        )}

                    </p>

                </div>


                <button
                    type="button"
                    class="calendar-delete"
                    onclick="deleteCalendarEvent(${event.id})"
                >

                    🗑️ Delete

                </button>

            `;


            container.appendChild(
                card
            );

        }
    );

}


// ======================================================
// FORMAT CALENDAR DATE
// ======================================================

function formatCalendarDate(
    dateString
) {

    if (!dateString) {

        return "";

    }


    const parts =
        dateString.split("-");


    if (parts.length !== 3) {

        return dateString;

    }


    const date =
        new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2])
        );


    return date.toLocaleDateString(
        "en-MY",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


// ======================================================
// ADD CALENDAR EVENT
// ======================================================

async function addCalendarEvent() {

    const date =
        document
            .getElementById(
                "calendarDate"
            )
            .value;


    const title =
        document
            .getElementById(
                "calendarTitle"
            )
            .value
            .trim();


    const description =
        document
            .getElementById(
                "calendarDescription"
            )
            .value
            .trim();


    const icon =
        document
            .getElementById(
                "calendarIcon"
            )
            .value;


    if (
        !date ||
        !title
    ) {

        alert(
            "Please choose a date and enter an event title ❤️"
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
            "Calendar insert error:",
            error
        );

        alert(
            "Failed to save this event."
        );

        return;

    }


    // Clear form

    document
        .getElementById(
            "calendarDate"
        )
        .value = "";


    document
        .getElementById(
            "calendarTitle"
        )
        .value = "";


    document
        .getElementById(
            "calendarDescription"
        )
        .value = "";


    document
        .getElementById(
            "calendarIcon"
        )
        .value = "❤️";


    // Reload

    await loadCalendar();

}


// ======================================================
// DELETE CALENDAR EVENT
// ======================================================

async function deleteCalendarEvent(
    id
) {

    if (
        !confirm(
            "Delete this special date? 🥺"
        )
    ) {

        return;

    }


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
            "Calendar delete error:",
            error
        );

        alert(
            "Failed to delete this event."
        );

        return;

    }


    await loadCalendar();

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

    setTimeout(() => {
        birthdaySurprise();
    }, 500);

}, 1800);

}

// ======================================================
// START APP
// ======================================================

async function startApp() {

    await getCurrentUser();

    setupSecretMessageRealtime();

    setupOnlineStatus();

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

// ======================================================
// QUIZ - SET MY ANSWERS
// ======================================================

async function startQuizSetup() {

    const quizContent =
        document.getElementById("quizContent");

    if (!quizContent) return;

    const { data: questions, error } =
        await supabaseClient
            .from("quiz_questions")
            .select("*")
            .order("id", { ascending: true });

    if (error) {

        console.error(
            "Quiz questions error:",
            error
        );

        quizContent.innerHTML = `
            <div class="quiz-error">
                ❌ Unable to load quiz questions.
            </div>
        `;

        return;
    }

    if (!questions || questions.length === 0) {

        quizContent.innerHTML = `
            <div class="quiz-error">
                No quiz questions found.
            </div>
        `;

        return;
    }


    // --------------------------------------------------
    // LOAD MY EXISTING ANSWERS
    // --------------------------------------------------

    const { data: existingAnswers } =
        await supabaseClient
            .from("quiz_answers")
            .select("*")
            .eq("user_id", currentUser.id);


    const savedAnswers = {};

    if (existingAnswers) {

        existingAnswers.forEach(answer => {

            savedAnswers[answer.question_id] =
                answer;

        });

    }


    // --------------------------------------------------
    // QUIZ SETUP HTML
    // --------------------------------------------------

    quizContent.innerHTML = `

        <div class="quiz-setup">

            <div class="quiz-setup-header">

                <button
                    type="button"
                    onclick="showQuizHome()"
                    class="quiz-back-btn"
                >
                    ← Back
                </button>

                <div>

                    <h3>
                        📝 Set My Answers
                    </h3>

                    <p>
                        Answer these questions about yourself 💗
                    </p>

                </div>

            </div>


            <div id="quizSetupQuestions"></div>


            <button
                type="button"
                onclick="saveMyQuizAnswers()"
                class="quiz-save-btn"
            >
                💾 Save My Answers
            </button>

        </div>

    `;


    const container =
        document.getElementById(
            "quizSetupQuestions"
        );


    // --------------------------------------------------
    // CREATE EACH QUESTION
    // --------------------------------------------------

    questions.forEach((q, index) => {

        const questionNumber =
            index + 1;

        const saved =
            savedAnswers[q.id] || null;


        const selectedType =
            saved?.question_type ||
            q.question_type ||
            "open";


        let answerHTML = "";


        // ------------------------------------------------
        // OPEN / TEXT
        // ------------------------------------------------

        if (selectedType === "open") {

            answerHTML = `

                <textarea
                    id="answer_${q.id}"
                    rows="3"
                    placeholder="Type my answer here..."
                >${escapeHTML(
                    saved?.answer || ""
                )}</textarea>

            `;

        }


        // ------------------------------------------------
        // MCQ / OPTION
        // ------------------------------------------------

        else if (selectedType === "mcq") {

            answerHTML = `

                <div class="quiz-options">

                    <input
                        type="text"
                        id="optionA_${q.id}"
                        placeholder="Option A"
                        value="${escapeHTML(
                            saved?.option_a || ""
                        )}"
                    >

                    <input
                        type="text"
                        id="optionB_${q.id}"
                        placeholder="Option B"
                        value="${escapeHTML(
                            saved?.option_b || ""
                        )}"
                    >

                    <input
                        type="text"
                        id="optionC_${q.id}"
                        placeholder="Option C"
                        value="${escapeHTML(
                            saved?.option_c || ""
                        )}"
                    >

                    <input
                        type="text"
                        id="optionD_${q.id}"
                        placeholder="Option D"
                        value="${escapeHTML(
                            saved?.option_d || ""
                        )}"
                    >

                    <select
                        id="answer_${q.id}"
                    >

                        <option value="">
                            Choose my correct answer
                        </option>

                        <option
                            value="A"
                            ${saved?.answer === "A"
                                ? "selected"
                                : ""}
                        >
                            A
                        </option>

                        <option
                            value="B"
                            ${saved?.answer === "B"
                                ? "selected"
                                : ""}
                        >
                            B
                        </option>

                        <option
                            value="C"
                            ${saved?.answer === "C"
                                ? "selected"
                                : ""}
                        >
                            C
                        </option>

                        <option
                            value="D"
                            ${saved?.answer === "D"
                                ? "selected"
                                : ""}
                        >
                            D
                        </option>

                    </select>

                </div>

            `;

        }


        // ------------------------------------------------
        // CHECKBOX
        // ------------------------------------------------

        else if (selectedType === "checkbox") {

            let selectedCheckboxes = [];

            try {

                selectedCheckboxes =
                    JSON.parse(
                        saved?.answer || "[]"
                    );

            } catch (e) {

                selectedCheckboxes = [];

            }


            answerHTML = `

                <div class="quiz-options">

                    <input
                        type="text"
                        id="optionA_${q.id}"
                        placeholder="Option A"
                        value="${escapeHTML(
                            saved?.option_a || ""
                        )}"
                    >

                    <label>
                        <input
                            type="checkbox"
                            name="correct_${q.id}"
                            value="A"
                            ${
                                selectedCheckboxes.includes("A")
                                    ? "checked"
                                    : ""
                            }
                        >
                        Correct A
                    </label>


                    <input
                        type="text"
                        id="optionB_${q.id}"
                        placeholder="Option B"
                        value="${escapeHTML(
                            saved?.option_b || ""
                        )}"
                    >

                    <label>
                        <input
                            type="checkbox"
                            name="correct_${q.id}"
                            value="B"
                            ${
                                selectedCheckboxes.includes("B")
                                    ? "checked"
                                    : ""
                            }
                        >
                        Correct B
                    </label>


                    <input
                        type="text"
                        id="optionC_${q.id}"
                        placeholder="Option C"
                        value="${escapeHTML(
                            saved?.option_c || ""
                        )}"
                    >

                    <label>
                        <input
                            type="checkbox"
                            name="correct_${q.id}"
                            value="C"
                            ${
                                selectedCheckboxes.includes("C")
                                    ? "checked"
                                    : ""
                            }
                        >
                        Correct C
                    </label>


                    <input
                        type="text"
                        id="optionD_${q.id}"
                        placeholder="Option D"
                        value="${escapeHTML(
                            saved?.option_d || ""
                        )}"
                    >

                    <label>
                        <input
                            type="checkbox"
                            name="correct_${q.id}"
                            value="D"
                            ${
                                selectedCheckboxes.includes("D")
                                    ? "checked"
                                    : ""
                            }
                        >
                        Correct D
                    </label>

                </div>

            `;

        }


        // ------------------------------------------------
        // INSERT QUESTION CARD
        // ------------------------------------------------

        container.insertAdjacentHTML(
            "beforeend",

            `

            <div
                class="quiz-question-card"
                id="quizCard_${q.id}"
            >

                <div class="quiz-question-number">
                    Question ${questionNumber}
                </div>


                <div class="quiz-question-text">
                    ${escapeHTML(q.question)}
                </div>


                <div class="quiz-answer-type">

                    <label>
                        Answer Type
                    </label>

                    <select
                        id="type_${q.id}"
                        onchange="changeQuizAnswerType(${q.id})"
                    >

                        <option
                            value="open"
                            ${
                                selectedType === "open"
                                    ? "selected"
                                    : ""
                            }
                        >
                            ✍️ Text
                        </option>

                        <option
                            value="mcq"
                            ${
                                selectedType === "mcq"
                                    ? "selected"
                                    : ""
                            }
                        >
                            🔘 Option
                        </option>

                        <option
                            value="checkbox"
                            ${
                                selectedType === "checkbox"
                                    ? "selected"
                                    : ""
                            }
                        >
                            ☑️ Checkbox
                        </option>

                    </select>

                </div>


                <div id="answerArea_${q.id}">

                    ${answerHTML}

                </div>

            </div>

            `

        );

    });

}


// ======================================================
// QUIZ - CHANGE ANSWER TYPE
// ======================================================

async function changeQuizAnswerType(questionId) {

    const type =
        document.getElementById(
            `type_${questionId}`
        )?.value;


    const answerArea =
        document.getElementById(
            `answerArea_${questionId}`
        );


    if (!answerArea) return;


    // --------------------------------------------------
    // TEXT
    // --------------------------------------------------

    if (type === "open") {

        answerArea.innerHTML = `

            <textarea
                id="answer_${questionId}"
                rows="3"
                placeholder="Type my answer here..."
            ></textarea>

        `;

    }


    // --------------------------------------------------
    // MCQ
    // --------------------------------------------------

    else if (type === "mcq") {

        answerArea.innerHTML = `

            <div class="quiz-options">

                <input
                    type="text"
                    id="optionA_${questionId}"
                    placeholder="Option A"
                >

                <input
                    type="text"
                    id="optionB_${questionId}"
                    placeholder="Option B"
                >

                <input
                    type="text"
                    id="optionC_${questionId}"
                    placeholder="Option C"
                >

                <input
                    type="text"
                    id="optionD_${questionId}"
                    placeholder="Option D"
                >

                <select
                    id="answer_${questionId}"
                >

                    <option value="">
                        Choose my correct answer
                    </option>

                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>

                </select>

            </div>

        `;

    }


    // --------------------------------------------------
    // CHECKBOX
    // --------------------------------------------------

    else if (type === "checkbox") {

        answerArea.innerHTML = `

            <div class="quiz-options">

                <input
                    type="text"
                    id="optionA_${questionId}"
                    placeholder="Option A"
                >

                <label>
                    <input
                        type="checkbox"
                        name="correct_${questionId}"
                        value="A"
                    >
                    Correct A
                </label>


                <input
                    type="text"
                    id="optionB_${questionId}"
                    placeholder="Option B"
                >

                <label>
                    <input
                        type="checkbox"
                        name="correct_${questionId}"
                        value="B"
                    >
                    Correct B
                </label>


                <input
                    type="text"
                    id="optionC_${questionId}"
                    placeholder="Option C"
                >

                <label>
                    <input
                        type="checkbox"
                        name="correct_${questionId}"
                        value="C"
                    >
                    Correct C
                </label>


                <input
                    type="text"
                    id="optionD_${questionId}"
                    placeholder="Option D"
                >

                <label>
                    <input
                        type="checkbox"
                        name="correct_${questionId}"
                        value="D"
                    >
                    Correct D
                </label>

            </div>

        `;

    }

}

// ======================================================
// QUIZ - PERSONAL QUESTION SYSTEM
// ======================================================

const QUIZ_MAX_QUESTIONS = 30;
const QUIZ_PLAY_COUNT = 15;

let quizDraftQuestions = [];
let quizDraftCounter = 0;

let currentQuizQuestions = [];
let currentQuizIndex = 0;
let currentQuizScore = 0;
let currentQuizScoredTotal = 0;
let currentQuizAnswers = {};
let currentQuizAttemptId = null;


// ======================================================
// QUIZ USER / PARTNER
// ======================================================

function quizPartnerId() {

    if (!currentUser) return null;

    return currentUser.id === HAZIRAH_ID
        ? ZULKARNAIN_ID
        : HAZIRAH_ID;
}


function quizPartnerName() {

    if (currentUser?.id === HAZIRAH_ID) {
        return "Zul";
    }

    return "Zirah";
}


// ======================================================
// QUIZ HELPERS
// ======================================================

function qEsc(value) {

    return escapeHTML(value ?? "");

}


function qArr(value) {

    if (Array.isArray(value)) {

        return value
            .map(String)
            .sort();

    }

    try {

        return JSON.parse(value || "[]")
            .map(String)
            .sort();

    } catch (error) {

        return String(value || "")
            .split(",")
            .filter(Boolean)
            .map(String)
            .sort();

    }

}


function qAnswerText(question, raw) {

    const letters = qArr(raw);

    return letters
        .map(letter => {

            const text =
                question[
                    "option_" +
                    String(letter).toLowerCase()
                ] || letter;

            return `${letter}. ${text}`;

        })
        .join(", ");

}


// ======================================================
// QUESTION EDITOR OPTIONS
// ======================================================

function qOptions(question, type) {

    if (type === "open") {

        return `
            <div class="quiz-editor-hint">
                ✍️ Text answers are not marked right or wrong.
            </div>
        `;

    }


    const letters = ["A", "B", "C", "D"];


    const inputs = letters
        .map(letter => {

            return `
                <input
                    type="text"
                    class="quiz-option-input"
                    data-option="${letter}"
                    placeholder="Option ${letter}"
                    maxlength="200"
                    value="${
                        qEsc(
                            question[
                                "option_" +
                                letter.toLowerCase()
                            ] || ""
                        )
                    }"
                >
            `;

        })
        .join("");


    // MCQ

    if (type === "mcq") {

        return `
            <div class="quiz-option-editor">

                ${inputs}

                <select class="quiz-correct-select">

                    <option value="">
                        Choose correct answer
                    </option>

                    ${letters.map(letter => `

                        <option
                            value="${letter}"
                            ${
                                question.correct_answer === letter
                                    ? "selected"
                                    : ""
                            }
                        >
                            ${letter}
                        </option>

                    `).join("")}

                </select>

            </div>
        `;

    }


    // CHECKBOX

    return `
        <div class="quiz-option-editor">

            ${letters.map(letter => `

                <input
                    type="text"
                    class="quiz-option-input"
                    data-option="${letter}"
                    placeholder="Option ${letter}"
                    maxlength="200"
                    value="${
                        qEsc(
                            question[
                                "option_" +
                                letter.toLowerCase()
                            ] || ""
                        )
                    }"
                >

                <label class="quiz-correct-check">

                    <input
                        type="checkbox"
                        class="quiz-correct-checkbox"
                        value="${letter}"
                        ${
                            qArr(
                                question.correct_answer
                            ).includes(letter)
                                ? "checked"
                                : ""
                        }
                    >

                    Correct ${letter}

                </label>

            `).join("")}

            <div class="quiz-editor-hint">

                ☑️ Tick every correct answer.

            </div>

        </div>
    `;

}


// ======================================================
// QUESTION CARD
// ======================================================

function qCard(question, index) {

    const id = question.id;

    const type =
        question.question_type || "open";


    return `

        <div
            class="quiz-question-editor"
            data-question-id="${qEsc(id)}"
        >

            <div class="quiz-editor-top">

                <div class="quiz-editor-number">

                    Question ${index + 1}

                </div>


                <button
                    type="button"
                    class="quiz-delete-question"
                    onclick="removeQuizQuestion('${qEsc(id)}')"
                >

                    🗑️ Delete

                </button>

            </div>


            <textarea
                class="quiz-question-input"
                maxlength="300"
                placeholder="Write your question here..."
            >${qEsc(question.question || "")}</textarea>


            <label class="quiz-type-label">

                Answer Type

            </label>


            <select
                class="quiz-type-select"
                onchange="changeQuestionEditorType('${qEsc(id)}')"
            >

                <option
                    value="open"
                    ${type === "open" ? "selected" : ""}
                >
                    ✍️ Text
                </option>

                <option
                    value="mcq"
                    ${type === "mcq" ? "selected" : ""}
                >
                    🔘 Option
                </option>

                <option
                    value="checkbox"
                    ${type === "checkbox" ? "selected" : ""}
                >
                    ☑️ Checkbox
                </option>

            </select>


            <div
                class="quiz-editor-answer-area"
                id="editorAnswer_${qEsc(id)}"
            >

                ${qOptions(question, type)}

            </div>

        </div>

    `;

}


// ======================================================
// SET MY QUESTIONS
// ======================================================

async function startQuizSetup() {

    const quizContent =
        document.getElementById("quizContent");


    if (!quizContent || !currentUser) {
        return;
    }


    quizContent.innerHTML = `

        <div class="quiz-loading">

            Loading your questions... 💕

        </div>

    `;


    const {
        data,
        error
    } = await supabaseClient
        .from("quiz_questions")
        .select("*")
        .eq("owner_id", currentUser.id)
        .order("created_at", {
            ascending: true
        })
        .order("id", {
            ascending: true
        });


    if (error) {

        quizContent.innerHTML = `

            <div class="quiz-error">

                ❌ Unable to load your questions.

                <br><br>

                ${qEsc(error.message)}

                <br><br>

                <button
                    type="button"
                    class="quiz-back-btn"
                    onclick="showQuizHome()"
                >

                    ← Quiz Home

                </button>

            </div>

        `;

        return;

    }


    quizDraftQuestions =
        (data || []).slice(0, QUIZ_MAX_QUESTIONS);

    quizDraftCounter = 0;


    renderQuizSetup();

}


// ======================================================
// RENDER QUESTION SETUP
// ======================================================

function renderQuizSetup() {

    const quizContent =
        document.getElementById("quizContent");


    if (!quizContent) {
        return;
    }


    const count =
        quizDraftQuestions.length;


    quizContent.innerHTML = `

        <div class="quiz-setup">

            <div class="quiz-setup-header">

                <button
                    type="button"
                    onclick="showQuizHome()"
                    class="quiz-back-btn"
                >

                    ← Back

                </button>


                <div>

                    <h3>

                        📝 My Quiz Questions

                    </h3>

                    <p>

                        ${count} / ${QUIZ_MAX_QUESTIONS} questions

                    </p>

                </div>

            </div>


            <div class="quiz-setup-rules">

                💡 Create up to

                <strong>30</strong>

                questions.

                Your partner will get

                <strong>15 random questions</strong>.

            </div>


            <div id="quizSetupQuestions">

                ${
                    quizDraftQuestions
                        .map(qCard)
                        .join("")
                }

            </div>


            <div class="quiz-setup-actions">

                <button
                    type="button"
                    class="quiz-add-question-btn"
                    onclick="addQuizQuestion()"
                    ${count >= 30 ? "disabled" : ""}
                >

                    ➕ Add Question

                </button>


                <button
                    type="button"
                    class="quiz-save-btn"
                    onclick="saveMyQuizQuestions()"
                >

                    💾 Save My Questions

                </button>

            </div>

        </div>

    `;

}


// ======================================================
// ADD QUESTION + AUTO SAVE
// ======================================================

async function addQuizQuestion() {

    if (!currentUser) {
        alert("Please login first. 💗");
        return;
    }

    if (
        quizDraftQuestions.length >=
        QUIZ_MAX_QUESTIONS
    ) {
        alert(
            "You can create up to 30 questions only. 💗"
        );
        return;
    }


    // ==========================================
    // GET EVERYTHING CURRENTLY WRITTEN
    // ==========================================

    const currentQuestions =
        collectQuizEditorData();


    // ==========================================
    // CHECK LAST QUESTION
    // ==========================================

    if (currentQuestions.length > 0) {

        const lastQuestion =
            currentQuestions[
                currentQuestions.length - 1
            ];


        // Question kosong
        if (!lastQuestion.question) {

            alert(
                "Please write the question first. 💗"
            );

            return;
        }


        // MCQ / Checkbox
        if (
            lastQuestion.question_type !== "open" &&
            (
                !lastQuestion.option_a ||
                !lastQuestion.option_b ||
                !lastQuestion.option_c ||
                !lastQuestion.option_d ||
                !lastQuestion.correct_answer
            )
        ) {

            alert(
                "Please complete all options and select the correct answer first. 💗"
            );

            return;
        }


        // ==========================================
        // AUTO SAVE LAST QUESTION
        // ==========================================

        const saveData = {

            owner_id:
                currentUser.id,

            question:
                lastQuestion.question,

            question_type:
                lastQuestion.question_type,

            option_a:
                lastQuestion.option_a,

            option_b:
                lastQuestion.option_b,

            option_c:
                lastQuestion.option_c,

            option_d:
                lastQuestion.option_d,

            correct_answer:
                lastQuestion.correct_answer
        };


        // ==========================================
        // NEW QUESTION → INSERT
        // ==========================================

        if (
            String(lastQuestion.id)
                .startsWith("new_")
        ) {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("quiz_questions")
                    .insert([saveData])
                    .select()
                    .single();


            if (error) {

                console.error(
                    "Auto save error:",
                    error
                );

                alert(
                    "Failed to save question. 💔"
                );

                return;
            }


            // ======================================
            // UPDATE DRAFT WITH REAL DATABASE ID
            // ======================================

            const draftIndex =
                quizDraftQuestions.findIndex(
                    q =>
                        String(q.id) ===
                        String(lastQuestion.id)
                );


            if (draftIndex !== -1) {

                quizDraftQuestions[
                    draftIndex
                ] = {

                    ...quizDraftQuestions[
                        draftIndex
                    ],

                    ...lastQuestion,

                    id: data.id,

                    __new: false
                };
            }
        }


        // ==========================================
        // EXISTING QUESTION → UPDATE
        // ==========================================

        else {

            const {
                error
            } =
                await supabaseClient
                    .from("quiz_questions")
                    .update(saveData)
                    .eq(
                        "id",
                        Number(lastQuestion.id)
                    )
                    .eq(
                        "owner_id",
                        currentUser.id
                    );


            if (error) {

                console.error(
                    "Auto update error:",
                    error
                );

                alert(
                    "Failed to update question. 💔"
                );

                return;
            }
        }
    }


    // ==========================================
    // IMPORTANT:
    // SAVE ALL CURRENT TEXT INTO DRAFT
    // BEFORE RENDERING AGAIN
    // ==========================================

    currentQuestions.forEach(
        (question, index) => {

            if (
                quizDraftQuestions[index]
            ) {

                quizDraftQuestions[index] = {

                    ...quizDraftQuestions[index],

                    question:
                        question.question,

                    question_type:
                        question.question_type,

                    option_a:
                        question.option_a,

                    option_b:
                        question.option_b,

                    option_c:
                        question.option_c,

                    option_d:
                        question.option_d,

                    correct_answer:
                        question.correct_answer
                };
            }
        }
    );


    // ==========================================
    // ADD NEW EMPTY QUESTION
    // ==========================================

    quizDraftCounter++;

    quizDraftQuestions.push({

        id:
            `new_${Date.now()}_${quizDraftCounter}`,

        question: "",

        question_type: "open",

        option_a: "",

        option_b: "",

        option_c: "",

        option_d: "",

        correct_answer: "",

        __new: true

    });


    // ==========================================
    // DISPLAY AGAIN
    // ==========================================

    renderQuizSetup();
}

// ======================================================
// DELETE QUESTION
// ======================================================

function removeQuizQuestion(id) {

    if (!confirm("Delete this question?")) {
        return;
    }


    quizDraftQuestions =
        quizDraftQuestions.filter(
            question =>
                String(question.id) !==
                String(id)
        );


    renderQuizSetup();

}


// ======================================================
// CHANGE QUESTION TYPE
// ======================================================

function changeQuestionEditorType(id) {

    const card =
        Array.from(
            document.querySelectorAll(
                ".quiz-question-editor"
            )
        ).find(
            element =>
                element.dataset.questionId ===
                String(id)
        );


    if (!card) {
        return;
    }


    const type =
        card.querySelector(
            ".quiz-type-select"
        )?.value;


    const area =
        card.querySelector(
            ".quiz-editor-answer-area"
        );


    if (area) {

        area.innerHTML =
            qOptions({}, type);

    }

}


// ======================================================
// COLLECT QUESTION DATA
// ======================================================

function collectQuizEditorData() {

    return Array.from(
        document.querySelectorAll(
            ".quiz-question-editor"
        )
    ).map(card => {

        const id =
            card.dataset.questionId;


        const type =
            card.querySelector(
                ".quiz-type-select"
            )?.value || "open";


        const question =
            card.querySelector(
                ".quiz-question-input"
            )?.value.trim() || "";


        const options = {};


        card.querySelectorAll(
            ".quiz-option-input"
        ).forEach(input => {

            options[input.dataset.option] =
                input.value.trim();

        });


        let correct = "";


        if (type === "mcq") {

            correct =
                card.querySelector(
                    ".quiz-correct-select"
                )?.value || "";

        }


        else if (type === "checkbox") {

            correct =
                Array.from(
                    card.querySelectorAll(
                        ".quiz-correct-checkbox:checked"
                    )
                )
                .map(input => input.value)
                .sort()
                .join(",");

        }


        return {

            id,

            question,

            question_type: type,

            option_a:
                type === "open"
                    ? null
                    : options.A || "",

            option_b:
                type === "open"
                    ? null
                    : options.B || "",

            option_c:
                type === "open"
                    ? null
                    : options.C || "",

            option_d:
                type === "open"
                    ? null
                    : options.D || "",

            correct_answer:
                type === "open"
                    ? null
                    : correct

        };

    });

}


// ======================================================
// SAVE MY QUESTIONS
// ======================================================

async function saveMyQuizQuestions() {

    if (!currentUser) {
        return;
    }


    const rows =
        collectQuizEditorData();


    if (rows.length > 30) {

        alert(
            "Maximum 30 questions allowed."
        );

        return;

    }


    // Validate

    for (
        let i = 0;
        i < rows.length;
        i++
    ) {

        const row = rows[i];


        if (!row.question) {

            alert(
                `Please write Question ${i + 1}. 💗`
            );

            return;

        }


        if (
            row.question_type !== "open" &&
            (
                !row.option_a ||
                !row.option_b ||
                !row.option_c ||
                !row.option_d ||
                !row.correct_answer
            )
        ) {

            alert(
                `Please complete all options and choose the correct answer for Question ${i + 1}.`
            );

            return;

        }

    }


    // Existing question IDs

    const existing =
        quizDraftQuestions
            .filter(
                q =>
                    !String(q.id)
                        .startsWith("new_")
            )
            .map(q => Number(q.id))
            .filter(Number.isFinite);


    const current =
        rows
            .filter(
                row =>
                    !String(row.id)
                        .startsWith("new_")
            )
            .map(row => Number(row.id))
            .filter(Number.isFinite);


    // Deleted questions

    const deleted =
        existing.filter(
            id =>
                !current.includes(id)
        );


    if (deleted.length) {

        const {
            error
        } = await supabaseClient
            .from("quiz_questions")
            .delete()
            .eq("owner_id", currentUser.id)
            .in("id", deleted);


        if (error) {

            alert(error.message);

            return;

        }

    }


    // Existing rows

    const oldRows =
        rows
            .filter(
                row =>
                    !String(row.id)
                        .startsWith("new_")
            )
            .map(row => ({

                id: Number(row.id),

                owner_id:
                    currentUser.id,

                question:
                    row.question,

                question_type:
                    row.question_type,

                option_a:
                    row.option_a,

                option_b:
                    row.option_b,

                option_c:
                    row.option_c,

                option_d:
                    row.option_d,

                correct_answer:
                    row.correct_answer

            }));


    // New rows

    const newRows =
        rows
            .filter(
                row =>
                    String(row.id)
                        .startsWith("new_")
            )
            .map(row => ({

                owner_id:
                    currentUser.id,

                question:
                    row.question,

                question_type:
                    row.question_type,

                option_a:
                    row.option_a,

                option_b:
                    row.option_b,

                option_c:
                    row.option_c,

                option_d:
                    row.option_d,

                correct_answer:
                    row.correct_answer

            }));


    // Update existing

    if (oldRows.length) {

        const {
            error
        } = await supabaseClient
            .from("quiz_questions")
            .upsert(
                oldRows,
                {
                    onConflict: "id"
                }
            );


        if (error) {

            alert(error.message);

            return;

        }

    }


    // Insert new

    if (newRows.length) {

        const {
            error
        } = await supabaseClient
            .from("quiz_questions")
            .insert(newRows);


        if (error) {

            alert(error.message);

            return;

        }

    }


    alert(
        "Your quiz questions have been saved! 💗"
    );


    showQuizHome();

}


// ======================================================
// QUIZ HOME
// ======================================================

async function showQuizHome() {

    const quizContent =
        document.getElementById(
            "quizContent"
        );


    if (!quizContent) {
        return;
    }


    let count = 0;


    if (currentUser) {

        const {
            count: questionCount
        } = await supabaseClient
            .from("quiz_questions")
            .select(
                "id",
                {
                    count: "exact",
                    head: true
                }
            )
            .eq(
                "owner_id",
                currentUser.id
            );


        count =
            questionCount || 0;

    }


    const partner =
        quizPartnerName();


    const ready =
        count >= QUIZ_PLAY_COUNT;


    quizContent.innerHTML = `

        <div class="quiz-intro">

            <div class="quiz-big-emoji">

                🧠💗

            </div>


            <h3>

                How Well Do You Know Your Partner?

            </h3>


            <p>

                ${
                    currentUser?.id === HAZIRAH_ID
                        ? "💙"
                        : "🩷"
                }

                Let’s see how well you know

                ${qEsc(partner)}. 🥹

            </p>


            <div class="quiz-question-status">

                📝 Your questions:

                <strong>

                    ${count} / 30

                </strong>

            </div>


            <button
                type="button"
                id="setAnswersBtn"
                onclick="startQuizSetup()"
            >

                📝
                ${
                    count
                        ? "Edit My Questions"
                        : "Create My Questions"
                }

            </button>


            <button
                type="button"
                id="startQuizBtn"
                onclick="startQuiz()"
                ${ready ? "" : "disabled"}
            >

                🎮 Start Quiz —
                15 Random Questions

            </button>


            <button
                type="button"
                id="quizHistoryBtn"
                onclick="showQuizHistory()"
            >

                📖 Quiz History

            </button>


            <p class="quiz-ready-text">

                ${
                    ready
                        ? "✅ Your partner can play your questions."
                        : "📝 Create at least 15 questions before your partner can play."
                }

            </p>

        </div>

    `;

}


// ======================================================
// START QUIZ
// ======================================================

async function startQuiz() {

    if (!currentUser) {
        alert("Please login first.");
        return;
    }

    const partnerId =
        currentUser.id === HAZIRAH_ID
            ? ZULKARNAIN_ID
            : HAZIRAH_ID;

    // Get partner's questions
    const { data: questions, error } =
        await supabaseClient
            .from("quiz_questions")
            .select("*")
            .eq("owner_id", partnerId);

    if (error) {
        console.error("Quiz questions error:", error);
        alert("Unable to load your partner's questions.");
        return;
    }

    if (!questions || questions.length < 15) {
        alert(
            `Your partner has only created ${questions?.length || 0} / 15 questions. 💗`
        );
        return;
    }

    // Random 15 questions
    currentQuizQuestions =
        [...questions]
            .sort(() => Math.random() - 0.5)
            .slice(0, 15);

    currentQuizIndex = 0;
    currentQuizScore = 0;
    currentQuizAnswers = {};

    showQuizQuestion();
}

// ======================================================
// SHOW QUESTION
// ======================================================

function showQuizQuestion() {

    const quizContent =
        document.getElementById(
            "quizContent"
        );


    const question =
        currentQuizQuestions[
            currentQuizIndex
        ];


    if (!quizContent) {
        return;
    }


    if (!question) {

        showQuizResult();

        return;

    }


    const type =
        question.question_type ||
        "open";


    let answerArea = "";


    // TEXT

    if (type === "open") {

        answerArea = `

            <textarea
                id="quizUserAnswer"
                class="quiz-text-answer"
                placeholder="Write your answer..."
                maxlength="500"
            ></textarea>

        `;

    }


    // MCQ

    else if (type === "mcq") {

        answerArea = `

            <div class="quiz-play-options">

                ${["A", "B", "C", "D"]
                    .map(letter => `

                    <label>

                        <input
                            type="radio"
                            name="quizUserAnswer"
                            value="${letter}"
                        >

                        <span>

                            <strong>${letter}.</strong>

                            ${qEsc(
                                question[
                                    "option_" +
                                    letter.toLowerCase()
                                ]
                            )}

                        </span>

                    </label>

                `)
                .join("")}

            </div>

        `;

    }


    // CHECKBOX

    else {

        answerArea = `

            <div class="quiz-play-options">

                ${["A", "B", "C", "D"]
                    .map(letter => `

                    <label>

                        <input
                            type="checkbox"
                            name="quizUserAnswer"
                            value="${letter}"
                        >

                        <span>

                            <strong>${letter}.</strong>

                            ${qEsc(
                                question[
                                    "option_" +
                                    letter.toLowerCase()
                                ]
                            )}

                        </span>

                    </label>

                `)
                .join("")}

            </div>

        `;

    }


    quizContent.innerHTML = `

        <div class="quiz-play-container">

            <div class="quiz-play-header">

                <button
                    type="button"
                    class="quiz-back-btn"
                    onclick="showQuizHome()"
                >

                    ← Exit Quiz

                </button>


                <span>

                    Question
                    ${currentQuizIndex + 1}
                    / ${currentQuizQuestions.length}

                </span>

            </div>


            <div class="quiz-play-card">

                <div class="quiz-question-number">

                    Question ${currentQuizIndex + 1}

                </div>


                <h2>

                    ${qEsc(question.question)}

                </h2>


                <div id="quizAnswerArea">

                    ${answerArea}

                </div>


                <div
                    id="quizFeedback"
                    class="quiz-feedback-area"
                ></div>


                <button
                    type="button"
                    id="quizCheckBtn"
                    onclick="submitQuizAnswer()"
                >

                    💕 Check Answer

                </button>


                <button
                    type="button"
                    id="quizNextBtn"
                    onclick="goToNextQuizQuestion()"
                    style="display:none"
                >

                    Next Question →

                </button>

            </div>

        </div>

    `;

}


// ======================================================
// SUBMIT ANSWER
// ======================================================

function submitQuizAnswer() {

    const question =
        currentQuizQuestions[
            currentQuizIndex
        ];


    if (!question) {
        return;
    }


    const type =
        question.question_type ||
        "open";


    let user = "";

    let correctAnswer = "";

    let correct = null;

    let scored = false;


    // TEXT

    if (type === "open") {

        user =
            document.getElementById(
                "quizUserAnswer"
            )?.value.trim() || "";


        if (!user) {

            alert(
                "Please answer first 💗"
            );

            return;

        }

    }


    // MCQ

    else if (type === "mcq") {

        const selected =
            document.querySelector(
                'input[name="quizUserAnswer"]:checked'
            );


        if (!selected) {

            alert(
                "Please choose an answer 💗"
            );

            return;

        }


        user =
            selected.value;


        correctAnswer =
            qAnswerText(
                question,
                question.correct_answer || ""
            );


        correct =
            user ===
            question.correct_answer;


        scored = true;

    }


    // CHECKBOX

    else {

        const selected =
            Array.from(
                document.querySelectorAll(
                    'input[name="quizUserAnswer"]:checked'
                )
            )
            .map(
                input => input.value
            )
            .sort();


        if (!selected.length) {

            alert(
                "Please select at least one answer 💗"
            );

            return;

        }


        user =
            selected
                .map(letter => {

                    return (
                        `${letter}. ` +
                        (
                            question[
                                "option_" +
                                letter.toLowerCase()
                            ] || letter
                        )
                    );

                })
                .join(", ");


        correctAnswer =
            qAnswerText(
                question,
                question.correct_answer
            );


        const expected =
            qArr(
                question.correct_answer
            );


        correct =
            JSON.stringify(selected) ===
            JSON.stringify(expected);


        scored = true;

    }


    // Save current answer

    currentQuizAnswers[
        currentQuizIndex
    ] = {

        questionId:
            question.id,

        question:
            question.question,

        questionType:
            type,

        userAnswer:
            user,

        correctAnswer:
            correctAnswer,

        correct:
            correct,

        scored:
            scored

    };


    // Score only objective questions

    if (scored) {

        currentQuizScoredTotal++;


        if (correct) {

            currentQuizScore++;

        }

    }


    const feedback =
        document.getElementById(
            "quizFeedback"
        );


    if (feedback) {


        // TEXT

        if (!scored) {

            feedback.innerHTML = `

                <div class="quiz-feedback-text">

                    💗 Answer saved.
                    This question is not scored.

                </div>

            `;

        }


        // CORRECT

        else if (correct) {

            feedback.innerHTML = `

                <div class="quiz-feedback-correct">

                    <div class="quiz-feedback-icon">

                        🎉💗✨

                    </div>

                    <strong>

                        Correct!

                    </strong>

                    <p>

                        You really know your partner! 🥰

                    </p>

                </div>

            `;

        }


        // WRONG

        else {

            feedback.innerHTML = `

                <div class="quiz-feedback-wrong">

                    <div class="quiz-feedback-icon">

                        🥺💔

                    </div>

                    <strong>

                        Not quite!

                    </strong>


                    <p>

                        <b>Your answer:</b>

                        <br>

                        ${qEsc(user)}

                    </p>


                    <p>

                        <b>Correct answer:</b>

                        <br>

                        ${qEsc(correctAnswer)}

                    </p>

                </div>

            `;

        }

    }


    const checkButton =
        document.getElementById(
            "quizCheckBtn"
        );


    const nextButton =
        document.getElementById(
            "quizNextBtn"
        );


    if (checkButton) {

        checkButton.style.display =
            "none";

    }


    if (nextButton) {

        nextButton.style.display =
            "block";

    }

}


// ======================================================
// NEXT QUESTION
// ======================================================

function goToNextQuizQuestion() {

    currentQuizIndex++;


    if (
        currentQuizIndex >=
        currentQuizQuestions.length
    ) {

        showQuizResult();

        return;

    }


    showQuizQuestion();

}


// ======================================================
// SAVE QUIZ ATTEMPT
// ======================================================

async function saveQuizAttempt() {

    if (
        !currentUser ||
        !currentQuizQuestions.length
    ) {

        return null;

    }


    const {
        data: attempt,
        error
    } = await supabaseClient
        .from("quiz_attempts")
        .insert({

            user_id:
                currentUser.id,

            partner_id:
                quizPartnerId(),

            score:
                currentQuizScore,

            total:
                currentQuizScoredTotal

        })
        .select()
        .single();


    if (error) {

        console.error(
            "Quiz attempt error:",
            error
        );

        return null;

    }


    currentQuizAttemptId =
        attempt.id;


    const rows =
        currentQuizQuestions.map(
            (question, index) => {

                const answer =
                    currentQuizAnswers[
                        index
                    ] || {

                        userAnswer: "",

                        correctAnswer: "",

                        correct: null,

                        scored: false

                    };


                return {

                    attempt_id:
                        attempt.id,

                    question_id:
                        question.id,

                    question_text:
                        question.question,

                    question_type:
                        question.question_type ||
                        "open",

                    user_answer:
                        answer.userAnswer ||
                        "",

                    correct_answer:
                        answer.scored
                            ? answer.correctAnswer || ""
                            : null,

                    is_scored:
                        answer.scored === true,

                    is_correct:
                        answer.scored
                            ? answer.correct === true
                            : null

                };

            }
        );


    const {
        error: answerError
    } = await supabaseClient
        .from("quiz_attempt_answers")
        .insert(rows);


    if (answerError) {

        console.error(
            "Quiz answers error:",
            answerError
        );

    }


    return attempt;

}


// ======================================================
// QUIZ RESULT
// ======================================================

async function showQuizResult() {

    const quizContent =
        document.getElementById(
            "quizContent"
        );


    if (!quizContent) {
        return;
    }


    if (!currentQuizAttemptId) {

        await saveQuizAttempt();

    }


    const textCount =
        currentQuizQuestions.filter(
            question =>
                (
                    question.question_type ||
                    "open"
                ) === "open"
        ).length;


    let message = "";


    if (
        currentQuizScoredTotal === 0
    ) {

        message =
            "Your text answers are saved, but there are no scored questions. 💗";

    }


    else if (
        currentQuizScore ===
        currentQuizScoredTotal
    ) {

        message =
            "Perfect! You really know your partner! 💕😍";

    }


    else if (
        currentQuizScore /
        currentQuizScoredTotal >=
        0.8
    ) {

        message =
            "Amazing! You know your partner very well! 🥰";

    }


    else if (
        currentQuizScore /
        currentQuizScoredTotal >=
        0.6
    ) {

        message =
            "Not bad! You know your partner quite well! 💗";

    }


    else {

        message =
            "Aww, maybe you need to know each other better! 🥺💕";

    }


    quizContent.innerHTML = `

        <div class="quiz-intro">

            <div class="quiz-result-icon">

                🎉

            </div>


            <h2>

                Quiz Completed! 💕

            </h2>


            <div class="quiz-score">

                ${currentQuizScore}
                /
                ${currentQuizScoredTotal}

            </div>


            <p>

                ${qEsc(message)}

            </p>


            ${
                textCount
                    ? `
                        <div class="quiz-unscored-note">

                            ✍️
                            ${textCount}
                            Text question${
                                textCount > 1
                                    ? "s were"
                                    : " was"
                            }
                            not scored.

                        </div>
                    `
                    : ""
            }


            <div class="quiz-result-buttons">

                <button
                    type="button"
                    onclick="showQuizReview()"
                >

                    📖 Review Answers

                </button>


                <button
                    type="button"
                    onclick="restartQuiz()"
                >

                    🔄 Try Again —
                    New Random Questions

                </button>


                <button
                    type="button"
                    class="quiz-back-btn"
                    onclick="showQuizHome()"
                >

                    ← Quiz Home

                </button>

            </div>

        </div>

    `;

}


// ======================================================
// REVIEW HISTORY HTML
// ======================================================

function reviewHTML(
    answers,
    personName
) {

    return (answers || [])
        .map(
            (answer, index) => {


                // TEXT

                if (!answer.is_scored) {

                    return `

                        <div
                            class="quiz-review-card review-text"
                        >

                            <div
                                class="quiz-review-number"
                            >

                                Question ${index + 1}

                            </div>


                            <h3>

                                ${qEsc(
                                    answer.question_text
                                )}

                            </h3>


                            <p
                                class="review-not-scored"
                            >

                                ✍️ Text —
                                Not scored

                            </p>


                            <p>

                                <strong>

                                    ${qEsc(
                                        personName ||
                                        "Your"
                                    )} answer:

                                </strong>

                                <br>

                                ${qEsc(
                                    answer.user_answer ||
                                    "-"
                                )}

                            </p>

                        </div>

                    `;

                }


                // OBJECTIVE

                return `

                    <div
                        class="
                            quiz-review-card
                            ${
                                answer.is_correct
                                    ? "review-correct"
                                    : "review-wrong"
                            }
                        "
                    >

                        <div
                            class="quiz-review-number"
                        >

                            Question ${index + 1}

                        </div>


                        <h3>

                            ${qEsc(
                                answer.question_text
                            )}

                        </h3>


                        <p>

                            <strong>

                                Status:

                            </strong>

                            ${
                                answer.is_correct
                                    ? "✅ Correct"
                                    : "❌ Incorrect"
                            }

                        </p>


                        <p>

                            <strong>

                                ${qEsc(
                                    personName ||
                                    "Your"
                                )} answer:

                            </strong>

                            <br>

                            ${qEsc(
                                answer.user_answer ||
                                "-"
                            )}

                        </p>


                        ${
                            answer.is_correct
                                ? ""
                                : `
                                    <p>

                                        <strong>

                                            Correct answer:

                                        </strong>

                                        <br>

                                        ${qEsc(
                                            answer.correct_answer ||
                                            "-"
                                        )}

                                    </p>
                                `
                        }

                    </div>

                `;

            }
        )
        .join("");

}


// ======================================================
// REVIEW CURRENT QUIZ
// ======================================================

function showQuizReview() {

    const quizContent =
        document.getElementById(
            "quizContent"
        );


    if (!quizContent) {
        return;
    }


    quizContent.innerHTML = `

        <div class="quiz-intro">

            <button
                type="button"
                class="quiz-back-btn"
                onclick="showQuizResult()"
            >

                ← Back to Result

            </button>


            <h2>

                📖 Review Answers

            </h2>


            <p>

                Here's how you did! 💕

            </p>


            <div class="quiz-review-list">

                ${
                    currentQuizQuestions
                        .map(
                            (question, index) => {

                                const answer =
                                    currentQuizAnswers[
                                        index
                                    ];


                                if (!answer) {
                                    return "";
                                }


                                if (
                                    answer.scored
                                ) {

                                    return `

                                        <div
                                            class="
                                                quiz-review-card
                                                ${
                                                    answer.correct
                                                        ? "review-correct"
                                                        : "review-wrong"
                                                }
                                            "
                                        >

                                            <div
                                                class="quiz-review-number"
                                            >

                                                Question
                                                ${index + 1}

                                            </div>


                                            <h3>

                                                ${qEsc(
                                                    question.question
                                                )}

                                            </h3>


                                            <p>

                                                <strong>

                                                    Status:

                                                </strong>

                                                ${
                                                    answer.correct
                                                        ? "✅ Correct"
                                                        : "❌ Incorrect"
                                                }

                                            </p>


                                            <p>

                                                <strong>

                                                    Your answer:

                                                </strong>

                                                <br>

                                                ${qEsc(
                                                    answer.userAnswer ||
                                                    "-"
                                                )}

                                            </p>


                                            ${
                                                answer.correct
                                                    ? ""
                                                    : `
                                                        <p>

                                                            <strong>

                                                                Correct answer:

                                                            </strong>

                                                            <br>

                                                            ${qEsc(
                                                                answer.correctAnswer ||
                                                                "-"
                                                            )}

                                                        </p>
                                                    `
                                            }

                                        </div>

                                    `;

                                }


                                return `

                                    <div
                                        class="
                                            quiz-review-card
                                            review-text
                                        "
                                    >

                                        <div
                                            class="quiz-review-number"
                                        >

                                            Question
                                            ${index + 1}

                                        </div>


                                        <h3>

                                            ${qEsc(
                                                question.question
                                            )}

                                        </h3>


                                        <p
                                            class="review-not-scored"
                                        >

                                            ✍️ Text —
                                            Not scored

                                        </p>


                                        <p>

                                            <strong>

                                                Your answer:

                                            </strong>

                                            <br>

                                            ${qEsc(
                                                answer.userAnswer ||
                                                "-"
                                            )}

                                        </p>

                                    </div>

                                `;

                            }
                        )
                        .join("")

                }

            </div>

        </div>

    `;

}


// ======================================================
// QUIZ HISTORY
// ======================================================

async function showQuizHistory() {

    const quizContent =
        document.getElementById(
            "quizContent"
        );


    if (
        !quizContent ||
        !currentUser
    ) {

        return;

    }


    quizContent.innerHTML = `

        <div class="quiz-loading">

            Loading Quiz History... 💕

        </div>

    `;


    const {
        data,
        error
    } = await supabaseClient
        .from("quiz_attempts")
        .select("*")
        .or(
            `user_id.eq.${currentUser.id},partner_id.eq.${currentUser.id}`
        )
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        quizContent.innerHTML = `

            <div class="quiz-error">

                ❌ ${qEsc(error.message)}

                <br><br>

                <button
                    type="button"
                    class="quiz-back-btn"
                    onclick="showQuizHome()"
                >

                    ← Quiz Home

                </button>

            </div>

        `;

        return;

    }


    if (!data?.length) {

        quizContent.innerHTML = `

            <div class="quiz-history-empty">

                <div class="quiz-history-empty-icon">

                    📖💕

                </div>


                <h2>

                    No Quiz History Yet

                </h2>


                <p>

                    Complete a quiz first
                    to see your quiz history here ♡

                </p>


                <button
                    type="button"
                    class="quiz-back-btn"
                    onclick="showQuizHome()"
                >

                    ← Quiz Home

                </button>

            </div>

        `;

        return;

    }


    quizContent.innerHTML = `

        <div class="quiz-history-container">

            <div class="quiz-history-header">

                <h2>

                    📖 Quiz History

                </h2>


                <p>

                    Both of you can view
                    completed quizzes here ♡

                </p>

            </div>


            <div class="quiz-history-list">

                ${
                    data
                        .map(
                            attempt => `

                                <div
                                    class="quiz-history-card"
                                >

                                    <div
                                        class="quiz-history-info"
                                    >

                                        <h3>

                                            💕
                                            ${qEsc(
                                                USER_NAMES[
                                                    attempt.user_id
                                                ] ||
                                                "Unknown"
                                            )}

                                            answered about

                                            ${qEsc(
                                                USER_NAMES[
                                                    attempt.partner_id
                                                ] ||
                                                "Unknown"
                                            )}

                                        </h3>


                                        <div
                                            class="quiz-history-score"
                                        >

                                            ${attempt.score}
                                            /
                                            ${attempt.total}

                                        </div>


                                        <div
                                            class="quiz-history-date"
                                        >

                                            📅
                                            ${qEsc(
                                                formatNoteDate(
                                                    attempt.created_at
                                                )
                                            )}

                                        </div>

                                    </div>


                                    <button
                                        type="button"
                                        class="quiz-history-view-btn"
                                        onclick="viewQuizAttempt('${qEsc(
                                            attempt.id
                                        )}')"
                                    >

                                        👀 View Answers

                                    </button>

                                </div>

                            `
                        )
                        .join("")

                }

            </div>


            <button
                type="button"
                class="quiz-back-btn"
                onclick="showQuizHome()"
            >

                ← Quiz Home

            </button>

        </div>

    `;

}


// ======================================================
// VIEW SAVED QUIZ ATTEMPT
// ======================================================

async function viewQuizAttempt(id) {

    const quizContent =
        document.getElementById(
            "quizContent"
        );


    if (
        !quizContent ||
        !currentUser
    ) {

        return;

    }


    quizContent.innerHTML = `

        <div class="quiz-loading">

            Loading saved answers... 💕

        </div>

    `;


    const {
        data: attempt,
        error: attemptError
    } = await supabaseClient
        .from("quiz_attempts")
        .select("*")
        .eq("id", id)
        .single();


    if (attemptError) {

        quizContent.innerHTML = `

            <div class="quiz-error">

                ❌ ${qEsc(
                    attemptError.message
                )}

                <br><br>

                <button
                    type="button"
                    class="quiz-back-btn"
                    onclick="showQuizHistory()"
                >

                    ← Quiz History

                </button>

            </div>

        `;

        return;

    }


    const {
        data: answers,
        error: answerError
    } = await supabaseClient
        .from("quiz_attempt_answers")
        .select("*")
        .eq(
            "attempt_id",
            id
        )
        .order(
            "id",
            {
                ascending: true
            }
        );


    if (answerError) {

        quizContent.innerHTML = `

            <div class="quiz-error">

                ❌ ${qEsc(
                    answerError.message
                )}

                <br><br>

                <button
                    type="button"
                    class="quiz-back-btn"
                    onclick="showQuizHistory()"
                >

                    ← Quiz History

                </button>

            </div>

        `;

        return;

    }


    const who =
        USER_NAMES[
            attempt.user_id
        ] || "Unknown";


    const about =
        USER_NAMES[
            attempt.partner_id
        ] || "Unknown";


    quizContent.innerHTML = `

        <div class="quiz-intro">

            <button
                type="button"
                class="quiz-back-btn"
                onclick="showQuizHistory()"
            >

                ← Quiz History

            </button>


            <h2>

                📖 Quiz Review

            </h2>


            <p>

                ${qEsc(who)}
                answered about
                ${qEsc(about)} 💕

            </p>


            <div class="quiz-score">

                ${attempt.score}
                /
                ${attempt.total}

            </div>


            <div class="quiz-review-list">

                ${reviewHTML(
                    answers,
                    who
                )}

            </div>

        </div>

    `;

}


// ======================================================
// TRY AGAIN
// ======================================================

async function restartQuiz() {

    currentQuizIndex = 0;

    currentQuizScore = 0;

    currentQuizScoredTotal = 0;

    currentQuizAnswers = {};

    currentQuizQuestions = [];

    currentQuizAttemptId = null;


    // This loads a NEW random set

    await startQuiz();

}


/* ======================================================
   MOBILE HAMBURGER MENU
====================================================== */

function toggleMobileMenu() {

    const menu = document.querySelector(".navigation");
    const button = document.getElementById("mobileMenuBtn");

    if (!menu || !button) return;

    menu.classList.toggle("mobile-menu-open");

    if (menu.classList.contains("mobile-menu-open")) {

        button.textContent = "✕";
        button.setAttribute("aria-label", "Close menu");

    } else {

        button.textContent = "☰";
        button.setAttribute("aria-label", "Open menu");

    }
}
