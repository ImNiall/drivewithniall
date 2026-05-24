const themeToggle = document.querySelector("#themeToggle");
const lessonCards = [...document.querySelectorAll("[data-lesson]")];
const progressFill = document.querySelector("#progressFill");
const progressTitle = document.querySelector("#progressTitle");
const progressDetail = document.querySelector("#progressDetail");
const resetProgress = document.querySelector("#resetProgress");
const nextLessonTitle = document.querySelector("#nextLessonTitle");
const nextLessonLink = document.querySelector("#nextLessonLink");
const badgeRow = document.querySelector("#badgeRow");
const weakAreaSummary = document.querySelector("#weakAreaSummary");
const parentSummary = document.querySelector("#parentSummary");
const lessonDialog = document.querySelector("#lessonDialog");
const dialogTitle = document.querySelector("#dialogTitle");
const dialogType = document.querySelector("#dialogType");
const dialogWatch = document.querySelector("#dialogWatch");
const dialogPractice = document.querySelector("#dialogPractice");
const dialogReflect = document.querySelector("#dialogReflect");
const lessonQuestion = document.querySelector("#lessonQuestion");
const saveQuestion = document.querySelector("#saveQuestion");
const downloadNotes = document.querySelector("#downloadNotes");
const storageKey = "driveOnlineProgress";
const memoryStore = new Map();

const defaultState = {
  lessons: {},
  questions: {},
};

const lessonMeta = {
  "cockpit-drill": { difficulty: "Easy", tag: "Free", statusLabel: "Start here" },
  "first-move-off": { difficulty: "Easy", tag: "Free", statusLabel: "Free preview" },
  "clutch-control": { difficulty: "Medium", tag: "Premium", statusLabel: "Unlock path" },
  "gears-steering": { difficulty: "Medium", tag: "Premium", statusLabel: "Core control" },
  "mirrors-signals": { difficulty: "Medium", tag: "Premium", statusLabel: "Road routine" },
  "hazard-reading": { difficulty: "Medium", tag: "Premium", statusLabel: "Awareness" },
  emerging: { difficulty: "Hard", tag: "Premium", statusLabel: "Junctions" },
  roundabouts: { difficulty: "Hard", tag: "Premium", statusLabel: "Roundabouts" },
  "bay-parking": { difficulty: "Medium", tag: "Premium", statusLabel: "Manoeuvre" },
  "parallel-parking": { difficulty: "Hard", tag: "Premium", statusLabel: "Manoeuvre" },
  "dual-carriageways": { difficulty: "Hard", tag: "Premium", statusLabel: "Higher speed" },
  "town-country": { difficulty: "Hard", tag: "Premium", statusLabel: "Risk control" },
  "sat-nav": { difficulty: "Medium", tag: "Premium", statusLabel: "Independent" },
  "missed-turns": { difficulty: "Medium", tag: "Premium", statusLabel: "Confidence" },
  "mock-test": { difficulty: "Hard", tag: "Premium", statusLabel: "Test prep" },
  "show-me-tell-me": { difficulty: "Easy", tag: "Premium", statusLabel: "Final prep" },
};

function setTheme(mode) {
  const isDark = mode === "dark";
  document.body.classList.toggle("dark-mode", isDark);

  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    themeToggle.querySelector(".theme-toggle-icon").textContent = isDark ? "☀" : "☾";
    themeToggle.querySelector(".theme-toggle-text").textContent = isDark ? "Light" : "Dark";
  }

  safeSet("driveTheme", mode);
}

function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return memoryStore.get(key) || null;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    memoryStore.set(key, value);
  }
}

function safeRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    memoryStore.delete(key);
  }
}

function getState() {
  try {
    return { ...defaultState, ...JSON.parse(safeGet(storageKey)) };
  } catch {
    return { lessons: {}, questions: {} };
  }
}

function saveState(state) {
  safeSet(storageKey, JSON.stringify(state));
}

function lessonTitle(card) {
  return card.querySelector("h3").textContent;
}

function lessonType(card) {
  return card.querySelector(".lesson-type").textContent;
}

function ensureLessonState(state, id) {
  state.lessons[id] ||= {
    status: "not-started",
    confidence: 0,
    struggled: false,
    quiz: false,
  };
  return state.lessons[id];
}

function injectLessonControls() {
  lessonCards.forEach((card) => {
    if (card.querySelector(".lesson-tools")) return;
    const meta = lessonMeta[card.dataset.lesson] || { difficulty: "Medium", tag: "Premium", statusLabel: "Lesson" };
    const frame = card.querySelector(".video-frame");
    const body = card.querySelector(".video-card-body");

    frame.insertAdjacentHTML(
      "beforeend",
      `<div class="video-meta-strip"><span>${meta.tag}</span><span>${meta.difficulty}</span></div>`,
    );

    body.insertAdjacentHTML(
      "afterbegin",
      `<div class="lesson-status-line"><span>${meta.statusLabel}</span><span>Not started</span></div>`,
    );

    const tools = document.createElement("div");
    tools.className = "lesson-tools";
    tools.innerHTML = `
      <div class="lesson-state" aria-label="Lesson progress state">
        <button type="button" data-status="watched">Watched</button>
        <button type="button" data-status="practised">Practised</button>
        <button type="button" data-status="confident">Confident</button>
      </div>
      <div class="confidence-row" aria-label="Confidence rating">
        <span>Confidence</span>
        <button type="button" data-confidence="1">1</button>
        <button type="button" data-confidence="2">2</button>
        <button type="button" data-confidence="3">3</button>
      </div>
      <div class="lesson-actions">
        <button type="button" data-action="details">Open lesson</button>
        <button type="button" data-action="quiz">Quick quiz</button>
        <button type="button" data-action="struggle">I struggled</button>
        <a href="index.html#book">Book this topic</a>
      </div>
    `;

    card.querySelector(".video-card-body").append(tools);
  });
}

function completedCount(state) {
  return Object.values(state.lessons).filter((lesson) => lesson.status === "confident").length;
}

function watchedCount(state) {
  return Object.values(state.lessons).filter((lesson) => lesson.status !== "not-started").length;
}

function updateProgress() {
  const state = getState();
  const confident = completedCount(state);
  const watched = watchedCount(state);
  const total = lessonCards.length;
  const percent = total ? Math.round((confident / total) * 100) : 0;
  const weakLessons = [];
  let confidenceTotal = 0;
  let confidenceRatings = 0;

  lessonCards.forEach((card) => {
    const id = card.dataset.lesson;
    const lesson = ensureLessonState(state, id);
    const isComplete = lesson.status === "confident";

    card.classList.toggle("is-complete", isComplete);
    card.classList.toggle("is-struggle", lesson.struggled);
    card.dataset.status = lesson.status;
    card.querySelector(".lesson-complete").textContent = isComplete ? "Completed" : "Mark complete";
    card.querySelector(".lesson-status-line span:last-child").textContent = lesson.status
      .split("-")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");

    card.querySelectorAll("[data-status]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.status === lesson.status);
    });

    card.querySelectorAll("[data-confidence]").forEach((button) => {
      button.classList.toggle("is-active", Number(button.dataset.confidence) <= lesson.confidence);
    });

    card.querySelector('[data-action="quiz"]').textContent = lesson.quiz ? "Quiz passed" : "Quick quiz";
    card.querySelector('[data-action="struggle"]').textContent = lesson.struggled ? "Flagged" : "I struggled";

    if (lesson.struggled) weakLessons.push(lessonTitle(card));
    if (lesson.confidence) {
      confidenceTotal += lesson.confidence;
      confidenceRatings += 1;
    }
  });

  saveState(state);
  progressFill.style.width = `${percent}%`;
  progressTitle.textContent = `${percent}% complete`;
  progressDetail.textContent = `${confident} confident, ${watched} started, ${total} total videos`;

  const nextCard = lessonCards.find((card) => ensureLessonState(state, card.dataset.lesson).status !== "confident");
  nextLessonTitle.textContent = nextCard ? lessonTitle(nextCard) : "Course complete";
  nextLessonLink.href = nextCard ? `#${nextCard.closest(".video-stage").id}` : "#course";
  nextLessonLink.textContent = nextCard ? "Continue learning" : "Review course";

  const badges = [];
  if (watched >= 1) badges.push("First video");
  if (confident >= 4) badges.push("Control basics");
  if (confident >= 8) badges.push("Road reader");
  if (confident >= 12) badges.push("Test prep started");
  if (confident === total) badges.push("Test ready");
  badgeRow.innerHTML = (badges.length ? badges : ["First video", "Control basics", "Test prep"])
    .map((badge) => `<span class="${badges.includes(badge) ? "is-earned" : ""}">${badge}</span>`)
    .join("");

  weakAreaSummary.textContent = weakLessons.length
    ? `Flagged for revision: ${weakLessons.slice(0, 3).join(", ")}${weakLessons.length > 3 ? "..." : ""}`
    : "No weak areas flagged yet.";

  const confidenceAverage = confidenceRatings ? (confidenceTotal / confidenceRatings).toFixed(1) : "0.0";
  parentSummary.textContent = `${watched}/${total} videos started, ${confident} marked confident, average confidence ${confidenceAverage}/3.`;
}

function openLesson(card) {
  dialogTitle.textContent = lessonTitle(card);
  dialogType.textContent = lessonType(card);
  dialogWatch.textContent = card.querySelector(".video-card-body > p:not(.lesson-type)").textContent;
  dialogPractice.textContent = "Practise this on a quiet road first, then ask Niall to repeat it during the next practical lesson.";
  dialogReflect.textContent = "Can you explain what could go wrong here and what you would do to stay safe?";
  lessonQuestion.value = getState().questions[card.dataset.lesson] || "";
  lessonDialog.dataset.lesson = card.dataset.lesson;
  lessonDialog.showModal();
}

function passQuiz(card) {
  const state = getState();
  const lesson = ensureLessonState(state, card.dataset.lesson);
  lesson.quiz = true;
  if (lesson.status === "not-started") lesson.status = "watched";
  saveState(state);
  updateProgress();
}

const savedTheme = safeGet("driveTheme");
const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
setTheme(savedTheme || (prefersDark ? "dark" : "light"));
injectLessonControls();
updateProgress();

if (themeToggle && !themeToggle.dataset.inlineThemeToggle) {
  themeToggle.addEventListener("click", () => {
    setTheme(document.body.classList.contains("dark-mode") ? "light" : "dark");
  });
}

lessonCards.forEach((card) => {
  card.querySelector(".lesson-complete").addEventListener("click", () => {
    const state = getState();
    const lesson = ensureLessonState(state, card.dataset.lesson);
    lesson.status = lesson.status === "confident" ? "not-started" : "confident";
    if (lesson.status === "confident" && !lesson.confidence) lesson.confidence = 3;
    saveState(state);
    updateProgress();
  });

  card.addEventListener("click", (event) => {
    const target = event.target.closest("[data-status], [data-confidence], [data-action]");
    if (!target) return;

    const state = getState();
    const lesson = ensureLessonState(state, card.dataset.lesson);

    if (target.dataset.status) lesson.status = target.dataset.status;
    if (target.dataset.confidence) lesson.confidence = Number(target.dataset.confidence);
    if (target.dataset.action === "struggle") lesson.struggled = !lesson.struggled;
    if (target.dataset.action === "quiz") passQuiz(card);
    if (target.dataset.action === "details") openLesson(card);

    saveState(state);
    updateProgress();
  });
});

resetProgress.addEventListener("click", () => {
  safeRemove(storageKey);
  updateProgress();
});

saveQuestion.addEventListener("click", () => {
  const state = getState();
  state.questions[lessonDialog.dataset.lesson] = lessonQuestion.value;
  saveState(state);
  saveQuestion.textContent = "Saved";
  setTimeout(() => {
    saveQuestion.textContent = "Save question";
  }, 1200);
});

downloadNotes.addEventListener("click", () => {
  const title = dialogTitle.textContent;
  const notes = `Drive with Niall - ${title}\n\nWatch:\n${dialogWatch.textContent}\n\nPractise:\n${dialogPractice.textContent}\n\nReflect:\n${dialogReflect.textContent}\n`;
  const blob = new Blob([notes], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-notes.txt`;
  link.click();
  URL.revokeObjectURL(link.href);
});

document
  .querySelectorAll("button, .primary-button, .secondary-button, .outline-button, .course-path a")
  .forEach((element) => {
    element.addEventListener("click", (event) => {
      const rect = element.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      ripple.className = "click-ripple";
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      element.append(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });
