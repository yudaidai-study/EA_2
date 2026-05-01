let currentIndex = -1;
let currentQuestion = null;
let quizScore = { correct: 0, total: 0 };

// ---- モード切替 ----

function switchMode(mode) {
  ['random', 'list', 'quiz'].forEach(m => {
    document.getElementById(`mode-${m}`).classList.toggle('hidden', m !== mode);
    document.getElementById(`tab-${m}`).classList.toggle('active', m === mode);
  });
  if (mode === 'list') renderList();
  if (mode === 'quiz') startQuiz();
}

// ---- ランダムモード ----

function getRandomIndex() {
  if (books.length === 1) return 0;
  let next;
  do { next = Math.floor(Math.random() * books.length); } while (next === currentIndex);
  return next;
}

function showRandom() {
  currentIndex = getRandomIndex();
  const book = books[currentIndex];
  const card = document.getElementById('book-card');
  card.classList.remove('fade-in');
  void card.offsetWidth;
  card.classList.add('fade-in');

  document.getElementById('book-title').textContent = book.title;
  document.getElementById('book-author').textContent = `著者: ${book.author}`;
  document.getElementById('book-year').textContent = `${book.year}年`;
  document.getElementById('book-category').textContent = book.category;
  document.getElementById('book-summary').textContent = book.summary;
  document.getElementById('book-takeaway').textContent = book.takeaway;

  const pointsList = document.getElementById('book-points');
  pointsList.innerHTML = '';
  book.points.forEach(point => {
    const li = document.createElement('li');
    li.textContent = point;
    pointsList.appendChild(li);
  });

  document.getElementById('counter').textContent = `全 ${books.length} 冊収録`;
}

// ---- 一覧モード ----

function renderList() {
  document.getElementById('list-counter').textContent = `全 ${books.length} 冊収録`;
  const container = document.getElementById('book-list');
  container.innerHTML = '';
  books.forEach((book, index) => {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `
      <div class="list-item-header" onclick="toggleListItem(${index})">
        <div class="list-item-info">
          <span class="category">${book.category}</span>
          <span class="list-item-title">${book.title}</span>
          <span class="list-item-author">${book.author}（${book.year}年）</span>
        </div>
        <span class="list-item-arrow" id="arrow-${index}">▸</span>
      </div>
      <div class="list-item-detail hidden" id="detail-${index}">
        <div class="divider"></div>
        <h3 class="section-label">概要</h3>
        <p class="summary">${book.summary}</p>
        <h3 class="section-label">主なポイント</h3>
        <ul class="points">${book.points.map(p => `<li>${p}</li>`).join('')}</ul>
        <h3 class="section-label">この本から学べること</h3>
        <p class="takeaway">${book.takeaway}</p>
      </div>
    `;
    container.appendChild(item);
  });
}

function toggleListItem(index) {
  const detail = document.getElementById(`detail-${index}`);
  const arrow = document.getElementById(`arrow-${index}`);
  const opening = detail.classList.contains('hidden');
  detail.classList.toggle('hidden', !opening);
  arrow.textContent = opening ? '▾' : '▸';
}

// ---- クイズモード ----

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function startQuiz() {
  quizScore = { correct: 0, total: 0 };
  updateQuizScore();
  nextQuestion();
}

function updateQuizScore() {
  const el = document.getElementById('quiz-score');
  el.textContent = quizScore.total === 0
    ? `全 ${books.length} 冊から出題`
    : `${quizScore.correct} / ${quizScore.total} 正解`;
}

function generateQuestion() {
  const types = ['takeaway', 'keyword', 'fromBook'];
  const type = types[Math.floor(Math.random() * types.length)];
  const idx = Math.floor(Math.random() * books.length);
  const book = books[idx];
  const others = shuffle(books.filter((_, i) => i !== idx)).slice(0, 3);

  if (type === 'takeaway') {
    return {
      question: `「${book.title}」（${book.author}）\n著者が最も伝えたいメッセージはどれ？`,
      options: shuffle([book.takeaway, ...others.map(b => b.takeaway)]),
      correct: book.takeaway,
      explanation: null,
    };
  }

  const point = book.points[Math.floor(Math.random() * book.points.length)];
  const parts = point.split(/\s*—\s*/);
  const keyword = parts[0].trim();
  const description = parts.slice(1).join(' — ').trim();

  if (type === 'keyword') {
    const wrongKeywords = others.map(b => {
      const p = b.points[Math.floor(Math.random() * b.points.length)];
      return p.split(/\s*—\s*/)[0].trim();
    });
    return {
      question: `「${book.title}」（${book.author}）\nに登場するキーワードはどれ？`,
      options: shuffle([keyword, ...wrongKeywords]),
      correct: keyword,
      explanation: description ? `「${keyword}」：${description}` : null,
    };
  }

  // fromBook: キーワードからどの本か当てる
  return {
    question: `「${keyword}」という概念が登場するのはどの本？`,
    options: shuffle([book.title, ...others.map(b => b.title)]),
    correct: book.title,
    explanation: `「${keyword}」は「${book.title}」（${book.author}）の概念です`,
  };
}

function nextQuestion() {
  document.getElementById('quiz-feedback').classList.add('hidden');
  document.getElementById('quiz-next').classList.add('hidden');

  currentQuestion = generateQuestion();
  document.getElementById('quiz-question').textContent = currentQuestion.question;

  const optionsEl = document.getElementById('quiz-options');
  optionsEl.innerHTML = '';
  currentQuestion.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'btn quiz-option';
    btn.textContent = opt;
    btn.onclick = () => selectAnswer(opt);
    optionsEl.appendChild(btn);
  });
}

function selectAnswer(selected) {
  const isCorrect = selected === currentQuestion.correct;
  quizScore.total++;
  if (isCorrect) quizScore.correct++;
  updateQuizScore();

  document.querySelectorAll('.quiz-option').forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === currentQuestion.correct) btn.classList.add('correct');
    else if (btn.textContent === selected) btn.classList.add('incorrect');
  });

  const feedback = document.getElementById('quiz-feedback');
  feedback.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
  let text = isCorrect ? '✓ 正解！' : `✗ 不正解。正解：${currentQuestion.correct}`;
  if (currentQuestion.explanation) text += `\n${currentQuestion.explanation}`;
  feedback.textContent = text;

  document.getElementById('quiz-next').classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  showRandom();
});
