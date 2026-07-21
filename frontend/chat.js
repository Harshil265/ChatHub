const API_URL = "https://chat-app-uiip.onrender.com";

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

let currentUser = null;
let currentFriend = null;
let users = [];
let onlineUsers = [];
let lastDate = "";
const drafts = {};

const friendsList = document.getElementById("friendsList");

const chatTitle = document.querySelector(".chat-user h3");
const chatStatus = document.querySelector(".chat-user p");
const chatImage = document.querySelector(".chat-user img");
const typingStatus = document.getElementById("typingStatus");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const container =document.querySelector(".container");
const mobileBackBtn =document.getElementById("mobileBackBtn");

mobileBackBtn.addEventListener("click", () => {

    container.classList.remove("chat-open");

    infoPanel.classList.remove("open");

});
console.log(messageInput);

let typing = false;

let typingTimeout;

function getProfileImage(user, size = 60) {

    if (user.profilePic && user.profilePic.trim() !== "") {

        return user.profilePic;

    }

    return `https://i.pravatar.cc/${size}?u=${user.email}`;

}

messageInput.addEventListener("input", () => {

    if (!currentFriend) return;

    if (!currentUser) return;

    if (!typing) {

        typing = true;

        socket.emit("typing", {

            sender: currentUser._id,

            receiver: currentFriend._id

        });

    }

    clearTimeout(typingTimeout);

    typingTimeout = setTimeout(() => {

        typing = false;

        socket.emit("stopTyping", {

            sender: currentUser._id,

            receiver: currentFriend._id

        });

    }, 10000);

});

async function loadCurrentUser() {

    try {

        const response = await fetch(API_URL + "/api/users/me", {

            method: "GET",

            headers: {
                Authorization: "Bearer " + token
            }

        });

        const data = await response.json();

        console.log("Current User:", data);

        if (!data.success) {

            alert(data.message);

            localStorage.removeItem("token");

            window.location.href = "login.html";

            return;

        }

        currentUser = data.user;
        socket.emit("setup", currentUser._id);
        loadUsers();

    }

    catch (err) {

        console.log(err);

        alert("Unable to connect to server.");

    }

}

const socket = io("https://chat-app-uiip.onrender.com");


socket.on("connect", () => {

    console.log("✅ Connected to Socket.IO:", socket.id);

});

socket.on("disconnect", () => {

    console.log("🔴 Disconnected");

});

socket.on("onlineUsers", (users) => {

    onlineUsers = users;

    displayUsers();

});

socket.on("receiveMessage", (message) => {

    if (!currentFriend) return;

    if (
        (message.sender === currentFriend._id &&
            message.receiver === currentUser._id)
        ||
        (message.sender === currentUser._id &&
            message.receiver === currentFriend._id)
    ) {

        appendMessage(message);

    }

});

socket.on("showTyping", (data) => {

    if (!currentFriend) return;

    if (
        currentFriend._id.toString() === data.sender.toString()
    ) {

        typingStatus.textContent =
            `${currentFriend.name} is typing...`;

        typingStatus.style.display = "block";

    }

});

socket.on("hideTyping", () => {

    typingStatus.textContent = "";

    typingStatus.style.display = "none";

});

async function loadUsers() {

    try {

        const response = await fetch(API_URL + "/api/users", {

            method: "GET",

            headers: {
                Authorization: "Bearer " + token
            }

        });

        const data = await response.json();

        console.log("Users:", data);

        if (!data.success) {

            alert(data.message);

            return;

        }

        users = data.users.filter(user => user._id !== currentUser._id);

        displayUsers();

    }

    catch (err) {

        console.log(err);

    }

}

function displayUsers() {

    // Remember which friend is currently selected
    const selectedFriendId = currentFriend?._id;

    friendsList.innerHTML = "";

    if (users.length === 0) {

        friendsList.innerHTML =
            "<p style='padding:20px;'>No users found.</p>";

        return;

    }

    users.forEach((user) => {

        const friend = document.createElement("div");

        friend.className = "friend";

        const isOnline =
            onlineUsers.includes(user._id);


        const profileImage =
            user.profilePic &&
            user.profilePic.trim() !== ""

                ? user.profilePic

                : "https://i.pravatar.cc/60?u=" +
                  encodeURIComponent(user.email);


        friend.innerHTML = `

            <img
                src="${profileImage}"
                alt="${user.name}"
            >

            <div>

                <div class="friend-name">

                    <h4>${user.name}</h4>

                    <span class="status ${
                        isOnline
                            ? "online"
                            : "offline"
                    }"></span>

                </div>

                <p>

                    ${
                        isOnline
                            ? "🟢 Online"
                            : "⚪ Offline"
                    }

                </p>

            </div>

        `;

        if (
            currentFriend &&
            user._id === selectedFriendId
        ) {

            friend.classList.add("active");

        }


        friend.addEventListener("click", () => {


            if (currentFriend) {

                drafts[currentFriend._id] =
                    messageInput.value;

            }


            currentFriend = user;

            container.classList.add(
                "chat-open"
            );


            typingStatus.innerHTML = "";

            typingStatus.style.display =
                "none";


            messageInput.value =
                drafts[currentFriend._id] || "";

            document
                .querySelectorAll(".friend")
                .forEach(item => {

                    item.classList.remove(
                        "active"
                    );

                });

            friend.classList.add("active");

            infoPanel.classList.remove(
                "open"
            );


            // Update chat

            updateChatHeader();

            loadContactInfo();

            loadMessages();

        });


        // Add friend to list

        friendsList.appendChild(friend);

    });

    if (currentFriend) {

        messageInput.value =
            drafts[currentFriend._id] || "";

    }

}


function updateChatHeader() {

    if (!currentFriend) return;

    const isOnline = onlineUsers.includes(currentFriend._id);

    chatTitle.textContent = currentFriend.name;

    chatStatus.innerHTML = isOnline
        ? "<span style='color:#16a34a;'>● Online</span>"
        : "<span style='color:#999;'>● Offline</span>";

    chatImage.src =
    currentFriend.profilePic &&currentFriend.profilePic.trim() !== ""
        ? currentFriend.profilePic
        : "https://i.pravatar.cc/60?u=" +
          encodeURIComponent(currentFriend.email);
}

function formatMessageDate(date) {

    const msgDate = new Date(date);

    const today = new Date();

    const yesterday = new Date();

    yesterday.setDate(today.getDate() - 1);

    if (msgDate.toDateString() === today.toDateString()) {

        return "Today";

    }

    if (msgDate.toDateString() === yesterday.toDateString()) {

        return "Yesterday";

    }

    return msgDate.toLocaleDateString("en-IN", {

        day: "numeric",
        month: "long",
        year: "numeric"

    });

}

function appendMessage(message) {

    const currentDate = formatMessageDate(message.createdAt);

    if (currentDate !== lastDate) {

        const dateDiv = document.createElement("div");

        dateDiv.className = "date-separator";

        dateDiv.textContent = currentDate;

        chatBody.appendChild(dateDiv);

        lastDate = currentDate;

    }

    const messageDiv = document.createElement("div");

    const isMine = message.sender.toString() === currentUser._id.toString();

    messageDiv.className = isMine
        ? "message sent"
        : "message received";

    const time = new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    messageDiv.innerHTML = `
        <div>${message.message}</div>
        <small>${time}</small>
    `;

    chatBody.appendChild(messageDiv);

    chatBody.scrollTop = chatBody.scrollHeight;

}

async function loadMessages() {

    if (!currentFriend) return;

    try {

        const response = await fetch(

            `${API_URL}/api/messages/${currentUser._id}/${currentFriend._id}`,

            {
                headers: {
                    Authorization: "Bearer " + token
                }
            }

        );

        const data = await response.json();

        if (!data.success) {

            alert(data.message);

            return;

        }

        displayMessages(data.messages);

    }

    catch (err) {

        console.log(err);

    }

}

function displayMessages(messages) {

    chatBody.innerHTML = "";
    lastDate = "";


    if (messages.length === 0) {

        chatBody.innerHTML = `

        <div class="empty-chat">

            Start Conversation 👋

        </div>

    `;

        return;

    }

    messages.forEach(msg => {

        appendMessage(msg);

    });

    setTimeout(() => {

        chatBody.scrollTop = chatBody.scrollHeight;

    }, 100);

}

async function sendMessage() {

    const text = messageInput.value.trim();

    if (!text || !currentFriend) return;

    try {

        const response = await fetch(

            `${API_URL}/api/messages`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json",

                    Authorization: "Bearer " + token

                },

                body: JSON.stringify({

                    sender: currentUser._id,

                    receiver: currentFriend._id,

                    message: text

                })

            }

        );

        const data = await response.json();

        if (data.success) {

            messageInput.value = "";

            typing = false;

            socket.emit("stopTyping", {

                sender: currentUser._id,

                receiver: currentFriend._id

            });
        }

        else {

            alert(data.message);

        }

    }

    catch (err) {

        console.log(err);

    }

}

const infoPanel = document.querySelector(".contact-info");

const infoBtn = document.querySelector(".fa-circle-info");

const closeInfoBtn = document.querySelector(".close-info");

const infoImg = document.getElementById("info-img");

const infoName = document.getElementById("info-name");

const infoStatus = document.getElementById("info-status");

const infoEmail = document.getElementById("info-email");

const infoPhone = document.getElementById("info-phone");




function loadContactInfo() {

    if (!currentFriend) return;
infoImg.src =
    currentFriend.profilePic &&
    currentFriend.profilePic.trim() !== ""
        ? currentFriend.profilePic
        : "https://i.pravatar.cc/120?u=" +
          encodeURIComponent(currentFriend.email);
    
    infoName.textContent = currentFriend.name;

    infoStatus.textContent =
        currentFriend.isOnline
            ? "🟢 Online"
            : "⚪ Offline";

    infoEmail.textContent = currentFriend.email;

    infoPhone.textContent = currentFriend.mobile;

}


infoBtn.addEventListener("click", () => {

    if (!currentFriend) return;

    loadContactInfo();

    infoPanel.classList.add("open");

});



closeInfoBtn.addEventListener("click", () => {

    infoPanel.classList.remove("open");

});

const searchInput = document.querySelector(".search input");

searchInput.addEventListener("keyup", () => {

    const value = searchInput.value.toLowerCase();

    const friends = document.querySelectorAll(".friend");

    friends.forEach(friend => {

        const name = friend
            .querySelector("h4")
            .textContent
            .toLowerCase();

        if (name.includes(value)) {

            friend.style.display = "flex";

        }

        else {

            friend.style.display = "none";

        }

    });

});


const chatBody = document.querySelector(".chat-body");


sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keypress", function (e) {

    if (e.key === "Enter") {

        sendMessage();
        loadMessages();

    }

});


setInterval(() => {

    if (currentUser) {

        loadUsers();

    }

}, 90000);


const logoutBtn = document.getElementById("logoutBtn");
const logoutPopup = document.getElementById("logoutPopup");
const cancelLogout = document.getElementById("cancelLogout");
const confirmLogout = document.getElementById("confirmLogout");

// Open popup
logoutBtn.addEventListener("click", () => {

    logoutPopup.style.display = "flex";

});

// Cancel logout
cancelLogout.addEventListener("click", () => {

    logoutPopup.style.display = "none";

});

// Confirm logout
confirmLogout.addEventListener("click", async () => {

    try {

        const response = await fetch(API_URL + "/api/auth/logout", {

            method: "POST",

            headers: {

                Authorization: "Bearer " + token

            }

        });

        const data = await response.json();

        if (data.success) {

            localStorage.removeItem("token");

            logoutPopup.style.display = "none";

            window.location.href = "login.html";

        }

        else {

            alert(data.message);

        }

    }

    catch (err) {

        console.log(err);

        alert("Server Error");

    }

});

loadCurrentUser();
