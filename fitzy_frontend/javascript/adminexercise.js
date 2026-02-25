import API_BASE_URL from "./config.js";

const form = document.getElementById("exerciseForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();

  const imageFile = document.getElementById("image").files[0];
  const videoFile = document.getElementById("video").files[0];

  if (!imageFile || !videoFile) {
    alert("Please select both image and video");
    return;
  }

  formData.append("level", document.getElementById("level").value);
  formData.append("category_id", document.getElementById("category").value);
  formData.append("title", document.getElementById("title").value);
  formData.append("instruction", document.getElementById("instruction").value);
  formData.append("breathing_tip", document.getElementById("breathing").value);
  formData.append("focus_area", document.getElementById("focus").value);

  formData.append("exercise_image", imageFile);
  formData.append("exercise_video", videoFile);

  try {
    const res = await fetch(`${API_BASE_URL}/exercise/create`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Backend error:", data);
      alert("Error: " + JSON.stringify(data));
      return;
    }

    alert("✅ Exercise added successfully!");
    form.reset();

  } catch (err) {
    console.error(err);
    alert("❌ Network error while uploading exercise");
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



