
    let selectedDay = 1;
    let foodType = "veg";

    // GET category_id from login
    const rawCategoryId = localStorage.getItem("category_id");

    if (!rawCategoryId) {
      alert("Category not found. Please login again.");
      console.error("category_id missing in localStorage");
    }

    const categoryId = Number(rawCategoryId);
    console.log("Category ID:", categoryId);

    function selectDay(day) {
      selectedDay = day;
      loadDiet();
    }

    function setFoodType(type) {
      foodType = type;
      loadDiet();
    }

    function loadDiet() {
      let url = "";

      if (foodType === "veg") {
        url = "http://127.0.0.1:8000/veg/diet";
      } else {
        url = "http://127.0.0.1:8000/nonveg/diet";
      }

      console.log("Fetching:", url);

      fetch(url)
        .then(res => res.json())
        .then(data => {
          const diet = data.find(d =>
            Number(d.category_id) === categoryId &&
            Number(d.day) === selectedDay
          );

          if (!diet) {
            document.getElementById("breakfast").innerText = "No data";
            document.getElementById("lunch").innerText = "No data";
            document.getElementById("dinner").innerText = "No data";
            return;
          }

          document.getElementById("breakfast").innerText = diet.breakfast;
          document.getElementById("lunch").innerText = diet.lunch;
          document.getElementById("dinner").innerText = diet.dinner;
        })
        .catch(err => console.error(err));
    }

    // LOAD DEFAULT (Day 1, Veg)
    loadDiet();
