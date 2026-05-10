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

// Fade-in on scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card, .feature, .step, .stat').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
});

// === MAT-IA CHAT ===

const chatWidget   = document.getElementById('chatWidget');
const chatTrigger  = document.getElementById('chatTrigger');
const chatClose    = document.getElementById('chatClose');
const chatInput    = document.getElementById('chatInput');
const chatSend     = document.getElementById('chatSend');
const chatMessages = document.getElementById('chatMessages');
const matiaHeroBtn = document.getElementById('matiaHeroBtn');

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
        <div class="chat-bubble typing-dots">
            <span></span><span></span><span></span>
        </div>`;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return msg;
}

function getBotResponse(message) {
    const m = message.toLowerCase();

    if (m.match(/^(hola|buenas|buenos|hi|hey)/))
        return '¡Hola! Contame qué problema tiene tu equipo y te oriento.';
    if (m.includes('iphone'))
        return '¿El iPhone no enciende, no carga, o tiene otro síntoma? Eso me ayuda a orientarte mejor.';
    if (m.includes('macbook') || m.includes('mac book'))
        return '¿Es Air o Pro? ¿El síntoma es que no enciende, sin imagen en pantalla, o problema de carga?';
    if (m.includes('mac') && (m.includes('no enciende') || m.includes('no prende')))
        return 'Ese síntoma en Mac generalmente es falla de placa o controlador de carga. Lo resolvemos con microsoldadura. ¿Querés coordinar por WhatsApp?';
    if (m.includes('no enciende') || m.includes('no prende') || m.includes('no arranca') || m.includes('apagado'))
        return 'Ese síntoma puede ser placa, batería o conector de carga. La mayoría se resuelve con microsoldadura. ¿Querés coordinarlo por WhatsApp?';
    if (m.includes('pantalla') || m.includes('display') || m.includes('imagen') || m.includes('backlight'))
        return 'Los problemas de imagen pueden ser la pantalla en sí o el controlador en placa. Necesitamos verlo presencialmente para confirmarte. ¿Lo traés al local?';
    if (m.includes('agua') || m.includes('mojado') || m.includes('líquido') || m.includes('liquido') || m.includes('cayó') || m.includes('cayo'))
        return '¡Importante! Si se mojó, apagalo ya si aún no lo hiciste y NO lo cargues. Traelo cuanto antes: los daños por líquido se recuperan mucho mejor si se actúa rápido.';
    if (m.includes('carga') || m.includes('batería') || m.includes('bateria') || m.includes('puerto'))
        return 'Los problemas de carga pueden ser el conector, el circuito de carga en placa, o la batería. Primero hacemos diagnóstico para confirmarte cuál es. ¿Lo traés al local?';
    if (m.includes('face id') || m.includes('faceid'))
        return 'El Face ID es uno de los trabajos más delicados. Dependiendo qué módulo falló, puede tener solución. Necesitamos evaluarlo. ¿Lo traés al local?';
    if (m.includes('precio') || m.includes('costo') || m.includes('cuánto') || m.includes('cuanto') || m.includes('presupuesto'))
        return 'Los precios varían según la falla. Primero hacemos el diagnóstico (sin cargo si no hay reparación viable) y después te pasamos el presupuesto. ¿Qué equipo tenés?';
    if (m.includes('whatsapp') || m.includes('contacto') || m.includes('teléfono') || m.includes('telefono') || m.includes('llamar'))
        return 'Podés escribirnos al +54 11 5340-3805 o +54 11 6354-0404. Atendemos de lunes a viernes de 10 a 18hs. ¡Te esperamos!';
    if (m.includes('garantía') || m.includes('garantia'))
        return 'Trabajamos con garantía sobre la reparación. Los detalles te los pasamos cuando te presupuestamos según el tipo de trabajo.';
    if (m.includes('tiempo') || m.includes('demora') || m.includes('cuándo') || m.includes('cuando'))
        return 'Los tiempos varían según la complejidad de la falla. En general entre 2 y 7 días hábiles. Te lo confirmamos al hacer el diagnóstico.';

    return 'Entendido. Para darte un diagnóstico preciso necesitamos ver el equipo en el local. ¿Querés coordinar una visita por WhatsApp?';
}

function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    appendMessage(text, 'user');
    chatInput.value = '';
    chatSend.disabled = true;

    const typingEl = showTyping();

    setTimeout(() => {
        typingEl.remove();
        appendMessage(getBotResponse(text), 'bot');
        chatSend.disabled = false;
        chatInput.focus();
    }, 900 + Math.random() * 400);
}

chatSend.addEventListener('click', sendMessage);

chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});

chatInput.addEventListener('input', () => {
    chatSend.disabled = !chatInput.value.trim();
});
