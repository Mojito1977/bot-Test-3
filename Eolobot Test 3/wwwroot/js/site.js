// THEME SWITCH
const themeToggle = document.getElementById("themeToggle");
const themeLabel = document.querySelector(".theme-label");

themeToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark");
    document.body.classList.toggle("light");
    themeLabel.textContent =
        document.body.classList.contains("dark") ? "Dark Mode" : "Light Mode";
});

// ELEMENTI BASE
const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const quickActions = document.querySelectorAll(".quick-actions button");

// SUONI
const sendSound = document.getElementById("send-sound");
const receiveSound = document.getElementById("receive-sound");

// STATO
let currentFlow = null;
let flowStep = 0;
let typingElement = null;

// FUNZIONI MESSAGGI
function addMessage(text, sender = "bot") {
    if (sender === "bot") {
        hideTyping();
        if (receiveSound) receiveSound.play().catch(() => { });
    } else {
        if (sendSound) sendSound.play().catch(() => { });
    }

    const div = document.createElement("div");
    div.classList.add("message", sender);
    div.textContent = text;
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function addMeta(text) {
    const div = document.createElement("div");
    div.classList.add("message", "meta");
    div.textContent = text;
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// TYPING INDICATOR
function showTyping() {
    hideTyping();
    typingElement = document.createElement("div");
    typingElement.classList.add("typing-indicator");
    typingElement.innerHTML = "<span></span><span></span><span></span>";
    chatWindow.appendChild(typingElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function hideTyping() {
    if (typingElement && typingElement.parentNode) {
        typingElement.parentNode.removeChild(typingElement);
        typingElement = null;
    }
}

// FLUSSO: PROBLEMI CONNESSIONE
async function handleConnessioneFlow(userText) {
    if (flowStep === 0) {
        addMessage("Ok, ti aiuto con la connessione. Il problema è:", "bot");
        addMessage("- Nessuna connessione\n- Connessione lenta\n- Connessione che va e viene", "bot");
        flowStep = 1;
        return;
    }

    if (flowStep === 1) {
        const lower = userText.toLowerCase();
        if (lower.includes("nessuna")) {
            addMessage("Capito: nessuna connessione. Controlliamo alcune cose di base.", "bot");
        } else if (lower.includes("lenta")) {
            addMessage("Capito: connessione lenta. Vediamo insieme alcuni controlli.", "bot");
        } else {
            addMessage("Ok, connessione instabile. Facciamo qualche verifica.", "bot");
        }
        addMessage("1) Le luci del modem sono tutte accese in modo fisso o lampeggiano?", "bot");
        flowStep = 2;
        return;
    }

    if (flowStep === 2) {
        addMessage("Grazie. Ora provo a verificare lo stato della tua linea…", "bot");
        addMeta("Avvio controllo automatico della linea…");
        showTyping();
        await simulateLineaCheck();
        hideTyping();
        addMessage("Dai controlli automatici non risultano guasti generali sulla tua linea.", "bot");
        addMessage("Se il problema persiste, posso aprire un ticket per l’assistenza tecnica.", "bot");
        addMessage("Vuoi che apra un ticket? (sì/no)", "bot");
        flowStep = 3;
        return;
    }

    if (flowStep === 3) {
        const lower = userText.toLowerCase();
        if (lower.includes("sì") || lower.includes("si")) {
            const ticketId = "EO-" + Math.floor(Math.random() * 900000 + 100000);
            addMessage(`Ho aperto un ticket per te. ID: ${ticketId}.`, "bot");
            addMessage("Un operatore ti contatterà il prima possibile. Nel frattempo puoi continuare a usare il chatbot per altre domande.", "bot");
        } else {
            addMessage("Va bene, non apro nessun ticket. Se cambi idea, scrivimi pure.", "bot");
        }
        currentFlow = null;
        flowStep = 0;
        return;
    }
}

// FLUSSO: FATTURE E PAGAMENTI
function handleFattureFlow(userText) {
    if (flowStep === 0) {
        addMessage("Per le fatture posso aiutarti con:", "bot");
        addMessage("- Verifica stato pagamento\n- Invio copia fattura\n- Informazioni su metodi di pagamento", "bot");
        flowStep = 1;
        return;
    }

    if (flowStep === 1) {
        addMessage("Per motivi di privacy questa è solo una demo, quindi non accedo ai tuoi dati reali.", "bot");
        addMessage("In un sistema reale qui verrebbero interrogati i sistemi interni di Eolo.", "bot");
        addMessage("Posso però spiegarti come funzionano in generale fatture, scadenze e metodi di pagamento.", "bot");
        currentFlow = null;
        flowStep = 0;
        return;
    }
}

// FLUSSO: OFFERTE
function handleOfferteFlow(userText) {
    if (flowStep === 0) {
        addMessage("Posso darti informazioni generali su:", "bot");
        addMessage("- Offerte casa\n- Offerte business\n- Velocità e copertura", "bot");
        flowStep = 1;
        return;
    }

    if (flowStep === 1) {
        addMessage("Questa è una demo: le offerte non sono collegate ai sistemi reali di Eolo.", "bot");
        addMessage("In un contesto reale il chatbot leggerebbe le offerte aggiornate da un’API interna.", "bot");
        currentFlow = null;
        flowStep = 0;
        return;
    }
}

// SIMULAZIONE CONTROLLO LINEA
async function simulateLineaCheck() {
    try {
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipRes.json();

        const locRes = await fetch("https://ipapi.co/json/");
        const locData = await locRes.json();

        const city = locData.city || "la tua zona";

        const meteoRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${locData.latitude}&longitude=${locData.longitude}&hourly=wind_speed_10m`
        );
        await meteoRes.json(); // non usiamo i dettagli, basta la simulazione

        addMessage(`Ho rilevato il tuo IP pubblico: ${ipData.ip}`, "bot");
        addMessage(`Sto verificando eventuali condizioni meteo avverse vicino a ${city}…`, "bot");
        addMessage("Al momento non risultano condizioni estreme che possano giustificare un guasto diffuso.", "bot");
    } catch (e) {
        addMessage("Non sono riuscito a completare il controllo automatico della linea, ma possiamo comunque procedere con la diagnosi.", "bot");
    }
}

// CHIAMATA AI (DeepSeek)
async function askAI(prompt) {
    showTyping();
    try {
        const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer INSERISCI_LA_TUA_API_KEY"
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content:
                            "Sei un assistente clienti Eolo in una demo scolastica. Rispondi in modo chiaro, educato e sintetico. Specifica quando qualcosa è solo simulato."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            })
        });

        const data = await res.json();
        const reply =
            data.choices?.[0]?.message?.content ||
            "Non sono riuscito a generare una risposta al momento.";
        addMessage(reply, "bot");
    } catch (e) {
        addMessage("Si è verificato un problema nel contattare il motore AI. Riprova più tardi.", "bot");
    } finally {
        hideTyping();
    }
}

// GESTIONE MESSAGGIO UTENTE
async function handleUserMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessage(text, "user");
    userInput.value = "";

    // Se siamo in un flusso guidato
    if (currentFlow === "problemi_connessione") {
        await handleConnessioneFlow(text);
        return;
    }
    if (currentFlow === "fatture_pagamenti") {
        handleFattureFlow(text);
        return;
    }
    if (currentFlow === "info_offerte") {
        handleOfferteFlow(text);
        return;
    }

    const lower = text.toLowerCase();

    if (lower.includes("connessione") || lower.includes("internet") || lower.includes("wifi")) {
        currentFlow = "problemi_connessione";
        flowStep = 0;
        await handleConnessioneFlow(text);
        return;
    }

    if (lower.includes("fattur") || lower.includes("pagament")) {
        currentFlow = "fatture_pagamenti";
        flowStep = 0;
        handleFattureFlow(text);
        return;
    }

    if (lower.includes("offert") || lower.includes("piano") || lower.includes("abbonamento")) {
        currentFlow = "info_offerte";
        flowStep = 0;
        handleOfferteFlow(text);
        return;
    }

    // Domanda generica → AI
    await askAI(text);
}

// QUICK ACTIONS
quickActions.forEach(btn => {
    btn.addEventListener("click", async () => {
        const action = btn.dataset.action;
        if (action === "problemi_connessione") {
            currentFlow = "problemi_connessione";
            flowStep = 0;
            await handleConnessioneFlow("");
        } else if (action === "fatture_pagamenti") {
            currentFlow = "fatture_pagamenti";
            flowStep = 0;
            handleFattureFlow("");
        } else if (action === "info_offerte") {
            currentFlow = "info_offerte";
            flowStep = 0;
            handleOfferteFlow("");
        }
    });
});

// INVIO DA TASTIERA
userInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleUserMessage();
    }
});

sendBtn.addEventListener("click", handleUserMessage);

// MESSAGGIO INIZIALE
addMessage("Ciao! Sono il chatbot di assistenza Eolo (demo). Come posso aiutarti oggi?", "bot");
addMessage("Puoi usare i pulsanti rapidi qui sotto oppure scrivere la tua domanda.", "bot");
