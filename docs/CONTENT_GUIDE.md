# Content Guide

This guide explains how to add new content to Puente — vocabulary, grammar topics, reading passages, and curated resources. It is written for whoever maintains the codebase directly.

---

## Overview

Puente has two types of content:

| Type | Where it lives | Who edits it |
|---|---|---|
| Vocabulary + resources | Google Sheets (fetched automatically) or Firebase | Teachers via the app, or directly in Sheets |
| Grammar + reading | `js/content.js` | Developer |

---

## Adding Vocabulary

*(Coming soon)* — Vocabulary will be managed through a Google Sheet or directly through the teacher upload interface. Instructions will be added here once that system is built.

The planned column structure for a vocabulary entry is:

| Field | Description | Example |
|---|---|---|
| `word` | The English word | *ambitious* |
| `spanish` | Spanish translation | *ambicioso/a* |
| `definition` | Simple English definition | *having a strong desire to succeed* |
| `example` | Example sentence | *She is ambitious and works very hard.* |
| `level` | beginner / intermediate / advanced | *intermediate* |
| `topic` | Thematic category | *personality, work* |
| `emoji` | Optional visual hint | *🎯* |

---

## Adding Grammar Topics

Grammar content lives in `js/content.js`. Each topic follows this structure:

```javascript
{
  topic: 'Simple Present',       // Display name
  level: 'beginner',             // beginner / intermediate / advanced
  explanation: `
    Use the simple present tense for habits, routines, and facts.
    Add -s or -es for he/she/it.

    Examples:
    - I eat breakfast every morning.
    - She works at a school.
    - Water boils at 100°C.
  `,
  funFact: `In English, "I am" is the only verb form that changes
            for the first person. Most other languages do this for
            every pronoun — English simplified it over time.`,
  exercises: [
    {
      type: 'fill-blank',
      sentence: 'She ___ to school every day.',
      answer: 'goes',
      options: ['go', 'goes', 'going', 'gone'],
      hint: 'She = third person singular → add -s or -es'
    },
    {
      type: 'multiple-choice',
      question: 'Which sentence is correct?',
      options: [
        'He don't like coffee.',
        'He doesn't like coffee.',
        'He not like coffee.',
        'He isn't like coffee.'
      ],
      answer: 'He doesn\'t like coffee.',
      explanation: 'Use "doesn\'t" (does + not) for he/she/it in negative sentences.'
    }
  ]
}
```

**To add a new topic:** copy the block above, fill in the fields, and add it to the appropriate level array in `content.js`.

---

## Adding Reading Passages

Reading passages also live in `js/content.js`. Each passage follows this structure:

```javascript
{
  title: 'A Morning in San José',
  level: 'beginner',
  topic: 'daily life',
  text: `
    María wakes up at six o'clock every morning. She lives in San José,
    the capital of Costa Rica. First, she makes coffee. Then she gets dressed
    and walks to the bus stop. The bus is always crowded in the morning.
    María doesn't mind. She uses the time to listen to music in English.
  `,
  questions: [
    {
      question: 'What time does María wake up?',
      options: ['5:00 AM', '6:00 AM', '7:00 AM', '8:00 AM'],
      answer: '6:00 AM'
    },
    {
      question: 'How does María get to work?',
      options: ['By car', 'By bike', 'By bus', 'She walks'],
      answer: 'By bus'
    }
  ]
}
```

**Tips for writing passages:**
- Keep beginner passages to 100–150 words; intermediate 150–250; advanced 250–400
- Use themes students can relate to: daily life, Costa Rica, travel, work, culture
- Every word in the passage should be available in the vocabulary data so click-to-define works

---

## Adding Curated Resources

*(Coming soon)* — Resources will be managed through a Google Sheet or Firebase. The planned fields are:

| Field | Description | Example |
|---|---|---|
| `title` | Name of the resource | *BBC Learning English* |
| `url` | Link | *https://bbc.co.uk/learningenglish* |
| `type` | app / video / deck / website | *website* |
| `level` | beginner / intermediate / advanced / all | *all* |
| `skill` | vocabulary / grammar / reading / speaking / all | *all* |
| `description` | One sentence explaining why it's useful | *Free lessons, videos, and quizzes from the BBC.* |
| `credit` | Creator or organization to credit | *BBC* |
