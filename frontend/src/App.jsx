import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

// ── Age Groups ────────────────────────────────────────────────────
const AGE_GROUPS = [
  {
    id: "little",
    label: "Little Lions",
    emoji: "🦁",
    ages: "Ages 5–8",
    desc: "Simple words, big adventures",
    wordTarget: "250–400 words",
  },
  {
    id: "young",
    label: "Young Adventurers",
    emoji: "⚔️",
    ages: "Ages 9–12",
    desc: "Deeper stories, bigger questions",
    wordTarget: "400–600 words",
  },
];

// ── Guide Styles ──────────────────────────────────────────────────
// Each guide uses C.S. Lewis / Narnia-inspired storytelling,
// but from a different angle to suit the child's choice.
const GUIDES = [
  {
    id: "storyteller",
    name: "The Great Storyteller",
    emoji: "📖",
    desc: "Warm & wonder-filled",
    voice:
      "You speak like a wise, warm grandfather sitting by a fireplace, " +
      "telling the greatest story ever told. You use gentle wonder, vivid " +
      "imagery of forests, stars, and kind creatures, and the joy of discovery.",
  },
  {
    id: "adventurer",
    name: "The Brave Guide",
    emoji: "🗺️",
    desc: "Bold & exciting",
    voice:
      "You speak like a brave, encouraging adventurer leading a quest. " +
      "The Bible passage is the map; God's kingdom is the land to explore. " +
      "You use exciting language of journeys, battles won by love, and heroes " +
      "who trust the Great King.",
  },
  {
    id: "friend",
    name: "The Curious Friend",
    emoji: "🌟",
    desc: "Playful & curious",
    voice:
      "You speak like an enthusiastic, curious best friend who just discovered " +
      "the most amazing thing and can't wait to share it. You ask wonder-questions " +
      "and compare Bible truths to things children know — animals, seasons, friendship, games.",
  },
];

// ── System Prompt Builder ─────────────────────────────────────────
function buildSystem({ guideId, ageGroup, passageRef, passageText, priorStory }) {
  const guide = GUIDES.find((g) => g.id === guideId) || GUIDES[0];
  const age = AGE_GROUPS.find((a) => a.id === ageGroup) || AGE_GROUPS[0];

  const isLittle = ageGroup === "little";

  const ageRule = isLittle
    ? `AGE RULE: You are speaking to children aged 5–8. Use very simple words. Short sentences. No hard theological terms — if you must use one, explain it immediately with a fun comparison. Aim for ${age.wordTarget}.`
    : `AGE RULE: You are speaking to children aged 9–12. You can use slightly more complex sentences, but keep the language clear and vivid. No unnecessary jargon. Aim for ${age.wordTarget}.`;

  const styleRule = `
STYLE RULE — C.S. LEWIS / NARNIA:
${guide.voice}

You always write as if the Bible is the greatest and truest adventure story ever told.
Use vivid imagery: forests, stars, mountains, rivers, creatures, kings and kingdoms.
Draw comparisons children understand: friendship, fear of the dark, a wonderful surprise,
the feeling of coming home. Never be dry or lecture-y. Always be warm and alive.

You write in the spirit of C.S. Lewis — who believed that stories, imagination, and truth
belong together. You show how God is real, good, and wonderfully close.
`.trim();

  const guardrail = `
GUARDRAIL:
You only answer questions about:
- The Bible passage being studied (${passageRef})
- Bible stories, characters, and events
- Who God is, who Jesus is, what the Holy Spirit does
- Christian faith, prayer, kindness, forgiveness, love

If a child asks something completely unrelated to the Bible or faith (homework, games,
movies, food, etc.), gently say: "That's a fun question! But I'm only here to help you
explore the Bible today. Ask me something about the passage!"

Do NOT return JSON for guardrail — just reply with that friendly sentence naturally.
`.trim();

  const ctx = [
    `Current passage: ${passageRef}`,
    `Passage text:\n${passageText}`,
    priorStory ? `Your prior story about this passage:\n${priorStory}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const lengthRule =
    "LENGTH RULE: Keep your response within 3000 tokens. End naturally — complete sentences always. Never trail off mid-thought.";

  return [styleRule, ageRule, lengthRule, guardrail, ctx].join("\n\n");
}

// ── Bible Books (for fuzzy matching) ─────────────────────────────
const BOOKS = [
  ["Genesis","gen","ge","gn"],["Exodus","exo","ex","exod"],["Leviticus","lev","le","lv"],
  ["Numbers","num","nu","nm"],["Deuteronomy","deu","dt","deut"],["Joshua","jos","josh"],
  ["Judges","jdg","jg","judg"],["Ruth","rut","ru"],["1 Samuel","1sa","1sam"],
  ["2 Samuel","2sa","2sam"],["1 Kings","1ki","1kgs"],["2 Kings","2ki","2kgs"],
  ["1 Chronicles","1ch","1chr","1chron"],["2 Chronicles","2ch","2chr","2chron"],
  ["Ezra","ezr"],["Nehemiah","neh","ne"],["Esther","est","esth"],["Job","jb"],
  ["Psalms","ps","psa","psalm"],["Proverbs","pro","pr","prov"],
  ["Ecclesiastes","ecc","ec","eccl"],["Song of Solomon","sng","ss","song","sos"],
  ["Isaiah","isa","is"],["Jeremiah","jer","je","jr"],["Lamentations","lam","la"],
  ["Ezekiel","ezk","eze","ezek"],["Daniel","dan","da","dn"],["Hosea","hos","ho"],
  ["Joel","jol","joe","jl"],["Amos","amo","am"],["Obadiah","oba","ob","obad"],
  ["Jonah","jon","jnh"],["Micah","mic","mi"],["Nahum","nam","nah","na"],
  ["Habakkuk","hab"],["Zephaniah","zep","zeph"],["Haggai","hag","hg"],
  ["Zechariah","zec","zech"],["Malachi","mal","ml"],
  ["Matthew","mat","mt","matt"],["Mark","mrk","mk","mr"],["Luke","luk","lk"],
  ["John","jhn","jn"],["Acts","act"],["Romans","rom","ro","rm"],
  ["1 Corinthians","1co","1cor"],["2 Corinthians","2co","2cor"],
  ["Galatians","gal","ga"],["Ephesians","eph"],["Philippians","php","phil"],
  ["Colossians","col"],["1 Thessalonians","1th","1thes","1thess"],
  ["2 Thessalonians","2th","2thes","2thess"],["1 Timothy","1ti","1tim"],
  ["2 Timothy","2ti","2tim"],["Titus","tit"],["Philemon","phm","phlm"],
  ["Hebrews","heb"],["James","jas","jm"],["1 Peter","1pe","1pet"],
  ["2 Peter","2pe","2pet"],["1 John","1jn","1jo","1jhn"],
  ["2 John","2jn","2jo","2jhn"],["3 John","3jn","3jo","3jhn"],
  ["Jude","jud"],["Revelation","rev","re","rv"],
];

function levenshtein(a, b) {
  const m = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= b.length; j++) m[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      m[i][j] = a[i - 1] === b[j - 1] ? m[i - 1][j - 1]
        : 1 + Math.min(m[i - 1][j], m[i][j - 1], m[i - 1][j - 1]);
  return m[a.length][b.length];
}

function fuzzyBook(input) {
  const norm = input.toLowerCase().replace(/\s+/g, " ").trim();
  let best = null, bestDist = Infinity;
  for (const [canonical, ...aliases] of BOOKS) {
    for (const form of [canonical.toLowerCase(), ...aliases]) {
      if (form === norm) return canonical;
      if (norm.length >= 3 && form.startsWith(norm)) return canonical;
      const d = levenshtein(norm, form);
      if (d < bestDist) { bestDist = d; best = canonical; }
    }
  }
  const maxDist = norm.replace(/\s/g, "").length <= 4 ? 1 : 2;
  return bestDist <= maxDist ? best : input;
}

function normalizeRef(raw) {
  const trimmed = raw.trim();
  const m = trimmed.match(/^(\d\s+)?([a-zA-Z][a-zA-Z\s]*?)\s+(\d[\d:,.\-–—]*)$/);
  if (!m) return trimmed;
  const prefix = (m[1] || "").trim();
  const bookInput = prefix ? `${prefix} ${m[2].trim()}` : m[2].trim();
  return `${fuzzyBook(bookInput)} ${m[3].trim()}`;
}

// ── Bible API ─────────────────────────────────────────────────────
async function fetchPassage(reference) {
  const url = `https://bible-api.com/${encodeURIComponent(reference)}?translation=web`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Passage not found. Try: John 3:16 or Genesis 1:1-5");
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return { reference: data.reference, text: data.text.trim(), verses: data.verses };
}

// ── Claude API ────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

async function callClaude(messages, system) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, system }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API error ${res.status}`);
  }
  const data = await res.json();
  return data.text;
}

// ── Suggestion Questions ──────────────────────────────────────────
const SUGGESTIONS = [
  "Why did God do that?",
  "What does this mean for me?",
  "Who is the hero of this story?",
  "What is God like in this passage?",
  "Tell me more about this!",
  "How can I be brave like this?",
];

// ── Icons ─────────────────────────────────────────────────────────
const LionIcon = () => (
  <svg width="28" height="28" viewBox="0 0 100 100" fill="none">
    <circle cx="50" cy="50" r="46" fill="#f5c842" />
    <circle cx="50" cy="50" r="36" fill="#e8a020" />
    <circle cx="50" cy="52" r="26" fill="#f5c842" />
    <circle cx="41" cy="46" r="4.5" fill="#3d2b00" />
    <circle cx="59" cy="46" r="4.5" fill="#3d2b00" />
    <circle cx="42" cy="45" r="1.8" fill="white" />
    <circle cx="60" cy="45" r="1.8" fill="white" />
    <ellipse cx="50" cy="56" rx="4.5" ry="3" fill="#c05020" />
    <path d="M44 62 Q50 68 56 62" stroke="#3d2b00" strokeWidth="2" fill="none" strokeLinecap="round" />
    <line x1="22" y1="54" x2="40" y2="57" stroke="#3d2b00" strokeWidth="1.5" />
    <line x1="22" y1="60" x2="40" y2="60" stroke="#3d2b00" strokeWidth="1.5" />
    <line x1="60" y1="57" x2="78" y2="54" stroke="#3d2b00" strokeWidth="1.5" />
    <line x1="60" y1="60" x2="78" y2="60" stroke="#3d2b00" strokeWidth="1.5" />
    <polygon points="26,26 34,40 18,40" fill="#e8a020" />
    <polygon points="74,26 82,40 66,40" fill="#e8a020" />
    <polygon points="26,26 32,37 20,37" fill="#f5c842" />
    <polygon points="74,26 80,37 68,37" fill="#f5c842" />
  </svg>
);

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#f5c842">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const BookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const Spin = ({ s = 18 }) => (
  <div style={{
    width: s, height: s, borderRadius: "50%",
    border: "3px solid #7ec850", borderTopColor: "transparent",
    animation: "spin .8s linear infinite", flexShrink: 0,
  }} />
);

// ── App ───────────────────────────────────────────────────────────
export default function App() {
  const [ageGroup, setAgeGroup]         = useState("little");
  const [guide, setGuide]               = useState(GUIDES[0]);
  const [passage, setPassage]           = useState("");
  const [passageData, setPassageData]   = useState(null);
  const [story, setStory]               = useState("");
  const [chatMessages, setChat]         = useState([]);
  const [chatInput, setChatInput]       = useState("");
  const [loadingStory, setLoadingStory] = useState(false);
  const [loadingChat, setLoadingChat]   = useState(false);
  const [error, setError]               = useState("");
  const [openPicker, setOpenPicker]     = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = () => setOpenPicker(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  async function handleExplore() {
    if (!passage.trim()) return;
    setError(""); setPassageData(null); setStory(""); setChat([]);
    setLoadingStory(true);
    try {
      const data = await fetchPassage(normalizeRef(passage.trim()));
      setPassageData(data);
      const system = buildSystem({ guideId: guide.id, ageGroup, passageRef: data.reference, passageText: data.text });
      const ageLabel = AGE_GROUPS.find((a) => a.id === ageGroup)?.label || "Little Lions";
      const prompt = `Tell me the story of this Bible passage in your wonderful way! Make it come alive for a ${ageLabel} reader.\n\nPassage: ${data.reference}\n\n${data.text}`;
      setStory(await callClaude([{ role: "user", content: prompt }], system));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingStory(false);
    }
  }

  async function handleChat(inputOverride) {
    const userMsg = (inputOverride || chatInput).trim();
    if (!userMsg || loadingChat || !passageData) return;
    setChatInput("");
    const newMsgs = [...chatMessages, { role: "user", content: userMsg }];
    setChat(newMsgs);
    setLoadingChat(true);
    try {
      const system = buildSystem({
        guideId: guide.id, ageGroup,
        passageRef: passageData.reference, passageText: passageData.text,
        priorStory: story,
      });
      const reply = await callClaude(newMsgs.map((m) => ({ role: m.role, content: m.content })), system);
      setChat([...newMsgs, { role: "assistant", content: reply }]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingChat(false);
    }
  }

  const hasContent = passageData && story && !loadingStory;
  const currentAge = AGE_GROUPS.find((a) => a.id === ageGroup) || AGE_GROUPS[0];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,600;0,700;0,800;1,400&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes twinkle{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:1;transform:scale(1.2)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(245,200,66,.2)}50%{box-shadow:0 0 40px rgba(245,200,66,.5)}}
        *{box-sizing:border-box;margin:0;padding:0}
        html,body{background:#0e1f0e;-webkit-font-smoothing:antialiased}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:#2d4a2d;border-radius:4px}

        /* ── Layout ── */
        .app{min-height:100vh;background:linear-gradient(160deg,#0a1a0a 0%,#122312 40%,#0e1f1a 100%);color:#f0ead6;font-family:'Nunito',sans-serif}
        .stars{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
        .star{position:absolute;border-radius:50%;background:#f5c842;animation:twinkle 3s ease infinite}

        /* ── Header ── */
        .hdr{position:relative;z-index:20;display:flex;align-items:center;justify-content:space-between;padding:20px 36px;border-bottom:1px solid rgba(126,200,80,.15)}
        .hdr-brand{display:flex;align-items:center;gap:14px}
        .hdr-lion{animation:float 4s ease infinite}
        .hdr-title{font-family:'Lora',serif;font-size:22px;font-weight:600;color:#f5c842;letter-spacing:.5px}
        .hdr-sub{font-size:13px;color:#7ec850;margin-top:2px}
        .age-sw{display:flex;gap:8px}
        .age-opt{padding:8px 16px;border-radius:20px;font-family:'Nunito',sans-serif;font-size:12px;font-weight:700;cursor:pointer;border:2px solid transparent;transition:all .2s}
        .age-opt.on{background:#f5c842;color:#0e1f0e;border-color:#f5c842}
        .age-opt:not(.on){background:rgba(245,200,66,.08);color:#f5c842;border-color:rgba(245,200,66,.25)}
        .age-opt:not(.on):hover{background:rgba(245,200,66,.15)}

        /* ── Main ── */
        .main{position:relative;z-index:1;max-width:980px;margin:0 auto;padding:32px 36px}
        @media(max-width:760px){.main{padding:18px}.hdr{padding:14px 18px}.grid{grid-template-columns:1fr!important}}

        /* ── Controls ── */
        .ctrl{display:flex;gap:10px;margin-bottom:28px;flex-wrap:wrap;align-items:stretch}
        .pin{flex:1;min-width:200px;background:rgba(18,35,18,.8);border:2px solid rgba(126,200,80,.25);border-radius:14px;padding:13px 18px;color:#f0ead6;font-family:'Nunito',sans-serif;font-size:16px;font-weight:600;outline:none;transition:border-color .2s}
        .pin:focus{border-color:#7ec850}
        .pin::placeholder{color:#3a5a3a;font-style:italic;font-weight:400}

        /* ── Picker ── */
        .pkr{position:relative}
        .pkr-btn{background:rgba(18,35,18,.8);border:2px solid rgba(126,200,80,.25);border-radius:14px;padding:12px 16px;color:#7ec850;font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:8px;white-space:nowrap;height:100%;transition:all .2s}
        .pkr-btn:hover{border-color:#7ec850}
        .pkr-drop{position:absolute;top:calc(100% + 6px);left:0;background:#122312;border:2px solid rgba(126,200,80,.3);border-radius:14px;min-width:220px;z-index:200;box-shadow:0 20px 50px rgba(0,0,0,.6);overflow:hidden}
        .pkr-opt{padding:13px 18px;cursor:pointer;border-bottom:1px solid rgba(126,200,80,.1);transition:background .15s;display:flex;align-items:center;gap:10px}
        .pkr-opt:last-child{border-bottom:none}
        .pkr-opt:hover{background:rgba(126,200,80,.1)}
        .pkr-emoji{font-size:20px;flex-shrink:0}
        .pkr-name{font-weight:700;font-size:13px;color:#f0ead6}
        .pkr-meta{font-size:11px;color:#7ec850;font-style:italic;margin-top:1px}

        /* ── Go button ── */
        .go-btn{background:linear-gradient(135deg,#7ec850,#5aad30);border:none;border-radius:14px;padding:13px 26px;color:#0e1f0e;font-family:'Nunito',sans-serif;font-size:14px;font-weight:800;letter-spacing:.5px;cursor:pointer;transition:all .2s;white-space:nowrap;display:flex;align-items:center;gap:8px;animation:glow 3s ease infinite}
        .go-btn:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.1)}
        .go-btn:disabled{opacity:.4;cursor:not-allowed;animation:none;background:#3a5a3a}

        /* ── Error ── */
        .err{background:rgba(180,40,40,.15);border:2px solid rgba(180,40,40,.35);border-radius:12px;padding:12px 18px;color:#ff9988;font-size:15px;margin-bottom:20px}

        /* ── Loading ── */
        .ld{padding:40px 0;display:flex;flex-direction:column;gap:16px;align-items:flex-start}
        .ld-row{display:flex;align-items:center;gap:12px;color:#7ec850;font-size:16px;font-weight:600}

        /* ── Grid ── */
        .grid{display:grid;grid-template-columns:1fr 1.4fr;gap:20px;margin-bottom:20px}

        /* ── Panel ── */
        .panel{background:rgba(12,28,12,.7);border:2px solid rgba(126,200,80,.2);border-radius:18px;overflow:hidden;animation:fadeUp .4s ease both;backdrop-filter:blur(4px)}
        .ph{padding:14px 20px;border-bottom:1px solid rgba(126,200,80,.15);display:flex;align-items:center;justify-content:space-between;gap:8px}
        .plabel{font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#5aad30}
        .pref{font-family:'Lora',serif;font-size:13px;color:#f5c842;font-weight:600}
        .pb{padding:20px;max-height:500px;overflow-y:auto}

        /* ── Verse ── */
        .verse{display:flex;gap:10px;margin-bottom:10px}
        .vn{font-size:10px;color:#4a7a3a;min-width:18px;padding-top:4px;font-weight:700}
        .vt{font-family:'Lora',serif;font-size:15px;line-height:1.9;color:#d8e8c8}

        /* ── Story ── */
        .story p{font-size:16px;line-height:2;color:#e8ded8;margin-bottom:18px;font-family:'Lora',serif}
        .story p:first-child::first-letter{font-size:2.8em;float:left;line-height:.8;margin:4px 8px 0 0;color:#f5c842;font-family:'Lora',serif;font-weight:600}
        .story h1,.story h2,.story h3{font-family:'Nunito',sans-serif;font-weight:800;color:#7ec850;margin:20px 0 8px}
        .story h1{font-size:18px}.story h2{font-size:16px}.story h3{font-size:14px}
        .story strong{color:#f5c842;font-weight:700}
        .story em{color:#a8d880;font-style:italic}
        .story ul,.story ol{padding-left:22px;margin-bottom:16px}
        .story li{font-size:16px;line-height:1.9;color:#e8ded8;margin-bottom:6px;font-family:'Lora',serif}
        .story blockquote{border-left:3px solid #f5c842;margin:0 0 18px;padding:6px 0 6px 16px;color:#c8d8a8;font-style:italic;font-family:'Lora',serif}
        .ai-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(245,200,66,.1);border:1px solid rgba(245,200,66,.25);border-radius:20px;padding:4px 12px;font-size:11px;color:#c8a040;font-weight:700}
        .cite-bar{padding:8px 20px;border-top:1px solid rgba(126,200,80,.1);font-size:10px;color:#3a5a3a;font-weight:700;letter-spacing:.8px;text-align:right}

        /* ── Chat ── */
        .chat{background:rgba(12,28,12,.7);border:2px solid rgba(126,200,80,.2);border-radius:18px;overflow:hidden;animation:fadeUp .4s .08s ease both;backdrop-filter:blur(4px)}
        .ch{padding:16px 24px;border-bottom:1px solid rgba(126,200,80,.15);display:flex;align-items:center;justify-content:space-between;gap:12px}
        .ch-title{font-family:'Nunito',sans-serif;font-size:17px;font-weight:800;color:#f5c842}
        .ch-sub{font-size:12px;color:#5aad30;margin-top:2px}
        .cms{padding:18px 24px;min-height:120px;max-height:400px;overflow-y:auto;display:flex;flex-direction:column;gap:14px}
        .cempty{color:#3a5a3a;font-style:italic;font-size:15px;text-align:center;padding:24px 0}

        /* ── Suggestions ── */
        .sugg{display:flex;gap:8px;flex-wrap:wrap;padding:0 24px 12px}
        .sugg-btn{padding:6px 14px;background:rgba(126,200,80,.1);border:1px solid rgba(126,200,80,.25);border-radius:20px;color:#7ec850;font-family:'Nunito',sans-serif;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s;white-space:nowrap}
        .sugg-btn:hover{background:rgba(126,200,80,.2);border-color:#7ec850}

        /* ── Messages ── */
        .msg{display:flex;gap:10px;animation:fadeUp .3s ease}
        .mu{flex-direction:row-reverse}
        .bbl{max-width:80%;padding:12px 16px;border-radius:14px;font-size:15px;line-height:1.75}
        .mu .bbl{background:rgba(90,173,48,.2);color:#e8f8d8;border:1px solid rgba(126,200,80,.3);font-weight:600;font-family:'Nunito',sans-serif}
        .ma .bbl{background:rgba(18,35,18,.9);color:#e8ded8;border:1px solid rgba(126,200,80,.15);font-family:'Lora',serif}
        .ma .bbl p{margin:0 0 10px;line-height:1.8}.ma .bbl p:last-child{margin-bottom:0}
        .ma .bbl strong{color:#f5c842;font-weight:700}
        .ma .bbl em{color:#a8d880;font-style:italic}
        .ma .bbl ul,.ma .bbl ol{padding-left:18px;margin:0 0 10px}
        .ma .bbl li{margin-bottom:4px;line-height:1.7}
        .av{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;margin-top:2px}
        .mu .av{background:rgba(90,173,48,.2);border:1px solid rgba(126,200,80,.3)}
        .ma .av{background:rgba(245,200,66,.1);border:1px solid rgba(245,200,66,.25)}

        /* ── Chat input ── */
        .cir{padding:12px 20px;border-top:1px solid rgba(126,200,80,.15);display:flex;gap:10px;align-items:flex-end}
        .ci{flex:1;background:rgba(10,26,10,.8);border:2px solid rgba(126,200,80,.2);border-radius:12px;padding:11px 14px;color:#f0ead6;font-family:'Nunito',sans-serif;font-size:15px;font-weight:600;outline:none;resize:none;min-height:44px;max-height:100px;transition:border-color .2s}
        .ci:focus{border-color:#7ec850}
        .ci::placeholder{color:#2d4a2d;font-style:italic;font-weight:400}
        .sb{background:linear-gradient(135deg,#7ec850,#5aad30);border:none;border-radius:12px;width:44px;height:44px;display:flex;align-items:center;justify-content:center;color:#0e1f0e;cursor:pointer;transition:all .2s;flex-shrink:0}
        .sb:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.1)}
        .sb:disabled{opacity:.3;cursor:not-allowed;background:#3a5a3a}

        /* ── Empty state ── */
        .empty{text-align:center;padding:72px 20px}
        .empty-lion{font-size:56px;margin-bottom:18px;animation:float 4s ease infinite;display:block}
        .empty-title{font-family:'Lora',serif;font-size:22px;font-weight:600;color:#7ec850;margin-bottom:10px}
        .empty-sub{font-size:14px;color:#3a5a3a;max-width:380px;margin:0 auto;line-height:1.75}
        .empty-examples{margin-top:20px;display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
        .ex-btn{padding:7px 16px;background:rgba(126,200,80,.08);border:1px solid rgba(126,200,80,.2);border-radius:20px;color:#5aad30;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s}
        .ex-btn:hover{background:rgba(126,200,80,.15);color:#7ec850}
      `}</style>

      {/* Twinkling stars background */}
      <div className="stars">
        {[...Array(28)].map((_, i) => (
          <div key={i} className="star" style={{
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
          }} />
        ))}
      </div>

      <div className="app">
        {/* ── Header ── */}
        <header className="hdr">
          <div className="hdr-brand">
            <div className="hdr-lion"><LionIcon /></div>
            <div>
              <div className="hdr-title">Biblia Kids</div>
              <div className="hdr-sub">Bible Adventures for Young Explorers</div>
            </div>
          </div>
          <div className="age-sw">
            {AGE_GROUPS.map((a) => (
              <button key={a.id} className={`age-opt ${ageGroup === a.id ? "on" : ""}`}
                onClick={() => setAgeGroup(a.id)}>
                {a.emoji} {a.label}
              </button>
            ))}
          </div>
        </header>

        <main className="main">
          {/* ── Controls ── */}
          <div className="ctrl">
            <input
              className="pin"
              placeholder="Type a Bible passage — e.g. John 3:16, Psalm 23, Genesis 1:1..."
              value={passage}
              onChange={(e) => setPassage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleExplore()}
            />

            {/* Guide picker */}
            <div className="pkr" onClick={(e) => e.stopPropagation()}>
              <button className="pkr-btn" onClick={() => setOpenPicker((p) => p === "guide" ? null : "guide")}>
                {guide.emoji} {guide.name} <ChevronDown />
              </button>
              {openPicker === "guide" && (
                <div className="pkr-drop">
                  {GUIDES.map((g) => (
                    <div key={g.id} className="pkr-opt" onClick={() => { setGuide(g); setOpenPicker(null); }}>
                      <span className="pkr-emoji">{g.emoji}</span>
                      <div>
                        <div className="pkr-name">{g.name}</div>
                        <div className="pkr-meta">{g.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="go-btn" onClick={handleExplore} disabled={loadingStory || !passage.trim()}>
              <BookIcon />
              {loadingStory ? "Opening the Story..." : "Explore!"}
            </button>
          </div>

          {error && <div className="err">Oops! {error}</div>}

          {/* ── Loading state ── */}
          {loadingStory && (
            <div className="ld">
              <div className="ld-row"><Spin />Finding the passage in the Great Book...</div>
              <div className="ld-row"><Spin />{guide.name} is telling the story...</div>
            </div>
          )}

          {/* ── Content ── */}
          {hasContent && (
            <>
              <div className="grid">
                {/* Bible text */}
                <div className="panel">
                  <div className="ph">
                    <span className="plabel"><BookIcon /> Scripture</span>
                    <span className="pref">{passageData.reference}</span>
                  </div>
                  <div className="pb">
                    {passageData.verses?.map((v) => (
                      <div key={v.verse} className="verse">
                        <span className="vn">{v.verse}</span>
                        <span className="vt">{v.text.trim()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="cite-bar">bible-api.com · World English Bible</div>
                </div>

                {/* Story explanation */}
                <div className="panel" style={{ animationDelay: "0.08s" }}>
                  <div className="ph">
                    <span className="plabel"><StarIcon /> {guide.name}'s Story</span>
                    <span className="ai-badge">✨ AI Story · {currentAge.emoji} {currentAge.label}</span>
                  </div>
                  <div className="pb">
                    <div className="story">
                      <ReactMarkdown>{story}</ReactMarkdown>
                    </div>
                  </div>
                  <div className="cite-bar">AI-generated · C.S. Lewis Narnia style · Not verbatim</div>
                </div>
              </div>

              {/* ── Chat ── */}
              <div className="chat">
                <div className="ch">
                  <div>
                    <div className="ch-title">Ask a Question! 🌟</div>
                    <div className="ch-sub">Curious about something? {guide.name} is here to help.</div>
                  </div>
                  <span style={{ fontSize: 28 }}>{guide.emoji}</span>
                </div>

                {chatMessages.length === 0 && (
                  <div className="sugg">
                    {SUGGESTIONS.map((s) => (
                      <button key={s} className="sugg-btn" onClick={() => handleChat(s)}>{s}</button>
                    ))}
                  </div>
                )}

                <div className="cms">
                  {chatMessages.length === 0 && (
                    <div className="cempty">Ask anything about the passage — no question is too small!</div>
                  )}
                  {chatMessages.map((m, i) => {
                    const isUser = m.role === "user";
                    return (
                      <div key={i} className={`msg ${isUser ? "mu" : "ma"}`}>
                        <div className="av">{isUser ? "😊" : guide.emoji}</div>
                        <div className="bbl" style={{ maxWidth: "100%" }}>
                          {isUser
                            ? m.content
                            : <ReactMarkdown>{m.content}</ReactMarkdown>}
                        </div>
                      </div>
                    );
                  })}
                  {loadingChat && (
                    <div className="msg ma">
                      <div className="av">{guide.emoji}</div>
                      <div className="bbl"><Spin s={16} /></div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="cir">
                  <textarea
                    className="ci"
                    placeholder="What would you like to know?"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChat(); }
                    }}
                  />
                  <button className="sb" onClick={() => handleChat()} disabled={!chatInput.trim() || loadingChat}>
                    <SendIcon />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── Empty state ── */}
          {!hasContent && !loadingStory && (
            <div className="empty">
              <span className="empty-lion">🦁</span>
              <div className="empty-title">Where would you like to adventure today?</div>
              <div className="empty-sub">
                Type a Bible passage above and {guide.name} will tell you its story
                in the most wonderful way — just like stepping through a magical wardrobe.
              </div>
              <div className="empty-examples">
                {["John 3:16", "Psalm 23", "Genesis 1:1-5", "Matthew 5:1-12", "Daniel 6:16-23", "Luke 15:11-24"].map((ex) => (
                  <button key={ex} className="ex-btn" onClick={() => { setPassage(ex); }}>
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
