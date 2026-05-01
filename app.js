let viewHistory = [];
let histPos = -1;
let currentQuestion = null;

// ---- モード切替 ----

function switchMode(mode) {
  ['random', 'list', 'quiz'].forEach(function(m) {
    document.getElementById('mode-' + m).style.display = (m === mode) ? '' : 'none';
    document.getElementById('tab-' + m).classList.toggle('active', m === mode);
  });
  if (mode === 'list') renderList();
  if (mode === 'quiz') nextQuestion();
}

// ---- ランダムモード ----

function displayBook(idx) {
  const book = books[idx];
  const card = document.getElementById('book-card');
  card.classList.remove('fade-in');
  void card.offsetWidth;
  card.classList.add('fade-in');

  document.getElementById('book-number').textContent = 'No.' + (idx + 1);
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

  document.getElementById('btn-prev').style.visibility = (histPos > 0) ? 'visible' : 'hidden';
  document.getElementById('btn-next').style.visibility = (histPos < viewHistory.length - 1) ? 'visible' : 'hidden';
}

function showRandom() {
  // 前進履歴を切り捨ててから新しい書籍を追加
  viewHistory = viewHistory.slice(0, histPos + 1);
  const last = viewHistory.length > 0 ? viewHistory[viewHistory.length - 1] : -1;
  let next;
  do { next = Math.floor(Math.random() * books.length); } while (next === last && books.length > 1);
  viewHistory.push(next);
  histPos = viewHistory.length - 1;
  displayBook(next);
}

function goPrev() {
  if (histPos > 0) {
    histPos--;
    displayBook(viewHistory[histPos]);
  }
}

function goNext() {
  if (histPos < viewHistory.length - 1) {
    histPos++;
    displayBook(viewHistory[histPos]);
  }
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

    const num = document.createElement('span');
    num.className = 'list-item-num';
    num.textContent = 'No.' + (index + 1);

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

    info.appendChild(num);
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
  blank.id = 'quiz-blank';
  blank.textContent = '　　　　';
  questionEl.appendChild(blank);
  if (currentQuestion.after) {
    questionEl.appendChild(document.createTextNode(currentQuestion.after));
  }

  document.getElementById('quiz-reveal').style.display = '';
  document.getElementById('quiz-next').style.display = 'none';
}

function revealAnswer() {
  const blank = document.getElementById('quiz-blank');
  blank.textContent = currentQuestion.answer;
  blank.classList.add('quiz-blank-revealed');

  document.getElementById('quiz-reveal').style.display = 'none';
  document.getElementById('quiz-next').style.display = '';
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('header-count').textContent = books.length + '冊';
  showRandom();
});
