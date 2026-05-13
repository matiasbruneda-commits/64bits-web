// === NAVIGATION ===

const hamburger   = document.getElementById('hamburger');
const navMobile   = document.getElementById('navMobile');
const nav         = document.getElementById('nav');

hamburger.addEventListener('click', () => {
    const isOpen = navMobile.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (!target) return;
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 52;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
        navMobile.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
    });
});

window.addEventListener('scroll', () => {
    nav.style.background = window.scrollY > 20
        ? 'rgba(0, 0, 0, 0.92)'
        : 'rgba(0, 0, 0, 0.75)';
}, { passive: true });

// === SCROLL: PARALLAX ===

const watermark = document.querySelector('.watermark');

let maxScroll = document.documentElement.scrollHeight - window.innerHeight;
window.addEventListener('resize', () => {
    maxScroll = document.documentElement.scrollHeight - window.innerHeight;
}, { passive: true });

let rafPending = false;
const onScrollRAF = () => {
    rafPending = false;
    const sy    = window.scrollY;
    const viewH = window.innerHeight;

    if (watermark) {
        const progress = maxScroll > 0 ? sy / maxScroll : 0;
        const vOffset  = (0.5 - progress) * viewH * 0.4;
        watermark.style.transform = `translate(-50%, calc(-50% + ${vOffset}px))`;
    }
};

window.addEventListener('scroll', () => {
    if (!rafPending) { rafPending = true; requestAnimationFrame(onScrollRAF); }
}, { passive: true });

// === SCROLL FADE-UP ===

// Guardar valores de los stats antes de que cualquier animación los toque
document.querySelectorAll('.stat-number').forEach(el => {
    el.dataset.target = el.textContent.trim();
});

const fadeInObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add('visible');
        fadeInObs.unobserve(el);
        if (!el.dataset.staggerDone) {
            const delay = parseInt(el.style.getPropertyValue('--stagger') || '0', 10);
            setTimeout(() => {
                el.style.setProperty('--stagger', '0ms');
                el.dataset.staggerDone = '1';
            }, delay + 700);
        }
    });
}, { threshold: 0.08 });

function registerFade(selector, baseDelay, perItem, animClass = 'fade-up') {
    document.querySelectorAll(selector).forEach((el, i) => {
        if (el.classList.contains('no-fade')) return;
        el.classList.add(animClass);
        el.style.setProperty('--stagger', `${baseDelay + i * perItem}ms`);
        fadeInObs.observe(el);
    });
}

registerFade('.section-eyebrow',       0,   0);
registerFade('.section-title',        60,   0);
registerFade('.section-subtitle',    120,   0);
registerFade('.service-card',          0,  70, 'scale-up');
registerFade('.feature',               0,  55);
registerFade('.step',                  0,  90);
registerFade('.stat',                  0,  80);
registerFade('.trust-item',            0,  60);
registerFade('.testimonials-carousel', 0,   0, 'fade-in');
registerFade('.testimonials-cta',     80,   0);
registerFade('.contact-info',          0,   0, 'slide-right');
registerFade('.contact-actions',       0,   0, 'slide-left');

// === ANIMATED COUNTERS ===

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function runCounter(el, target) {
    const start = performance.now();
    const tick = (now) => {
        const p = Math.min((now - start) / 1800, 1);
        el.textContent = Math.round(easeOutCubic(p) * target);
        if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}

function runTypewriter(el, text) {
    el.textContent = '';
    let i = 0;
    const iv = setInterval(() => {
        el.textContent += text[i++];
        if (i >= text.length) clearInterval(iv);
    }, 85);
}

const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const numEl = entry.target.querySelector('.stat-number');
        if (!numEl || numEl.dataset.counted) return;
        numEl.dataset.counted = '1';
        const raw = numEl.dataset.target || numEl.textContent.trim();
        const num = parseInt(raw, 10);
        if (!isNaN(num)) runCounter(numEl, num);
        else              runTypewriter(numEl, raw);
        counterObs.unobserve(entry.target);
    });
}, { threshold: 0.6 });

document.querySelectorAll('.stat').forEach(el => counterObs.observe(el));

// === TESTIMONIALS CAROUSEL ===
(function () {
    const track = document.getElementById('carouselTrack');
    if (!track) return;

    const cards   = track.querySelectorAll('.testimonial-card');
    const dots    = document.querySelectorAll('.carousel-dot');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    let current = 0;
    let timer;

    function goTo(index) {
        current = (index + cards.length) % cards.length;
        track.style.transform = `translateX(-${current * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function startTimer() {
        timer = setInterval(() => goTo(current + 1), 5000);
    }

    function resetTimer() {
        clearInterval(timer);
        startTimer();
    }

    prevBtn.addEventListener('click', () => { goTo(current - 1); resetTimer(); });
    nextBtn.addEventListener('click', () => { goTo(current + 1); resetTimer(); });
    dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); resetTimer(); }));

    const carousel = document.querySelector('.testimonials-carousel');
    carousel.addEventListener('mouseenter', () => clearInterval(timer));
    carousel.addEventListener('mouseleave', startTimer);

    goTo(0);
    startTimer();
})();

// === MAT-IA CHAT ===

const chatWidget   = document.getElementById('chatWidget');
const chatTrigger  = document.getElementById('chatTrigger');
const chatClose    = document.getElementById('chatClose');
const chatInput    = document.getElementById('chatInput');
const chatSend     = document.getElementById('chatSend');
const chatMessages = document.getElementById('chatMessages');
const matiaHeroBtn = document.getElementById('matiaHeroBtn');

// URL del Cloudflare Worker — reemplazar después de deployar
const MATIA_WORKER = 'https://matia-64bits.matiasbruneda.workers.dev';

const MATIA_SYSTEM = `Sos MAT-IA, el asistente técnico de 64 Bits Belgrano. Tu personalidad es cercana, profesional y empática — hablás en argentino, de forma simple y clara, sin tecnicismos innecesarios.

PRIMER MENSAJE: Siempre arrancás preguntando el nombre del cliente. Ejemplo: "¡Hola! Soy MAT-IA, el asistente de 64 Bits Belgrano. ¿Cómo te llamás?"

UNA VEZ QUE SABÉS EL NOMBRE: Usalo en cada respuesta para generar cercanía.

TU OBJETIVO: Diagnosticar el problema del equipo haciendo preguntas de a una por vez, nunca varias juntas. Según el problema orientar al cliente y motivarlo a traer el equipo al local.

PREGUNTAS DE DIAGNÓSTICO según el problema:
- No enciende: ¿Vibra cuando lo cargás? ¿Aparece el logo de Apple? ¿Se cayó o mojó?
- No carga: ¿Carga con distintos cables? ¿El conector tiene pelusa? ¿La batería dura poco?
- Pantalla: ¿Tiene imagen pero no responde al tacto? ¿La imagen tiene rayas o está negra?
- Daño por agua: ¿Cuándo fue? ¿Lo pusiste a cargar después?
- MacBook no enciende: ¿Hace algún sonido? ¿El MagSafe/USB-C tiene luz?

SERVICIOS Y PRECIOS ORIENTATIVOS:
- Diagnóstico: sin costo si no hay reparación posible
- Cambio de pantalla iPhone: desde $80.000
- Cambio de batería iPhone: desde $40.000
- Reparación placa lógica iPhone: desde $150.000 según falla
- Reparación placa lógica MacBook: desde $200.000 según falla
- Conector de carga: desde $60.000

UBICACIÓN Y CONTACTO:
- Ciudad de la Paz 2347, local 63, Belgrano, CABA
- Lunes a viernes 10 a 18hs
- WhatsApp: +54 11 5340-3805

AL FINAL DE LA CONVERSACIÓN: Cuando el cliente esté listo para llevar el equipo, preguntale su WhatsApp y generá un link wa.me con un resumen de la charla para que Matias esté al tanto.

PRIMER MENSAJE DEL CLIENTE: Cuando el cliente mande su primer mensaje, presentate brevemente y preguntale cómo se llama. Ejemplo: "Hola! Soy MAT-IA, el asistente de 64 Bits. ¿Cómo te llamás?"

IMPORTANTE: Nunca des presupuestos cerrados, siempre son orientativos y sujetos a diagnóstico. Nunca prometás resultados sin ver el equipo.

TONO Y ESTILO:
- Menos exclamaciones y frases de relleno tipo "¡Perfecto!", "¡Genial!", "Bueno,", "Ah, entiendo,"
- No repetir el nombre en cada mensaje — usarlo solo al principio y ocasionalmente
- Si el cliente da su nombre, usarlo en diminutivo cuando sea posible (Matias → Mati, Diego → Die, Federico → Fede, etc.)
- Ir directo a la pregunta sin tanto preámbulo
- Tono amistoso pero concreto — como un amigo técnico que sabe lo que hace
- Evitar frases como "Una pregunta más para orientarme mejor" — ir directo

FLUJO ADICIONAL PARA "NO CARGA":
Antes de preguntar sobre el cable, preguntar primero: "¿El teléfono sigue encendido o ya se apagó porque se quedó sin batería?"
- Si se apagó: tener en cuenta que puede ser solo batería descargada
- Si sigue encendido: continuar con el diagnóstico normal`;

const conversationHistory = [];

function openChat() {
    chatWidget.classList.add('open');
    chatTrigger.classList.add('hidden');
    setTimeout(() => chatInput.focus(), 280);
}

function closeChat() {
    chatWidget.classList.remove('open');
    chatTrigger.classList.remove('hidden');
}

matiaHeroBtn.addEventListener('click', openChat);
chatTrigger.addEventListener('click', openChat);
chatClose.addEventListener('click', closeChat);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chatWidget.classList.contains('open')) closeChat();
});

function appendMessage(text, type) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${type}`;

    if (type === 'bot') {
        msg.innerHTML = `
            <div class="chat-msg-avatar">
                <svg class="matia-icon" aria-hidden="true"><use href="#matia-avatar"/></svg>
            </div>
            <div class="chat-bubble">${text}</div>`;
    } else {
        msg.innerHTML = `<div class="chat-bubble">${text}</div>`;
    }

    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return msg;
}

function showTyping() {
    const msg = document.createElement('div');
    msg.className = 'chat-msg bot chat-typing-msg';
    msg.innerHTML = `
        <div class="chat-msg-avatar">
            <svg class="matia-icon" aria-hidden="true"><use href="#matia-avatar"/></svg>
        </div>
        <div class="chat-bubble">
            <div class="typing-indicator">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        </div>`;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return msg;
}

function buildWhatsappSummary() {
    const lines = [];
    chatMessages.querySelectorAll('.chat-msg').forEach(msg => {
        const bubble = msg.querySelector('.chat-bubble');
        if (!bubble || bubble.querySelector('.typing-indicator')) return;
        const role = msg.classList.contains('bot') ? 'MAT-IA' : 'Cliente';
        const txt = bubble.textContent.trim();
        if (txt) lines.push(`${role}: ${txt}`);
    });
    return `Hola! Te paso el resumen de mi consulta con MAT-IA 64 Bits:\n\n${lines.join('\n')}`;
}

function showWhatsappBtn() {
    if (document.getElementById('chatWaBtn')) return;
    const footer = chatWidget.querySelector('.chat-footer');
    if (!footer) return;

    const btn = document.createElement('button');
    btn.id = 'chatWaBtn';
    btn.className = 'chat-wa-btn';
    btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> Enviar resumen por WhatsApp`;
    btn.addEventListener('click', () => {
        const url = `https://wa.me/5491153403805?text=${encodeURIComponent(buildWhatsappSummary())}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    });

    footer.insertBefore(btn, footer.firstChild);
}

async function callMatIA(userText) {
    conversationHistory.push({ role: 'user', content: userText });

    const res = await fetch(MATIA_WORKER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system: MATIA_SYSTEM, messages: conversationHistory }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const reply = data.content?.[0]?.text || 'No pude procesar la respuesta. Intentá de nuevo.';
    conversationHistory.push({ role: 'assistant', content: reply });
    return reply;
}

async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    appendMessage(text, 'user');
    chatInput.value = '';
    chatSend.disabled = true;

    const typingEl = showTyping();

    try {
        const [reply] = await Promise.all([
            callMatIA(text),
            new Promise(r => setTimeout(r, 1500)),
        ]);
        typingEl.remove();
        appendMessage(reply, 'bot');
        if (conversationHistory.length >= 4) showWhatsappBtn();
    } catch {
        typingEl.remove();
        appendMessage('No pude conectarme. Escribinos directo al <a href="https://wa.me/5491153403805" target="_blank" rel="noopener noreferrer">WhatsApp +54 11 5340-3805</a>.', 'bot');
    } finally {
        chatSend.disabled = false;
        chatInput.focus();
    }
}

chatSend.addEventListener('click', sendMessage);

chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});

chatInput.addEventListener('input', () => {
    chatSend.disabled = !chatInput.value.trim();
});

// === FAQ ACCORDION ===
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => { i.classList.remove('open'); i.querySelector('.faq-question').setAttribute('aria-expanded', 'false'); });
    if (!isOpen) { item.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
  });
});
