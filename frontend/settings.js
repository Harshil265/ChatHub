const token = localStorage.getItem("token");
const API_URL = "https://chat-app-uiip.onrender.com";

if (!token) {

    window.location.href = "login.html";

}

let user = null;
let currentAction = "";

const profilePic = document.getElementById("profilePic");
const profileInput = document.getElementById("profileInput");

const changePhotoBtn = document.getElementById("changePhotoBtn");


const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const userMobile = document.getElementById("userMobile");

const editPanel = document.getElementById("editPanel");
const editTitle = document.getElementById("editTitle");
const currentValue = document.getElementById("currentValue");
const newValue = document.getElementById("newValue");

const saveBtn = document.getElementById("saveBtn");

loadCurrentUser();

async function loadCurrentUser() {

    try {

        const response = await fetch(
            API_URL + "/api/users/me",
            {

                headers: {

                    Authorization: "Bearer " + token

                }

            }
        );

        const data = await response.json();

        if (!data.success) {

            localStorage.removeItem("token");

            window.location.href = "login.html";

            return;

        }

        user = data.user;

        refreshProfile();

    }

    catch (err) {

        console.log(err);

        alert("Unable to load profile.");

    }

}

function refreshProfile() {

    userName.textContent = user.name;

    userEmail.textContent = user.email;

    userMobile.textContent = user.mobile;

    if (user.profilePic && user.profilePic.trim() !== "") {

        profilePic.src = user.profilePic;

    }
    else {

        profilePic.src = "https://i.pravatar.cc/150?u=" + user.email;

    }

}

document.getElementById("changePhotoBtn").onclick = () => {

    profileInput.click();

};

profileInput.addEventListener("change", async () => {

    const file = profileInput.files[0];

    if (!file) {
        return;
    }

    // Show preview immediately
    profilePic.src = URL.createObjectURL(file);

    const formData = new FormData();

    formData.append("profilePic", file);

    try {

        const response = await fetch(
            API_URL + "/api/users/upload-profile",
            {
                method: "POST",

                headers: {
                    Authorization: "Bearer " + token
                },

                body: formData
            }
        );

        const contentType =
            response.headers.get("content-type");

        // Check if server returned JSON
        if (
            !contentType ||
            !contentType.includes("application/json")
        ) {

            const errorText =
                await response.text();

            console.error(
                "SERVER ERROR:",
                errorText
            );

            throw new Error(
                "Server returned non-JSON response. Status: " +
                response.status
            );

        }

        const data =
            await response.json();

        if (data.success) {

            // Cloudinary URL from backend
            profilePic.src =
                data.profilePic;

            alert(
                "✅ Profile Picture Updated"
            );

        } else {

            alert(
                data.message ||
                "Upload failed"
            );

        }

    }

    catch (error) {

        console.error(
            "UPLOAD ERROR:",
            error
        );

        alert(
            "❌ Upload Failed"
        );

    }

});

document.getElementById("changeNameBtn").onclick = () => {

    if (!user) return;

    editPanel.style.display = "block";

    currentAction = "name";

    editTitle.textContent = "Change Name";

    currentValue.textContent = "Current Name : " + user.name;

    newValue.type = "text";

    newValue.value = "";

    newValue.placeholder = "Enter New Name";

};

document.getElementById("changeEmailBtn").onclick = () => {

    if (!user) return;

    editPanel.style.display = "block";

    currentAction = "email";

    editTitle.textContent = "Change Email";

    currentValue.textContent = "Current Email : " + user.email;

    newValue.type = "email";

    newValue.value = "";

    newValue.placeholder = "Enter New Email";

};

document.getElementById("changeMobileBtn").onclick = () => {

    if (!user) return;

    editPanel.style.display = "block";

    currentAction = "mobile";

    editTitle.textContent = "Change Mobile Number";

    currentValue.textContent = "Current Mobile : " + user.mobile;

    newValue.type = "text";

    newValue.value = "";

    newValue.placeholder = "Enter New Mobile Number";

};

document.getElementById("changePasswordBtn").onclick = () => {

    editPanel.style.display = "block";

    currentAction = "password";

    editTitle.textContent = "Change Password";

    currentValue.textContent = "";

    newValue.type = "password";

    newValue.value = "";

    newValue.placeholder = "Enter New Password";

};

saveBtn.onclick = () => {

    const value = newValue.value.trim();

    if (value === "") {

        alert("Please enter a value.");

        return;

    }

    updateProfile(currentAction, value);

};

document.getElementById("backBtn").onclick = () => {

    window.location.href = "index.html";

};

async function updateProfile(field, value) {

    try {

        const response = await fetch
            (API_URL + "/api/users/update-profile",
                {

                    method: "PUT",

                    headers: {

                        "Content-Type": "application/json",

                        Authorization: "Bearer " + token

                    },

                    body: JSON.stringify({

                        field,

                        value

                    })

                }

            );

        const data = await response.json();

        if (!data.success) {

            alert(data.message);

            return;

        }

        user = data.user;

        refreshProfile();

        editPanel.style.display = "none";

        newValue.value = "";

        alert(data.message);

    }

    catch (err) {

        console.log(err);

        alert("Server Error");

    }

}
