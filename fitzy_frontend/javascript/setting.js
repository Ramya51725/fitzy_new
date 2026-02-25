import API_BASE_URL from "./config.js";

document.addEventListener("DOMContentLoaded", () => {

  const userId = localStorage.getItem("user_id");

  if (!userId) {
    alert("Please login first");
    window.location.href = "sign_in.html";
    return;
  }

  fetch(`${API_BASE_URL}/users/${userId}`)
    .then(res => {
      if (res.status === 404) {
        throw new Error("User not found");
      }
      return res.json();
    })
    .then(data => {
      document.getElementById("userName").innerText = data.name;
      document.getElementById("userAge").innerText = data.age;
      document.getElementById("userHeight").innerText = data.height + " cm";
      document.getElementById("userWeight").innerText = data.weight + " kg";
      document.getElementById("userCategory").innerText = data.category;
      document.getElementById("userBMI").innerText = data.bmi.toFixed(2);
      document.getElementById("bmiValue").innerText = data.bmi.toFixed(2);
    })
    .catch(err => {
      console.error(err);
      alert("Unable to load user details. Please refresh.");
    });


  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {

      const confirmDelete = confirm(
        "Your account will be deleted permanently. Continue?"
      );

      if (!confirmDelete) return;

      fetch(`${API_BASE_URL}/users/delete/${userId}`, {
        method: "DELETE"
      })
        .then(res => {
          if (!res.ok) {
            throw new Error("Delete failed");
          }
          return res.json();
        })
        .then(() => {
          localStorage.clear();
          alert("Account deleted successfully");
          window.location.href = "../../index.html";
        })
        .catch(err => {
          console.error("DELETE ERROR:", err);
          alert("Account deletion failed. Please try again.");
        });
    });
  }

});




