import API_BASE_URL from "./config.js";

const form = document.getElementById("exerciseForm");

function showMessage(text) {
  const msgDiv = document.getElementById("statusMessage");
  if (!msgDiv) return;

  msgDiv.innerHTML = text;  
  msgDiv.style.display = "block";

  setTimeout(() => {
    msgDiv.style.display = "none";
  }, 3000);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();

  const imageFile = document.getElementById("image").files[0];
  const videoFile = document.getElementById("video").files[0];

  if (!imageFile || !videoFile) {
    showMessage("Please select both image and video")
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
    showMessage(`
      <i class="fa-solid fa-circle-check" 
        style="color: green; margin-right: 6px;">
      </i>
      Exercise added successfully!
    `);    
    form.reset();

  } catch (err) {
    console.error(err);
    showMessage(`
      <i class="fa-solid fa-circle-xmark" 
        style="color: red; margin-right: 6px;">
      </i>
      Network error while uploading exercise
    `);   
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



document.addEventListener("DOMContentLoaded", () => {

  const deleteBtn = document.getElementById("deleteExerciseBtn");

  if (!deleteBtn) return;

  deleteBtn.addEventListener("click", async () => {

    console.log("CLICKED ✅");

    const level = document.getElementById("level").value;
    const category = document.getElementById("category").value;
    const title = document.getElementById("title").value.trim();

    if (!level || !category || !title) {
      alert("Please select Level, Category and enter Title");
      return;
    }

    const confirmDelete = confirm(
      `Are you sure you want to delete "${title}" from ${level}?`
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_BASE_URL}/exercise/delete`, {
        method: "DELETE",  // 🔥 FIXED
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          level,
          category_id: Number(category),
          title
        })
      });

      const data = await response.json();
      console.log("Response:", data);

      if (!response.ok) {
        alert(data.detail || "Delete failed");
        return;
      }

      alert("Exercise deleted successfully ✅");
      document.getElementById("exerciseForm").reset();

    } catch (error) {
      console.error("Delete error:", error);
      alert("Network error ❌");
    }
  });
});