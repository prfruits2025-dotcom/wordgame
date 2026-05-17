import { useState, useEffect, useRef, useCallback } from "react";

const MONSTERS = [
  { name: "Gloomfang", emoji: "🐉", hp: 100, color: "#7c3aed", attack: "Fire Breath" },
  { name: "Shadowcrawl", emoji: "🕷️", hp: 80, color: "#1d4ed8", attack: "Venom Sting" },
  { name: "Frostbite", emoji: "🐺", hp: 120, color: "#0891b2", attack: "Ice Howl" },
  { name: "Blazetail", emoji: "🦊", hp: 90, color: "#ea580c", attack: "Ember Dash" },
];

const WORD_SETS = {
  easy: [
    { word: "BRAVE", meaning: "Showing courage in the face of danger", sentence: "The brave knight faced the dragon." },
    { word: "MAGIC", meaning: "Mysterious power to make things happen", sentence: "The wizard cast a magic spell." },
    { word: "QUEST", meaning: "A long difficult search for something", sentence: "They set off on a quest for treasure." },
    { word: "STORM", meaning: "Violent weather with strong winds", sentence: "The storm swept through the forest." },
    { word: "FLAME", meaning: "A stream of burning gas from fire", sentence: "The flame lit up the dark cave." },
  ],
  medium: [
    { word: "GALLANT", meaning: "Brave, heroic, and chivalrous", sentence: "The gallant hero saved the princess." },
    { word: "ANCIENT", meaning: "Belonging to the very distant past", sentence: "The ancient map led to the treasure." },
    { word: "MYSTICAL", meaning: "Having a spiritual, mysterious quality", sentence: "The mystical forest glowed at night." },
    { word: "TRIUMPH", meaning: "A great victory or achievement", sentence: "Their triumph echoed across the land." },
    { word: "PHANTOM", meaning: "A ghost or spirit appearing to people", sentence: "The phantom haunted the old castle." },
  ],
  hard: [
    { word: "LUMINOUS", meaning: "Emitting or reflecting bright light", sentence: "The luminous crystals lit the cave." },
    { word: "FEROCIOUS", meaning: "Savagely fierce, cruel, or violent", sentence: "The ferocious beast roared loudly." },
    { word: "ENCHANTED", meaning: "Placed under a spell; filled with delight", sentence: "The enchanted sword glowed blue." },
    { word: "VALIANT", meaning: "Possessing or showing courage", sentence: "The valiant warrior never gave up." },
    { word: "CELESTIAL", meaning: "Positioned in or relating to the sky", sentence: "The celestial star map guided them." },
  ]
};

const VOCAB_LIBRARY = [
  ...WORD_SETS.easy,
  ...WORD_SETS.medium,
  ...WORD_SETS.hard,
].map((w, i) => ({ ...w, id: i, difficulty: i < 5 ? "easy" : i < 10 ? "medium" : "hard", learned: i < 4, favorite: i === 1 || i === 7 }));

const STORIES = [
  {
    id: 1, title: "The Crystal Cave", difficulty: "easy", unlocked: true,
    text: "Deep in the Enchanted Forest, there lived a young wizard named Pip. One bright morning, Pip discovered a secret path covered in sparkling mushrooms. The path wound through tall trees and glowing flowers until it reached a crystal cave. Inside the cave, magical creatures played and danced.",
    words: ["Enchanted", "discovered", "sparkling", "glowing", "magical"],
  },
  {
    id: 2, title: "The Dragon's Riddle", difficulty: "medium", unlocked: true,
    text: "Zara the brave explorer stood before an ancient dragon. The enormous creature spoke with a thunderous voice. To pass this mountain, you must answer my riddle correctly. Zara thought carefully, remembering everything she had learned on her journey. She answered brilliantly and the dragon smiled.",
    words: ["ancient", "enormous", "thunderous", "correctly", "brilliantly"],
  },
  {
    id: 3, title: "Stars of Valor", difficulty: "hard", unlocked: false,
    text: "The celestial observatory towered above the kingdom. Astronomers there tracked luminous constellations each night. A phenomenal discovery awaited the most valiant scholar willing to persevere through countless challenges.",
    words: ["celestial", "luminous", "constellations", "phenomenal", "persevere"],
  },
];

const ACHIEVEMENTS = [
  { id: 1, icon: "⚔️", title: "First Strike", desc: "Win your first battle", earned: true },
  { id: 2, icon: "📚", title: "Word Wizard", desc: "Learn 10 new words", earned: true },
  { id: 3, icon: "🔥", title: "On Fire", desc: "7-day reading streak", earned: false },
  { id: 4, icon: "🏆", title: "Champion", desc: "Defeat 50 monsters", earned: false },
  { id: 5, icon: "🎙️", title: "Voice Master", desc: "Perfect pronunciation x10", earned: true },
  { id: 6, icon: "⭐", title: "Star Reader", desc: "Complete all stories", earned: false },
];

const POWERUPS = [
  { id: "freeze", icon: "❄️", name: "Freeze", color: "#06b6d4", active: true },
  { id: "hint", icon: "💡", name: "Hint", color: "#eab308", active: true },
  { id: "double", icon: "⚡", name: "2x Dmg", color: "#a855f7", active: false },
  { id: "auto", icon: "🔊", name: "Auto", color: "#22c55e", active: true },
  { id: "shield", icon: "🛡️", name: "Shield", color: "#f97316", active: false },
];

const PLAYERS_ONLINE = [
  { name: "DragonSlayer99", rank: "Gold", avatar: "🧙", level: 24, online: true },
  { name: "WordWitch", rank: "Silver", avatar: "🧝", level: 18, online: true },
  { name: "SpellBinder", rank: "Bronze", avatar: "🧚", level: 12, online: false },
  { name: "RuneMaster", rank: "Diamond", avatar: "🦸", level: 35, online: true },
];

const RANK_COLORS = { Bronze: "#cd7f32", Silver: "#c0c0c0", Gold: "#ffd700", Diamond: "#b9f2ff", Platinum: "#e5e4e2" };

function Particle({ style }) {
  return <div style={{ position: "absolute", borderRadius: "50%", pointerEvents: "none", ...style }} />;
}

function FloatingParticles({ count = 15, colors = ["#a78bfa", "#60a5fa", "#34d399", "#fbbf24"] }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 8 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 3,
  }));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: "absolute", left: p.left, top: p.top,
          width: p.size, height: p.size, borderRadius: "50%",
          background: p.color, opacity: 0.6,
          animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
        }} />
      ))}
    </div>
  );
}

function HPBar({ current, max, color = "#22c55e" }) {
  const pct = (current / max) * 100;
  const barColor = pct > 60 ? "#22c55e" : pct > 30 ? "#eab308" : "#ef4444";
  return (
    <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: 999, height: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.2)" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${barColor}, ${barColor}aa)`, borderRadius: 999, transition: "width 0.5s ease", boxShadow: `0 0 8px ${barColor}` }} />
    </div>
  );
}

function XPBar({ current, max }) {
  return (
    <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 999, height: 8, overflow: "hidden" }}>
      <div style={{ width: `${(current / max) * 100}%`, height: "100%", background: "linear-gradient(90deg, #a78bfa, #60a5fa)", borderRadius: 999, transition: "width 0.5s ease" }} />
    </div>
  );
}

function StarRating({ score }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3].map(i => (
        <span key={i} style={{ fontSize: 20, filter: i <= score ? "none" : "grayscale(1) opacity(0.3)" }}>⭐</span>
      ))}
    </div>
  );
}

// ===================== SCREENS =====================

function SplashScreen({ onStart }) {
  const [frame, setFrame] = useState(0);
  const letters = "WORD BATTLE ARENA".split("");
  useEffect(() => { const t = setInterval(() => setFrame(f => (f + 1) % 60), 50); return () => clearInterval(t); }, []);
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" }}>
      <FloatingParticles count={20} />
      {/* Castle bg */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120, background: "linear-gradient(0deg, #1e0a3c 0%, transparent 100%)", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 8 }}>
        {[60, 80, 100, 140, 100, 80, 60].map((h, i) => (
          <div key={i} style={{ width: 30, height: h, background: "#1a0530", borderRadius: "4px 4px 0 0", opacity: 0.7, position: "relative" }}>
            <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", width: 6, height: 8, background: "#1a0530", borderRadius: "2px 2px 0 0" }} />
          </div>
        ))}
      </div>
      {/* Portal ring */}
      <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", border: "3px solid rgba(167,139,250,0.3)", boxShadow: "0 0 60px rgba(167,139,250,0.4)", animation: "spin 8s linear infinite" }} />
      <div style={{ position: "absolute", width: 250, height: 250, borderRadius: "50%", border: "2px solid rgba(96,165,250,0.2)", boxShadow: "0 0 40px rgba(96,165,250,0.3)", animation: "spin 5s linear infinite reverse" }} />
      {/* Floating alphabet letters */}
      {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").slice(0, 12).map((l, i) => (
        <div key={i} style={{
          position: "absolute", left: `${5 + (i * 8)}%`, top: `${15 + Math.sin((frame + i * 10) / 10) * 10}%`,
          fontSize: 24, fontWeight: 900, color: `hsl(${(i * 30 + frame * 3) % 360}, 80%, 70%)`,
          opacity: 0.4, textShadow: `0 0 10px currentColor`, userSelect: "none",
          transition: "top 0.1s", fontFamily: "'Fredoka One', cursive"
        }}>{l}</div>
      ))}
      {/* Logo */}
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 13, letterSpacing: 6, color: "#a78bfa", textTransform: "uppercase", marginBottom: 8, fontFamily: "'Nunito', sans-serif" }}>✨ Magical Learning Adventure ✨</div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 2 }}>
          {"WORD BATTLE ARENA".split("").map((l, i) => (
            <span key={i} style={{
              fontSize: l === " " ? 20 : 36, fontWeight: 900,
              color: l === " " ? "transparent" : `hsl(${(i * 20 + frame * 5) % 360}, 90%, 65%)`,
              textShadow: `0 0 20px hsl(${(i * 20 + frame * 5) % 360}, 90%, 65%)`,
              display: "inline-block",
              transform: `translateY(${Math.sin((frame + i * 8) / 8) * 4}px)`,
              transition: "transform 0.1s", fontFamily: "'Fredoka One', cursive"
            }}>{l}</span>
          ))}
        </div>
        <div style={{ marginTop: 12, fontSize: 15, color: "#94a3b8", fontFamily: "'Nunito', sans-serif" }}>
          Spell. Speak. Conquer! 🗡️
        </div>
      </div>
      {/* Start button */}
      <button onClick={onStart} style={{
        position: "relative", zIndex: 10,
        background: "linear-gradient(135deg, #7c3aed, #4f46e5)", border: "none",
        borderRadius: 20, padding: "18px 48px", fontSize: 20, fontWeight: 800,
        color: "white", cursor: "pointer", fontFamily: "'Fredoka One', cursive",
        boxShadow: "0 0 30px rgba(124,58,237,0.8), 0 8px 30px rgba(0,0,0,0.4)",
        animation: "pulse 2s ease-in-out infinite", letterSpacing: 1
      }}>
        ⚔️ Start Adventure!
      </button>
      <div style={{ position: "relative", zIndex: 10, marginTop: 16, display: "flex", gap: 12 }}>
        <button style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12, padding: "8px 16px", color: "#94a3b8", cursor: "pointer", fontSize: 13, fontFamily: "'Nunito', sans-serif" }}>🔊 Music On</button>
        <button style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12, padding: "8px 16px", color: "#94a3b8", cursor: "pointer", fontSize: 13, fontFamily: "'Nunito', sans-serif" }}>♿ Accessibility</button>
      </div>
    </div>
  );
}

function HomeScreen({ onNavigate, playerData }) {
  const navButtons = [
    { id: "battle", icon: "⚔️", label: "Adventure Mode", color: "#7c3aed", desc: "Battle monsters!" },
    { id: "reading", icon: "📖", label: "Reading Challenge", color: "#0891b2", desc: "Read stories aloud" },
    { id: "pronunciation", icon: "🎙️", label: "Pronunciation Battle", color: "#059669", desc: "Speak & win" },
    { id: "multiplayer", icon: "🌐", label: "Multiplayer Arena", color: "#d97706", desc: "Fight friends" },
    { id: "vocab", icon: "📚", label: "Vocabulary Library", color: "#be185d", desc: "Learn new words" },
    { id: "parents", icon: "👨‍👩‍👧", label: "Parents Dashboard", color: "#475569", desc: "Track progress" },
  ];
  const [time, setTime] = useState(0);
  useEffect(() => { const t = setInterval(() => setTime(x => x + 1), 100); return () => clearInterval(t); }, []);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0f172a 0%, #1e1b4b 40%, #0f172a 100%)", padding: "0 0 24px", position: "relative", overflow: "hidden" }}>
      <FloatingParticles count={12} />
      {/* Top bar */}
      <div style={{ background: "linear-gradient(90deg, rgba(124,58,237,0.8), rgba(79,70,229,0.8))", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #f59e0b, #ef4444)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, border: "3px solid rgba(255,255,255,0.4)", boxShadow: "0 0 15px rgba(245,158,11,0.5)" }}>🧙</div>
          <div>
            <div style={{ fontWeight: 800, color: "white", fontSize: 16, fontFamily: "'Fredoka One', cursive" }}>{playerData.name}</div>
            <div style={{ fontSize: 12, color: "#c4b5fd" }}>Level {playerData.level} Wizard</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fbbf24", fontFamily: "'Fredoka One', cursive" }}>🪙 {playerData.coins}</div>
            <div style={{ fontSize: 10, color: "#94a3b8" }}>Coins</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#60a5fa", fontFamily: "'Fredoka One', cursive" }}>💎 {playerData.gems}</div>
            <div style={{ fontSize: 10, color: "#94a3b8" }}>Gems</div>
          </div>
        </div>
      </div>
      {/* XP bar */}
      <div style={{ padding: "12px 20px", background: "rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: "#a78bfa" }}>⚡ XP Progress</span>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>{playerData.xp} / {playerData.xpMax}</span>
        </div>
        <XPBar current={playerData.xp} max={playerData.xpMax} />
      </div>
      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "12px 16px" }}>
        {[
          { label: "🔥 Streak", value: `${playerData.streak} days`, color: "#f97316" },
          { label: "📖 Reading", value: `${playerData.readingPct}%`, color: "#22c55e" },
          { label: "🧠 Vocab", value: `${playerData.vocabPct}%`, color: "#a78bfa" },
        ].map(s => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: "10px 8px", textAlign: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.color, fontFamily: "'Fredoka One', cursive" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>{s.label}</div>
          </div>
        ))}
      </div>
      {/* Daily Reward */}
      <div style={{ margin: "0 16px 16px", background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.1))", borderRadius: 16, padding: 16, border: "1px solid rgba(245,158,11,0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 800, color: "#fbbf24", fontSize: 15, fontFamily: "'Fredoka One', cursive" }}>🎁 Daily Reward Ready!</div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>Claim your day {playerData.streak} reward</div>
          </div>
          <button style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)", border: "none", borderRadius: 12, padding: "10px 18px", color: "white", fontWeight: 800, cursor: "pointer", fontFamily: "'Fredoka One', cursive", fontSize: 14 }}>Claim!</button>
        </div>
      </div>
      {/* Nav buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "0 16px" }}>
        {navButtons.map(btn => (
          <button key={btn.id} onClick={() => onNavigate(btn.id)} style={{
            background: `linear-gradient(135deg, ${btn.color}33, ${btn.color}11)`,
            border: `1px solid ${btn.color}55`, borderRadius: 18, padding: "16px 12px",
            cursor: "pointer", textAlign: "left", position: "relative", overflow: "hidden",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
            onMouseEnter={e => { e.target.style.transform = "scale(1.03)"; e.target.style.boxShadow = `0 8px 30px ${btn.color}44`; }}
            onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = "none"; }}>
            <div style={{ fontSize: 30, marginBottom: 6 }}>{btn.icon}</div>
            <div style={{ fontWeight: 800, color: "white", fontSize: 14, fontFamily: "'Fredoka One', cursive", lineHeight: 1.2 }}>{btn.label}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{btn.desc}</div>
          </button>
        ))}
      </div>
      {/* Mascot */}
      <div style={{ position: "fixed", bottom: 90, right: 16, zIndex: 50, animation: "float 3s ease-in-out infinite" }}>
        <div style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", borderRadius: "50% 50% 50% 10px", width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, boxShadow: "0 0 20px rgba(124,58,237,0.6)", cursor: "pointer" }}>🦉</div>
        <div style={{ position: "absolute", bottom: "100%", right: 0, marginBottom: 8, background: "rgba(0,0,0,0.8)", borderRadius: 12, padding: "6px 10px", fontSize: 11, color: "white", whiteSpace: "nowrap", border: "1px solid rgba(167,139,250,0.3)" }}>Try Reading Challenge! 📖</div>
      </div>
    </div>
  );
}

function BattleScreen({ onBack, playerData, setPlayerData }) {
  const [monsterIdx, setMonsterIdx] = useState(0);
  const [monsterHP, setMonsterHP] = useState(100);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [word, setWord] = useState("");
  const [message, setMessage] = useState("Form a word to attack!");
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [attacking, setAttacking] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [damageNumbers, setDamageNumbers] = useState([]);
  const [victory, setVictory] = useState(false);
  const [listening, setListening] = useState(false);
  const [activeLetters, setActiveLetters] = useState([]);

  const monster = MONSTERS[monsterIdx % MONSTERS.length];
  const difficulty = monsterHP > 70 ? "easy" : monsterHP > 40 ? "medium" : "hard";
  const wordSet = WORD_SETS[difficulty];
  const currentWord = wordSet[Math.floor(Math.random() * wordSet.length)];

  const letterPool = "ABCDEFGHIJKLMNOPRSTW".split("");
  const [availableLetters] = useState(() => {
    const pool = [...letterPool];
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    return pool.slice(0, 12).map((l, i) => ({ l, id: i, used: false }));
  });

  useEffect(() => {
    if (timeLeft <= 0 || victory) return;
    const t = setInterval(() => setTimeLeft(x => x - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, victory]);

  const spawnDamage = (dmg) => {
    const id = Date.now();
    setDamageNumbers(prev => [...prev, { id, dmg, x: 40 + Math.random() * 20, y: 30 + Math.random() * 20 }]);
    setTimeout(() => setDamageNumbers(prev => prev.filter(d => d.id !== id)), 1200);
  };

  const attack = () => {
    if (!word || word.length < 3) { setMessage("Word too short! Need 3+ letters!"); return; }
    const dmg = word.length * 8 + combo * 5 + Math.floor(Math.random() * 10);
    const newHP = Math.max(0, monsterHP - dmg);
    setAttacking(true);
    setTimeout(() => { setShaking(true); setTimeout(() => setShaking(false), 500); }, 300);
    setTimeout(() => setAttacking(false), 600);
    spawnDamage(dmg);
    setMonsterHP(newHP);
    setCombo(c => c + 1);
    setMessage(`💥 "${word}" dealt ${dmg} damage! ${combo > 2 ? `COMBO x${combo}! 🔥` : ""}`);
    setWord("");
    setActiveLetters([]);
    setSelectedLetters([]);
    if (newHP <= 0) { setTimeout(() => setVictory(true), 800); }
  };

  const addLetter = (letter, id) => {
    if (activeLetters.includes(id)) return;
    setWord(w => w + letter);
    setActiveLetters(prev => [...prev, id]);
  };

  const clearWord = () => { setWord(""); setActiveLetters([]); };

  const speakWord = () => {
    if (!word) return;
    const u = new SpeechSynthesisUtterance(word);
    u.rate = 0.8;
    window.speechSynthesis.speak(u);
  };

  const listenForWord = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      setMessage("🎙️ Voice not supported in this browser"); return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.onstart = () => { setListening(true); setMessage("🎙️ Listening... say your word!"); };
    r.onresult = (e) => {
      const heard = e.results[0][0].transcript.toUpperCase().trim();
      setWord(heard);
      setMessage(`Heard: "${heard}" - Press Attack!`);
    };
    r.onend = () => setListening(false);
    r.onerror = () => { setListening(false); setMessage("Couldn't hear you. Try again!"); };
    r.start();
  };

  if (victory) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #065f46, #1d4ed8)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <FloatingParticles count={20} colors={["#fbbf24", "#34d399", "#60a5fa", "#a78bfa"]} />
        <div style={{ fontSize: 80, animation: "bounce 0.5s ease infinite alternate" }}>🏆</div>
        <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 36, color: "#fbbf24", textShadow: "0 0 20px #fbbf24" }}>VICTORY!</div>
        <div style={{ color: "#94a3b8", fontSize: 16, margin: "8px 0 24px", fontFamily: "'Nunito', sans-serif" }}>You defeated {monster.name}!</div>
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          {[{ v: `+${combo * 50}`, l: "XP Earned", c: "#a78bfa" }, { v: `+${combo * 10}`, l: "Coins", c: "#fbbf24" }, { v: combo, l: "Combo Max", c: "#34d399" }].map(s => (
            <div key={s.l} style={{ textAlign: "center", background: "rgba(255,255,255,0.1)", borderRadius: 16, padding: "12px 20px" }}>
              <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 24, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>{s.l}</div>
            </div>
          ))}
        </div>
        <button onClick={onBack} style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", border: "none", borderRadius: 16, padding: "14px 32px", color: "white", fontWeight: 800, fontFamily: "'Fredoka One', cursive", fontSize: 16, cursor: "pointer" }}>🏠 Back to Home</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #1a0530 0%, #0f172a 60%, #1a0530 100%)", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.4)" }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 10, padding: "6px 12px", color: "white", cursor: "pointer", fontSize: 13, fontFamily: "'Nunito', sans-serif" }}>← Back</button>
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 18, color: combo > 3 ? "#f97316" : "white" }}>🔥 x{combo}</div>
            <div style={{ fontSize: 10, color: "#94a3b8" }}>Combo</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 18, color: timeLeft < 10 ? "#ef4444" : "#fbbf24" }}>⏱ {timeLeft}s</div>
            <div style={{ fontSize: 10, color: "#94a3b8" }}>Time</div>
          </div>
        </div>
      </div>
      {/* Monster zone */}
      <div style={{ position: "relative", padding: "16px 20px 8px", background: "linear-gradient(180deg, rgba(124,58,237,0.1), transparent)" }}>
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontFamily: "'Fredoka One', cursive", color: "white", fontSize: 18 }}>{monster.emoji} {monster.name}</span>
            <span style={{ fontSize: 13, color: "#94a3b8" }}>⚡ {difficulty.toUpperCase()}</span>
          </div>
          <HPBar current={monsterHP} max={100} />
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>HP: {monsterHP}/100</div>
        </div>
        <div style={{ textAlign: "center", position: "relative" }}>
          <div style={{
            fontSize: 80, lineHeight: 1, userSelect: "none",
            animation: attacking ? "shake 0.3s ease" : shaking ? "shake 0.5s ease" : "float 3s ease-in-out infinite",
            filter: monsterHP < 30 ? "brightness(0.5) sepia(1) hue-rotate(320deg)" : "drop-shadow(0 0 20px rgba(124,58,237,0.6))"
          }}>{monster.emoji}</div>
          {/* Damage numbers */}
          {damageNumbers.map(d => (
            <div key={d.id} style={{
              position: "absolute", left: `${d.x}%`, top: `${d.y}%`,
              fontFamily: "'Fredoka One', cursive", fontSize: 28, color: "#fbbf24",
              textShadow: "0 0 10px #fbbf24", animation: "floatUp 1.2s ease forwards",
              pointerEvents: "none", zIndex: 20
            }}>-{d.dmg}!</div>
          ))}
        </div>
        {/* Monster speech */}
        <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: 12, padding: "8px 12px", textAlign: "center", border: "1px solid rgba(255,255,255,0.1)", marginTop: 4 }}>
          <span style={{ fontSize: 12, color: "#c4b5fd", fontFamily: "'Nunito', sans-serif" }}>
            {monsterHP > 70 ? "You'll never defeat me!" : monsterHP > 30 ? "Ouch! Keep fighting!" : "I'm almost done for..."}
          </span>
        </div>
      </div>
      {/* Word hint */}
      <div style={{ margin: "8px 16px", padding: "10px 14px", background: "rgba(96,165,250,0.1)", borderRadius: 14, border: "1px solid rgba(96,165,250,0.2)" }}>
        <div style={{ fontSize: 11, color: "#60a5fa", marginBottom: 2 }}>💡 Word Challenge:</div>
        <div style={{ fontFamily: "'Fredoka One', cursive", color: "white", fontSize: 16 }}>{currentWord.word} <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 400, fontFamily: "'Nunito', sans-serif" }}>– {currentWord.meaning}</span></div>
      </div>
      {/* Word formation */}
      <div style={{ margin: "0 16px 8px", padding: "12px 14px", background: "rgba(255,255,255,0.05)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.15)", minHeight: 54, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 24, color: word ? "white" : "#4b5563", letterSpacing: 4 }}>{word || "_ _ _ _"}</span>
        {word && (
          <button onClick={clearWord} style={{ marginLeft: "auto", background: "rgba(239,68,68,0.2)", border: "none", borderRadius: 8, padding: "4px 10px", color: "#ef4444", cursor: "pointer", fontSize: 13 }}>✕</button>
        )}
      </div>
      {/* Message */}
      <div style={{ textAlign: "center", padding: "4px 16px", fontSize: 12, color: "#94a3b8", fontFamily: "'Nunito', sans-serif", minHeight: 24 }}>{message}</div>
      {/* Letter tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, padding: "8px 16px" }}>
        {availableLetters.map(({ l, id }) => (
          <button key={id} onClick={() => addLetter(l, id)} style={{
            height: 44, background: activeLetters.includes(id) ? "rgba(124,58,237,0.2)" : "linear-gradient(135deg, #1e1b4b, #312e81)",
            border: activeLetters.includes(id) ? "2px solid rgba(124,58,237,0.5)" : "1px solid rgba(255,255,255,0.15)",
            borderRadius: 10, color: activeLetters.includes(id) ? "#6b7280" : "white",
            fontFamily: "'Fredoka One', cursive", fontSize: 18, cursor: activeLetters.includes(id) ? "default" : "pointer",
            opacity: activeLetters.includes(id) ? 0.4 : 1,
            transition: "all 0.15s", boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
          }}>{l}</button>
        ))}
      </div>
      {/* Action buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "10px 16px" }}>
        <button onClick={listenForWord} style={{
          background: listening ? "linear-gradient(135deg, #dc2626, #991b1b)" : "linear-gradient(135deg, #059669, #065f46)",
          border: "none", borderRadius: 14, padding: "14px", color: "white",
          fontFamily: "'Fredoka One', cursive", fontSize: 16, cursor: "pointer",
          boxShadow: listening ? "0 0 20px rgba(220,38,38,0.6)" : "0 0 15px rgba(5,150,105,0.4)",
          animation: listening ? "pulse 1s infinite" : "none"
        }}>{listening ? "🎙️ Listening..." : "🎙️ Speak Word"}</button>
        <button onClick={attack} disabled={!word} style={{
          background: word ? "linear-gradient(135deg, #7c3aed, #4f46e5)" : "rgba(255,255,255,0.05)",
          border: "none", borderRadius: 14, padding: "14px", color: word ? "white" : "#4b5563",
          fontFamily: "'Fredoka One', cursive", fontSize: 16, cursor: word ? "pointer" : "default",
          boxShadow: word ? "0 0 20px rgba(124,58,237,0.5)" : "none",
        }}>⚔️ ATTACK!</button>
      </div>
      {/* Power-ups */}
      <div style={{ display: "flex", gap: 10, padding: "0 16px 16px", overflowX: "auto" }}>
        {POWERUPS.map(p => (
          <button key={p.id} style={{
            flex: "0 0 auto", background: p.active ? `${p.color}22` : "rgba(255,255,255,0.03)",
            border: `1px solid ${p.active ? p.color + "55" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 12, padding: "8px 12px", cursor: p.active ? "pointer" : "default",
            opacity: p.active ? 1 : 0.4, textAlign: "center", minWidth: 60
          }}>
            <div style={{ fontSize: 20 }}>{p.icon}</div>
            <div style={{ fontSize: 9, color: p.active ? "white" : "#4b5563", fontFamily: "'Nunito', sans-serif" }}>{p.name}</div>
          </button>
        ))}
      </div>
      {/* Player character */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "linear-gradient(0deg, rgba(15,7,40,1), transparent)", padding: "8px 20px 16px", display: "flex", alignItems: "center", gap: 12, pointerEvents: "none" }}>
        <div style={{ fontSize: 40, animation: attacking ? "attack 0.4s ease" : "idle 2s ease-in-out infinite", filter: "drop-shadow(0 0 10px rgba(167,139,250,0.5))" }}>🧙</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4, fontFamily: "'Nunito', sans-serif" }}>Player HP</div>
          <HPBar current={85} max={100} />
        </div>
        <button onClick={speakWord} style={{ pointerEvents: "all", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, padding: "6px 10px", color: "white", cursor: "pointer", fontSize: 13, fontFamily: "'Nunito', sans-serif" }}>🔊</button>
      </div>
    </div>
  );
}

function ReadingScreen({ onBack }) {
  const [selected, setSelected] = useState(null);
  const [readingWord, setReadingWord] = useState(null);
  const [fluency, setFluency] = useState(0);
  const [reading, setReading] = useState(false);

  const speak = (text, slow = false) => {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = slow ? 0.6 : 0.85;
    window.speechSynthesis.speak(u);
  };

  const startReading = (story) => {
    setReading(true);
    setFluency(0);
    const interval = setInterval(() => setFluency(f => { if (f >= 100) { clearInterval(interval); setReading(false); return 100; } return f + 2; }), 200);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0f2027, #203a43, #2c5364)", padding: "0 0 32px" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, background: "rgba(0,0,0,0.3)" }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 10, padding: "6px 12px", color: "white", cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontSize: 13 }}>← Back</button>
        <div>
          <div style={{ fontFamily: "'Fredoka One', cursive", color: "white", fontSize: 20 }}>📖 Reading Challenge</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>Read aloud & improve your skills</div>
        </div>
      </div>
      {/* Narrator */}
      <div style={{ margin: "16px", display: "flex", gap: 12, alignItems: "center", background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 14, border: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ fontSize: 40, animation: "float 3s ease-in-out infinite" }}>🦉</div>
        <div>
          <div style={{ fontFamily: "'Fredoka One', cursive", color: "white", fontSize: 15 }}>Professor Hoot</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>Choose a story and read it aloud!</div>
        </div>
        <button onClick={() => speak("Choose a story and read it aloud to improve your reading skills!")} style={{ marginLeft: "auto", background: "rgba(96,165,250,0.2)", border: "none", borderRadius: 10, padding: "6px 12px", color: "#60a5fa", cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontSize: 12 }}>🔊 Hear</button>
      </div>
      {/* Story cards */}
      {!selected ? (
        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          {STORIES.map(story => (
            <div key={story.id} onClick={() => story.unlocked && setSelected(story)} style={{
              background: story.unlocked ? "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))" : "rgba(255,255,255,0.02)",
              border: `1px solid ${story.unlocked ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.05)"}`,
              borderRadius: 18, padding: 18, cursor: story.unlocked ? "pointer" : "default", opacity: story.unlocked ? 1 : 0.5,
              position: "relative", overflow: "hidden"
            }}>
              {!story.unlocked && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", borderRadius: 18, fontSize: 24 }}>🔒</div>}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontFamily: "'Fredoka One', cursive", color: "white", fontSize: 18 }}>{story.title}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Difficulty: {story.difficulty} · {story.words.length} key words</div>
                </div>
                <span style={{ background: story.difficulty === "easy" ? "rgba(34,197,94,0.2)" : story.difficulty === "medium" ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.2)", borderRadius: 8, padding: "4px 10px", fontSize: 11, color: story.difficulty === "easy" ? "#22c55e" : story.difficulty === "medium" ? "#f59e0b" : "#ef4444", border: `1px solid ${story.difficulty === "easy" ? "#22c55e44" : story.difficulty === "medium" ? "#f59e0b44" : "#ef444444"}` }}>{story.difficulty}</span>
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 8, lineHeight: 1.5 }}>{story.text.slice(0, 80)}...</div>
              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                {story.words.map(w => (
                  <span key={w} style={{ background: "rgba(167,139,250,0.15)", borderRadius: 8, padding: "3px 8px", fontSize: 11, color: "#c4b5fd", border: "1px solid rgba(167,139,250,0.2)" }}>{w}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: "0 16px" }}>
          <button onClick={() => setSelected(null)} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 10, padding: "6px 12px", color: "white", cursor: "pointer", marginBottom: 12, fontFamily: "'Nunito', sans-serif", fontSize: 13 }}>← Stories</button>
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 20, padding: 20, border: "1px solid rgba(255,255,255,0.15)" }}>
            <div style={{ fontFamily: "'Fredoka One', cursive", color: "white", fontSize: 22, marginBottom: 4 }}>{selected.title}</div>
            <div style={{ height: 2, background: "linear-gradient(90deg, #7c3aed, transparent)", borderRadius: 2, marginBottom: 16 }} />
            <div style={{ fontSize: 16, lineHeight: 1.8, color: "#e2e8f0", fontFamily: "'Nunito', sans-serif" }}>
              {selected.text.split(" ").map((w, i) => {
                const clean = w.replace(/[.,!?]/g, "");
                const isKey = selected.words.some(kw => kw.toLowerCase() === clean.toLowerCase());
                return (
                  <span key={i} onClick={() => { setReadingWord(clean); speak(clean); }} style={{
                    background: readingWord === clean ? "rgba(167,139,250,0.4)" : isKey ? "rgba(96,165,250,0.15)" : "transparent",
                    color: isKey ? "#93c5fd" : "#e2e8f0", borderRadius: 4, padding: "0 2px", cursor: "pointer",
                    borderBottom: isKey ? "2px solid #60a5fa" : "none", transition: "background 0.2s"
                  }}>{w}{" "}</span>
                );
              })}
            </div>
            {/* Fluency meter */}
            <div style={{ marginTop: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>📊 Reading Fluency</span>
                <span style={{ fontSize: 12, color: "#22c55e" }}>{fluency}%</span>
              </div>
              <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 999, height: 10 }}>
                <div style={{ width: `${fluency}%`, height: "100%", background: "linear-gradient(90deg, #7c3aed, #22c55e)", borderRadius: 999, transition: "width 0.3s" }} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
              <button onClick={() => speak(selected.text)} style={{ background: "linear-gradient(135deg, #0891b2, #0e7490)", border: "none", borderRadius: 14, padding: 14, color: "white", fontFamily: "'Fredoka One', cursive", fontSize: 15, cursor: "pointer" }}>🔊 Hear Story</button>
              <button onClick={() => startReading(selected)} style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", border: "none", borderRadius: 14, padding: 14, color: "white", fontFamily: "'Fredoka One', cursive", fontSize: 15, cursor: "pointer" }}>{reading ? "🎙️ Reading..." : "🎙️ Read Aloud"}</button>
            </div>
            <button onClick={() => speak(selected.text, true)} style={{ width: "100%", marginTop: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: 12, color: "#94a3b8", fontFamily: "'Nunito', sans-serif", fontSize: 14, cursor: "pointer" }}>🐢 Slow Pronunciation Mode</button>
          </div>
        </div>
      )}
    </div>
  );
}

function VocabScreen({ onBack }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [words, setWords] = useState(VOCAB_LIBRARY);
  const [playing, setPlaying] = useState(null);

  const filtered = words.filter(w =>
    (filter === "all" || w.difficulty === filter || (filter === "favorites" && w.favorite)) &&
    (w.word.toLowerCase().includes(search.toLowerCase()) || w.meaning.toLowerCase().includes(search.toLowerCase()))
  );

  const speak = (word) => {
    setPlaying(word);
    const u = new SpeechSynthesisUtterance(word);
    u.rate = 0.8;
    u.onend = () => setPlaying(null);
    window.speechSynthesis.speak(u);
  };

  const toggleFav = (id) => setWords(prev => prev.map(w => w.id === id ? { ...w, favorite: !w.favorite } : w));

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #1a0533, #0f172a)", padding: "0 0 32px" }}>
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, background: "rgba(0,0,0,0.3)" }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 10, padding: "6px 12px", color: "white", cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontSize: 13 }}>← Back</button>
        <div style={{ fontFamily: "'Fredoka One', cursive", color: "white", fontSize: 20 }}>📚 Vocabulary Library</div>
      </div>
      {/* Search */}
      <div style={{ padding: "12px 16px" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search words..." style={{ width: "100%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: "12px 16px", color: "white", fontFamily: "'Nunito', sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
      </div>
      {/* Filters */}
      <div style={{ display: "flex", gap: 8, padding: "0 16px 12px", overflowX: "auto" }}>
        {["all", "easy", "medium", "hard", "favorites"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            flex: "0 0 auto", background: filter === f ? "linear-gradient(135deg, #7c3aed, #4f46e5)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${filter === f ? "#7c3aed" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 20, padding: "6px 16px", color: "white", cursor: "pointer",
            fontFamily: "'Nunito', sans-serif", fontSize: 13, fontWeight: filter === f ? 700 : 400
          }}>{f === "favorites" ? "❤️ Saved" : f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>
      {/* Word cards */}
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(w => (
          <div key={w.id} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 18, padding: 16, border: "1px solid rgba(255,255,255,0.1)", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "'Fredoka One', cursive", color: "white", fontSize: 20 }}>{w.word}</span>
                  {w.learned && <span style={{ fontSize: 10, background: "rgba(34,197,94,0.2)", color: "#22c55e", borderRadius: 6, padding: "2px 8px", border: "1px solid #22c55e33" }}>✓ Learned</span>}
                  <span style={{ fontSize: 10, background: w.difficulty === "easy" ? "rgba(34,197,94,0.1)" : w.difficulty === "medium" ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)", color: w.difficulty === "easy" ? "#22c55e" : w.difficulty === "medium" ? "#f59e0b" : "#ef4444", borderRadius: 6, padding: "2px 8px" }}>{w.difficulty}</span>
                </div>
                <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4, fontFamily: "'Nunito', sans-serif" }}>{w.meaning}</div>
                <div style={{ fontSize: 12, color: "#60a5fa", marginTop: 6, fontStyle: "italic", fontFamily: "'Nunito', sans-serif" }}>"{w.sentence}"</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginLeft: 12 }}>
                <button onClick={() => speak(w.word)} style={{ width: 36, height: 36, background: playing === w.word ? "rgba(96,165,250,0.3)" : "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.3)", borderRadius: 10, color: "#60a5fa", cursor: "pointer", fontSize: 16 }}>🔊</button>
                <button onClick={() => toggleFav(w.id)} style={{ width: 36, height: 36, background: w.favorite ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.05)", border: `1px solid ${w.favorite ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.1)"}`, borderRadius: 10, color: w.favorite ? "#ef4444" : "#4b5563", cursor: "pointer", fontSize: 16 }}>{w.favorite ? "❤️" : "🤍"}</button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ textAlign: "center", color: "#4b5563", padding: 40, fontFamily: "'Nunito', sans-serif" }}>No words found. Try a different search!</div>}
      </div>
    </div>
  );
}

function RewardsScreen({ onBack }) {
  const [opened, setOpened] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const openChest = () => {
    setOpened(true);
    setTimeout(() => setShowConfetti(true), 300);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1a0533, #0f172a)", padding: "0 0 32px" }}>
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, background: "rgba(0,0,0,0.3)" }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 10, padding: "6px 12px", color: "white", cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontSize: 13 }}>← Back</button>
        <div style={{ fontFamily: "'Fredoka One', cursive", color: "white", fontSize: 20 }}>🏆 Rewards</div>
      </div>
      {/* Confetti */}
      {showConfetti && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100 }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} style={{
              position: "absolute", left: `${Math.random() * 100}%`, top: "-10px",
              width: 8, height: 8, background: ["#fbbf24", "#ef4444", "#22c55e", "#60a5fa", "#a78bfa"][i % 5],
              borderRadius: Math.random() > 0.5 ? "50%" : 2,
              animation: `fall ${1.5 + Math.random() * 2}s ease-in ${Math.random()}s forwards`
            }} />
          ))}
        </div>
      )}
      {/* Chest */}
      <div style={{ textAlign: "center", padding: "32px 20px 20px" }}>
        <div onClick={!opened ? openChest : undefined} style={{ fontSize: 100, cursor: opened ? "default" : "pointer", animation: opened ? "bounce 0.4s ease" : "float 2s ease-in-out infinite", display: "inline-block", filter: "drop-shadow(0 0 30px rgba(251,191,36,0.6))" }}>
          {opened ? "📦" : "🪙"}
        </div>
        {!opened ? (
          <>
            <div style={{ fontFamily: "'Fredoka One', cursive", color: "#fbbf24", fontSize: 24, marginTop: 12 }}>Treasure Chest!</div>
            <div style={{ color: "#94a3b8", fontSize: 14, fontFamily: "'Nunito', sans-serif" }}>Tap to open your reward!</div>
            <button onClick={openChest} style={{ marginTop: 16, background: "linear-gradient(135deg, #f59e0b, #b45309)", border: "none", borderRadius: 16, padding: "14px 36px", color: "white", fontFamily: "'Fredoka One', cursive", fontSize: 18, cursor: "pointer", boxShadow: "0 0 30px rgba(245,158,11,0.5)" }}>✨ Open Chest!</button>
          </>
        ) : (
          <>
            <div style={{ fontFamily: "'Fredoka One', cursive", color: "#fbbf24", fontSize: 28, marginTop: 12 }}>Amazing! You earned:</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
              {[{ v: "+350", l: "XP", c: "#a78bfa", icon: "⚡" }, { v: "+80", l: "Coins", c: "#fbbf24", icon: "🪙" }, { v: "+3", l: "Gems", c: "#60a5fa", icon: "💎" }].map(s => (
                <div key={s.l} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 16, padding: "16px 20px", textAlign: "center", border: "1px solid rgba(255,255,255,0.15)" }}>
                  <div style={{ fontSize: 28 }}>{s.icon}</div>
                  <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22, color: s.c }}>{s.v}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {/* New words */}
      <div style={{ margin: "0 16px 16px", background: "rgba(167,139,250,0.1)", borderRadius: 18, padding: 16, border: "1px solid rgba(167,139,250,0.2)" }}>
        <div style={{ fontFamily: "'Fredoka One', cursive", color: "white", fontSize: 17, marginBottom: 12 }}>📖 New Words Learned!</div>
        {["GALLANT", "MYSTICAL", "TRIUMPH"].map(w => (
          <div key={w} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ background: "rgba(34,197,94,0.2)", color: "#22c55e", borderRadius: 8, padding: "2px 10px", fontSize: 13, border: "1px solid #22c55e33", fontFamily: "'Fredoka One', cursive" }}>✓</span>
            <span style={{ color: "white", fontFamily: "'Nunito', sans-serif", fontSize: 14 }}>{w}</span>
          </div>
        ))}
      </div>
      {/* Achievements */}
      <div style={{ margin: "0 16px", background: "rgba(255,255,255,0.03)", borderRadius: 18, padding: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ fontFamily: "'Fredoka One', cursive", color: "white", fontSize: 17, marginBottom: 12 }}>🏅 Achievements</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {ACHIEVEMENTS.map(a => (
            <div key={a.id} style={{ background: a.earned ? "rgba(167,139,250,0.1)" : "rgba(255,255,255,0.03)", borderRadius: 14, padding: 12, border: `1px solid ${a.earned ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.05)"}`, opacity: a.earned ? 1 : 0.5 }}>
              <div style={{ fontSize: 24 }}>{a.icon}</div>
              <div style={{ fontFamily: "'Fredoka One', cursive", color: "white", fontSize: 13, marginTop: 4 }}>{a.title}</div>
              <div style={{ fontSize: 10, color: "#94a3b8" }}>{a.desc}</div>
              {a.earned && <div style={{ fontSize: 10, color: "#22c55e", marginTop: 4 }}>✓ Earned!</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MultiplayerScreen({ onBack }) {
  const [inQueue, setInQueue] = useState(false);
  const [queueTime, setQueueTime] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!inQueue) return;
    const t = setInterval(() => setQueueTime(x => x + 1), 1000);
    return () => clearInterval(t);
  }, [inQueue]);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0c0a1e, #1a0533)", padding: "0 0 32px" }}>
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, background: "rgba(0,0,0,0.4)" }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 10, padding: "6px 12px", color: "white", cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontSize: 13 }}>← Back</button>
        <div>
          <div style={{ fontFamily: "'Fredoka One', cursive", color: "white", fontSize: 20 }}>🌐 Multiplayer Arena</div>
          <div style={{ fontSize: 12, color: "#22c55e" }}>● {PLAYERS_ONLINE.filter(p => p.online).length} players online</div>
        </div>
      </div>
      {/* Matchmaking */}
      <div style={{ margin: 16, background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(79,70,229,0.1))", borderRadius: 20, padding: 20, border: "1px solid rgba(124,58,237,0.3)", textAlign: "center" }}>
        {inQueue ? (
          <>
            <div style={{ fontSize: 48, animation: "spin 2s linear infinite", display: "inline-block" }}>⚔️</div>
            <div style={{ fontFamily: "'Fredoka One', cursive", color: "white", fontSize: 20, marginTop: 8 }}>Searching for opponent...</div>
            <div style={{ color: "#94a3b8", fontSize: 14, fontFamily: "'Nunito', sans-serif" }}>Queue time: {queueTime}s</div>
            <button onClick={() => { setInQueue(false); setQueueTime(0); }} style={{ marginTop: 16, background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "10px 24px", color: "#ef4444", cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontSize: 14 }}>Cancel</button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 48, filter: "drop-shadow(0 0 15px rgba(124,58,237,0.5))" }}>🏟️</div>
            <div style={{ fontFamily: "'Fredoka One', cursive", color: "white", fontSize: 22, marginTop: 8 }}>Word Battle Arena</div>
            <div style={{ color: "#94a3b8", fontSize: 13, fontFamily: "'Nunito', sans-serif", marginBottom: 16 }}>Challenge players worldwide in real-time word battles!</div>
            <button onClick={() => setInQueue(true)} style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", border: "none", borderRadius: 16, padding: "14px 32px", color: "white", fontFamily: "'Fredoka One', cursive", fontSize: 18, cursor: "pointer", boxShadow: "0 0 25px rgba(124,58,237,0.5)" }}>⚔️ Find Match!</button>
          </>
        )}
      </div>
      {/* Online players */}
      <div style={{ margin: "0 16px 12px" }}>
        <div style={{ fontFamily: "'Fredoka One', cursive", color: "white", fontSize: 17, marginBottom: 10 }}>👥 Players Online</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {PLAYERS_ONLINE.map(p => (
            <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: "12px 16px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, border: "2px solid rgba(255,255,255,0.2)" }}>{p.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "white", fontFamily: "'Fredoka One', cursive", fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}>
                  {p.name}
                  <span style={{ fontSize: 10, background: "rgba(255,255,255,0.1)", borderRadius: 6, padding: "2px 6px", color: "#94a3b8" }}>Lv.{p.level}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: RANK_COLORS[p.rank] || "#94a3b8" }}>★ {p.rank}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.online ? "#22c55e" : "#4b5563" }} />
                {p.online && <button style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 8, padding: "4px 10px", color: "#a78bfa", cursor: "pointer", fontSize: 11, fontFamily: "'Nunito', sans-serif" }}>Challenge</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Chat UI */}
      <div style={{ margin: "0 16px", background: "rgba(255,255,255,0.03)", borderRadius: 18, padding: 16, border: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontFamily: "'Fredoka One', cursive", color: "white", fontSize: 15, marginBottom: 10 }}>💬 Arena Chat</div>
        {[
          { user: "DragonSlayer99", msg: "Anyone up for a challenge? 🔥", avatar: "🧙" },
          { user: "WordWitch", msg: "Just hit level 18! 🎉", avatar: "🧝" },
          { user: "RuneMaster", msg: "Looking for Diamond ranked battles", avatar: "🦸" },
        ].map((c, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 20, flexShrink: 0 }}>{c.avatar}</div>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "6px 12px", flex: 1 }}>
              <div style={{ fontSize: 11, color: "#a78bfa", marginBottom: 2, fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>{c.user}</div>
              <div style={{ fontSize: 13, color: "#e2e8f0", fontFamily: "'Nunito', sans-serif" }}>{c.msg}</div>
            </div>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input value={message} onChange={e => setMessage(e.target.value)} placeholder="Type a message..." style={{ flex: 1, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "10px 14px", color: "white", fontFamily: "'Nunito', sans-serif", fontSize: 13, outline: "none" }} />
          <button style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", border: "none", borderRadius: 12, padding: "10px 16px", color: "white", cursor: "pointer", fontSize: 16 }}>➤</button>
        </div>
      </div>
    </div>
  );
}

function ParentsScreen({ onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0f172a, #1e293b)", padding: "0 0 32px" }}>
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, background: "rgba(0,0,0,0.4)" }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 10, padding: "6px 12px", color: "white", cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontSize: 13 }}>← Back</button>
        <div style={{ fontFamily: "'Fredoka One', cursive", color: "white", fontSize: 20 }}>👨‍👩‍👧 Parents Dashboard</div>
      </div>
      <div style={{ padding: "16px" }}>
        {[
          { label: "📚 Words Learned", value: "47", sub: "+12 this week", color: "#a78bfa" },
          { label: "⏱ Daily Playtime", value: "28 min", sub: "Within healthy limits", color: "#22c55e" },
          { label: "📖 Reading Level", value: "Grade 4", sub: "↑ Improved from Grade 3", color: "#60a5fa" },
          { label: "🔥 Current Streak", value: "7 days", sub: "Best streak: 12 days", color: "#f97316" },
        ].map(s => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: "16px", marginBottom: 10, border: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, color: "#94a3b8", fontFamily: "'Nunito', sans-serif", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontFamily: "'Fredoka One', cursive", color: s.color, fontSize: 22 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#22c55e", fontFamily: "'Nunito', sans-serif" }}>{s.sub}</div>
            </div>
          </div>
        ))}
        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 16, border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontFamily: "'Fredoka One', cursive", color: "white", fontSize: 17, marginBottom: 12 }}>⚙️ Settings</div>
          {["Daily time limit", "Difficulty level", "Voice features", "Notifications"].map(s => (
            <div key={s} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ color: "#e2e8f0", fontFamily: "'Nunito', sans-serif", fontSize: 14 }}>{s}</span>
              <div style={{ width: 44, height: 24, background: "rgba(124,58,237,0.4)", borderRadius: 12, position: "relative", cursor: "pointer" }}>
                <div style={{ position: "absolute", right: 2, top: 2, width: 20, height: 20, borderRadius: "50%", background: "#7c3aed" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===================== MAIN APP =====================

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0f0c29; }
  @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
  @keyframes pulse { 0%,100% { box-shadow: 0 0 30px rgba(124,58,237,0.8); } 50% { box-shadow: 0 0 50px rgba(124,58,237,1), 0 0 80px rgba(79,70,229,0.4); } }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes bounce { 0% { transform: translateY(0); } 100% { transform: translateY(-12px); } }
  @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-8px) rotate(-3deg); } 75% { transform: translateX(8px) rotate(3deg); } }
  @keyframes attack { 0% { transform: translateX(0); } 50% { transform: translateX(30px) scale(1.2); } 100% { transform: translateX(0); } }
  @keyframes idle { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
  @keyframes floatUp { 0% { opacity: 1; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-60px) scale(1.5); } }
  @keyframes fall { 0% { transform: translateY(0) rotate(0); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
  input::placeholder { color: #4b5563; }
  ::-webkit-scrollbar { width: 0; }
`;

export default function App() {
  const [screen, setScreen] = useState("splash");
  const [playerData] = useState({
    name: "MagicKid", level: 7, xp: 340, xpMax: 500,
    coins: 1250, gems: 23, streak: 7, readingPct: 68, vocabPct: 45
  });

  const nav = (id) => setScreen(id);

  return (
    <>
      <style>{CSS}</style>
      <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", fontFamily: "'Nunito', sans-serif", position: "relative" }}>
        {screen === "splash" && <SplashScreen onStart={() => setScreen("home")} />}
        {screen === "home" && <HomeScreen onNavigate={nav} playerData={playerData} />}
        {screen === "battle" && <BattleScreen onBack={() => setScreen("home")} playerData={playerData} setPlayerData={() => {}} />}
        {screen === "reading" && <ReadingScreen onBack={() => setScreen("home")} />}
        {screen === "vocab" && <VocabScreen onBack={() => setScreen("home")} />}
        {screen === "rewards" && <RewardsScreen onBack={() => setScreen("home")} />}
        {screen === "multiplayer" && <MultiplayerScreen onBack={() => setScreen("home")} />}
        {screen === "parents" && <ParentsScreen onBack={() => setScreen("home")} />}
        {/* Bottom nav for non-splash screens */}
        {screen !== "splash" && (
          <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "rgba(10,5,25,0.95)", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-around", padding: "10px 0 16px", backdropFilter: "blur(10px)", zIndex: 200 }}>
            {[{ id: "home", icon: "🏠", label: "Home" }, { id: "battle", icon: "⚔️", label: "Battle" }, { id: "reading", icon: "📖", label: "Read" }, { id: "vocab", icon: "📚", label: "Vocab" }, { id: "rewards", icon: "🏆", label: "Rewards" }].map(t => (
              <button key={t.id} onClick={() => nav(t.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "4px 8px" }}>
                <span style={{ fontSize: 22 }}>{t.icon}</span>
                <span style={{ fontSize: 9, color: screen === t.id ? "#a78bfa" : "#4b5563", fontFamily: "'Nunito', sans-serif", fontWeight: screen === t.id ? 700 : 400 }}>{t.label}</span>
                {screen === t.id && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#a78bfa" }} />}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
