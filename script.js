// COUNTDOWN (Birthday target: June 6, 2026 00:00:00)
const targetDate = new Date(2026, 5, 6, 0, 0, 0).getTime();
const forceRevealWishes = new URLSearchParams(window.location.search).has('showWishes');
const APPROVED_STATUS = 'approved';

let timerActive = true;
const heroMessage = document.querySelector('.heroMessage');
const confettiContainer = document.getElementById('confettiContainer');
let confettiLoop;

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

function loadSlideImage(index) {
    const slide = slides[index];
    if (!slide || slide.dataset.failed || slide.src || !slide.dataset.src) return;
    slide.src = slide.dataset.src;
}

if (slides.length > 0) {
    slides.forEach((slide) => {
        slide.addEventListener('error', () => {
            slide.dataset.failed = 'true';
            slide.classList.remove('active');
            if (slides[slideIndex] === slide) {
                showNextSlide();
            }
        });
    });

    function showNextSlide() {
        slides[slideIndex].classList.remove("active");

        for (let attempts = 0; attempts < slides.length; attempts++) {
            slideIndex = (slideIndex + 1) % slides.length;
            if (!slides[slideIndex].dataset.failed) {
                loadSlideImage(slideIndex);
                loadSlideImage((slideIndex + 1) % slides.length);
                slides[slideIndex].classList.add("active");
                return;
            }
        }
    }

    loadSlideImage(0);
    loadSlideImage(1);

    setInterval(showNextSlide, 3000);
}

// MESSAGE + CONFETTI
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

function startConfettiLoop() {
    if (confettiLoop) return;
    launchConfetti();
    confettiLoop = setInterval(launchConfetti, 30000);
}

function revealBirthdayMessage(isBirthday) {
    if (heroMessage) {
        if (isBirthday) {
            heroMessage.classList.remove('hidden');
            startConfettiLoop();
        } else {
            heroMessage.classList.add('hidden');
        }
    }
}

const SUPABASE_URL = 'https://yqloiatsvvuejgtyqvng.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxbG9pYXRzdnZ1ZWpndHlxdm5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0OTg5NjEsImV4cCI6MjA5NjA3NDk2MX0.DPEIppXivX4e-I-JKb_X1OO3kUfBQ9oBJruPD_MyELs';
const supabaseClient = window.supabase
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function fetchApprovedWishes() {
    try {
        if (!supabaseClient) throw new Error('Supabase client unavailable');
        const { data, error } = await supabaseClient
            .from('wishes')
            .select('id, name, message, created_at, status')
            .eq('status', APPROVED_STATUS)
            .order('created_at', { ascending: true });
        if (error) throw error;
        return data || [];
    } catch (supabaseError) {
        try {
            const res = await fetch('wishes_db.json');
            if (!res.ok) throw new Error('Static wishes unavailable');
            const wishes = await res.json();
            return wishes.filter(w => !w.status || w.status === APPROVED_STATUS);
        } catch (staticError) {
            return [];
        }
    }
}

function updateWishesCount(count) {
    const countEl = document.getElementById('wishesCount');
    if (!countEl) return;
    countEl.textContent = typeof count === 'number' ? `Saved wishes: ${count}` : 'Saved wishes: unavailable right now';
}

async function renderWishes(revealed) {
    const list = document.getElementById('wishesList');
    if (!list) return;
    if (!revealed) {
        list.classList.add('hidden');
        // also update count by fetching approved count
        const wishes = await fetchApprovedWishes();
        updateWishesCount(wishes.length);
        return;
    }
    list.innerHTML = '';
    const wishes = await fetchApprovedWishes();
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
            if (!supabaseClient) throw new Error('Supabase client unavailable');
            const wish = {
                name: name || 'Anonymous',
                message,
                status: APPROVED_STATUS
            };
            const { error } = await supabaseClient
                .from('wishes')
                .insert([wish]);
            if (error) throw error;
            if (!error) {
                showAlert('your birthday wish has been saved, thank you');
                form.reset();
                renderWishes(forceRevealWishes || Date.now() >= targetDate);
            }
        } catch (e) {
            console.error('Wish save failed:', e);
            showAlert('Sorry, your wish could not be saved. Please try again.');
            return;
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
    const wishes = await fetchApprovedWishes();
    badge.textContent = wishes.length || 0;
}
updateBadge();

// Initialize wishes display on non-birthday page loads
if (!isBirthdayOnLoad) {
    renderWishes(forceRevealWishes);
    if (forceRevealWishes) {
        const notice = document.getElementById('preBirthdayNotice');
        if (notice) {
            notice.textContent = 'Preview mode: saved wishes are visible before her birthday.';
        }
    }
}

