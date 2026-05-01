let currentIndex = -1;

function getRandomIndex() {
  if (books.length === 1) return 0;
  let next;
  do {
    next = Math.floor(Math.random() * books.length);
  } while (next === currentIndex);
  return next;
}

function showRandom() {
  currentIndex = getRandomIndex();

  const book = books[currentIndex];
  const card = document.getElementById("book-card");

  card.classList.remove("fade-in");
  void card.offsetWidth;
  card.classList.add("fade-in");

  document.getElementById("book-title").textContent = book.title;
  document.getElementById("book-author").textContent = `著者: ${book.author}`;
  document.getElementById("book-year").textContent = `${book.year}年`;
  document.getElementById("book-category").textContent = book.category;
  document.getElementById("book-summary").textContent = book.summary;
  document.getElementById("book-takeaway").textContent = book.takeaway;

  const pointsList = document.getElementById("book-points");
  pointsList.innerHTML = "";
  book.points.forEach((point) => {
    const li = document.createElement("li");
    li.textContent = point;
    pointsList.appendChild(li);
  });

  document.getElementById("counter").textContent =
    `全 ${books.length} 冊収録`;
}

document.addEventListener("DOMContentLoaded", () => {
  showRandom();
});
