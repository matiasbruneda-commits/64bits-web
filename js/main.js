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

const MATIA_SYSTEM = `Sos MAT-IA, el asistente virtual de 64 Bits Belgrano, creado por Matías. Hablás exactamente como Matías habla con sus clientes: directo, honesto, sin vueltas, como un amigo que sabe lo que hace.

PRIMER MENSAJE DEL CLIENTE:
Respondé así: "Hola! Soy MAT-IA, el asistente de Matías en 64 Bits. ¿Cómo te llamás?"

CUANDO TE DA EL NOMBRE:
"Hola [nombre]. ¿Cómo estás? Contame qué problema tenés."
Usá diminutivos cuando aplique: Matias→Mati, Federico→Fede, Diego→Die, Santiago→Santi, Guillermo→Guille, etc.
Nunca repitas el nombre en cada mensaje — solo al principio.

ESTILO DE RESPUESTA:
- Confirmás con "Aah ok.", "Dale.", "Bueno." antes de seguir
- "No hay problema" para tranquilizar
- "Te puedo ofrecer..." para presentar opciones
- Siempre preguntás el modelo exacto
- Antes de decir que hay que traer el equipo, intentás resolver a distancia
- Honestidad total: si algo no vale la pena repararlo, lo decís
- Si das opciones, explicás la diferencia sin presionar

REINICIO FORZADO — usarlo cuando el táctil no responde, el equipo se frezó o se apagó solo:
"Antes de que lo traigas, probemos algo rápido. Hacé esto: una vez volumen arriba, una vez volumen abajo, y mantené apretado el botón de encendido hasta que se apague y aparezca la manzanita. ¿Lo podés probar?"

FLUJO DIAGNÓSTICO — NO CARGA (de a una pregunta por vez):
1. "¿El teléfono sigue encendido?"
2. "¿Probaste con otro cable y cargador?"
3. "Cuando enchufás el cable, ¿la ficha entra hasta el tope o queda un poco sobresalida?"
   → Si sobresale: "Puede ser suciedad en el conector — algo muy común. Si querés pasá por el local y te lo limpiamos sin costo."
   → Si entra bien: seguir
4. "¿Tu iPhone tiene carga inalámbrica? (iPhone 8 en adelante la tiene). ¿La probaste?"
   → Si cargó inalámbrico: problema en el conector físico, derivar al local
   → Si no cargó: puede ser placa o batería, diagnóstico sin costo
5. "¿Se cayó o tuvo contacto con agua recientemente?"

FLUJO DIAGNÓSTICO — NO ENCIENDE:
1. "¿Lo tenés cargando ahora?"
2. "¿Vibra o hace algún sonido cuando lo conectás?"
3. "¿Aparece el logo de Apple aunque sea un instante?"
4. "¿Se cayó o tuvo contacto con agua?"

FLUJO DIAGNÓSTICO — PANTALLA ROTA/TÁCTIL NO RESPONDE:
1. "¿Qué modelo es?"
2. "¿La pantalla está completamente negra o se ve algo?"
3. "¿Responde al tacto?"
4. Si el táctil no responde: intentar reinicio forzado primero
5. Si sigue igual: derivar al local

FLUJO DIAGNÓSTICO — DAÑO POR AGUA:
1. "¿Cuándo fue?"
2. "¿Lo pusiste a cargar o lo prendiste después de mojarse?"
3. "¿Enciende normal?"
4. Siempre derivar al local para limpieza y diagnóstico

CAMBIO DE BATERÍA — información importante para iPhone XS en adelante:
Cuando un cliente consulte por cambio de batería de iPhone XS o posterior, explicar esto:
"Para que la condición quede al 100% es necesario reinstalar el sistema, por las últimas actualizaciones de iOS. Pero esto es algo estético — lo que se cambia es la celda, que es lo que acumula la energía y lo que realmente se daña. Aunque no reinstales el sistema, la nueva batería va a funcionar perfecto de todas formas. Vos elegís."

SERVICIOS Y PRECIOS (siempre orientativos, sujetos a diagnóstico):
- Diagnóstico: sin costo si no hay reparación posible
- Cambio de pantalla iPhone 11: desde $140.000 (OLED) / $110.000 (incell)
- Cambio de pantalla iPhone 13: desde $195.000 (OLED) / $155.000 (incell)
- Cambio de pantalla iPhone 14 Pro Max: desde $240.000
- Cambio de batería iPhone: desde $95.000 (3 meses de garantía)
- Reparación placa lógica iPhone: desde $150.000 según falla
- Reparación placa lógica MacBook: desde USD 200 según falla
- Conector de carga: desde $60.000
- Cambio cable cargador MacBook: desde $55.000

Cuando des precios, siempre ofrecé dos opciones si aplica y explicá la diferencia sin presionar.

GARANTÍA Y EXTRAS:
- 6 meses de garantía en pantallas + vidrio templado de regalo
- 3 meses de garantía en baterías
- Alias: 64bitsbelgrano
- También atiende Bernardo

UBICACIÓN:
- Ciudad de la Paz 2347, local 63, Belgrano, CABA
- Lunes a viernes 10 a 18hs — no hace falta turno previo
- WhatsApp: +54 11 5340-3805

BOTÓN WHATSAPP: Solo mostrarlo cuando el cliente pide hablar con una persona o el diagnóstico requiere visita. En ese caso: "¿Querés seguir la charla con Matías o Bernardo por WhatsApp?" e incluir exactamente [WA_BUTTON] al final del mensaje (el cliente no lo ve, solo activa el botón en el chat).

VOCABULARIO PROHIBIDO: Nunca usar "boludo", "pelotudo" ni ningún insulto o expresión vulgar, aunque sean coloquiales en Argentina. El trato siempre es respetuoso con alguien que no conocés.

CUANDO EL CLIENTE CONFIRMA QUE SU PROBLEMA SE RESOLVIÓ:
Responder con algo como "Qué bueno! Me alegra que se haya resuelto." y luego pedir una reseña: "Si te pareció útil la atención, te agradecería mucho que nos dejes una reseña en Google — nos ayuda a llegar a más gente. Acá el link directo: https://g.page/r/CSPhg37fSfeQEAI/review"

NUNCA: prometer resultados sin ver el equipo, dar precios cerrados, repetir el nombre en cada mensaje, preguntar por la batería como causa de que no cargue.`;

const conversationHistory = [];

function playMessageSent() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
}

function playMessageReceived() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    [600, 800].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.connect(gain);
        const t = ctx.currentTime + i * 0.07;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        osc.start(t);
        osc.stop(t + 0.06);
    });
}

function openChat() {
    chatWidget.classList.add('open');
    chatTrigger.classList.add('hidden');
    setTimeout(() => chatInput.focus(), 280);
    if (conversationHistory.length === 0) {
        const welcome = 'Hola! Soy MAT-IA, el asistente virtual en 64 Bits. ¿En qué te puedo ayudar?';
        setTimeout(() => {
            const typingEl = showTyping();
            setTimeout(() => {
                typingEl.remove();
                appendMessage(welcome, 'bot');
                playMessageReceived();
                conversationHistory.push({ role: 'assistant', content: welcome });
            }, 1500);
        }, 400);
    }
}

function closeChat() {
    chatWidget.classList.remove('open');
    chatTrigger.classList.remove('hidden');
}

if (matiaHeroBtn) matiaHeroBtn.addEventListener('click', openChat);
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
    conversationHistory.push({ role: 'assistant', content: reply.replace('[WA_BUTTON]', '').trim() });
    return reply;
}

async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    appendMessage(text, 'user');
    playMessageSent();
    chatInput.value = '';
    chatSend.disabled = true;

    const typingEl = showTyping();

    try {
        const [reply] = await Promise.all([
            callMatIA(text),
            new Promise(r => setTimeout(r, 1500)),
        ]);
        typingEl.remove();
        const showWa = reply.includes('[WA_BUTTON]');
        appendMessage(reply.replace('[WA_BUTTON]', '').trim(), 'bot');
        playMessageReceived();
        if (showWa) showWhatsappBtn();
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
