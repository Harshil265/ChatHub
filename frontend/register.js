const toggle = document.getElementById("toggle");
const password = document.getElementById("password");
const registerBtn = document.getElementById("registerBtn");

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

// Register Button
registerBtn.addEventListener("click", register);

async function register() {

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const password = document.getElementById("password").value.trim();

    if (name === "" || email === "" || mobile === "" || password === "") {
        alert("Please fill all fields.");
        return;
    }

    const user = {
        name,
        email,
        mobile,
        password
    };

    try {

        const response = await fetch("http://localhost:5000/api/auth/register", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(user)

        });

        const data = await response.json();

        if (data.success) {

            alert(data.message);

            window.location.href = "login.html";

        } else {

            alert(data.message);

        }

    } catch (error) {

        console.error(error);

        alert("Unable to connect to server.");

    }

}