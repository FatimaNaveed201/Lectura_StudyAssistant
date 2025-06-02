function goHome() {
  window.location.href = "home.html";
}

window.onload = () => {
  const lecture = JSON.parse(localStorage.getItem("currentLecture"));
  if (!lecture) {
    alert("No lecture data found!");
    goHome();
    return;
  }

  document.getElementById('lectureTitle').textContent = lecture.name;
  renderSummary(lecture.content.summary);
  renderFlashcards(lecture.content.flashcards);
  renderQuiz(lecture.content.quiz);
};

function renderSummary(summary) {
  const box = document.getElementById("summaryBox");
  box.innerHTML = `<p>${escapeHTML(summary)}</p>`;
}

function renderFlashcards(htmlOrArray) {
  const box = document.getElementById("flashcardsBox");
  box.innerHTML = '';

  let flashcards = [];

  try {
    flashcards = typeof htmlOrArray === 'string' ? JSON.parse(htmlOrArray) : htmlOrArray;
  } catch {
    box.innerHTML = `<div class="raw-html">${htmlOrArray}</div>`; // fallback with wrapper
    return;
  }

  flashcards.forEach(({ question, answer }) => {
    const card = document.createElement("div");
    card.className = "flashcard";

    const inner = document.createElement("div");
    inner.className = "card-inner";

    const front = document.createElement("div");
    front.className = "card-front";
    front.innerText = question;

    const back = document.createElement("div");
    back.className = "card-back";
    back.innerText = answer;

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);

    card.addEventListener("click", () => {
      card.classList.toggle("flipped");
    });

    box.appendChild(card);
  });
}

function renderQuiz(htmlOrArray) {
  const box = document.getElementById("quizBox");
  box.innerHTML = '';

  let quizItems = [];

  try {
    quizItems = typeof htmlOrArray === 'string' ? JSON.parse(htmlOrArray) : htmlOrArray;
  } catch {
    box.innerHTML = `<div class="raw-html">${htmlOrArray}</div>`; // fallback with wrapper
    return;
  }

  quizItems.forEach(({ question, options, correctAnswer }) => {
    const qDiv = document.createElement("div");
    qDiv.className = "quiz-question";

    const qText = document.createElement("div");
    qText.innerText = question;

    const ul = document.createElement("ul");
    options.forEach(opt => {
      const li = document.createElement("li");
      li.innerText = opt;
      ul.appendChild(li);
    });

    const answer = document.createElement("div");
    answer.className = "quiz-answer";
    answer.innerHTML = `<strong>Answer:</strong> ${correctAnswer}`;

    qDiv.appendChild(qText);
    qDiv.appendChild(ul);
    qDiv.appendChild(answer);
    box.appendChild(qDiv);
  });
}

function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
