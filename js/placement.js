// ── Question pool (15 per level, 10 randomly selected per test) ───────────────

const POOL = {
  beginner: [
    {
      text: "I go to school ___ Monday.",
      options: ["in", "on", "at", "by"],
      answer: "on"
    },
    {
      text: "___ she your sister?",
      options: ["Are", "Is", "Am", "Be"],
      answer: "Is"
    },
    {
      text: "Which word is the opposite of 'big'?",
      options: ["tall", "heavy", "small", "old"],
      answer: "small"
    },
    {
      text: "My father ___ coffee every morning.",
      options: ["drink", "drinks", "drinking", "drinked"],
      answer: "drinks"
    },
    {
      text: "I have ___ dog. ___ dog is brown.",
      options: ["a / The", "the / A", "a / A", "the / The"],
      answer: "a / The"
    },
    {
      text: "___ do you live?",
      options: ["What", "Who", "Where", "When"],
      answer: "Where"
    },
    {
      text: "There are three ___ in the room.",
      options: ["childs", "childrens", "children", "child"],
      answer: "children"
    },
    {
      text: "Yesterday, I ___ to the store.",
      options: ["go", "goes", "going", "went"],
      answer: "went"
    },
    {
      text: "The weather is cold and ___.",
      options: ["raining", "rainy", "rain", "rains"],
      answer: "rainy"
    },
    {
      text: "What does 'difficult' mean?",
      options: ["fácil", "interesante", "difícil", "aburrido"],
      answer: "difícil"
    },
    {
      text: "Which word means 'rojo' in English?",
      options: ["blue", "green", "red", "yellow"],
      answer: "red"
    },
    {
      text: "My sister ___ 15 years old.",
      options: ["have", "has", "is", "are"],
      answer: "is"
    },
    {
      text: "Which sentence is correct?",
      options: [
        "He don't like pizza.",
        "He doesn't likes pizza.",
        "He doesn't like pizza.",
        "He not like pizza."
      ],
      answer: "He doesn't like pizza."
    },
    {
      text: "I ___ breakfast at 7 every morning.",
      options: ["eating", "eat", "eats", "eaten"],
      answer: "eat"
    },
    {
      text: "How do you say 'Me llamo Ana'?",
      options: ["I called Ana.", "My name is Ana.", "She is Ana.", "I am Ana called."],
      answer: "My name is Ana."
    }
  ],

  intermediate: [
    {
      text: "I ___ never been to the United States.",
      options: ["have", "has", "had", "am"],
      answer: "have"
    },
    {
      text: "If I ___ more money, I would travel the world.",
      options: ["have", "had", "will have", "would have"],
      answer: "had"
    },
    {
      text: "The letter ___ written last week.",
      options: ["is", "was", "were", "has"],
      answer: "was"
    },
    {
      text: "Something 'optional' is...",
      options: ["required", "not necessary", "expensive", "difficult"],
      answer: "not necessary"
    },
    {
      text: "The woman ___ lives next door is a teacher.",
      options: ["which", "what", "who", "whose"],
      answer: "who"
    },
    {
      text: "She has been studying English ___ three years.",
      options: ["since", "for", "during", "while"],
      answer: "for"
    },
    {
      text: "He said that he ___ come to the party.",
      options: ["will", "would", "can", "shall"],
      answer: "would"
    },
    {
      text: "Despite the rain, the event was a great ___.",
      options: ["success", "successful", "succeed", "successfully"],
      answer: "success"
    },
    {
      text: "You ___ see a doctor. That cough sounds serious.",
      options: ["might", "should", "could", "would"],
      answer: "should"
    },
    {
      text: "Which sentence is correct?",
      options: [
        "She is working here since 2020.",
        "She has been working here since 2020.",
        "She works here since 2020.",
        "She was working here since 2020."
      ],
      answer: "She has been working here since 2020."
    },
    {
      text: "It's ___ hot today that I don't want to go outside.",
      options: ["such", "very", "so", "too"],
      answer: "so"
    },
    {
      text: "I wish I ___ more time to study.",
      options: ["have", "had", "will have", "would have"],
      answer: "had"
    },
    {
      text: "By the time she arrived, we ___ waiting for an hour.",
      options: ["were", "had been", "have been", "are"],
      answer: "had been"
    },
    {
      text: "The documentary was really ___. I learned a lot.",
      options: ["informative", "informed", "information", "inform"],
      answer: "informative"
    },
    {
      text: "You ___ bring an umbrella — it might rain later.",
      options: ["must", "ought", "should", "shall"],
      answer: "should"
    }
  ],

  advanced: [
    {
      text: "Something 'meticulous' is...",
      options: [
        "careless and rushed",
        "extremely careful and precise",
        "very creative",
        "hard to understand"
      ],
      answer: "extremely careful and precise"
    },
    {
      text: "The teacher insisted that every student ___ the exam on time.",
      options: ["submits", "submitted", "submit", "will submit"],
      answer: "submit"
    },
    {
      text: "If she ___ harder, she would have passed.",
      options: ["studied", "had studied", "would study", "has studied"],
      answer: "had studied"
    },
    {
      text: "The politician's speech was deliberately ___ — no one could tell what she actually believed.",
      options: ["ambiguous", "ambitious", "animated", "anonymous"],
      answer: "ambiguous"
    },
    {
      text: "Which sentence is correct?",
      options: [
        "There are less people here today.",
        "There are fewer people here today.",
        "Less people are here.",
        "Fewer less people came."
      ],
      answer: "There are fewer people here today."
    },
    {
      text: "Not only ___ to every class, she also submitted every assignment early.",
      options: ["she came", "did she come", "she did come", "came she"],
      answer: "did she come"
    },
    {
      text: "To 'alleviate' something means to...",
      options: [
        "make it worse",
        "remove it completely",
        "make it less severe",
        "ignore it"
      ],
      answer: "make it less severe"
    },
    {
      text: "The project was very challenging. ___, the team finished ahead of schedule.",
      options: ["Therefore", "Nevertheless", "Furthermore", "Similarly"],
      answer: "Nevertheless"
    },
    {
      text: "What is the main idea of this passage?",
      passage: "Despite its small size, Costa Rica generates over 99% of its electricity from renewable sources and is home to 5% of the world's species. The country has set a goal to become fully carbon neutral.",
      options: [
        "Costa Rica is a small country.",
        "Costa Rica is a leader in environmental sustainability.",
        "Costa Rica uses solar panels.",
        "Costa Rica has many animals."
      ],
      answer: "Costa Rica is a leader in environmental sustainability."
    },
    {
      text: "What does this passage suggest?",
      passage: "María had always been the first to raise her hand in class. But after moving somewhere new where she didn't speak the language, she found herself sitting quietly — watching others answer questions she knew perfectly well.",
      options: [
        "María became less intelligent.",
        "Language barriers can affect how people express what they know.",
        "María didn't like her new school.",
        "María decided to stop studying."
      ],
      answer: "Language barriers can affect how people express what they know."
    },
    {
      text: "The scientist's findings were ___, challenging assumptions accepted for decades.",
      options: ["redundant", "groundbreaking", "trivial", "predictable"],
      answer: "groundbreaking"
    },
    {
      text: "She spoke with such ___ that even her harshest critics were moved.",
      options: ["eloquence", "arrogance", "hesitation", "brevity"],
      answer: "eloquence"
    },
    {
      text: "Which pair of words are NOT synonyms?",
      options: [
        "begin / commence",
        "angry / furious",
        "tired / exhausted",
        "happy / melancholy"
      ],
      answer: "happy / melancholy"
    },
    {
      text: "To 'corroborate' a story means to...",
      options: [
        "contradict it",
        "exaggerate it",
        "confirm it with evidence",
        "summarize it"
      ],
      answer: "confirm it with evidence"
    },
    {
      text: "What does this passage suggest about the term 'lingua franca'?",
      passage: "The term 'lingua franca' originally referred to a specific trade language used in Mediterranean ports. Today, it broadly describes any language used as a common means of communication between people who do not share a native language.",
      options: [
        "It is only used in Mediterranean ports.",
        "Its meaning has expanded over time.",
        "It refers only to trade languages.",
        "It was invented in modern times."
      ],
      answer: "Its meaning has expanded over time."
    }
  ]
};

// ── Utilities ─────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildTest() {
  const beg = shuffle(POOL.beginner).slice(0, 10);
  const mid = shuffle(POOL.intermediate).slice(0, 10);
  const adv = shuffle(POOL.advanced).slice(0, 10);
  return [...beg, ...mid, ...adv].map(q => ({ ...q, options: shuffle(q.options) }));
}

// ── State ─────────────────────────────────────────────────────────────────────

let questions     = [];
let currentIndex  = 0;
let answers       = [];
let currentUserId = null;

// ── DOM refs ──────────────────────────────────────────────────────────────────

const screenLoading = document.getElementById('screen-loading');
const screenIntro   = document.getElementById('screen-intro');
const screenTest    = document.getElementById('screen-test');
const screenResult  = document.getElementById('screen-result');

// ── Auth check ────────────────────────────────────────────────────────────────

async function init() {
  const { data: { user } } = await db.auth.getUser();

  if (!user) { window.location.href = 'login.html'; return; }

  const { data: profile } = await db
    .from('profiles')
    .select('role, level')
    .eq('id', user.id)
    .single();

  if (!profile)                  { window.location.href = 'login.html';              return; }
  if (profile.role === 'teacher') { window.location.href = 'teacher/dashboard.html'; return; }
  if (profile.level)             { window.location.href = 'dashboard.html';          return; }

  currentUserId = user.id;
  screenLoading.hidden = true;
  screenIntro.hidden = false;
}

// ── Start ─────────────────────────────────────────────────────────────────────

document.getElementById('start-btn').addEventListener('click', () => {
  questions = buildTest();
  answers   = new Array(30).fill(null);
  currentIndex = 0;
  screenIntro.hidden = true;
  screenTest.hidden  = false;
  renderQuestion();
});

// ── Render question ───────────────────────────────────────────────────────────

function renderQuestion() {
  const q = questions[currentIndex];

  document.getElementById('progress-fill').style.width = `${(currentIndex / 30) * 100}%`;
  document.getElementById('question-counter').textContent = `Pregunta ${currentIndex + 1} de 30`;

  const passageEl = document.getElementById('passage');
  if (q.passage) {
    passageEl.textContent = q.passage;
    passageEl.hidden = false;
  } else {
    passageEl.hidden = true;
  }

  document.getElementById('question-text').textContent = q.text;

  const list = document.getElementById('options-list');
  list.innerHTML = '';
  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className   = 'option-btn';
    btn.textContent = opt;
    btn.addEventListener('click', () => selectOption(opt));
    list.appendChild(btn);
  });

  const nextBtn = document.getElementById('next-btn');
  nextBtn.disabled    = true;
  nextBtn.textContent = currentIndex === 29 ? 'Ver mi resultado' : 'Siguiente';
}

function selectOption(text) {
  document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
  const btn = [...document.querySelectorAll('.option-btn')].find(b => b.textContent === text);
  if (btn) btn.classList.add('selected');
  answers[currentIndex] = text;
  document.getElementById('next-btn').disabled = false;
}

document.getElementById('next-btn').addEventListener('click', () => {
  if (currentIndex < 29) {
    currentIndex++;
    renderQuestion();
  } else {
    submitTest();
  }
});

// ── Score + save ──────────────────────────────────────────────────────────────

async function submitTest() {
  const bScore = questions.slice(0, 10).filter((q, i) => answers[i]      === q.answer).length;
  const iScore = questions.slice(10, 20).filter((q, i) => answers[i + 10] === q.answer).length;

  let level;
  if (bScore < 6)      level = 'beginner';
  else if (iScore < 6) level = 'intermediate';
  else                 level = 'advanced';

  await db.from('profiles').update({ level }).eq('id', currentUserId);

  document.getElementById('progress-fill').style.width = '100%';
  screenTest.hidden = true;
  showResult(level);
}

// ── Result ────────────────────────────────────────────────────────────────────

const RESULTS = {
  beginner: {
    label: 'Principiante',
    cls:   'beginner',
    title: '¡Bienvenido a Puente!',
    desc:  'Tu nivel es Principiante. Todo el mundo empieza desde el principio — y el hecho de que estés aquí ya es un gran paso. Puente te guiará desde lo básico, en español, a tu propio ritmo. Con tiempo y práctica, vas a sorprenderte de lo mucho que puedes aprender.'
  },
  intermediate: {
    label: 'Intermedio',
    cls:   'intermediate',
    title: 'Vas por buen camino.',
    desc:  'Tu nivel es Intermedio. Ya tienes una base sólida en inglés. Puente te ayudará a consolidar lo que sabes, llenar los vacíos y avanzar hacia una fluidez real. Estás justo donde necesitas estar.'
  },
  advanced: {
    label: 'Avanzado',
    cls:   'advanced',
    title: 'Tu inglés es muy bueno.',
    desc:  'Tu nivel es Avanzado. Puente te ayudará a llegar a una fluidez total con vocabulario matizado, lectura compleja y contenido que realmente te pondrá a prueba. A partir de aquí, se pone interesante.'
  }
};

function showResult(level) {
  const r     = RESULTS[level];
  const badge = document.getElementById('level-badge');
  badge.textContent = r.label;
  badge.className   = `level-badge ${r.cls}`;
  document.getElementById('result-title').textContent = r.title;
  document.getElementById('result-desc').textContent  = r.desc;
  screenResult.hidden = false;
}

document.getElementById('dashboard-btn').addEventListener('click', () => {
  window.location.href = 'dashboard.html';
});

// ── Boot ──────────────────────────────────────────────────────────────────────

init();
