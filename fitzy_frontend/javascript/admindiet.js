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

async function fetchExistingDiet() {
  const day = dayInput.value;
  const dietType = dietTypeSelect.value;
  const categoryId = categorySelect.value;

  if (!day || !dietType || !categoryId) {
    breakfastInput.value = "";
    lunchInput.value = "";
    dinnerInput.value = "";
    currentDietId = null;
    submitBtn.innerText = "Post New Diet";
    return;
  }

  if (Number(day) > 30) {
    alert("Invalid day! Day must be between 1 and 30.");
    dayInput.value = "";
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
      submitBtn.innerText = "Update Existing Diet";
      console.log("Existing diet loaded:", diet);
    } else {
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

dayInput.addEventListener("input", fetchExistingDiet);
dietTypeSelect.addEventListener("change", fetchExistingDiet);
categorySelect.addEventListener("change", fetchExistingDiet);

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const dietType = dietTypeSelect.value;
  const dayValue = Number(dayInput.value);

  if (dayValue > 30 || dayValue < 1) {
    alert("Invalid day! Diet plan is only for 30 days.");
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
  let method = "POST";

  if (currentDietId) {
    method = "PUT";
    if (dietType === "veg") {
      url = `${API_BASE_URL}/veg/update/${currentDietId}`;
    } else {
      url = `${API_BASE_URL}/nonveg/update/${currentDietId}`;
    }
  } else {
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

    fetchExistingDiet();

  } catch (error) {
    console.error("Submission error:", error);
    alert("Operation failed. Check console.");
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
