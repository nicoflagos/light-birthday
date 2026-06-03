// COUNTDOWN (Birthday target: June 3, 2026 2:18pm local time)
const targetDate = new Date(2026, 5, 3, 14, 18, 0).getTime();

let timerActive = true;
function updateCountdown() {
    if (!timerActive) return;
    
    const now = Date.now();
    let distance = targetDate - now;

    if (distance <= 0) {
        distance = 0;
        revealBirthdayMessage(true);
        renderWishes(true);
        const notice = document.getElementById('preBirthdayNotice');
        if (notice) {
            notice.textContent = 'All wishes are now visible below. Thank you for celebrating!';
        }
        timerActive = false;
        clearInterval(timer);
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").innerHTML = days + " ";
    document.getElementById("hours").innerHTML = hours + " ";
    document.getElementById("minutes").innerHTML = minutes + " ";
    document.getElementById("seconds").innerHTML = seconds + " ";
}

const timer = setInterval(updateCountdown, 1000);
updateCountdown();

// On page load, if it's already birthday, disable timer and launch confetti
const isBirthdayOnLoad = Date.now() >= targetDate;
if (isBirthdayOnLoad) {
    timerActive = false;
    clearInterval(timer);
    revealBirthdayMessage(true);
    renderWishes(true);
    launchConfetti();
    const notice = document.getElementById('preBirthdayNotice');
    if (notice) {
        notice.textContent = 'All wishes are now visible below. Thank you for celebrating!';
    }
}


// SLIDESHOW
let slideIndex = 0;
const slides = document.querySelectorAll(".slide");

setInterval(() => {
    slides[slideIndex].classList.remove("active");
    slideIndex = (slideIndex + 1) % slides.length;
    slides[slideIndex].classList.add("active");
}, 3000);

// MESSAGE + CONFETTI
const heroMessage = document.querySelector('.heroMessage');
const confettiContainer = document.getElementById('confettiContainer');

function createConfettiPiece() {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    const colors = ['#ff6b6b', '#ffd166', '#ff9ff3', '#a29bfe', '#74b9ff', '#81ecec'];
    const size = Math.floor(Math.random() * 12) + 8;
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size * 1.2}px`;
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.top = '-20px';
    confetti.style.opacity = `${Math.random() * 0.4 + 0.7}`;
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    confetti.style.animationDuration = `${Math.random() * 2 + 3.5}s`;
    confetti.style.animationDelay = `${Math.random() * 0.5}s`;
    return confetti;
}

function launchConfetti() {
    if (!confettiContainer) return;
    const count = 60;
    for (let i = 0; i < count; i++) {
        const piece = createConfettiPiece();
        confettiContainer.appendChild(piece);
    }
    setTimeout(() => {
        if (confettiContainer) confettiContainer.innerHTML = '';
    }, 5000);
}

function revealBirthdayMessage(isBirthday) {
    if (heroMessage) {
        if (isBirthday) {
            heroMessage.classList.remove('hidden');
            launchConfetti();
        } else {
            heroMessage.classList.add('hidden');
        }
    }
}

// LocalStorage key for saved wishes
const STORAGE_KEY = 'birthday_wishes_2026';

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function loadWishes() {
    try {
        // Try server first
        return []; // placeholder; server fetch used elsewhere
    } catch (e) {
        return [];
    }
}

function saveWishes(arr) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function updateWishesCount(count) {
    const countEl = document.getElementById('wishesCount');
    if (!countEl) return;
    countEl.textContent = typeof count === 'number' ? `Saved wishes: ${count}` : 'No wishes yet. Be the first!';
}

async function renderWishes(revealed) {
    const list = document.getElementById('wishesList');
    if (!revealed) {
        list.classList.add('hidden');
        // also update count by fetching approved count
        try {
            const res = await fetch('/api/wishes?status=approved');
            const json = await res.json();
            updateWishesCount(json.wishes.length);
        } catch (e) {
            // fallback to local count
            const raw = localStorage.getItem(STORAGE_KEY);
            const arr = raw ? JSON.parse(raw) : [];
            updateWishesCount(arr.length);
        }
        return;
    }
    list.innerHTML = '';
    try {
        const res = await fetch('/api/wishes?status=approved');
        const json = await res.json();
        const wishes = json.wishes || [];
        wishes.forEach(w => {
            const el = document.createElement('div');
            el.className = 'wishItem';
            const name = escapeHtml(w.name || 'Anonymous');
            const msg = escapeHtml(w.message || '');
            el.innerHTML = `<strong>${name}</strong><p>${msg}</p>`;
            list.appendChild(el);
        });
        updateWishesCount(wishes.length);
        list.classList.remove('hidden');
    } catch (e) {
        // offline fallback to localStorage
        const raw = localStorage.getItem(STORAGE_KEY);
        const wishes = raw ? JSON.parse(raw) : [];
        wishes.forEach(w => {
            const el = document.createElement('div');
            el.className = 'wishItem';
            const name = escapeHtml(w.name || 'Anonymous');
            const msg = escapeHtml(w.message || '');
            el.innerHTML = `<strong>${name}</strong><p>${msg}</p>`;
            list.appendChild(el);
        });
        updateWishesCount(wishes.length);
        list.classList.remove('hidden');
    }
}

function showAlert(msg) {
    alert(msg);
}

function disableForm(form) {
    Array.from(form.querySelectorAll('input, textarea, button')).forEach(el => el.disabled = true);
}

function enableForm(form) {
    Array.from(form.querySelectorAll('input, textarea, button')).forEach(el => el.disabled = false);
}

function initWishesForm() {
    const form = document.getElementById('wishesForm');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('wishName').value.trim();
        const message = document.getElementById('wishMessage').value.trim();
        if (!message) return;
        disableForm(form);
        try {
            // On June 6, auto-approve by adding status: 'approved'
            const isBirthday = Date.now() >= targetDate;
            const payload = { name, message };
            if (isBirthday) payload.status = 'approved';
            
            // try server
            const res = await fetch('/api/wishes', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                showAlert('✨ Your wish has been saved! Thank you!');
                form.reset();
                // On birthday, re-render wishes immediately
                if (isBirthday) renderWishes(true);
            } else {
                throw new Error('Server error');
            }
        } catch (e) {
            // fallback to local
            const raw = localStorage.getItem(STORAGE_KEY);
            const arr = raw ? JSON.parse(raw) : [];
            arr.push({ name, message, time: new Date().toISOString(), status: 'approved' });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
            showAlert('✨ Your wish has been saved locally! Thank you!');
            form.reset();
            renderWishes(Date.now() >= targetDate);
        } finally {
            enableForm(form);
        }
    });
}

// On page load: initialize form and decide whether to reveal wishes
initWishesForm();

// update wish badge count
async function updateBadge() {
    const badge = document.getElementById('badge');
    if (!badge) return;
    try {
        const res = await fetch('/api/wishes?status=approved');
        const json = await res.json();
        badge.textContent = (json.wishes && json.wishes.length) ? json.wishes.length : 0;
    } catch (e) {
        const raw = localStorage.getItem(STORAGE_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        badge.textContent = arr.length || 0;
    }
}
updateBadge();

// Initialize wishes display on non-birthday page loads
if (!isBirthdayOnLoad) {
    renderWishes(false);
}

