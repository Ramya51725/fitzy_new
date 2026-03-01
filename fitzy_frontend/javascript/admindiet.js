import API_BASE_URL from "./config.js";

const form = document.getElementById("dietForm");
const dayInput = document.getElementById("day");
const dietTypeSelect = document.getElementById("dietType");
const categorySelect = document.getElementById("category");
const breakfastInput = document.getElementById("breakfast");
const lunchInput = document.getElementById("lunch");
const dinnerInput = document.getElementById("dinner");
const submitBtn = document.getElementById("submitBtn");

let currentDietId = null;

function showMessage(text) {
  const msgDiv = document.getElementById("statusMessage");
  if (!msgDiv) return;

  msgDiv.innerText = text;
  msgDiv.style.display = "block";

  setTimeout(() => {
    msgDiv.style.display = "none";
  }, 3000);
}

async function fetchExistingDiet() {
  const day = dayInput.value;
  const dietType = dietTypeSelect.value;
  const categoryId = categorySelect.value;

  if (!day || !dietType || !categoryId) {
    breakfastInput.value = "";
    lunchInput.value = "";
    dinnerInput.value = "";
    currentDietId = null;
    submitBtn.disabled = true;
    return;
  }

  if (Number(day) > 30 || Number(day) < 1) {
    showMessage("Invalid day! Diet plan is only for 30 days");
    dayInput.value = "";
    submitBtn.disabled = true;
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

    if (data && data.length > 0) {
      const diet = data[0];

      breakfastInput.value = diet.breakfast || "";
      lunchInput.value = diet.lunch || "";
      dinnerInput.value = diet.dinner || "";

      currentDietId = diet.diet_id;
      submitBtn.disabled = false;

      showMessage("Diet loaded successfully. You can edit now.");
    } else {
      breakfastInput.value = "";
      lunchInput.value = "";
      dinnerInput.value = "";
      currentDietId = null;
      submitBtn.disabled = true;

      showMessage("No diet found. Only existing diet can be edited.");
    }
  } catch (error) {
    console.error("Fetch error:", error);
    showMessage("Failed to load diet. Check console.");
  }
}

dayInput.addEventListener("input", fetchExistingDiet);
dietTypeSelect.addEventListener("change", fetchExistingDiet);
categorySelect.addEventListener("change", fetchExistingDiet);

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!currentDietId) {
    showMessage("Cannot create new diet. Only editing is allowed.");
    return;
  }

  const dietType = dietTypeSelect.value;
  const dayValue = Number(dayInput.value);

  if (dayValue > 30 || dayValue < 1) {
    showMessage("Invalid day! Diet plan is only for 30 days");
    return;
  }

  const dietData = {
    day: dayValue,
    breakfast: breakfastInput.value.trim(),
    lunch: lunchInput.value.trim(),
    dinner: dinnerInput.value.trim(),
    category_id: Number(categorySelect.value)
  };

  let url = "";

  if (dietType === "veg") {
    url = `${API_BASE_URL}/veg/update/${currentDietId}`;
  } else {
    url = `${API_BASE_URL}/nonveg/update/${currentDietId}`;
  }

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dietData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    showMessage("Diet updated successfully!");
    fetchExistingDiet();

  } catch (error) {
    console.error("Update error:", error);
    showMessage("Update failed. Check console.");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "../../index.html";
    });
  }
});

