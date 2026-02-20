import API_BASE_URL from "./config.js";

const form = document.getElementById("dietForm");
const dayInput = document.getElementById("day");
const dietTypeSelect = document.getElementById("dietType");
const categorySelect = document.getElementById("category");
const breakfastInput = document.getElementById("breakfast");
const lunchInput = document.getElementById("lunch");
const dinnerInput = document.getElementById("dinner");
const submitBtn = document.getElementById("submitBtn");

let currentDietId = null; // Stores ID if diet exists

// --- FETCH DIET LOGIC ---
async function fetchExistingDiet() {
  const day = dayInput.value;
  const dietType = dietTypeSelect.value;
  const categoryId = categorySelect.value;

  // Clear fields if inputs are incomplete
  if (!day || !dietType || !categoryId) {
    breakfastInput.value = "";
    lunchInput.value = "";
    dinnerInput.value = "";
    currentDietId = null;
    submitBtn.innerText = "Post Diet";
    return;
  }

  let url = "";
  if (dietType === "veg") {
    url = `${API_BASE_URL}/veg/diet/by-category-day?category_id=${categoryId}&day=${day}`;
  } else {
    url = `${API_BASE_URL}/nonveg/diet/by-category-day?category_id=${categoryId}&day=${day}`;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch");

    const data = await response.json();

    // Check if diet exists (Backend returns an array for this endpoint)
    if (data && data.length > 0) {
      const diet = data[0];
      breakfastInput.value = diet.breakfast || "";
      lunchInput.value = diet.lunch || "";
      dinnerInput.value = diet.dinner || "";
      currentDietId = diet.diet_id;
      submitBtn.innerText = "Update Diet";
      console.log("Existing diet loaded:", diet);
    } else {
      // No existing diet found
      breakfastInput.value = "";
      lunchInput.value = "";
      dinnerInput.value = "";
      currentDietId = null;
      submitBtn.innerText = "Post New Diet";
      console.log("No existing diet found for this combination.");
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

// Add event listeners to trigger auto-fetch
dayInput.addEventListener("input", fetchExistingDiet);
dietTypeSelect.addEventListener("change", fetchExistingDiet);
categorySelect.addEventListener("change", fetchExistingDiet);

// --- SUBMIT (POST or PUT) LOGIC ---
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const dietType = dietTypeSelect.value;
  const dietData = {
    day: Number(dayInput.value),
    breakfast: breakfastInput.value.trim(),
    lunch: lunchInput.value.trim(),
    dinner: dinnerInput.value.trim(),
    category_id: Number(categorySelect.value)
  };

  let url = "";
  let method = "POST";

  if (currentDietId) {
    // UPDATE mode
    method = "PUT";
    if (dietType === "veg") {
      url = `${API_BASE_URL}/veg/update/${currentDietId}`;
    } else {
      url = `${API_BASE_URL}/nonveg/update/${currentDietId}`;
    }
  } else {
    // POST mode
    if (dietType === "veg") {
      url = `${API_BASE_URL}/veg/diet`;
    } else {
      url = `${API_BASE_URL}/nonveg/nonveg`;
    }
  }

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dietData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const result = await response.json();
    alert(currentDietId ? "Diet updated successfully!" : "Diet added successfully!");

    // Refresh the view
    fetchExistingDiet();

  } catch (error) {
    console.error("Submission error:", error);
    alert("Operation failed. Check console.");
  }
});

// Logout logic
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "../../index.html";
    });
  }
});
