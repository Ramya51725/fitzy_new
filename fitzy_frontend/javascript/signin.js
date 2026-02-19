import API_BASE_URL from "./config.js";

document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("signinForm");
  const messageEl = document.getElementById("message");

  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    messageEl.innerText = "";

    const formData = new FormData(form);

    const email = formData.get("email")?.trim().toLowerCase();
    const password = formData.get("password");

    if (!email || !password) {
      messageEl.innerText = "Email and password are required";
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {

        // ✅ Handle FastAPI validation errors properly
        if (Array.isArray(data.detail)) {
          const errorMsg = data.detail.map(err => err.msg).join(", ");
          throw new Error(errorMsg);
        }

        throw new Error(data.detail || "Invalid email or password");
      }

      // ✅ Clear old storage
      localStorage.clear();

      // ✅ Store required data (NO TOKEN)
      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("category_id", data.category_id);
      localStorage.setItem("name", data.name || "");
      localStorage.setItem("level", "level1");

      // ✅ Redirect
      if (email === "admin@gmail.com") {
        window.location.href = "../html/admin.html";
      } else {
        window.location.href = "../html/landing/beginner.html";
      }

    } catch (err) {
      console.error("Login Error Details:", err);
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
         messageEl.innerText = "Cannot connect to server. Make sure backend is running on http://127.0.0.1:8000";
      } else {
         messageEl.innerText = err.message || "Login failed. Try again.";
      }
    }
  });

});



// import API_BASE_URL from "./config.js";

// document.addEventListener("DOMContentLoaded", () => {

//   const form = document.getElementById("signinForm");
//   const messageEl = document.getElementById("message");

//   if (!form) return;

//   form.addEventListener("submit", async function (e) {
//     e.preventDefault();
//     messageEl.innerText = "";

//     const formData = new FormData(form);

//     const email = formData.get("email")?.trim().toLowerCase();
//     const password = formData.get("password");

//     if (!email || !password) {
//       messageEl.innerText = "Email and password are required";
//       return;
//     }


//     try {
//       const res = await fetch(`${API_BASE_URL}/users/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password })
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.detail || "Invalid email or password");
//       }

//       localStorage.clear();
//       localStorage.setItem("token", data.access_token);
//       localStorage.setItem("user_id", data.user_id);
//       localStorage.setItem("category_id", data.category_id);
//       localStorage.setItem("name", data.name || "");
//       localStorage.setItem("level", "level1");

//       if (email === "admin@gmail.com") {
//         window.location.href = "../html/admin.html";
//       } else {
//         window.location.href = "../html/landing/beginner.html";
//       }
      
//     } catch (err) {
//       console.error("Login error:", err);
//       messageEl.innerText = err.message || "Login failed. Try again.";
//     }
//   });

// });




