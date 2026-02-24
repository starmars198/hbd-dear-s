import { useState, useEffect, useCallback } from "react";

/* ─── PHOTOS ─────────────────────────────────────────────
   Your photos embedded as base64.
   For Vercel: replace these with /images/photo1.jpg etc.
   and put the actual files in your /public/images/ folder.
──────────────────────────────────────────────────────── */
const photos = [
  '/images/kita1.jpg',
  '/images/kita2.jpg',
  '/images/kita3.jpg',
  '/images/kita4.jpg',
  '/images/kita5.jpg',
  '/images/kita6.jpeg',
  '/images/kita7.jpeg',
  '/images/kita8.jpeg',
  '/images/kita9.jpeg',
  '/images/kita10.jpeg',
  '/images/kita11.jpeg',
  '/images/kita12.jpeg',
  '/images/kita13.jpeg',
  '/images/kita14.jpg',
  '/images/kita15.jpg',
  '/images/kita16.jpg',
];


/* ─── PALETTE ─────────────────────────────────────────── */
const C = {
  navy:      "#0f172a",
  indigo:    "#3730a3",
  indigoMid: "#4f46e5",
  indigoLt:  "#818cf8",
  teal:      "#0d9488",
  tealLt:    "#5eead4",
  silver:    "#94a3b8",
  silverLt:  "#cbd5e1",
  white:     "#f1f5f9",
  accent:    "#6366f1",
  glow:      "rgba(99,102,241,0.25)",
};

/* ─── SVG ATOMS ───────────────────────────────────────── */
const Heart = ({ size = 16, color = "#818cf8" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

const Petal = ({ color }) => (
  <svg width="10" height="18" viewBox="0 0 10 18" fill={color}>
    <ellipse cx="5" cy="9" rx="4" ry="8"/>
  </svg>
);

const BalloonSVG = ({ color, stringColor }) => (
  <svg width="44" height="72" viewBox="0 0 44 72" fill="none">
    <ellipse cx="22" cy="24" rx="18" ry="21" fill={color}/>
    <ellipse cx="15" cy="15" rx="5" ry="3.5" fill="white" opacity="0.18" transform="rotate(-30 15 15)"/>
    <polygon points="19,45 22,51 25,45" fill={color}/>
    <path d="M22 51 Q27 59 22 69 Q17 61 22 51" stroke={stringColor} strokeWidth="1" fill="none"/>
  </svg>
);

/* ─── BALLOON DATA ────────────────────────────────────── */
const balloonPalette = [
  { color:"#312e81", string:"#4f46e5" },
  { color:"#1e40af", string:"#3b82f6" },
  { color:"#134e4a", string:"#0d9488" },
  { color:"#1e3a5f", string:"#2563eb" },
  { color:"#3730a3", string:"#6366f1" },
  { color:"#164e63", string:"#0891b2" },
  { color:"#1e1b4b", string:"#4338ca" },
];
const balloonData = Array.from({ length:11 }, (_,i) => ({
  id:i, ...balloonPalette[i%balloonPalette.length],
  left:`${4+(i*8.8)%88}%`,
  delay:`${(i*1.4)%9}s`,
  duration:`${9+(i*1.6)%8}s`,
  sway: i%2===0 ? "swayL" : "swayR",
}));

/* ─── FLOWER ──────────────────────────────────────────── */
const FlowerPetal = ({ angle, color, bloomDelay }) => {
  const rad = (angle * Math.PI) / 180;
  return (
    <div style={{
      position:"absolute", width:10, height:18,
      background:color, borderRadius:"50%",
      left:`calc(50% + ${Math.cos(rad)*20}px - 5px)`,
      top:`calc(50% + ${Math.sin(rad)*20}px - 9px)`,
      transform:`rotate(${angle+90}deg) scale(0)`,
      animation:`petalBloom 1.5s ease-out ${bloomDelay}s forwards`,
      opacity:0,
    }}/>
  );
};
const Flower = ({ x, y, delay, colors }) => (
  <div style={{ position:"absolute", left:x, top:y, width:56, height:56, transform:"translate(-50%,-50%)", pointerEvents:"none" }}>
    {[0,45,90,135,180,225,270,315].map((a,i) => (
      <FlowerPetal key={i} angle={a} color={colors[i%colors.length]} bloomDelay={delay+i*0.08}/>
    ))}
    <div style={{
      position:"absolute", left:"50%", top:"50%", width:10, height:10, borderRadius:"50%",
      transform:"translate(-50%,-50%) scale(0)", background:"#fbbf24",
      animation:`petalBloom 0.6s ease-out ${delay+0.65}s forwards`, zIndex:2,
    }}/>
  </div>
);
const flowerData = [
  { x:"7%",  y:"74%", delay:0,   colors:["#312e81","#3730a3","#4338ca","#1e1b4b"] },
  { x:"14%", y:"84%", delay:0.35,colors:["#134e4a","#0f766e","#0d9488","#115e59"] },
  { x:"21%", y:"76%", delay:0.7, colors:["#1e3a5f","#1e40af","#1d4ed8","#1e3a8a"] },
  { x:"79%", y:"78%", delay:0.2, colors:["#3730a3","#4f46e5","#6366f1","#312e81"] },
  { x:"86%", y:"71%", delay:0.5, colors:["#0e7490","#0891b2","#06b6d4","#164e63"] },
  { x:"93%", y:"82%", delay:0.9, colors:["#1e3a5f","#1e40af","#3b82f6","#1e3a5f"] },
];

/* ─── PARTICLES HOOK ──────────────────────────────────── */
let pid = 0;
const useParticles = () => {
  const [particles, setParticles] = useState([]);
  const spawn = useCallback((x, y) => {
    const palette = ["#818cf8","#5eead4","#cbd5e1","#6366f1","#a5b4fc","#7dd3fc","#e2e8f0"];
    const np = Array.from({ length:16 }, (_,i) => {
      const angle = (Math.PI*2*i)/16 + Math.random()*0.4;
      const spd = 55 + Math.random()*110;
      return {
        id:pid++, x, y,
        dx:Math.cos(angle)*spd, dy:Math.sin(angle)*spd-65,
        type:Math.random()>0.45 ? "heart" : "petal",
        size:9+Math.random()*13,
        color:palette[Math.floor(Math.random()*palette.length)],
        rot:Math.random()*360,
      };
    });
    setParticles(p=>[...p,...np]);
    setTimeout(()=>setParticles(p=>p.filter(x=>!np.find(n=>n.id===x.id))),1300);
  },[]);
  return { particles, spawn };
};

/* ─── CONFETTI GENERATOR ──────────────────────────────── */
let cid = 0;
const makeConfetti = () =>
  Array.from({ length:110 }, (_,i) => ({
    id:cid++,
    x:2+Math.random()*96,
    delay:Math.random()*0.5,
    dur:1.2+Math.random()*1.4,
    size:5+Math.random()*9,
    color:["#ffd700","#ff69b4","#ff4da6","#ffa500","#ff6b9d","#ffe066","#ff9ef7","#c084fc","#f472b6","#fb923c"][i%10],
    shape:["circle","rect","diamond"][i%3],
    rot:Math.random()*360,
  }));

/* ─── LETTER MODAL ────────────────────────────────────── */
const LetterModal = ({ onClose }) => (
  <div
    onClick={onClose}
    data-no-particle="true"
    style={{
      position:"fixed", inset:0, zIndex:100,
      background:"rgba(4,6,16,0.84)", backdropFilter:"blur(12px)",
      display:"flex", alignItems:"center", justifyContent:"center",
      animation:"fadeIn 0.3s ease",
    }}
  >
    <style>{`
      .lscroll::-webkit-scrollbar { width: 5px; }
      .lscroll::-webkit-scrollbar-track { background: #e8e2d9; border-radius: 4px; }
      .lscroll::-webkit-scrollbar-thumb { background: #b5a89a; border-radius: 4px; }
      .lscroll::-webkit-scrollbar-thumb:hover { background: #8c7b6e; }
    `}</style>

    {/* Paper card */}
    <div
      onClick={e=>e.stopPropagation()}
      style={{
        width: 480,
        maxHeight: "82vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(160deg, #fdfaf5 0%, #faf6ee 40%, #f7f2e8 100%)",
        borderRadius: 3,
        position: "relative",
        animation: "modalPop 0.45s cubic-bezier(0.34,1.56,0.64,1)",
        boxShadow: [
          "0 2px 0 #e0d9ce",
          "0 4px 0 #d4cdc2",
          "0 6px 0 #c8c1b6",
          "0 8px 0 #bdb6ab",
          "0 10px 0 #b2aba0",
          "0 40px 80px rgba(0,0,0,0.65)",
          "0 12px 30px rgba(0,0,0,0.35)",
        ].join(","),
      }}
    >
      {/* Paper grain overlay */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none", borderRadius:3, zIndex:0,
        backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`,
        backgroundSize: "200px 200px",
      }}/>

      {/* Ruled lines */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:1, overflow:"hidden", borderRadius:3 }}>
        {Array.from({length:32}).map((_,i)=>(
          <div key={i} style={{
            position:"absolute", left:0, right:0,
            top: 96 + i * 31,
            height: 1,
            background: "rgba(170,195,225,0.28)",
          }}/>
        ))}
        {/* Red margin line */}
        <div style={{ position:"absolute", top:0, bottom:0, left:60, width:1, background:"rgba(210,95,95,0.2)" }}/>
      </div>

      {/* Top edge */}
      <div style={{ height:8, background:"linear-gradient(to bottom,#f0ebe0,#fdfaf5)", borderRadius:"3px 3px 0 0", borderBottom:"1px solid rgba(180,165,145,0.25)", flexShrink:0 }}/>

      {/* Header */}
      <div style={{ padding:"22px 46px 0 46px", flexShrink:0, position:"relative", zIndex:2 }}>
        <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:20 }}>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"0.78rem", color:"#8c7b6e", fontStyle:"italic", letterSpacing:"0.04em" }}>
            {new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}
          </p>
        </div>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.8rem", fontWeight:500, color:"#2c1f14", lineHeight:1.2, marginBottom:6 }}>
          Buat kesayanganku,
        </h2>
        <div style={{ width:44, height:1.5, background:"linear-gradient(to right,#b5a89a,transparent)", marginBottom:18 }}/>
      </div>

      {/* Scrollable body */}
      <div
        className="lscroll"
        style={{ flex:1, overflowY:"auto", padding:"0 46px", position:"relative", zIndex:2 }}
      >
        {[
          "Heyy sayaangg happy birthdayy yaaa, selamat bertambah umurrr i loveee loveee uu soo muchhhh i could not handle it damnnn",
          "I wish tahun ini banyaaakk sekali hal baik yang dateng ke kamuu, semogaa banyak orang orang baik jugaa yang ngelilingin kamuu",
          "Semoga kamuu selalu bahagiaa yaaa, apapun yang nanti bakal terjadi di hidup kamu aku harap selalu ada kebahagiaan ya bbyy",
          "Mungkin kadang kamu capek kamu lelah, tapi hey itu wajaar namanya juga manusia yak pasti bisa cape dan i hope kamu bisa istirahat yang cukupp, tidurnya nyenyaak makannya enakk yahh",
          "Jangan pernah insecure dan tidak percaya diri yaaa, kamu tuhh sangaatt cantikk sangatt kerennn. Aku selaluu dan akan selalu be proud of youuu bbyyy...",
          "I think waktu kamu di perut mama, mama banyak konsumsi gula soalnya eh buset anaknya manis bangettttttttt toloNnKKKKkkkkk (emot tewas mengenaskan)",
          "Anywayy selamat 21 hidup di semesta ini yaa cintakuu, aku terimakasih sama tuhan karena aku ada di semesta dan kehidupan yang sama dengan kamu <3333",
          "Jangan pernah ngerasa sendiri yaa disini ada akuu, kamu mau ngeluh, kamu mau cranky, kamu mau nangis, mau tumpahin semuanya sama aku juga boleehh, ill be hereee bb",
          "Kamu harus tau kamu sangat disayang banyak orang termasuk aku. Kalo kamu pernah mikir aku gapernah peduliin kamu atau aku selama ini pura-pura Big NO!! kamu salaahh! Aku selaluu peduli dan sayaaang sekali sama kamu",
          "Ini semuanya meluap-luappp satu jagad raya pun ngga cukup buat nampungnya",
          "Jangan pernah berpikir aku akan cape sama kamu yaa karena justru tiap hari aku makin sayaang, gamau jauh....",
          "Kalau kamu bertanya kenapa aku sayang kamu sebenernya jawabannya cuma karena kamu adalah kamu, kalau kamu merasa diri kamu banyak kurangnya lahk kalau begitu aku lebih kurang lagii",
          "Tapi gimanapun aku selalu merasa disayang kamuu begitupun akuuu, aku selalu sayang kamu apa adanyaa bby",
          "Terimakasih yaa kamu sangat amat membuatku disayang juga, aku senang:D",
          "Jangan berpikir jelek jeleek lagi ya sayaangkuu i loveee u soo muchhh mwaaah",
          "Sekali lagi happy birthday yaaa cintaakuu, happy selaluuu",
          ""
        ].map((text, i) => (
          <p key={i} style={{
            fontFamily:"'Cormorant Garamond',serif",
            fontSize:"1.08rem", lineHeight:1.98,
            color:"#3a2e24", fontWeight:400,
            marginBottom:6,
          }}>
            {text}
          </p>
        ))}

        {/* Signature */}
        <div style={{ marginTop:26, marginBottom:8 }}>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"0.98rem", color:"#5a4a3a", fontStyle:"italic", marginBottom:12 }}>
            Always yours,
          </p>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1rem"}} >Ur #1 Fan</p>
        </div>

        <div style={{ marginBottom:24, display:"flex", alignItems:"center", gap:8 }}>
          <svg width="15" height="13" viewBox="0 0 16 14" fill="#c0392b" opacity="0.55">
            <path d="M8 13L1.5 6.5C0.5 5.5 0.5 3.5 1.5 2.5C2.5 1.5 4 1.5 5 2.5L8 5.5L11 2.5C12 1.5 13.5 1.5 14.5 2.5C15.5 3.5 15.5 5.5 14.5 6.5L8 13Z"/>
          </svg>
          <div style={{ flex:1, height:1, background:"linear-gradient(to right, rgba(180,165,145,0.45), transparent)" }}/>
        </div>
      </div>

      {/* Bottom fade */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:36, borderRadius:"0 0 3px 3px", background:"linear-gradient(to top,#f7f2e8,transparent)", pointerEvents:"none", zIndex:3 }}/>

      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position:"absolute", top:12, right:12,
          width:26, height:26, borderRadius:"50%",
          background:"rgba(100,80,60,0.1)", border:"1px solid rgba(100,80,60,0.18)",
          color:"#8c7b6e", cursor:"pointer", fontSize:"11px",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily:"'Poppins',sans-serif", transition:"all 0.2s", zIndex:10,
        }}
        onMouseEnter={e=>{ e.currentTarget.style.background="rgba(100,80,60,0.18)"; e.currentTarget.style.color="#3a2e24"; }}
        onMouseLeave={e=>{ e.currentTarget.style.background="rgba(100,80,60,0.1)"; e.currentTarget.style.color="#8c7b6e"; }}
      >✕</button>

      {/* Dog-ear corner fold (bottom-right) */}
      <div style={{ position:"absolute", bottom:0, right:0, width:0, height:0, zIndex:4, borderStyle:"solid", borderWidth:"0 0 28px 28px", borderColor:"transparent transparent #ccc6bb transparent" }}/>
      <div style={{ position:"absolute", bottom:0, right:0, width:0, height:0, zIndex:5, borderStyle:"solid", borderWidth:"0 0 26px 26px", borderColor:"transparent transparent #eee8dc transparent" }}/>
    </div>
  </div>
);

/* ════════════════════════════════════════════════════════
   MAIN APP
════════════════════════════════════════════════════════ */
export default function App() {
  /*
    intro stages:
    "dark"     → black screen, lamp + string visible, text shown
    "pulling"  → string pulled, lamp flickers
    "light"    → warm light floods screen
    "gift"     → gift box pops in
    "opening"  → gift lid opens, confetti bursts
    "surprise" → SURPRISEEEE text + particles
    "fade"     → overlay fades out
    "done"     → main birthday scene visible
  */
  const [phase, setPhase]             = useState("dark");
  const [stringPulled, setStringPulled] = useState(false);
  const [lampFlicker, setLampFlicker] = useState(false);

  /* birthday states */
  const [candleBlown, setCandleBlown] = useState(false);
  const [blowing, setBlowing]         = useState(false);
  const [birthdayReveal, setBirthdayReveal] = useState(false);
  const [showSmoke, setShowSmoke]     = useState(false);
  const [dimmed, setDimmed]           = useState(false);
  const [sparkles, setSparkles]       = useState(false);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [showLetter, setShowLetter]   = useState(false);
  const { particles, spawn }          = useParticles();

  /* ── pull the lamp string ── */
  const pullString = () => {
    if (phase !== "dark") return;
    setStringPulled(true);
    setPhase("pulling");
    // flicker sequence
    setTimeout(()=> setLampFlicker(true),  300);
    setTimeout(()=> setLampFlicker(false), 550);
    setTimeout(()=> setLampFlicker(true),  700);
    setTimeout(()=> setLampFlicker(false), 820);
    setTimeout(()=> setLampFlicker(true),  900);
    setTimeout(()=>{ setLampFlicker(false); setPhase("light"); }, 1100);
    // brief warm light, then fade into birthday scene
    setTimeout(()=> setPhase("fade"),  2000);
    setTimeout(()=> setPhase("done"),  3200);
  };

  /* ── click particles (only when main is visible) ── */
  const handleScreenClick = useCallback((e) => {
    if (phase !== "done") return;
    if (e.target.closest("[data-no-particle]")) return;
    spawn(e.clientX, e.clientY);
  }, [phase, spawn]);

  /* ── candle ── */
  const blowCandle = () => {
    if (candleBlown || blowing) return;
    setBlowing(true); setDimmed(true);
    setTimeout(()=>{ setCandleBlown(true); setShowSmoke(true); }, 420);
    setTimeout(()=>{ setDimmed(false); setSparkles(true); }, 1050);
    setTimeout(()=>{ setShowSmoke(false); setSparkles(false); setBlowing(false); }, 2900);
    // pitch black reveal after candle blown
    setTimeout(()=>{ setBirthdayReveal(true); }, 1800);
    setTimeout(()=>{ setBirthdayReveal(false); }, 6000);
  };

  const relightCandle = () => {
    if (blowing) return;
    setCandleBlown(false);
    setShowSmoke(false);
    setSparkles(false);
    setBirthdayReveal(false);
  };

  /* ── envelope ── */
  const handleEnvelope = () => {
    if (!envelopeOpen) { setEnvelopeOpen(true); setTimeout(()=>setShowLetter(true), 540); }
    else { setShowLetter(false); setEnvelopeOpen(false); }
  };

  /* ── CSS ── */
  useEffect(()=>{
    const s = document.createElement("style");
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&display=swap');
      *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

      @keyframes floatUp {
        0%{transform:translateY(0);opacity:0}6%{opacity:1}88%{opacity:.9}100%{transform:translateY(-115vh);opacity:0}
      }
      @keyframes swayL {
        0%,100%{margin-left:0}50%{margin-left:-15px}
      }
      @keyframes swayR {
        0%,100%{margin-left:0}50%{margin-left:15px}
      }
      @keyframes flicker {
        0%,100%{transform:scaleY(1) scaleX(1)}30%{transform:scaleY(1.09) scaleX(.93)}60%{transform:scaleY(.94) scaleX(1.06)}80%{transform:scaleY(1.12) scaleX(.96)}
      }
      @keyframes smokeUp {
        0%{opacity:.6;transform:translateY(0) scaleX(1)}100%{opacity:0;transform:translateY(-38px) scaleX(2.8)}
      }
      @keyframes sparkle {
        0%{opacity:0;transform:scale(0) rotate(0deg)}50%{opacity:1;transform:scale(1.3) rotate(180deg)}100%{opacity:0;transform:scale(0) rotate(360deg)}
      }
      @keyframes particle {
        0%{opacity:1;transform:translate(0,0) rotate(0deg) scale(1)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) rotate(var(--rot)) scale(.3)}
      }
      @keyframes petalBloom {
        0%{opacity:0;transform:rotate(calc(var(--a,0deg)+90deg)) scale(0)}60%{opacity:1;transform:rotate(calc(var(--a,0deg)+90deg)) scale(1.1)}100%{opacity:1;transform:rotate(calc(var(--a,0deg)+90deg)) scale(1)}
      }
      @keyframes glowPulse {
        0%,100%{opacity:.4;transform:scale(1)}50%{opacity:.72;transform:scale(1.1)}
      }
      @keyframes bgRollL {
        0%{transform:translateX(0)}100%{transform:translateX(-50%)}
      }
      @keyframes bgRollR {
        0%{transform:translateX(-50%)}100%{transform:translateX(0)}
      }
      @keyframes flapOpen {
        0%{transform:rotateX(0deg)}100%{transform:rotateX(-175deg)}
      }
      @keyframes envelopeShake {
        0%,100%  { transform: rotate(0deg)    translateY(0px); }
        10%      { transform: rotate(-5deg)   translateY(-4px); }
        20%      { transform: rotate(5deg)    translateY(-7px); }
        30%      { transform: rotate(-4deg)   translateY(-4px); }
        40%      { transform: rotate(4deg)    translateY(-6px); }
        50%      { transform: rotate(-3deg)   translateY(-4px); }
        60%      { transform: rotate(3deg)    translateY(-5px); }
        70%      { transform: rotate(-2deg)   translateY(-2px); }
        80%      { transform: rotate(2deg)    translateY(-3px); }
        90%      { transform: rotate(-1deg)   translateY(-1px); }
      }
      @keyframes envelopeBob {
        0%,100% { transform: translateY(0px) rotate(0deg); }
        50%     { transform: translateY(-5px) rotate(1deg); }
      }
      @keyframes fadeInUp {
        from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}
      }
      @keyframes fadeIn {
        from{opacity:0}to{opacity:1}
      }
      @keyframes modalPop {
        0%{opacity:0;transform:scale(.86) translateY(28px)}100%{opacity:1;transform:scale(1) translateY(0)}
      }

      /* ── INTRO: LAMP ── */
      @keyframes lampHang {
        0%,100%{transform:rotate(-1.5deg)}50%{transform:rotate(1.5deg)}
      }
      @keyframes stringIdle {
        0%,100%{transform:rotate(-2deg) scaleY(1)}50%{transform:rotate(2deg) scaleY(1.02)}
      }
      @keyframes stringPull {
        0%{transform:scaleY(1) translateY(0)}40%{transform:scaleY(1.35) translateY(10px)}70%{transform:scaleY(1.1) translateY(4px)}100%{transform:scaleY(1) translateY(0)}
      }
      @keyframes stringSwing {
        0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}
      }
      @keyframes lampFlicker {
        0%,100%{opacity:1}20%{opacity:0.1}40%{opacity:0.8}60%{opacity:0.2}80%{opacity:0.9}
      }
      @keyframes lampGlow {
        0%,100%{opacity:0.75;transform:scale(1)}50%{opacity:1;transform:scale(1.06)}
      }
      @keyframes warmFlood {
        0%{opacity:0}100%{opacity:1}
      }
      @keyframes textGlow {
        0%,100%{opacity:0.6;text-shadow:0 0 20px rgba(255,200,100,.3)}
        50%{opacity:1;text-shadow:0 0 40px rgba(255,200,100,.7),0 0 80px rgba(255,180,60,.35)}
      }

      /* ── INTRO: GIFT ── */
      @keyframes giftPop {
        0%{opacity:0;transform:scale(0) translateY(40px)}
        60%{transform:scale(1.08) translateY(-8px)}
        80%{transform:scale(0.97) translateY(2px)}
        100%{opacity:1;transform:scale(1) translateY(0)}
      }
      @keyframes giftBounce {
        0%,100%{transform:translateY(0) rotate(-1deg)}
        50%{transform:translateY(-12px) rotate(1deg)}
      }
      @keyframes lidFly {
        0%{transform:translateY(0) rotate(0deg);opacity:1}
        100%{transform:translateY(-160px) rotate(-25deg);opacity:0}
      }
      @keyframes confettiBurst {
        0%{transform:translateY(0) rotate(var(--r));opacity:1}
        85%{opacity:.85}
        100%{transform:translateY(110vh) translateX(var(--dx)) rotate(calc(var(--r)+600deg));opacity:0}
      }
      @keyframes surpriseReveal {
        0%{opacity:0;transform:scale(0.5) translateY(20px) rotate(-3deg)}
        55%{transform:scale(1.1) translateY(-8px) rotate(1deg)}
        75%{transform:scale(0.97) translateY(2px)}
        100%{opacity:1;transform:scale(1) translateY(0) rotate(0deg)}
      }
      @keyframes surpriseShimmer {
        0%,100%{text-shadow:0 2px 8px rgba(120,60,0,.55),0 0 24px rgba(210,130,20,.35),0 0 48px rgba(200,100,10,.18)}
        50%{text-shadow:0 2px 12px rgba(140,70,0,.65),0 0 36px rgba(230,150,30,.45),0 0 72px rgba(210,110,10,.22)}
      }
      @keyframes sparkleFloat {
        0%{opacity:0;transform:translate(0,0) scale(0) rotate(0deg)}
        30%{opacity:1;transform:translate(var(--sx),var(--sy)) scale(1.2) rotate(180deg)}
        100%{opacity:0;transform:translate(calc(var(--sx)*2.2),calc(var(--sy)*2.2 + 40px)) scale(0) rotate(360deg)}
      }
      @keyframes overlayFade {
        from{opacity:1}to{opacity:0}
      }
      @keyframes introPulse {
        0%,100%{opacity:.55}50%{opacity:1}
      }
      @keyframes introTextIn {
        0%{opacity:0;transform:translateY(14px)}100%{opacity:1;transform:translateY(0)}
      }
      @keyframes subTagIn {
        from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}
      }

      .balloon {
        animation: floatUp var(--dur) var(--delay) ease-in infinite,
                   var(--sway) 3.4s ease-in-out infinite;
      }
    `;
    document.head.appendChild(s);
    return ()=>document.head.removeChild(s);
  },[]);

  /* ══════════════════════════════════
     RENDER
  ══════════════════════════════════ */
  return (
    <div
      onClick={handleScreenClick}
      style={{
        width:"100vw", height:"100vh", overflow:"hidden", position:"relative",
        fontFamily:"'Poppins',sans-serif",
      }}
    >

      {/* ════════════════════════════════
          MAIN BIRTHDAY SCENE
          (rendered always, fades in after intro)
      ════════════════════════════════ */}
      <div style={{
        position:"absolute", inset:0,
        background:"transparent",
        opacity: phase==="done" ? 1 : phase==="fade" ? 1 : 0,
        transition:"opacity 1s ease",
      }}>
        {/* Candle-blow dim */}
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none", zIndex:6,
          background:"rgba(0,0,0,.55)",
          opacity:dimmed?1:0, transition:"opacity .7s ease",
        }}/>

        {/* Birthday pitch-black reveal */}
        <div style={{
          position:"absolute", inset:0, zIndex:200,
          background:"#000",
          opacity: birthdayReveal ? 1 : 0,
          pointerEvents: birthdayReveal ? "auto" : "none",
          transition: birthdayReveal ? "opacity .6s ease" : "opacity 1.4s ease",
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        }}>
          <div style={{
            textAlign:"center",
            opacity: birthdayReveal ? 1 : 0,
            transform: birthdayReveal ? "scale(1)" : "scale(0.8)",
            transition: "opacity .8s ease .5s, transform .8s ease .5s",
          }}>
            <div style={{
              fontSize:"clamp(2rem,8vw,4.5rem)", fontWeight:700,
              fontFamily:"'Poppins',sans-serif",
              background:"linear-gradient(135deg,#f59e0b,#fde68a,#fb923c,#fbbf24)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
              letterSpacing:".03em", lineHeight:1.3, marginBottom:20,
            }}>
              YEAYYY Officialy 21++ yawww :D
            </div>
            <div style={{ fontSize:"2.8rem" }}>🎂✨🥳</div>
          </div>
        </div>

        {/* Ambient orbs */}
        <div style={{ position:"absolute", top:"18%", left:"13%", width:320, height:320, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,.07) 0%,transparent 70%)", pointerEvents:"none", zIndex:1, animation:"glowPulse 7s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", bottom:"22%", right:"10%", width:260, height:260, borderRadius:"50%", background:"radial-gradient(circle,rgba(13,148,136,.06) 0%,transparent 70%)", pointerEvents:"none", zIndex:1, animation:"glowPulse 9s ease-in-out 1.5s infinite" }}/>

        {/* BALLOONS */}
        {balloonData.map(b=>(
          <div key={b.id} className="balloon" style={{ position:"absolute", bottom:0, left:b.left, pointerEvents:"none", zIndex:2, "--dur":b.duration, "--delay":b.delay, "--sway":b.sway }}>
            <BalloonSVG color={b.color} stringColor={b.string}/>
          </div>
        ))}

        {/* FLOWERS */}
        {flowerData.map((f,i)=><Flower key={i} {...f}/>)}

        {/* ── CENTER CONTENT ── */}
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", zIndex:10 }}>

          {/* Title */}
          <div style={{ textAlign:"center", marginBottom:34, animation:"fadeInUp 1s ease .15s both" }}>
            <p style={{ fontSize:"10px", letterSpacing:".42em", color:C.silver, textTransform:"uppercase", marginBottom:12, fontWeight:300 }}>
              OMGG THIS IS 25TH OF FEBRUARY :O
            </p>
            <h1 style={{
              fontFamily:"'Cormorant Garamond',serif", fontSize:"3.7rem", fontWeight:500,
              color:C.white, lineHeight:1.1, letterSpacing:".02em",
              textShadow:`0 0 50px ${C.glow},0 2px 6px rgba(0,0,0,.6)`,
            }}>
              Happy Birthday, bby 
            </h1>
            <div style={{ width:64, height:1, background:"linear-gradient(to right,transparent,rgba(99,102,241,.7),transparent)", margin:"18px auto 0" }}/>
          </div>

          {/* CAKE */}
          <div style={{ position:"relative", display:"flex", flexDirection:"column", alignItems:"center", animation:"fadeInUp 1s ease .3s both" }} data-no-particle="true">
            <div style={{ position:"absolute", width:230, height:230, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,.16) 0%,transparent 70%)", top:"50%", left:"50%", transform:"translate(-50%,-50%)", animation:"glowPulse 3s ease-in-out infinite", pointerEvents:"none", zIndex:0 }}/>

            {/* Candle */}
            <div style={{ position:"relative", display:"flex", flexDirection:"column", alignItems:"center", zIndex:2 }}>
              {sparkles && (
                <div style={{ position:"absolute", top:-30, left:"50%", transform:"translateX(-50%)" }}>
                  {Array.from({length:8},(_,i)=>(
                    <div key={i} style={{ position:"absolute", width:5, height:5, borderRadius:"50%", background:i%2===0?C.indigoLt:C.tealLt, top:`${Math.sin((i/8)*Math.PI*2)*25}px`, left:`${Math.cos((i/8)*Math.PI*2)*25}px`, animation:`sparkle .9s ease-out ${i*.1}s both` }}/>
                  ))}
                </div>
              )}
              {!candleBlown && (
                <div style={{ width:13, height:21, background:"linear-gradient(to top,#f59e0b,#fde68a,#fefce8)", borderRadius:"50% 50% 20% 20%", animation:"flicker .55s ease-in-out infinite", boxShadow:"0 0 18px 6px rgba(245,158,11,.35)", marginBottom:2 }}/>
              )}
              {showSmoke && Array.from({length:3},(_,i)=>(
                <div key={i} style={{ position:"absolute", width:5+i*2, height:5+i*2, borderRadius:"50%", background:"rgba(148,163,184,.4)", left:"50%", transform:"translateX(-50%)", animation:`smokeUp 1.3s ease-out ${i*.22}s both` }}/>
              ))}
              <div 
                onClick={candleBlown && !blowing ? relightCandle : undefined}
                style={{ width:12, height:36, background:"linear-gradient(to bottom,#4f46e5,#3730a3)", borderRadius:4, boxShadow:"inset -2px 0 6px rgba(255,255,255,.12)", cursor: candleBlown && !blowing ? "pointer" : "default", position:"relative" }}
                title={candleBlown && !blowing ? "Click to relight 🕯️" : ""}
              >
                {candleBlown && !blowing && (
                  <div style={{ position:"absolute", top:-22, left:"50%", transform:"translateX(-50%)", fontSize:"12px", opacity:.7, pointerEvents:"none", whiteSpace:"nowrap", color:"#94a3b8", fontFamily:"'Poppins',sans-serif", fontSize:".55rem", letterSpacing:".08em" }}>tap to relight</div>
                )}
              </div>
            </div>

            {/* Tiers */}
            <div style={{ position:"relative", zIndex:2 }}>
              <div style={{ width:138, height:50, borderRadius:"10px 10px 0 0", background:"linear-gradient(to bottom,#1e293b,#0f172a)", boxShadow:"0 0 0 1px rgba(99,102,241,.18),0 4px 20px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.05)", position:"relative", overflow:"hidden" }}>
                <svg style={{position:"absolute",top:0,left:0}} width="138" height="22">
                  <path d="M0,12 Q17,4 35,12 Q52,20 70,12 Q87,4 104,12 Q121,20 138,12" stroke="rgba(99,102,241,.38)" strokeWidth="1.5" fill="none"/>
                </svg>
                {[18,50,82,114].map((x,i)=>(
                  <div key={i} style={{ position:"absolute", width:7, height:7, borderRadius:"50%", background:i%2===0?C.accent:C.teal, top:24, left:x, opacity:.85 }}/>
                ))}
              </div>
              <div style={{ width:182, height:62, marginLeft:-22, borderRadius:"6px 6px 14px 14px", background:"linear-gradient(to bottom,#0f172a,#090e1a)", boxShadow:"0 0 0 1px rgba(99,102,241,.13),0 8px 32px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.03)", position:"relative", overflow:"hidden" }}>
                <svg style={{position:"absolute",top:0,left:0}} width="182" height="22">
                  <path d="M0,12 Q22,2 45,12 Q68,22 91,12 Q114,2 137,12 Q160,22 182,12" stroke="rgba(13,148,136,.32)" strokeWidth="1.5" fill="none"/>
                </svg>
                {[14,44,74,104,134,164].map((x,i)=>(
                  <div key={i} style={{ position:"absolute", width:5, height:5, borderRadius:"50%", background:"rgba(255,255,255,.1)", top:32, left:x }}/>
                ))}
              </div>
              <div style={{ width:204, height:12, marginLeft:-33, borderRadius:6, background:"linear-gradient(to bottom,#1e293b,#0f172a)", boxShadow:"0 0 0 1px rgba(99,102,241,.1),0 4px 14px rgba(0,0,0,.4)" }}/>
            </div>

            <button
              onClick={blowCandle} data-no-particle="true" disabled={candleBlown}
              style={{
                marginTop:24, padding:"10px 34px", borderRadius:100,
                background:candleBlown?"rgba(99,102,241,.07)":"linear-gradient(135deg,#4f46e5,#3730a3)",
                color:candleBlown?C.silver:C.white,
                border:candleBlown?"1px solid rgba(99,102,241,.14)":"none",
                fontFamily:"'Poppins',sans-serif", fontWeight:400,
                fontSize:".79rem", letterSpacing:".12em",
                cursor:candleBlown?"not-allowed":"pointer",
                boxShadow:candleBlown?"none":"0 4px 28px rgba(79,70,229,.42)",
                transition:"all .3s ease",
              }}
            >
              {candleBlown ? "✦  wish made  ✦" : "blow the candle"}
            </button>
          </div>
        </div>

        {/* ENVELOPE */}
        <div style={{ position:"absolute", left:"5%", bottom:"10%", zIndex:15 }} data-no-particle="true">
          <div
            onClick={handleEnvelope}
            style={{
              cursor:"pointer", width:148,
              animation: envelopeOpen ? "none" : "envelopeShake 1.4s ease-in-out infinite",
              transformOrigin:"center bottom",
              filter: "drop-shadow(0 12px 32px rgba(0,0,0,0.55)) drop-shadow(0 2px 8px rgba(0,0,0,0.3))",
            }}
          >
            {/* Envelope SVG — realistic white envelope */}
            <svg width="148" height="108" viewBox="0 0 148 108" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display:"block" }}>
              {/* Body */}
              <rect x="1" y="1" width="146" height="106" rx="4" fill="#fafaf8" stroke="#d6d3cc" strokeWidth="1.2"/>

              {/* Bottom-left triangle fold */}
              <path d="M1 107 L74 58 L1 20 Z" fill="#edeae4" stroke="#d6d3cc" strokeWidth="0.8"/>
              {/* Bottom-right triangle fold */}
              <path d="M147 107 L74 58 L147 20 Z" fill="#e8e5df" stroke="#d6d3cc" strokeWidth="0.8"/>
              {/* Bottom flap (V shape pointing up) */}
              <path d="M1 107 L74 62 L147 107 Z" fill="#f5f3ef" stroke="#d6d3cc" strokeWidth="0.8"/>

              {/* Top flap — animated open */}
              <path
                d="M1 2 L74 56 L147 2 Z"
                fill={envelopeOpen ? "#f0ede7" : "#f7f5f1"}
                stroke="#d6d3cc" strokeWidth="0.8"
                style={{
                  transformOrigin:"74px 2px",
                  transform: envelopeOpen ? "rotateX(-170deg)" : "rotateX(0deg)",
                  transition:"transform 0.55s ease-out",
                }}
              />

              {/* Subtle center crease line */}
              <line x1="1" y1="107" x2="74" y2="62" stroke="#ccc9c2" strokeWidth="0.5" opacity="0.6"/>
              <line x1="147" y1="107" x2="74" y2="62" stroke="#ccc9c2" strokeWidth="0.5" opacity="0.6"/>

              {/* Red postage stamp top-right */}
              <rect x="112" y="10" width="26" height="22" rx="1.5" fill="#c0392b" stroke="#a93226" strokeWidth="0.8"/>
              <rect x="115" y="13" width="20" height="16" rx="1" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.7"/>
              {/* stamp lines */}
              <line x1="118" y1="17" x2="132" y2="17" stroke="rgba(255,255,255,0.5)" strokeWidth="0.7"/>
              <line x1="118" y1="20" x2="132" y2="20" stroke="rgba(255,255,255,0.5)" strokeWidth="0.7"/>
              <line x1="118" y1="23" x2="128" y2="23" stroke="rgba(255,255,255,0.5)" strokeWidth="0.7"/>

              {/* Postmark circular cancel lines */}
              <circle cx="101" cy="17" r="9" stroke="#888" strokeWidth="0.6" fill="none" opacity="0.4"/>
              <line x1="94" y1="14" x2="108" y2="14" stroke="#888" strokeWidth="0.5" opacity="0.4"/>
              <line x1="94" y1="17" x2="108" y2="17" stroke="#888" strokeWidth="0.5" opacity="0.4"/>
              <line x1="94" y1="20" x2="108" y2="20" stroke="#888" strokeWidth="0.5" opacity="0.4"/>

              {/* To: address lines */}
              <rect x="14" y="56" width="55" height="3" rx="1.5" fill="#c8c5bf" opacity="0.7"/>
              <rect x="14" y="63" width="42" height="3" rx="1.5" fill="#c8c5bf" opacity="0.5"/>
              <rect x="14" y="70" width="48" height="3" rx="1.5" fill="#c8c5bf" opacity="0.4"/>

              {/* Heart seal on flap center */}
              {!envelopeOpen && (
                <g transform="translate(74,48)">
                  <path d="M0 3.5C0 1.57 1.57 0 3.5 0C4.47 0 5.35 0.4 6 1.05C6.65 0.4 7.53 0 8.5 0C10.43 0 12 1.57 12 3.5C12 6.4 8.5 10 6 11.5C3.5 10 0 6.4 0 3.5Z" transform="translate(-6,-6)" fill="#c0392b" opacity="0.85"/>
                </g>
              )}
            </svg>

            <p style={{ textAlign:"center", marginTop:6, fontSize:"10px", color:"rgba(220,216,210,0.75)", letterSpacing:".14em", fontFamily:"'Poppins',sans-serif" }}>
              {envelopeOpen ? "close" : "open me"}
            </p>
          </div>
        </div>

        {/* LETTER MODAL */}
        {showLetter && <LetterModal onClose={()=>{ setShowLetter(false); setEnvelopeOpen(false); }}/>}

        {/* ── BACKGROUND FILM ROLL GALLERY ── */}
        <div style={{ position:"absolute", inset:0, zIndex:0, overflow:"hidden", pointerEvents:"none", background:"#08090d" }}>

          {/* Dark vignette overlay */}
          <div style={{ position:"absolute", inset:0, zIndex:3, background:"rgba(5,7,18,0.68)" }}/>
          {/* Grain texture */}
          <div style={{ position:"absolute", inset:0, zIndex:4, opacity:0.18,
            backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize:"180px 180px",
          }}/>
          {/* Edge vignette (soft dark corners/edges) */}
          <div style={{ position:"absolute", inset:0, zIndex:5,
            background:"radial-gradient(ellipse at center, transparent 45%, rgba(4,5,14,0.75) 100%)",
          }}/>

          {/* 3 diagonal film strip rows */}
          {/* Strategy: rotate the whole strip area -20deg, scale up to cover edges */}
          <div style={{
            position:"absolute",
            /* Overshoot to cover viewport even when rotated */
            top:"-30%", left:"-20%", width:"140%", height:"160%",
            transform:"rotate(-18deg)",
            transformOrigin:"center center",
            display:"flex", flexDirection:"column", gap:0,
          }}>
            {[0,1,2,3].map(row => {
              const goLeft = row % 2 === 0;
              const dur    = [95, 115, 85, 105][row];
              const imgSet = [...photos,...photos,...photos,...photos,...photos];
              const PHOTO_W = 210;
              const HOLE_H  = 10;
              const GAP     = 14;
              const ROW_H   = "25%";

              return (
                <div key={row} style={{ height:ROW_H, overflow:"hidden", display:"flex", flexDirection:"column", flexShrink:0 }}>

                  {/* Top sprocket */}
                  <div style={{ flexShrink:0, height:HOLE_H, background:"#0b0c10", display:"flex", alignItems:"center", gap:GAP, paddingLeft:GAP, borderTop:"1px solid rgba(255,255,255,0.05)", borderBottom:"1px solid rgba(255,255,255,0.03)" }}>
                    {Array.from({length:80}).map((_,i)=>(
                      <div key={i} style={{ flexShrink:0, width:16, height:6, borderRadius:2, background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.04)" }}/>
                    ))}
                  </div>

                  {/* Scrolling photos */}
                  <div style={{ flex:1, overflow:"hidden", background:"#0e0f13" }}>
                    <div style={{
                      display:"flex", gap:GAP, height:"100%", width:"max-content",
                      animation:`${goLeft ? "bgRollL" : "bgRollR"} ${dur}s linear infinite`,
                      paddingLeft:GAP,
                    }}>
                      {[...imgSet,...imgSet].map((src,i) => (
                        <div key={i} style={{
                          flexShrink:0, width:PHOTO_W, height:"100%",
                          position:"relative", overflow:"hidden",
                          borderLeft:"1px solid rgba(255,255,255,0.06)",
                          borderRight:"1px solid rgba(255,255,255,0.06)",
                          background:"#111216",
                        }}>
                          <img
                            src={src} alt=""
                            style={{ width:"100%", height:"100%", objectFit:"cover", filter:"sepia(0.18) saturate(0.5) contrast(1.12) brightness(0.75)", display:"block" }}
                            onError={e=>{ e.target.style.display="none"; e.target.parentElement.style.background="#0f1014"; e.target.parentElement.style.display="flex"; e.target.parentElement.style.alignItems="center"; e.target.parentElement.style.justifyContent="center"; e.target.parentElement.innerHTML='<span style="color:rgba(255,255,255,0.1);font-size:10px;font-family:Poppins;letter-spacing:0.1em">photo</span>'; }}
                          />
                          {/* Light leak */}
                          <div style={{ position:"absolute", top:0, left:0, width:16, height:"100%", background:"linear-gradient(to right,rgba(255,210,160,0.05),transparent)", pointerEvents:"none" }}/>
                          {/* Inner vignette */}
                          <div style={{ position:"absolute", inset:0, boxShadow:"inset 0 0 22px rgba(0,0,0,0.6)", pointerEvents:"none" }}/>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom sprocket */}
                  <div style={{ flexShrink:0, height:HOLE_H, background:"#0b0c10", display:"flex", alignItems:"center", gap:GAP, paddingLeft:GAP, borderTop:"1px solid rgba(255,255,255,0.03)", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                    {Array.from({length:80}).map((_,i)=>(
                      <div key={i} style={{ flexShrink:0, width:16, height:6, borderRadius:2, background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.04)" }}/>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CLICK PARTICLES */}
        {particles.map(p=>(
          <div key={p.id} style={{ position:"absolute", left:p.x, top:p.y, pointerEvents:"none", zIndex:50, transform:"translate(-50%,-50%)", "--dx":`${p.dx}px`, "--dy":`${p.dy}px`, "--rot":`${p.rot}deg`, animation:"particle 1.15s ease-out forwards" }}>
            {p.type==="heart" ? <Heart size={p.size} color={p.color}/> : <Petal color={p.color}/>}
          </div>
        ))}

        
      </div>

      {/* ════════════════════════════════
          INTRO OVERLAY — lamp + gift + surprise
      ════════════════════════════════ */}
      {phase !== "done" && (
        <div
          data-no-particle="true"
          style={{
            position:"fixed", inset:0, zIndex:200,
            overflow:"hidden",
            /* warm light floods in during "light" phase */
            background: ["dark","pulling"].includes(phase)
              ? "#040508"
              : phase === "light"
              ? "radial-gradient(ellipse at 50% 0%, #3a1e04 0%, #1a0d02 35%, #0a0704 100%)"
              : "transparent",
            transition:"background 1.2s ease",
            animation: phase==="fade" ? "overlayFade 1.4s ease forwards" : "none",
            pointerEvents: phase==="fade" ? "none" : "all",
          }}
        >

          {/* ══ WARM LIGHT FLOOD (after lamp on) ══ */}
          {phase === "light" && (
            <div style={{
              position:"absolute", inset:0, pointerEvents:"none",
              background:"radial-gradient(ellipse 80% 55% at 50% 0%, rgba(255,180,60,0.22) 0%, transparent 70%)",
              animation:"warmFlood 1.2s ease forwards",
            }}/>
          )}

          {/* ══ HANGING LAMP ══ */}
          {["dark","pulling","light"].includes(phase) && (
            <div style={{
              position:"absolute", top:0, left:"50%", transform:"translateX(-50%)",
              display:"flex", flexDirection:"column", alignItems:"center",
              zIndex:10,
            }}>
              {/* Cord from ceiling */}
              <div style={{
                width:3, height:60,
                background:"linear-gradient(to bottom,#2a2218,#4a3828)",
                borderRadius:"0 0 2px 2px",
                animation: ["dark","pulling"].includes(phase) ? "lampHang 3s ease-in-out infinite" : "none",
              }}/>

              {/* Lamp shade */}
              <div style={{
                position:"relative",
                animation: ["dark","pulling"].includes(phase) ? "lampHang 3s ease-in-out infinite" : "none",
              }}>
                {/* Shade SVG */}
                <svg width="110" height="90" viewBox="0 0 110 90" style={{ display:"block" }}>
                  {/* Shade body */}
                  <path d="M15 10 L5 80 Q55 92 105 80 L95 10 Q55 4 15 10Z"
                    fill={["dark","pulling"].includes(phase) ? "#2c2016" : "#c8780a"}
                    stroke={["dark","pulling"].includes(phase) ? "#1a1208" : "#a06008"}
                    strokeWidth="1.5"/>
                  {/* Shade top rim */}
                  <ellipse cx="55" cy="10" rx="40" ry="7"
                    fill={["dark","pulling"].includes(phase) ? "#221a10" : "#b06a06"}/>
                  {/* Shade highlight */}
                  <path d="M25 18 Q55 12 85 18" stroke="rgba(255,255,255,0.12)" strokeWidth="2" fill="none"/>
                  {/* Shade bottom rim */}
                  <ellipse cx="55" cy="80" rx="50" ry="9"
                    fill={["dark","pulling"].includes(phase) ? "#1a1208" : "#8a5204"}/>
                  {/* Bulb glow inside shade (warm) */}
                  {phase === "light" && (
                    <ellipse cx="55" cy="52" rx="28" ry="22"
                      fill="rgba(255,200,80,0.18)" style={{ animation:"lampGlow 2s ease-in-out infinite" }}/>
                  )}
                </svg>

                {/* Lamp glow ring below shade */}
                {phase === "light" && (
                  <div style={{
                    position:"absolute", bottom:-20, left:"50%", transform:"translateX(-50%)",
                    width:200, height:100, borderRadius:"50%",
                    background:"radial-gradient(ellipse, rgba(255,180,60,0.45) 0%, rgba(255,140,20,0.15) 50%, transparent 75%)",
                    animation:"lampGlow 2s ease-in-out infinite",
                    pointerEvents:"none",
                  }}/>
                )}
                {/* Large ambient glow */}
                {phase === "light" && (
                  <div style={{
                    position:"absolute", top:20, left:"50%", transform:"translateX(-50%)",
                    width:600, height:400, borderRadius:"50%",
                    background:"radial-gradient(ellipse, rgba(255,160,40,0.12) 0%, transparent 70%)",
                    pointerEvents:"none",
                  }}/>
                )}

                {/* Flicker overlay on lamp */}
                {lampFlicker && (
                  <div style={{
                    position:"absolute", inset:0, background:"rgba(255,255,255,0.06)",
                    animation:"lampFlicker 0.3s ease",
                    borderRadius:4, pointerEvents:"none",
                  }}/>
                )}
              </div>

              {/* Pull chain / string */}
              {!stringPulled && phase === "dark" && (
                <div
                  onClick={pullString}
                  style={{
                    position:"absolute", top:92, left:"calc(50% + 28px)",
                    cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center",
                    zIndex:20,
                    animation:"stringIdle 2.5s ease-in-out infinite",
                    transformOrigin:"top center",
                  }}
                  title="Pull the string!"
                >
                  {/* String cord */}
                  <div style={{
                    width:2, height:52,
                    background:"linear-gradient(to bottom,#7a6040,#b89060,#7a6040)",
                    borderRadius:1,
                  }}/>
                  {/* Bead links */}
                  {[0,1,2,3].map(i=>(
                    <div key={i} style={{
                      width:6, height:6, borderRadius:"50%",
                      background:"#c4984a",
                      boxShadow:"0 1px 3px rgba(0,0,0,0.5)",
                      marginTop:-2,
                      border:"1px solid #a07830",
                    }}/>
                  ))}
                  {/* Pull tag */}
                  <div style={{
                    marginTop:3, width:16, height:12,
                    background:"linear-gradient(135deg,#c49848,#a07830)",
                    borderRadius:3, border:"1px solid #7a5820",
                    boxShadow:"0 2px 6px rgba(0,0,0,0.4)",
                  }}/>
                  {/* Hint label */}
                  <div style={{
                    marginTop:8, fontSize:"9px", color:"rgba(200,170,100,.6)",
                    letterSpacing:".12em", fontFamily:"'Poppins',sans-serif",
                    whiteSpace:"nowrap",
                    animation:"introPulse 2s ease-in-out infinite",
                  }}>
                    pull me
                  </div>
                </div>
              )}

              {/* String pulled animation */}
              {stringPulled && phase === "pulling" && (
                <div style={{
                  position:"absolute", top:92, left:"calc(50% + 28px)",
                  display:"flex", flexDirection:"column", alignItems:"center",
                  animation:"stringPull 0.6s ease-out forwards",
                  transformOrigin:"top center",
                }}>
                  <div style={{ width:2, height:80, background:"linear-gradient(to bottom,#7a6040,#b89060)", borderRadius:1 }}/>
                  {[0,1,2,3].map(i=>(
                    <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:"#c4984a", marginTop:-2 }}/>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ DARK PHASE TEXT ══ */}
          {phase === "dark" && (
            <div style={{
              position:"absolute", top:"50%", left:"50%",
              transform:"translate(-50%,-50%)",
              textAlign:"center",
              animation:"introTextIn 1.6s ease 0.8s both",
            }}>
              <p style={{
                fontFamily:"'Cormorant Garamond',serif",
                fontSize:"1.65rem", fontWeight:400,
                color:"rgba(220,190,130,.75)",
                letterSpacing:".04em", lineHeight:1.75,
                animation:"textGlow 3s ease-in-out 2s infinite",
              }}>
                gelap by,<br/>
                <span style={{ fontSize:"1.2rem", opacity:.75, fontStyle:"italic" }}>
                  nyalain dulu lampunya.
                </span>
              </p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}