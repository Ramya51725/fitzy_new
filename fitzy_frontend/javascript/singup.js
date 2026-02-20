document.getElementById("signupForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const age = parseInt(document.getElementById("age").value);
    const height = parseFloat(document.getElementById("height").value);
    const weight = parseFloat(document.getElementById("weight").value);
    const email = document.getElementById("email").value;
    const password = document.getElementById("pass").value;
    const gender = document.querySelector('input[name="gender"]:checked')?.id;

    fetch("http://127.0.0.1:8000/users/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, age, height, weight, email, password, gender })
    })
    .then(res => res.json())
    .then(data => {
        redirectByCategory(data.category_id);
    })
    .catch(err => alert("Signup error"));
});
function redirectByCategory(categoryId) {
    if (categoryId === 1) {
        window.location.href = "../html/home.html";
    } 
    else if (categoryId === 2) {
        window.location.href = "../html/normal/normal_home.html";
    } 
    else if (categoryId === 3) {
        window.location.href = "../html/overweight/overweight.html";
    } 
    else {
        alert("Category not found");
    }
}



localStorage.setItem("category_id", data.category_id);
localStorage.setItem("level", "beginner");