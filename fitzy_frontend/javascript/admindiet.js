import API_BASE_URL from "./config.js";

const form = document.getElementById("dietForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const dietType = document.getElementById("dietType").value;

  const dietData = {
    day: Number(document.getElementById("day").value),
    breakfast: document.getElementById("breakfast").value.trim(),
    lunch: document.getElementById("lunch").value.trim(),
    dinner: document.getElementById("dinner").value.trim(),
    category_id: Number(document.getElementById("category").value)
  };

  let url = "";

  if (dietType === "veg") {
    url = `${API_BASE_URL}/veg/diet`;
  } else if (dietType === "nonveg") {
    url = `${API_BASE_URL}/nonveg/nonveg`;
  } else {
    alert("Please select Diet Type");
    return;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dietData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error:", errorText);
      alert("Failed to add diet. Check console.");
      return;
    }

    const result = await response.json();
    console.log("Success:", result);

    alert("Diet added successfully!");
    form.reset();

  } catch (error) {
    console.error("Network/JS error:", error);
    alert("Error adding diet. Check console.");
  }
});


document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "../../index.html";
  });
});


// import API_BASE_URL from "./config.js";

// const token = localStorage.getItem("token");

// if (!token) {
//   alert("Session expired. Please login again.");
//   window.location.href = "../../index.html";
// }

// const form = document.getElementById("dietForm");

// form.addEventListener("submit", async (e) => {
//   e.preventDefault();

//   const dietType = document.getElementById("dietType").value;

//   const dietData = {
//     day: Number(document.getElementById("day").value),
//     breakfast: document.getElementById("breakfast").value.trim(),
//     lunch: document.getElementById("lunch").value.trim(),
//     dinner: document.getElementById("dinner").value.trim(),
//     category_id: Number(document.getElementById("category").value)
//   };

//   let url = "";

//   if (dietType === "veg") {
//     url = `${API_BASE_URL}/veg/diet`;
//   } else if (dietType === "nonveg") {
//     url = `${API_BASE_URL}/nonveg/nonveg`;
//   } else {
//     alert("Please select Diet Type");
//     return;
//   }

//   try {
//     const response = await fetch(url, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${token}`  
//       },
//       body: JSON.stringify(dietData)
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error(" Backend error:", errorText);
//       alert("Failed to add diet. Check console.");
//       return;
//     }

//     const result = await response.json();
//     console.log(" Success:", result);

//     alert(" Diet added successfully!");
//     form.reset();

//   } catch (error) {
//     console.error(" Network/JS error:", error);
//     alert(" Error adding diet. Check console.");
//   }
// });

// document.addEventListener("DOMContentLoaded", () => {
//   const logoutBtn = document.getElementById("logoutBtn");

//   if (!logoutBtn) return;

//   logoutBtn.addEventListener("click", () => {
//     localStorage.clear();
//     sessionStorage.clear();
//     window.location.href = "../../index.html";
//   });
// });





