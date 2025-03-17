const book = document.querySelector(".section-book");
document.querySelector(".btn").addEventListener("click", function () {
  book.scrollIntoView({ behavior: "smooth" });
});
