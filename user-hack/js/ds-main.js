// User data - in a real app this would come from an API/database
const userData = {
  name: "John Doe",
  bottlesRecycled: 750,
  monthlyGoal: 1000,
  totalPoints: 2500,
};

// Achievement levels configuration
const levels = [
  { name: "Bronze", threshold: 0, color: "#92400e" },
  { name: "Silver", threshold: 250, color: "#9ca3af" },
  { name: "Gold", threshold: 500, color: "#eab308" },
  { name: "Platinum", threshold: 750, color: "#94a3b8" },
  { name: "Diamond", threshold: 1000, color: "#2563eb" },
];

// Calculate achievement level and progress
function calculateAchievementLevel(bottlesRecycled) {
  let currentLevel = levels[0];
  let nextLevel = levels[1];
  let progress = 0;

  for (let i = 0; i < levels.length - 1; i++) {
    if (
      bottlesRecycled >= levels[i].threshold &&
      bottlesRecycled < levels[i + 1].threshold
    ) {
      currentLevel = levels[i];
      nextLevel = levels[i + 1];
      progress =
        ((bottlesRecycled - levels[i].threshold) /
          (levels[i + 1].threshold - levels[i].threshold)) *
        100;
      break;
    }
  }

  if (bottlesRecycled >= levels[levels.length - 1].threshold) {
    currentLevel = levels[levels.length - 1];
    nextLevel = {
      name: "Max Level",
      threshold: levels[levels.length - 1].threshold,
    };
    progress = 100;
  }

  return {
    currentLevel,
    nextLevel,
    progress: Math.round(progress),
  };
}

// Initialize Lucide icons
function initializeIcons() {
  lucide.createIcons();
}

// Update dashboard with user data
function updateDashboard() {
  // Update user info
  document.getElementById("userName").textContent = userData.name;
  document.getElementById("bottlesRecycled").textContent =
    userData.bottlesRecycled;
  document.getElementById("monthlyGoal").textContent = userData.monthlyGoal;
  document.getElementById("totalPoints").textContent = userData.totalPoints;

  // Calculate and update level info
  const { currentLevel, nextLevel, progress } = calculateAchievementLevel(
    userData.bottlesRecycled
  );

  document.getElementById("currentLevel").textContent = currentLevel.name;
  document.getElementById("nextLevel").textContent = `Next: ${nextLevel.name}`;

  // Update progress bar
  const progressFill = document.getElementById("progressFill");
  progressFill.style.width = `${progress}%`;

  document.getElementById("progressCurrentLevel").textContent =
    currentLevel.name;
  document.getElementById(
    "progressPercent"
  ).textContent = `${progress}% Complete`;
  document.getElementById("progressNextLevel").textContent = nextLevel.name;

  // Create achievement badges
  const badgesGrid = document.getElementById("badgesGrid");
  badgesGrid.innerHTML = ""; // Clear existing badges

  levels.slice(0, -1).forEach((level, index) => {
    const isActive = userData.bottlesRecycled >= level.threshold;
    const badgeHtml = `
        <div class="badge-card ${isActive ? "" : "inactive"}">
          <i data-lucide="trophy" class="badge-icon" style="color: ${
            level.color
          }"></i>
          <h3>${level.name}</h3>
          <p>${level.threshold} bottles</p>
        </div>
      `;
    badgesGrid.insertAdjacentHTML("beforeend", badgeHtml);
  });

  // Reinitialize icons for new badges
  initializeIcons();
}

// Initialize dashboard when the page loads
document.addEventListener("DOMContentLoaded", () => {
  initializeIcons();
  updateDashboard();
});
