const toggle = document.getElementById("toggle");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");

// Show / Hide Password
toggle.addEventListener("click", () => {

    if (password.type === "password") {
        password.type = "text";
        toggle.textContent = "🙈";
    } else {
        password.type = "password";
        toggle.textContent = "👁️";
    }

});

// Login Button
loginBtn.addEventListener("click", login);

async function login() {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (email === "" || password === "") {
        alert("Please enter email and password.");
        return;
    }

    try {

        const response = await fetch("https://chat-app-uiip.onrender.com
/api/auth/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                password
            })

        });

        const data = await response.json();

        if (data.success) {

            localStorage.setItem("token", data.token);

            alert(data.message);

            window.location.href = "index.html";

        } else {

            alert(data.message);

        }

    } catch (error) {

        console.error(error);

        alert("Unable to connect to server.");

    }

}
