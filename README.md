# 🦁 Biblia Kids

A Bible reading and exploration app for children, built on the conviction that great doctrine and great storytelling belong together.

Children type any Bible story, character, or question in plain language. The app responds with a rich, wonder-filled explanation in the spirit of C.S. Lewis's Chronicles of Narnia — warm, vivid, and imaginative — while staying firmly grounded in Reformed theology in the tradition of John Calvin, Charles Spurgeon, and R.C. Sproul.

> *"Since it is God alone who enlightens our minds to perceive his truth, how great is our ingratitude if we do not fear to obscure it by our darkness."*
> — John Calvin

---

## The Idea

Most Bible apps for children fall into one of two traps: they either reduce Scripture to a moral lesson ("be kind like Jesus!") or they make the stories so simple that the real wonder — and the real weight — gets lost.

This app tries to hold two things together:

**Doctrinal precision.** Every answer is shaped by the Reformed faith: God's absolute sovereignty, total depravity, salvation by grace alone through faith alone in Christ alone, the glory of God as the chief end of all things, and Christ as the hero of every story from Genesis to Revelation. These are not simplified away — they are explained *through* story rather than *instead of* story.

**Narnia-style wonder.** C.S. Lewis believed imagination is a vehicle for truth. A child who feels the fear and wonder of a story about God will carry that truth deeper than one who only memorises a verse. The app speaks in vivid imagery — forests, stars, kings, great quests — because that is how children (and adults) come to love what is true.

The app is forked from [Lectio Scriptura](../lectio-scriptura/), which provides the same theological depth for adult Bible study with the voices of historical Reformed theologians.

---

## What It Does

- **Free-text input** — children type anything: *"Noah and the Ark"*, *"Why did God send Jesus?"*, *"Who is the Holy Spirit?"*
- **Three guide styles** — The Great Storyteller (warm, wonder-filled), The Brave Guide (bold, adventure-focused), The Curious Friend (playful, questioning)
- **Reformed theological core** — every response is grounded in the seven doctrinal pillars listed in the system prompt; the style changes but the doctrine never does
- **Strong guardrails** — the AI will not answer off-topic questions, will not fabricate Bible stories or verses, and will say "I don't know" rather than guess; anti-jailbreak instructions prevent children from drifting the AI off its purpose
- **Follow-up chat** — children can ask questions after the story; suggestion chips help younger readers who are not sure what to ask

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite |
| Backend | Python, FastAPI, Uvicorn |
| AI | Anthropic Claude (`claude-sonnet-4-6`) via the Anthropic Python SDK |
| Fonts | Google Fonts — Nunito, Lora |

The API key is held server-side only and never exposed to the browser.

---

## Running Locally

### Prerequisites

- Python 3.10+
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com)

### 1. Clone and set up the environment

```bash
git clone <your-repo-url>
cd biblia-kids
cp .env.example .env
# Open .env and add your ANTHROPIC_API_KEY
```

### 2. Start the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Start the frontend

```bash
# In a new terminal, from the project root
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Production build

```bash
cd frontend && npm run build
# FastAPI will serve the built frontend from /frontend/dist
uvicorn main:app --port 8000
```

---

## Acknowledgements

**Theological tradition**
This app draws on the Reformed theological tradition as articulated by:
- **John Calvin** (1509–1564) — *Institutes of the Christian Religion*, biblical commentaries
- **Charles Spurgeon** (1834–1892) — Metropolitan Tabernacle sermons
- **R.C. Sproul** (1939–2017) — writings on Reformed theology and Christian education
- **Westminster Shorter Catechism** (1647) — public domain confessional standard, especially Q1: *"What is the chief end of man? To glorify God and to enjoy him forever."*

**Storytelling inspiration**
- **C.S. Lewis** (1898–1963) — *The Chronicles of Narnia* and *Mere Christianity*; the conviction that imagination and truth belong together

**Technology**
- [Anthropic Claude](https://www.anthropic.com) — AI language model powering all responses
- [React](https://react.dev) and [Vite](https://vitejs.dev) — frontend framework and build tool
- [FastAPI](https://fastapi.tiangolo.com) — Python web framework for the backend proxy

---

## Important Disclaimer

> **This app uses artificial intelligence to generate Bible explanations. AI can make mistakes.**
>
> - Responses are AI-generated and are **not** written by a pastor, theologian, or biblical scholar.
> - While the system is designed to stay within Reformed theological boundaries, it may occasionally misrepresent, oversimplify, or miss nuance.
> - **Never treat this app as a substitute for your pastor, your church, or careful personal Bible reading.**
> - If something the app says seems wrong, unclear, or troubling — ask your pastor or a trusted Christian adult. That conversation is more valuable than anything this app can provide.
> - Bible references generated by the AI should always be verified in an actual Bible.

This app is a tool to spark curiosity and wonder about Scripture. The local church, faithful preaching, and Christian community are where that curiosity is properly formed and sustained.

## Contributing

Pull requests welcome. Please:
- Keep `.env` out of commits (check `.gitignore`)
- Run `ruff check backend/` before pushing Python changes
- Run `npm run build` before pushing frontend changes to verify it compiles
- Document any new theologians added with era and tradition in this README


*Soli Deo Gloria*
