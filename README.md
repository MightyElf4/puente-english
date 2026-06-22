# Puente

Puente is a free, open-source English learning platform for Spanish-speaking learners at any level — from complete beginner to advanced. It is built to be used independently by students in their own time, and as a classroom tool by teachers who want to run activities, assign practice, and track student progress.

The name *Puente* means "bridge" in Spanish — a bridge between Spanish and English, between students and the language, and between curiosity and fluency.

---

## Pedagogical Approach

Puente is built around two ideas that work together: **comprehensible input** and **explicit instruction**.

**Comprehensible input** means students spend time encountering English in context — reading passages, listening to words and sentences, exploring vocabulary through real examples rather than definitions alone. Exposure to language at the right level is one of the most powerful drivers of real fluency. Puente is designed so that students absorb English naturally, the same way people pick up language in real life.

**Explicit instruction** provides the framework that helps students make sense of what they absorb. Grammar topics are explained clearly and directly, with exercises that let students practice a structure before moving on. These two approaches reinforce each other: the more grammar a student understands explicitly, the more they notice it in context; the more input they encounter, the more intuitive the grammar becomes.

### Spanish support scaled by level

At the beginner level, Spanish is present throughout — in translations, instructions, and explanations. As students advance, Spanish support is gradually reduced, pushing learners toward thinking and reading in English. At the advanced level, the platform operates almost entirely in English.

| Level | Spanish support |
|---|---|
| Beginner (A1–A2) | Full Spanish translations and bilingual instructions throughout |
| Intermediate (B1–B2) | Spanish hints available on request; instructions in English |
| Advanced (C1+) | English only; Spanish available only in the resources section |

### Mistakes as data, not failure

Puente treats mistakes as useful information, not failure. Wrong answers are never penalized — they are recorded and used to surface personalized recommendations. If a student consistently struggles with a topic, the platform suggests targeted activities and resources for that area.

Some activities are self-paced and forgiving. Others are mastery-based, requiring demonstrated understanding before a student moves on. Both modes have a place in real learning, and Puente includes both.

### The most important thing

Above all, Puente is designed so that learning does not feel like a chore. Every design decision — the tone of feedback, the variety of activity types, the curated resources, the Word of the Day — is made with one goal in mind: to make students genuinely curious about English and motivated to keep learning on their own long after the class is over.

---

## Who This Is For

- **Students** who want to practice English independently, at their own pace, on their phone or computer
- **Teachers** who want a free, flexible tool for classroom activities, homework assignments, and progress tracking
- **Anyone** learning English who benefits from a bilingual, Spanish-friendly environment

---

## Features

### For students
- Vocabulary flashcards with audio pronunciation
- Grammar drills with immediate, explanatory feedback
- Leveled reading passages with click-to-define vocabulary
- Curated free resources: apps, YouTube channels, Anki decks, Quizlet sets
- Personal progress tracking across sessions
- Word of the Day on every visit
- Works on mobile and desktop
- Dark mode

### For teachers
- Class management and student rosters
- Assign specific activities or topics to a class
- Upload custom vocabulary lists and exercises
- Student progress dashboard — see who is practicing, how often, and where they struggle
- Classroom projector mode for whole-class activities

---

## Tech Stack

- **Frontend:** Vanilla HTML, CSS, and JavaScript — no frameworks, no build tools required
- **Auth + Database:** [Supabase](https://supabase.com/) — Authentication and PostgreSQL (free tier)
- **Hosting:** GitHub Pages

---

## Local Setup

1. Clone the repository:
   ```bash
   git clone git@github.com:MightyElf4/puente-english.git
   cd puente-english
   ```

2. Set up Supabase (see [Supabase Setup](#supabase-setup) below).

3. Open `index.html` in your browser. No build step or local server required for most features.

---

## Supabase Setup

Puente uses Supabase for user authentication and data storage. To run your own instance:

1. Go to [supabase.com](https://supabase.com) and create a free project
2. In the Supabase dashboard, go to **Authentication → Providers** and confirm Email is enabled
3. Go to **Project Settings → API** and copy your **Project URL** and **anon/public key**
4. Paste them into `js/supabase-config.js`:

```javascript
const SUPABASE_URL  = 'https://your-project.supabase.co';
const SUPABASE_ANON = 'your-anon-key';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
```

5. Run the SQL schema in **SQL Editor → New query** (see `docs/SCHEMA.sql` once created)

> Supabase anon keys are safe to include in client-side code. Access is controlled by Row Level Security (RLS) policies on the database, not by keeping the key secret.

---

## Documentation

- [Teacher Guide](docs/TEACHER_GUIDE.md) — Set up a class, create assignments, upload content, and read the progress dashboard
- [Content Guide](docs/CONTENT_GUIDE.md) — Add vocabulary, grammar topics, reading passages, and curated resources

---

## Credits

*Credits and acknowledgments will be added as the platform grows. All external content linked in Puente points to free, publicly available resources. Where possible, original creators are credited directly on the resources page.*

---

## License

MIT — free to use, adapt, and share.
