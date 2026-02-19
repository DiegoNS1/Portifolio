const intro = document.getElementById("intro");
const enterBtn = document.getElementById("enterBtn");
const soundBtn = document.getElementById("soundBtn");
const audio = document.getElementById("forgeAudio");
const year = document.getElementById("year");
const heatText = document.getElementById("heatText");

year.textContent = new Date().getFullYear();

// ---------- Intro open ----------
function enterForge() {
  if (!intro || intro.classList.contains("open")) return;
  intro.classList.add("open");

  // remove after animation
  setTimeout(() => {
    intro.style.display = "none";
    document.body.style.overflowY = "auto";
  }, 950);
}

enterBtn.addEventListener("click", enterForge);
window.addEventListener("keydown", (e) => {
  if (e.key === "Enter") enterForge();
});

// ---------- Optional sound (user gesture) ----------
let soundOn = false;
soundBtn.addEventListener("click", async () => {
  try {
    soundOn = !soundOn;
    soundBtn.setAttribute("aria-pressed", String(soundOn));
    soundBtn.textContent = soundOn ? "Som: Ligado" : "Som: Desligado";

    if (soundOn) {
      await audio.play();
    } else {
      audio.pause();
    }
  } catch {
    // Se o navegador bloquear, mantém desligado
    soundOn = false;
    soundBtn.setAttribute("aria-pressed", "false");
    soundBtn.textContent = "Som: Desligado";
  }
});

// ---------- Heat text small animation ----------
let heat = 72;
setInterval(() => {
  heat += (Math.random() - 0.5) * 6;
  heat = Math.max(55, Math.min(95, heat));
  heatText.textContent = `Calor: ${Math.round(heat)}%`;
}, 900);

// ---------- Embers canvas ----------
const canvas = document.getElementById("embers");
const ctx = canvas.getContext("2d");

let w, h, dpr;
function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  w = canvas.width = Math.floor(window.innerWidth * dpr);
  h = canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
}
window.addEventListener("resize", resize);
resize();

const embers = [];
const MAX = 85;

function rand(min, max){ return Math.random() * (max - min) + min; }

function spawn(x = rand(0, w), y = rand(h * 0.4, h)) {
  embers.push({
    x, y,
    r: rand(0.8, 2.6) * dpr,
    vy: rand(-1.8, -0.6) * dpr,
    vx: rand(-0.35, 0.35) * dpr,
    a: rand(0.35, 0.9),
    life: rand(120, 280),
    hue: rand(18, 45) // laranja/dourado
  });
  if (embers.length > MAX) embers.shift();
}

// initial
for (let i = 0; i < MAX; i++) spawn();

function draw() {
  ctx.clearRect(0,0,w,h);

  // glow base
  const g = ctx.createRadialGradient(w*0.5, h*0.65, 40*dpr, w*0.5, h*0.65, 520*dpr);
  g.addColorStop(0, "rgba(255,122,24,0.06)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0,0,w,h);

  for (const p of embers) {
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 1;
    p.a *= 0.997;

    // drift to top
    if (p.y < -20*dpr || p.life <= 0 || p.a < 0.05) {
      p.x = rand(0, w);
      p.y = rand(h*0.55, h + 40*dpr);
      p.life = rand(120, 280);
      p.a = rand(0.35, 0.9);
    }

    ctx.beginPath();
    ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${p.a})`;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fill();
  }

  requestAnimationFrame(draw);
}
draw();

// click sparks (simple burst)
window.addEventListener("pointerdown", (e) => {
  const x = (e.clientX * dpr);
  const y = (e.clientY * dpr);
  for (let i = 0; i < 18; i++) {
    spawn(x + rand(-22,22)*dpr, y + rand(-22,22)*dpr);
  }
});