document.addEventListener("DOMContentLoaded", () => {
  const switchButton = document.getElementById("switchButton");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  switchButton.addEventListener("click", () => {
    if (loginForm.style.display === "none") {
      loginForm.style.display = "block";
      signupForm.style.display = "none";
      switchButton.textContent = "Don't have an account? Sign up";
    } else {
      loginForm.style.display = "none";
      signupForm.style.display = "block";
      switchButton.textContent = "Already have an account? Sign in";
    }
  });
});
