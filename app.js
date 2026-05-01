let currentIndex = -1;
let currentQuestion = null;
let quizScore = { correct: 0, total: 0 };

// ---- モード切替 ----

function switchMode(mode) {
  ['random', 'list', 'quiz'].forEach(m => {
    document.getElementById('mode-' + m).style.display = (m === mode) ? '' : 'none';
    document.getElementById('tab-' + m).classList.toggle('active', m === mode);
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
  document.getElementById('book-author').textContent = '著者: ' + book.author;
  document.getElementById('book-year').textContent = book.year + '年';
  document.getElementById('book-category').textContent = book.category;
  document.getElementById('book-summary').textContent = book.summary;
  document.getElementById('book-takeaway').textContent = book.takeaway;

  const pointsList = document.getElementById('book-points');
  pointsList.innerHTML = '';
  book.points.forEach(function(point) {
    const li = document.createElement('li');
    li.textContent = point;
    pointsList.appendChild(li);
  });

  document.getElementById('counter').textContent = '全 ' + books.length + ' 冊収録';
}

// ---- 一覧モード ----

function renderList() {
  document.getElementById('list-counter').textContent = '全 ' + books.length + ' 冊収録';
  const container = document.getElementById('book-list');
  container.innerHTML = '';
  books.forEach(function(book, index) {
    const item = document.createElement('div');
    item.className = 'list-item';

    const header = document.createElement('div');
    header.className = 'list-item-header';
    header.onclick = function() { toggleListItem(index); };

    const info = document.createElement('div');
    info.className = 'list-item-info';

    const cat = document.createElement('span');
    cat.className = 'category';
    cat.textContent = book.category;

    const title = document.createElement('span');
    title.className = 'list-item-title';
    title.textContent = book.title;

    const author = document.createElement('span');
    author.className = 'list-item-author';
    author.textContent = book.author + '（' + book.year + '年）';

    const arrow = document.createElement('span');
    arrow.className = 'list-item-arrow';
    arrow.id = 'arrow-' + index;
    arrow.textContent = '▸';

    info.appendChild(cat);
    info.appendChild(title);
    info.appendChild(author);
    header.appendChild(info);
    header.appendChild(arrow);

    const detail = document.createElement('div');
    detail.className = 'list-item-detail';
    detail.id = 'detail-' + index;
    detail.style.display = 'none';

    const divider = document.createElement('div');
    divider.className = 'divider';

    const summaryLabel = document.createElement('h3');
    summaryLabel.className = 'section-label';
    summaryLabel.textContent = '概要';

    const summaryText = document.createElement('p');
    summaryText.className = 'summary';
    summaryText.textContent = book.summary;

    const pointsLabel = document.createElement('h3');
    pointsLabel.className = 'section-label';
    pointsLabel.textContent = '主なポイント';

    const pointsList = document.createElement('ul');
    pointsList.className = 'points';
    book.points.forEach(function(p) {
      const li = document.createElement('li');
      li.textContent = p;
      pointsList.appendChild(li);
    });

    const takeawayLabel = document.createElement('h3');
    takeawayLabel.className = 'section-label';
    takeawayLabel.textContent = 'この本から学べること';

    const takeawayText = document.createElement('p');
    takeawayText.className = 'takeaway';
    takeawayText.textContent = book.takeaway;

    detail.appendChild(divider);
    detail.appendChild(summaryLabel);
    detail.appendChild(summaryText);
    detail.appendChild(pointsLabel);
    detail.appendChild(pointsList);
    detail.appendChild(takeawayLabel);
    detail.appendChild(takeawayText);

    item.appendChild(header);
    item.appendChild(detail);
    container.appendChild(item);
  });
}

function toggleListItem(index) {
  const detail = document.getElementById('detail-' + index);
  const arrow = document.getElementById('arrow-' + index);
  const opening = detail.style.display === 'none';
  detail.style.display = opening ? '' : 'none';
  arrow.textContent = opening ? '▾' : '▸';
}

// ---- クイズモード ----

function startQuiz() {
  quizScore = { correct: 0, total: 0 };
  updateQuizScore();
  nextQuestion();
}

function updateQuizScore() {
  const el = document.getElementById('quiz-score');
  if (quizScore.total === 0) {
    el.textContent = '全 ' + books.length + ' 冊から出題';
  } else {
    el.textContent = quizScore.correct + ' / ' + quizScore.total + ' 正解';
  }
}

function generateQuestion() {
  const idx = Math.floor(Math.random() * books.length);
  const book = books[idx];
  const types = ['author', 'title', 'keyword', 'year'];
  const type = types[Math.floor(Math.random() * types.length)];

  if (type === 'author') {
    return {
      before: '「' + book.title + '」の著者は',
      after: 'だ。',
      answer: book.author,
    };
  }

  if (type === 'title') {
    return {
      before: '',
      after: 'は' + book.author + 'の著作（' + book.year + '年刊、' + book.category + '）だ。',
      answer: book.title,
    };
  }

  if (type === 'year') {
    return {
      before: '「' + book.title + '」（' + book.author + '）が出版されたのは',
      after: '年だ。',
      answer: String(book.year),
    };
  }

  // keyword
  const point = book.points[Math.floor(Math.random() * book.points.length)];
  const sep = point.indexOf('—');
  if (sep === -1) {
    return {
      before: '「' + book.title + '」の著者は',
      after: 'だ。',
      answer: book.author,
    };
  }
  const keyword = point.slice(0, sep).trim();
  const desc = point.slice(sep + 1).trim();
  return {
    before: '「' + book.title + '」のキーワード：',
    after: 'とは、' + desc,
    answer: keyword,
  };
}

function nextQuestion() {
  currentQuestion = generateQuestion();

  const questionEl = document.getElementById('quiz-question');
  questionEl.innerHTML = '';
  if (currentQuestion.before) {
    questionEl.appendChild(document.createTextNode(currentQuestion.before));
  }
  const blank = document.createElement('span');
  blank.className = 'quiz-blank';
  blank.textContent = '　　　　';
  questionEl.appendChild(blank);
  if (currentQuestion.after) {
    questionEl.appendChild(document.createTextNode(currentQuestion.after));
  }

  const input = document.getElementById('quiz-input');
  input.value = '';
  input.disabled = false;
  input.onkeydown = function(e) { if (e.key === 'Enter') submitAnswer(); };

  document.getElementById('quiz-feedback').style.display = 'none';
  document.getElementById('quiz-next').style.display = 'none';
  document.getElementById('quiz-submit').style.display = '';

  setTimeout(function() { input.focus(); }, 50);
}

function normalize(s) {
  return s.trim().replace(/[・\s]/g, '').toLowerCase();
}

function submitAnswer() {
  const input = document.getElementById('quiz-input');
  const userRaw = input.value.trim().replace(/年$/, '');
  const correctRaw = currentQuestion.answer.replace(/年$/, '');
  const isCorrect = normalize(userRaw) === normalize(correctRaw);

  quizScore.total++;
  if (isCorrect) quizScore.correct++;
  updateQuizScore();

  input.disabled = true;
  document.getElementById('quiz-submit').style.display = 'none';

  const feedback = document.getElementById('quiz-feedback');
  feedback.className = 'quiz-feedback ' + (isCorrect ? 'correct' : 'incorrect');
  feedback.textContent = isCorrect
    ? '✓ 正解！　' + currentQuestion.answer
    : '✗ 不正解。正解は「' + currentQuestion.answer + '」';
  feedback.style.display = '';

  document.getElementById('quiz-next').style.display = '';
}

document.addEventListener('DOMContentLoaded', function() {
  showRandom();
});
