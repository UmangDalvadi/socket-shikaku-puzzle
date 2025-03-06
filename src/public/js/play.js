document.addEventListener("DOMContentLoaded", () => {
  let selectedSize = 5; // Default size

  // Handle grid size selection
  document.querySelectorAll(".size-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      selectedSize = parseInt(e.target.getAttribute("data-size"));

      // Highlight selected button
      //   document.querySelectorAll(".size-btn").forEach((b) => {
      //     b.classList.remove("bg-blue-700");
      //   });
      e.target.classList.add("bg-gray-400");
    });
  });

  // Handle play button click
  document.getElementById("playButton").addEventListener("click", () => {
    window.location.href = `/play-ground?size=${selectedSize}`;
  });
});
