let lastParsedData = null;

lastParsedData = parseAIResponseToJSON(rawOutput);

// Show welcome message from localStorage
const userName = localStorage.getItem('userName');
document.getElementById('welcomeMessage').innerText = `Hello, ${userName || 'Guest'}! Upload your Lecture PDF Below!`;

// Show initial tab on page load
showTab('summary');

// Display file name when file is selected
const fileInput = document.getElementById('lectureFile');
const fileNameText = document.getElementById('fileNameText');

fileInput.addEventListener('change', () => {
  if (fileInput.files.length > 0) {
    fileNameText.textContent = fileInput.files[0].name;
  } else {
    fileNameText.textContent = 'Please upload a file';
  }
});

async function uploadLecture() {
  const fileInput = document.getElementById('lectureFile');

  const file = fileInput.files[0];

  if (!file) {
    alert('Please upload a file!');
    return;
  }

  // Show loader
  document.getElementById('loader').style.display = 'flex';

  const formData = new FormData();
  formData.append('lectureFile', file);

  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch('/api/lecture/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });


    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    const data = await response.json();
    const rawOutput = data.result || data.error;

    const parsedData = parseAIResponseToJSON(rawOutput);

    renderSummary(parsedData.summary);
    renderFlashcards(parsedData.flashcards);
    renderQuiz(parsedData.quiz);

    showTab('summary');

  } catch (error) {
    alert(`Error: ${error.message}`);
    console.error('Upload or processing error:', error);
  } finally {
    // Hide loader
    document.getElementById('loader').style.display = 'none';
  }
}


/**
 * Parses raw AI text into structured JSON.
 */
function parseAIResponseToJSON(rawText) {
  const jsonData = {
    summary: '',
    flashcards: [],
    quiz: []
  };

  // Extract summary
  const summaryMatch = rawText.match(/\[START BOX\]([\s\S]*?)\[END BOX\]/i)
    || rawText.match(/Summary:[\s\S]*?\n([\s\S]*?)(?=\n\d+\.|$)/i);
  jsonData.summary = summaryMatch ? summaryMatch[1].trim() : 'Summary not found.';

  // Split before 'Quiz:' so flashcards don't absorb it
  const splitParts = rawText.split(/Quiz:/i);
  const flashcardText = splitParts[0] || '';
  const quizText = splitParts[1] || '';

  // Extract flashcards from section before Quiz
  const flashcardRegex = /- Q:\s*(.*?)\n\s*A:\s*([\s\S]*?)(?=\n- Q:|\n*$)/g;
  let match;
  while ((match = flashcardRegex.exec(flashcardText)) !== null) {
    jsonData.flashcards.push({
      question: match[1].trim(),
      answer: match[2].trim().replace(/[#]+$/, '').trim()
    });
  }

  // Extract quiz questions from section after "Quiz:"
  const quizBlockRegex = /\d+\.\s[\s\S]*?(?=\n\d+\.|$)/g;
  const blocks = quizText.match(quizBlockRegex);
  if (blocks) {
    blocks.forEach(block => {
      const lines = block.trim().split('\n').filter(l => l.trim() !== '');
      if (lines.length < 3) return;

      const question = lines[0].trim();
      const answerLine = lines[lines.length - 1];
      const correctAnswerMatch = answerLine.match(/✅\s*Answer\s*[:\-]\s*(.*)/i);
      if (!correctAnswerMatch) return;

      const correctAnswerLetter = correctAnswerMatch[1].trim().toLowerCase();
      const optionsRaw = lines.slice(1, lines.length - 1);

      // Keep the letter prefixes on options for display
      const options = optionsRaw.map(opt => opt.trim());

      // Find the full correct answer text matching the letter
      let correctAnswer = '';
      for (const opt of options) {
        if (opt.toLowerCase().startsWith(correctAnswerLetter)) {
          // Remove the letter prefix and space to get clean text
          correctAnswer = opt.replace(/^[a-z][\.\)]\s*/i, '').trim();
          break;
        }
      }

      jsonData.quiz.push({
        question,
        options,
        correctAnswer
      });

    });
  }

  console.log("Parsed flashcards:", jsonData.flashcards);
  console.log("Parsed quiz:", jsonData.quiz);

  return jsonData;
}


function renderSummary(summaryText) {
  const summaryBox = document.getElementById('summaryBox');
  summaryBox.innerHTML = ''; // Clear previous content

  const summaryDiv = document.createElement('div');
  summaryDiv.className = 'summary-box';
  summaryDiv.innerHTML = `<h3>📘 Summary</h3><p>${escapeHTML(summaryText)}</p>`;

  summaryBox.appendChild(summaryDiv);
}

function renderFlashcards(flashcards) {
  const flashcardContainer = document.getElementById('flashcardsBox');
  flashcardContainer.innerHTML = '';

  if (!flashcards || flashcards.length === 0) {
    flashcardContainer.innerHTML = '<p>No flashcards found.</p>';
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'flashcard-scroll-wrapper';

  flashcards.forEach(({ question, answer }) => {
    const card = document.createElement('div');
    card.className = 'flashcard';

    const inner = document.createElement('div');
    inner.className = 'card-inner';

    const front = document.createElement('div');
    front.className = 'card-front';
    front.innerText = question;

    const back = document.createElement('div');
    back.className = 'card-back';
    back.innerText = answer;

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);

    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });

    wrapper.appendChild(card);
  });

  flashcardContainer.appendChild(wrapper);
}

function removeNumberPrefix(text) {
  return text.replace(/^\d+\.\s*/, '').trim();
}


function renderQuiz(quiz) {
  let score = 0;
  let answeredCount = 0;
  const totalQuestions = quiz.length;

  const quizBox = document.getElementById('quizBox');
  quizBox.innerHTML = '';

  if (!quiz || quiz.length === 0) {
    quizBox.innerHTML = '<p>No quiz found.</p>';
    return;
  }

  const quizSection = document.createElement('div');
  quizSection.className = 'quiz-section';

  quiz.forEach(({ question, options, correctAnswer }, index) => {
    const quizDiv = document.createElement('div');
    quizDiv.className = 'quiz-card';

    const questionEl = document.createElement('p');
    questionEl.className = 'quiz-question';
    questionEl.innerText = `Q${index + 1}. ${removeNumberPrefix(question)}`;
    quizDiv.appendChild(questionEl);

    options.forEach(option => {
      const button = document.createElement('button');
      button.className = 'quiz-option';
      button.innerText = option;

      button.onclick = () => {
        const buttons = quizDiv.querySelectorAll('.quiz-option');
        buttons.forEach(btn => {
          btn.disabled = true;
          btn.classList.remove('correct', 'incorrect');
        });

        // Function to clean option text by removing the letter prefix (e.g., "a) ")
        function cleanText(text) {
          return text.replace(/^[a-z][\.\)]\s*/i, '').trim().toLowerCase();
        }

        const clickedText = cleanText(button.innerText);
        const correctText = correctAnswer.toLowerCase();

        // Reset animation
        void button.offsetWidth;

        if (clickedText === correctText) {
          button.classList.add('correct');
        } else {
          button.classList.add('incorrect');

          buttons.forEach(btn => {
            if (cleanText(btn.innerText) === correctText) {
              void btn.offsetWidth;
              btn.classList.add('correct');
            }
          });
        }

        // Score tracking logic
        answeredCount++;
        if (clickedText === correctText) score++;

        if (answeredCount === totalQuestions) {
          setTimeout(() => {
            alert(`🎉 You scored ${score}/${totalQuestions}!`);
          }, 300);
        }
      };

      quizDiv.appendChild(button);
    });

    quizSection.appendChild(quizDiv);
  });

  const retryButton = document.createElement('button');
  retryButton.className = 'retry-button';
  retryButton.innerText = '🔄 Retry Quiz';
  retryButton.onclick = () => {
    // Shuffle the quiz
    const shuffledQuiz = quiz.sort(() => Math.random() - 0.5);
    renderQuiz(shuffledQuiz);
  };


  quizBox.appendChild(quizSection);
  quizBox.appendChild(retryButton);
}


function escapeHTML(str) {
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m];
  });
}

function showTab(tabId) {
  // Hide all tab contents and remove 'active' class
  document.querySelectorAll('.tab').forEach(tab => {
    tab.style.display = 'none';
    tab.classList.remove('active');
  });

  // Remove 'active' class from all buttons
  document.querySelectorAll('.tab-bar button').forEach(button => {
    button.classList.remove('active');
  });

  // Show the selected tab and mark as active
  const selectedTab = document.getElementById(tabId);
  if (selectedTab) {
    selectedTab.style.display = 'block';
    selectedTab.classList.add('active');
  }

  // Highlight the selected tab's button
  const selectedButton = document.getElementById('btn-' + tabId);
  if (selectedButton) {
    selectedButton.classList.add('active');
  }
}

function goHome() {
  // Redirect to home page    
  window.location.href = "home.html";
}  

async function saveNotes() {
  
  const name = prompt("Enter a name for this lecture:");
  if (!name || name.trim() === "") return alert("Lecture name cannot be empty.");

  const note = {
    name,
    timestamp: Date.now(),
    content: {
      summary: document.getElementById('summaryBox').innerText.trim(),
      flashcards: extractFlashcards(),
      quiz: extractQuiz()
    }
  };

  try {
    
    const token = localStorage.getItem("authToken");
    console.log("Token:", token); // Check if token exists

    const response = await fetch("/api/notes/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(note)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to save lecture to server.");
    }

    alert("Lecture saved to your account!");
    goHome();

  } catch (error) {
    console.error("Save failed:", error);
    alert("Error saving lecture: " + error.message);
  }
}


function extractFlashcards() {
  const cards = document.querySelectorAll("#flashcardsBox .flashcard");
  const flashcards = [];
  cards.forEach(card => {
    const question = card.querySelector(".card-front")?.innerText || "";
    const answer = card.querySelector(".card-back")?.innerText || "";
    flashcards.push({ question, answer });
  });
  return flashcards;
}

function extractQuiz() {
  const quizCards = document.querySelectorAll("#quizBox .quiz-card");
  const quiz = [];

  quizCards.forEach(card => {
    const question = card.querySelector(".quiz-question")?.innerText || "";
    const optionButtons = Array.from(card.querySelectorAll(".quiz-option"));
    const options = optionButtons.map(btn => btn.innerText);
    const correctBtn = optionButtons.find(btn => btn.classList.contains("correct"));
    const correctAnswer = correctBtn ? correctBtn.innerText : "";

    quiz.push({
      question,
      options,
      correctAnswer
    });
  });

  return quiz;
}
