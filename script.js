const intro = document.getElementById("intro");
const stage = document.getElementById("memoryStage");
const openBtn = document.getElementById("openBtn");
const replayBtn = document.getElementById("replayBtn");
const memoryWrap = document.getElementById("memoryWrap");
const orbit = document.getElementById("orbit");
const photos = [...document.querySelectorAll(".photo")];
const bouquetWrap = document.getElementById("bouquetWrap");
const dots = [...document.querySelectorAll(".dot")];
const letter = document.getElementById("letter");
const letterBackdrop = document.getElementById("letterBackdrop");
const letterClose = document.getElementById("letterClose");
const letterImage = document.getElementById("letterImage");
const letterKicker = document.getElementById("letterKicker");
const letterTitle = document.getElementById("letterTitle");
const letterText = document.getElementById("letterText");
const petals = document.getElementById("petals");

const memories = [
  { title: "Already nine months!!!!?", text: "Happy 9 months. Thank you for being part of my life and chapter and for making so many days happier. ROAD TO ONE YEAR! LOVE YOOOOU!", kicker: "1" },
  { title: "VALENTINE !", text: "Lots of surprises and loves day. The very first bouquet I have got and it is perfect. The moments, gifts, and you - it is THE BEST MOMENT EVER. I couldn't stop loving you more 💋", kicker: "2" },
  { title: "Fav Pic", text: "This is one of my fav pics because it gives me Youth of May vibe - when they get married. This day was filled with happiness and love. Plus one of my fav day!", kicker: "3" },
  { title: "For all the days ♡", text: "Sometimes, just being with you is already enough for me. All I want is you staying on my side no matter what. Being loved by you is all I want 𑣲⋆", kicker: "4" },
  { title: "THE first date ♡", text: "The day I fell in love and finally decided to be with you. None of the stress or overthinking had appeared on that day. All I was thinking is we are going to be THE COUPLE officially. All the waiting time is over and being able to call Ko for real. I hope we keep having those butterflies.", kicker: "5" }
];

let angle = 0;
let pointerTarget = 0;
let pointerOffset = 0;
let lastTime = null;
let raf = null;
let opened = false;
let paused = false;
let activeIndex = 0;
let lastFocused = null;
const AUTO_SPEED = 4.2;
const POINTER_EASE = 2.6;

function pointerMove(clientX) {
  const center = window.innerWidth / 2;
  const normalized = Math.max(-1, Math.min(1, (clientX - center) / (window.innerWidth * 0.5)));
  pointerTarget = normalized * 11;
}

function setActive(index) {
  activeIndex = index;
  dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
}

function updateOrbit(timestamp) {
  if (!opened) return;
  if (lastTime === null) lastTime = timestamp;
  const dt = Math.min(0.05, (timestamp - lastTime) / 1000);
  lastTime = timestamp;

  if (!paused) angle += AUTO_SPEED * dt;

  const ease = 1 - Math.exp(-POINTER_EASE * dt);
  pointerOffset += (pointerTarget - pointerOffset) * ease;
  const current = angle + pointerOffset;

  const rect = memoryWrap.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  const radiusX = Math.min(w * 0.40, 440);
  const radiusY = Math.min(h * 0.18, 135);
  const points = photos.length;

  photos.forEach((photo, i) => {
    const base = (i / points) * Math.PI * 2;
    const a = base + current * Math.PI / 180;
    const x = Math.sin(a) * radiusX;
    const y = -Math.cos(a) * radiusY;
    const depth = Math.cos(a);

    // Gentle depth changes keep the carousel calm instead of making the photos
    // jump dramatically toward and away from the viewer.
    const scale = 0.82 + (depth + 1) * 0.10;
    const rotation = Math.sin(a) * 3.5;
    const z = Math.round(depth * 100);

    photo.style.setProperty("--x", `${x}px`);
    photo.style.setProperty("--y", `${y}px`);
    photo.style.setProperty("--depth", z);
    photo.style.setProperty("--scale", scale.toFixed(3));
    photo.style.setProperty("--rot", `${rotation.toFixed(2)}deg`);
    photo.style.zIndex = String(300 + z);
  });

  raf = requestAnimationFrame(updateOrbit);
}

function openSurprise() {
  intro.classList.add("hidden");
  stage.classList.add("show");
  stage.setAttribute("aria-hidden", "false");
  opened = true;
  paused = false;
  angle = 0; pointerTarget = 0; pointerOffset = 0; lastTime = null;
  if (!raf) raf = requestAnimationFrame(updateOrbit);
}

function replay() {
  closeLetter();
  opened = false;
  paused = false;
  stage.classList.remove("show");
  stage.setAttribute("aria-hidden", "true");
  if (raf) { cancelAnimationFrame(raf); raf = null; }
  lastTime = null;
  photos.forEach(el => { el.style.animation = "none"; void el.offsetWidth; el.style.animation = ""; });
  bouquetWrap.style.animation = "none"; void bouquetWrap.offsetWidth; bouquetWrap.style.animation = "";
  setTimeout(() => intro.classList.remove("hidden"), 420);
}

function openLetter(index) {
  const safeIndex = Number.isInteger(index) ? index : 0;
  const memory = memories[safeIndex] || memories[0];
  const img = photos[safeIndex]?.querySelector("img");
  lastFocused = document.activeElement;
  letterImage.src = img?.src || "";
  letterImage.alt = `Memory ${safeIndex + 1}`;
  letterKicker.textContent = memory.kicker;
  letterTitle.textContent = memory.title;
  letterText.textContent = memory.text;
  paused = true;
  letter.classList.add("open");
  letterBackdrop.classList.add("open");
  letter.setAttribute("aria-hidden", "false");
  setActive(safeIndex);
  letterClose.focus();
}

function closeLetter() {
  paused = false;
  letter.classList.remove("open");
  letterBackdrop.classList.remove("open");
  letter.setAttribute("aria-hidden", "true");
  if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
}

function jumpToMemory(index) {
  const target = Number(index);
  if (!Number.isFinite(target)) return;
  const step = 360 / photos.length;
  angle = -target * step;
  setActive(target);
}

openBtn.addEventListener("click", openSurprise);
replayBtn.addEventListener("click", replay);
letterClose.addEventListener("click", closeLetter);
letterBackdrop.addEventListener("click", closeLetter);
photos.forEach(photo => photo.addEventListener("click", () => openLetter(Number(photo.dataset.memory))));
bouquetWrap.addEventListener("click", () => {
  releaseBouquetPetals();
});

function releaseBouquetPetals() {
  const rect = bouquetWrap.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height * 0.42;

  for (let i = 0; i < 26; i++) {
    const petal = document.createElement("span");
    petal.className = "bouquet-petal-burst";
    const angle = Math.random() * Math.PI * 2;
    const distance = 90 + Math.random() * 230;
    const size = 0.55 + Math.random() * 0.7;
    petal.style.left = `${originX}px`;
    petal.style.top = `${originY}px`;
    petal.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    petal.style.setProperty("--dy", `${Math.sin(angle) * distance - 90}px`);
    petal.style.setProperty("--rot", `${Math.random() * 360}deg`);
    petal.style.setProperty("--scale", size.toFixed(2));
    petal.style.animationDelay = `${Math.random() * 0.12}s`;
    document.body.appendChild(petal);
    petal.addEventListener("animationend", () => petal.remove(), { once: true });
  }

  bouquetWrap.classList.remove("petal-pop");
  void bouquetWrap.offsetWidth;
  bouquetWrap.classList.add("petal-pop");
}

dots.forEach(dot => dot.addEventListener("click", () => jumpToMemory(dot.dataset.dot)));

window.addEventListener("mousemove", e => {
  if (opened && !letter.classList.contains("open")) pointerMove(e.clientX);
});
window.addEventListener("touchmove", e => {
  if (opened && e.touches[0] && !letter.classList.contains("open")) pointerMove(e.touches[0].clientX);
}, { passive: true });
window.addEventListener("resize", () => { pointerTarget = 0; });

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    if (letter.classList.contains("open")) closeLetter();
    else if (stage.classList.contains("show")) replay();
  }
  if (stage.classList.contains("show") && !letter.classList.contains("open")) {
    if (e.key === "ArrowRight") jumpToMemory((activeIndex + 1) % memories.length);
    if (e.key === "ArrowLeft") jumpToMemory((activeIndex - 1 + memories.length) % memories.length);
  }
  if (letter.classList.contains("open") && e.key === "Tab") {
    const focusables = [letterClose];
    if (document.activeElement === focusables[0] && !e.shiftKey) { e.preventDefault(); focusables[0].focus(); }
  }
});

for (let i = 0; i < 18; i++) {
  const p = document.createElement("span");
  p.className = "petal";
  p.style.left = `${Math.random() * 100}%`;
  p.style.top = `${-20 - Math.random() * 20}%`;
  p.style.setProperty("--drift", `${(Math.random() * 180 - 90).toFixed(0)}px`);
  p.style.animationDuration = `${8 + Math.random() * 9}s`;
  p.style.animationDelay = `${Math.random() * 9}s`;
  p.style.transform = `scale(${0.55 + Math.random() * .7})`;
  petals.appendChild(p);
}
