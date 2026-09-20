/* =====================================================
   GUARDIAN LIFE PRO
   JAVASCRIPT
===================================================== */


/* ================= DADOS ================= */

const STORAGE_KEY = "guardianLifePRO";

let data = JSON.parse(
    localStorage.getItem(STORAGE_KEY)
) || {

    password: "",

    medications: [],

    routines: [],

    appointments: [],

    shopping: [],

    contacts: [],

    healthCard: {},

    personal: {}

};


/* ================= FUNÇÕES BÁSICAS ================= */

function $(id) {
    return document.getElementById(id);
}


function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

}


/* ================= LOGIN ================= */

function login() {

    const password =
        $("passwordInput").value.trim();

    if (!password) {

        $("loginMsg").textContent =
            "⚠️ Digite uma senha.";

        return;
    }


    /* Primeira senha */

    if (!data.password) {

        data.password = password;

        saveData();

        showApp();

        return;
    }


    /* Senha existente */

    if (password === data.password) {

        showApp();

    } else {

        $("loginMsg").textContent =
            "❌ Senha incorreta.";

    }

}


$("passwordInput").addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            login();

        }

    }
);


/* ================= ENTRAR ================= */

function showApp() {

    $("lockPage").classList.add("hidden");

    $("app").classList.remove("hidden");

    updateDate();

    renderAll();

}


/* ================= SAIR ================= */

function logout() {

    $("app").classList.add("hidden");

    $("lockPage").classList.remove("hidden");

    $("passwordInput").value = "";

    backHome();

}


/* ================= DATA ================= */

function updateDate() {

    const now = new Date();

    $("dateText").textContent =
        now.toLocaleDateString(
            "pt-BR",
            {
                weekday: "long",
                day: "2-digit",
                month: "long"
            }
        );

}


/* ================= NAVEGAÇÃO ================= */

function openArea(id) {

    $("dashboard").classList.add("hidden");

    document
        .querySelectorAll(".area")
        .forEach(area => {
            area.classList.remove("active");
        });


    $(id).classList.add("active");

    window.scrollTo(0, 0);

}


function backHome() {

    document
        .querySelectorAll(".area")
        .forEach(area => {
            area.classList.remove("active");
        });

    $("dashboard").classList.remove("hidden");

    window.scrollTo(0, 0);

}





















/* ================= MEDICAMENTOS ================= */

// garante que o array existe, mesmo se "data" vier vazio ou antigo
if (!data.medications) {
    data.medications = [];
}

function toggleMedForm() {
    const form = $("medForm");
    form.style.display = form.style.display === "none" ? "block" : "none";
}

function addMedication() {
    const name = $("medName").value.trim();
    const time = $("medTime").value;
    const tipo = $("medTipo").value;
    const obs = $("medObs").value.trim();

    if (!name || !time) {
        alert("Preencha o medicamento e o horário.");
        return;
    }

    data.medications.push({
        id: Date.now(),
        name: name,
        time: time,
        tipo: tipo,
        obs: obs,
        lastNotified: null
    });

    saveData();

    $("medName").value = "";
    $("medTime").value = "";
    $("medObs").value = "";
    toggleMedForm();

    renderMedications();
}

function deleteMedication(id) {
    data.medications = data.medications.filter(item => item.id !== id);

    saveData();
    renderMedications();
}

function renderMedications() {
    const list = $("medList");
    if (!list) return; // evita erro se a seção não estiver na tela

    const continuos = data.medications.filter(m => m.tipo === "continuo").length;
    const temporarios = data.medications.filter(m => m.tipo === "temporario").length;

    const countEl = $("medCount");
    if (countEl) {
        countEl.textContent = `${continuos} contínuo(s) · ${temporarios} temporário(s)`;
    }

    if (data.medications.length === 0) {
        list.innerHTML = `
            <div class="med-empty">
                <span class="icon">💊</span>
                Nenhum medicamento cadastrado ainda.<br>
                Toque no botão acima para adicionar.
            </div>
        `;
        return;
    }

    list.innerHTML = data.medications.map(med => `
        <div class="med-item">
            <div>
                <strong>💊 ${escapeHTML(med.name)} — ${med.time}</strong>
                <span class="tag">${med.tipo === "continuo" ? "Contínuo" : "Temporário"}</span>
                <br>
                <small>${escapeHTML(med.obs || "Sem observação")}</small>
            </div>
            <button type="button" onclick="deleteMedication(${med.id})">Excluir</button>
        </div>
    `).join("");
}

/* ----- NOTIFICAÇÕES ----- */

function requestNotificationPermission() {
    if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
    }
}

function checkMedicationNotifications() {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const today = now.toISOString().slice(0, 10);

    data.medications.forEach(med => {
        if (med.time === currentTime && med.lastNotified !== today) {
            new Notification("💊 Hora do medicamento!", {
                body: `${med.name}${med.obs ? " — " + med.obs : ""}`
            });

            med.lastNotified = today;
            saveData();
        }
    });
}

requestNotificationPermission();
setInterval(checkMedicationNotifications, 30000);
   




















/* ================= ROTINA DIÁRIA ================= */

// garante que o array existe, mesmo se "data" vier vazio ou antigo
if (!data.routines) {
    data.routines = [];
}

function toggleRotinaForm() {
    const form = $("rotinaForm");
    form.style.display = form.style.display === "none" ? "block" : "none";
}

function addRotina() {
    const name = $("rotName").value.trim();
    const time = $("rotTime").value;

    if (!name) {
        alert("Preencha o nome da atividade.");
        return;
    }

    data.routines.push({
        id: Date.now(),
        name: name,
        time: time,
        done: false,
        lastDone: null
    });

    saveData();

    $("rotName").value = "";
    $("rotTime").value = "";
    toggleRotinaForm();

    renderRotina();
}

function toggleRotinaDone(id) {
    const today = new Date().toISOString().slice(0, 10);
    const item = data.routines.find(r => r.id === id);
    if (!item) return;

    item.done = !item.done;
    item.lastDone = item.done ? today : null;

    saveData();
    renderRotina();
}

function deleteRotina(id) {
    data.routines = data.routines.filter(item => item.id !== id);

    saveData();
    renderRotina();
}

function renderRotina() {
    const list = $("rotinaList");
    if (!list) return; // evita erro se a seção não estiver na tela

    const countEl = $("rotCount");
    if (countEl) {
        countEl.textContent = `${data.routines.length} atividade${data.routines.length === 1 ? "" : "s"}`;
    }

    if (data.routines.length === 0) {
        list.innerHTML = `
            <div class="rot-empty">
                <span class="icon">📋</span>
                Nenhuma atividade cadastrada ainda.<br>
                Toque em "+ Nova Atividade" para começar.
            </div>
        `;
        return;
    }

    list.innerHTML = data.routines.map(rot => `
        <div class="rot-item ${rot.done ? "done" : ""}">
            <input
                type="checkbox"
                ${rot.done ? "checked" : ""}
                onchange="toggleRotinaDone(${rot.id})"
            >
            <div class="rot-info">
                <strong>${escapeHTML(rot.name)}</strong>
                ${rot.time ? `<br><small>⏰ ${rot.time}</small>` : ""}
            </div>
            <button type="button" onclick="deleteRotina(${rot.id})">Excluir</button>
        </div>
    `).join("");
}

/* reseta as atividades marcadas como concluídas todo dia */
function resetRotinaDiaria() {
    const today = new Date().toISOString().slice(0, 10);
    let changed = false;

    data.routines.forEach(r => {
        if (r.done && r.lastDone !== today) {
            r.done = false;
            r.lastDone = null;
            changed = true;
        }
    });

    if (changed) saveData();
}


















/* ================= CONSULTAS ================= */

// garante que o array existe, mesmo se "data" vier vazio ou antigo
if (!data.appointments) {
    data.appointments = [];
}

function toggleConsultaForm() {
    const form = $("consultaForm");
    form.style.display = form.style.display === "none" ? "block" : "none";
}

function addAppointment() {
    const doctor = $("docName").value.trim();
    const place = $("docPlace").value.trim();
    const date = $("docDate").value;
    const time = $("docTime").value;

    if (!doctor || !date || !time) {
        alert("Preencha médico, data e horário.");
        return;
    }

    data.appointments.push({
        id: Date.now(),
        doctor: doctor,
        place: place,
        date: date,
        time: time
    });

    saveData();

    $("docName").value = "";
    $("docPlace").value = "";
    $("docDate").value = "";
    $("docTime").value = "";
    toggleConsultaForm();

    renderAppointments();
}

function deleteAppointment(id) {
    data.appointments = data.appointments.filter(item => item.id !== id);

    saveData();
    renderAppointments();
}

function isConsultaPassada(item) {
    const dataHora = new Date(`${item.date}T${item.time}`);
    return dataHora.getTime() < Date.now();
}

function renderAppointments() {
    const list = $("appointmentList");
    if (!list) return; // evita erro se a seção não estiver na tela

    const passadas = data.appointments.filter(isConsultaPassada).length;
    const proximas = data.appointments.length - passadas;

    const countEl = $("consCount");
    if (countEl) {
        countEl.textContent = `${proximas} próxima${proximas === 1 ? "" : "s"} · ${passadas} passada${passadas === 1 ? "" : "s"}`;
    }

    if (data.appointments.length === 0) {
        list.innerHTML = `
            <div class="cons-empty">
                <span class="icon">🏥</span>
                Nenhuma consulta agendada.<br>
                Toque em "+ Nova Consulta" para adicionar.
            </div>
        `;
        return;
    }

    // ordena por data/hora, mais próxima primeiro
    const ordenadas = [...data.appointments].sort((a, b) =>
        new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
    );

    list.innerHTML = ordenadas.map(item => {
        const passada = isConsultaPassada(item);
        return `
            <div class="cons-item ${passada ? "passada" : ""}">
                <div>
                    <strong>🏥 ${escapeHTML(item.doctor)}</strong>
                    <span class="tag ${passada ? "passada" : ""}">${passada ? "Passada" : "Próxima"}</span>
                    <br>
                    <small>
                        ${formatDate(item.date)} às ${item.time}
                        • ${escapeHTML(item.place || "Local não informado")}
                    </small>
                </div>
                <button type="button" onclick="deleteAppointment(${item.id})">Excluir</button>
            </div>
        `;
    }).join("");
}













 /* ================= LISTA DE COMPRAS ================= */

// garante que o array existe, mesmo se "data" vier vazio ou antigo
if (!data.shopping) {
    data.shopping = [];
}

function addShopping() {
    const input = $("shoppingName");
    const name = input.value.trim();

    if (!name) {
        input.focus();
        return;
    }

    data.shopping.push({
        id: Date.now(),
        name: name,
        done: false
    });

    saveData();

    input.value = "";
    input.focus();

    renderShopping();
}

function toggleShopping(id) {
    const item = data.shopping.find(x => x.id === id);
    if (!item) return;

    item.done = !item.done;

    saveData();
    renderShopping();
}

function deleteShopping(id) {
    data.shopping = data.shopping.filter(item => item.id !== id);

    saveData();
    renderShopping();
}

function renderShopping() {
    const list = $("shoppingList");
    if (!list) return; // evita erro se a seção não estiver na tela ainda

    const total = data.shopping.length;
    const marcados = data.shopping.filter(i => i.done).length;

    const countEl = $("shopCount");
    if (countEl) {
        countEl.textContent = `${marcados} de ${total} itens marcados`;
    }

    if (total === 0) {
        list.innerHTML = `
            <div class="shop-empty">
                <span class="icon">🛍️</span>
                <span class="title">Lista vazia</span>
                Adicione seus itens de compra acima
            </div>
        `;
        return;
    }

    list.innerHTML = data.shopping.map(item => `
        <div class="shop-item ${item.done ? "done" : ""}">
            <input
                type="checkbox"
                ${item.done ? "checked" : ""}
                onchange="toggleShopping(${item.id})"
            >
            <div class="shop-name">${escapeHTML(item.name)}</div>
            <button type="button" onclick="deleteShopping(${item.id})">Excluir</button>
        </div>
    `).join("");
}














/* ================= CARTÃO DE SAÚDE ================= */

// garante que o objeto existe, mesmo se "data" vier vazio ou antigo
if (!data.healthCard) {
    data.healthCard = {
        tipoSanguineo: null,
        medicamentos: "",
        alergiaMedicamentos: "",
        alergiaAlimentar: "",
        alergiaOutras: "",
        condicoes: "",
        observacoes: ""
    };
}

function initHealthCard() {
    const el = $("csMeds");
    if (!el) return; // evita erro se a seção não estiver na tela

    const hc = data.healthCard;

    $("csMeds").value = hc.medicamentos || "";
    $("csAlergiaMed").value = hc.alergiaMedicamentos || "";
    $("csAlergiaAlimento").value = hc.alergiaAlimentar || "";
    $("csAlergiaOutras").value = hc.alergiaOutras || "";
    $("csCondicoes").value = hc.condicoes || "";
    $("csObs").value = hc.observacoes || "";

    document.querySelectorAll(".cs-blood-btn").forEach(btn => {
        btn.classList.toggle("selected", btn.dataset.tipo === hc.tipoSanguineo);
        btn.onclick = () => selectBloodType(btn.dataset.tipo);
    });
}

function selectBloodType(tipo) {
    data.healthCard.tipoSanguineo =
        data.healthCard.tipoSanguineo === tipo ? null : tipo;

    document.querySelectorAll(".cs-blood-btn").forEach(btn => {
        btn.classList.toggle("selected", btn.dataset.tipo === data.healthCard.tipoSanguineo);
    });
}

function saveHealthCard() {
    data.healthCard = {
        tipoSanguineo: data.healthCard.tipoSanguineo,
        medicamentos: $("csMeds").value.trim(),
        alergiaMedicamentos: $("csAlergiaMed").value.trim(),
        alergiaAlimentar: $("csAlergiaAlimento").value.trim(),
        alergiaOutras: $("csAlergiaOutras").value.trim(),
        condicoes: $("csCondicoes").value.trim(),
        observacoes: $("csObs").value.trim()
    };

    saveData();
    alert("Cartão de saúde salvo com sucesso!");
}

function clearHealthCard() {
    const confirmar = confirm("Tem certeza que deseja apagar todas as informações do cartão de saúde?");
    if (!confirmar) return;

    data.healthCard = {
        tipoSanguineo: null,
        medicamentos: "",
        alergiaMedicamentos: "",
        alergiaAlimentar: "",
        alergiaOutras: "",
        condicoes: "",
        observacoes: ""
    };

    saveData();
    initHealthCard();
}

function buildHealthCardText() {
    const hc = data.healthCard;

    let texto = "🏷️ *CARTÃO DE SAÚDE*\n\n";
    texto += `🩸 Tipo Sanguíneo: ${hc.tipoSanguineo || "Não informado"}\n\n`;
    texto += `💊 Medicamentos em Uso:\n${hc.medicamentos || "Nenhum"}\n\n`;
    texto += `⚠️ Alergias a Medicamentos:\n${hc.alergiaMedicamentos || "Nenhuma"}\n\n`;
    texto += `🍽️ Alergias Alimentares:\n${hc.alergiaAlimentar || "Nenhuma"}\n\n`;
    texto += `🌿 Outras Alergias:\n${hc.alergiaOutras || "Nenhuma"}\n\n`;
    texto += `🩺 Condições de Saúde:\n${hc.condicoes || "Nenhuma"}\n\n`;
    texto += `📝 Observações:\n${hc.observacoes || "Nenhuma"}`;

    return texto;
}

async function shareHealthCard() {
    const texto = buildHealthCardText();

    if (navigator.share) {
        try {
            await navigator.share({
                title: "Cartão de Saúde",
                text: texto
            });
            return;
        } catch (e) {
            return;
        }
    }

    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
}























































/* ================= DADOS PESSOAIS ================= */











































/* ================= CONTATOS ================= */

if (!data.contacts) {
    data.contacts = [];
}

function toggleContactForm() {
    const form = $("contactForm");
    form.style.display = form.style.display === "none" ? "block" : "none";
}

function addContact() {
    const name = $("contactName").value.trim();
    const phone = $("contactPhone").value.trim();

    if (!name || !phone) {
        alert("Preencha nome e telefone.");
        return;
    }

    data.contacts.push({
        id: Date.now(),
        name: name,
        phone: phone
    });

    saveData();

    $("contactName").value = "";
    $("contactPhone").value = "";
    toggleContactForm();

    renderContacts();
}

function deleteContact(id) {
    data.contacts = data.contacts.filter(item => item.id !== id);

    saveData();
    renderContacts();
}

function renderContacts() {
    const list = $("contactList");
    if (!list) return;

    const totalEl = $("contTotal");
    if (totalEl) {
        totalEl.textContent = `(${data.contacts.length})`;
    }

    if (!data.contacts.length) {
        list.innerHTML = `
            <div class="panel">
                Nenhum contato cadastrado.
            </div>
        `;
        return;
    }

    list.innerHTML = data.contacts.map(contact => `
        <div class="cont-item">
            <div class="cont-info">
                <span class="cont-avatar">👤</span>
                <div>
                    <div class="cont-name">${escapeHTML(contact.name)}</div>
                    <div class="cont-phone">📱 ${escapeHTML(contact.phone)}</div>
                </div>
            </div>
            <div class="cont-actions">
                <button type="button" class="cont-call-btn"
                    onclick="window.location.href='tel:${escapeAttribute(contact.phone)}'">📞</button>
                <button type="button" class="cont-delete-btn"
                    onclick="deleteContact(${contact.id})">✕</button>
            </div>
        </div>
    `).join("");
}

function callNumber(number) {
    window.location.href = "tel:" + number;
}














/* ================= MINHA SAÚDE (SINAIS VITAIS) ================= */

if (!data.healthLog) {
    data.healthLog = {}; // { "2026-09-20": { peso, sistolica, diastolica, frequencia, glicemia } }
}

function hojeISO() {
    return new Date().toISOString().slice(0, 10);
}

function irParaHoje() {
    $("sdDate").value = hojeISO();
    loadSaudeDia();
}

function initSaude() {
    const el = $("sdDate");
    if (!el) return; // evita erro se a seção não estiver na tela

    if (!el.value) {
        el.value = hojeISO();
    }

    loadSaudeDia();
    renderSaudeHistorico();
}

function loadSaudeDia() {
    const date = $("sdDate").value;
    const registro = data.healthLog[date] || {};

    $("sdPeso").value = registro.peso ?? "";
    $("sdSistolica").value = registro.sistolica ?? "";
    $("sdDiastolica").value = registro.diastolica ?? "";
    $("sdFrequencia").value = registro.frequencia ?? "";
    $("sdGlicemia").value = registro.glicemia ?? "";
}

function saveSaudeDia() {
    const date = $("sdDate").value;

    if (!date) {
        alert("Escolha uma data.");
        return;
    }

    data.healthLog[date] = {
        peso: $("sdPeso").value.trim(),
        sistolica: $("sdSistolica").value.trim(),
        diastolica: $("sdDiastolica").value.trim(),
        frequencia: $("sdFrequencia").value.trim(),
        glicemia: $("sdGlicemia").value.trim()
    };

    podarHealthLog();
    saveData();
    renderSaudeHistorico();

    alert("Registro salvo!");
}

// mantém só os últimos 14 dias de registro
function podarHealthLog() {
    const datas = Object.keys(data.healthLog).sort(); // ordem crescente
    while (datas.length > 14) {
        delete data.healthLog[datas.shift()];
    }
}

function deleteSaudeDia(date) {
    delete data.healthLog[date];
    saveData();
    renderSaudeHistorico();

    if ($("sdDate").value === date) {
        loadSaudeDia();
    }
}

function renderSaudeHistorico() {
    const list = $("sdHistorico");
    if (!list) return;

    const datas = Object.keys(data.healthLog).sort().reverse(); // mais recente primeiro

    if (datas.length === 0) {
        list.innerHTML = `<div class="sd-hist-empty">Nenhum registro ainda.</div>`;
        return;
    }

    list.innerHTML = datas.map(date => {
        const r = data.healthLog[date];
        const partes = [];

        if (r.peso) partes.push(`⚖️ ${r.peso}kg`);
        if (r.sistolica && r.diastolica) partes.push(`🩺 ${r.sistolica}/${r.diastolica}`);
        if (r.frequencia) partes.push(`💗 ${r.frequencia}bpm`);
        if (r.glicemia) partes.push(`🩸 ${r.glicemia}mg/dL`);

        return `
            <div class="sd-hist-item">
                <div>
                    <div class="sd-hist-date">${formatDate(date)}</div>
                    <div class="sd-hist-data">${partes.join(" · ") || "Sem dados"}</div>
                </div>
                <button type="button" onclick="deleteSaudeDia('${date}')">Excluir</button>
            </div>
        `;
    }).join("");
}

function buildSaudeReportText() {
    const datas = Object.keys(data.healthLog).sort().reverse();

    let texto = "❤️ *RELATÓRIO DE SAÚDE — Últimos 14 dias*\n\n";

    if (datas.length === 0) {
        texto += "Nenhum registro salvo ainda.";
        return texto;
    }

    datas.forEach(date => {
        const r = data.healthLog[date];
        texto += `📅 ${formatDate(date)}\n`;
        texto += `⚖️ Peso: ${r.peso || "-"} kg\n`;
        texto += `🩺 Pressão: ${r.sistolica || "-"}/${r.diastolica || "-"} mmHg\n`;
        texto += `💗 Freq. Cardíaca: ${r.frequencia || "-"} bpm\n`;
        texto += `🩸 Glicemia: ${r.glicemia || "-"} mg/dL\n\n`;
    });

    return texto;
}

async function shareSaudeReport() {
    const texto = buildSaudeReportText();

    if (navigator.share) {
        try {
            await navigator.share({
                title: "Relatório de Saúde",
                text: texto
            });
            return;
        } catch (e) {
            return;
        }
    }

    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
}








































/* ================= CALCULADORA ================= */

let calcState = {
    display: "0",
    first: null,
    operator: null,
    waitingSecond: false
};

function calcUpdateDisplay() {
    $("calcDisplay").textContent = calcState.display;
}

function calcDigit(d) {
    if (calcState.waitingSecond) {
        calcState.display = d;
        calcState.waitingSecond = false;
    } else {
        calcState.display = calcState.display === "0" ? d : calcState.display + d;
    }
    calcUpdateDisplay();
}

function calcComma() {
    if (calcState.waitingSecond) {
        calcState.display = "0,";
        calcState.waitingSecond = false;
        calcUpdateDisplay();
        return;
    }
    if (!calcState.display.includes(",")) {
        calcState.display += ",";
        calcUpdateDisplay();
    }
}

function calcClear() {
    calcState = { display: "0", first: null, operator: null, waitingSecond: false };
    calcUpdateDisplay();
}

function calcBackspace() {
    if (calcState.waitingSecond) return;
    calcState.display = calcState.display.length > 1
        ? calcState.display.slice(0, -1)
        : "0";
    calcUpdateDisplay();
}

function calcToggleSign() {
    if (calcState.display === "0") return;
    calcState.display = calcState.display.startsWith("-")
        ? calcState.display.slice(1)
        : "-" + calcState.display;
    calcUpdateDisplay();
}

function calcPercent() {
    const value = parseFloat(calcState.display.replace(",", ".")) / 100;
    calcState.display = calcFormat(value);
    calcUpdateDisplay();
}

function calcFormat(value) {
    if (!isFinite(value)) return "Erro";
    const rounded = Math.round(value * 1e10) / 1e10;
    return String(rounded).replace(".", ",");
}

function calcOperator(op) {
    const value = parseFloat(calcState.display.replace(",", "."));

    if (calcState.operator && calcState.waitingSecond) {
        calcState.operator = op;
        return;
    }

    if (calcState.first === null) {
        calcState.first = value;
    } else if (calcState.operator) {
        calcState.first = calcCompute(calcState.first, value, calcState.operator);
        calcState.display = calcFormat(calcState.first);
        calcUpdateDisplay();
    }

    calcState.operator = op;
    calcState.waitingSecond = true;
}

function calcCompute(a, b, op) {
    switch (op) {
        case "+": return a + b;
        case "-": return a - b;
        case "*": return a * b;
        case "/": return b === 0 ? NaN : a / b;
        default: return b;
    }
}

function calcResult() {
    if (calcState.operator === null || calcState.first === null) return;

    const value = parseFloat(calcState.display.replace(",", "."));
    const result = calcCompute(calcState.first, value, calcState.operator);

    calcState.display = calcFormat(result);
    calcState.first = null;
    calcState.operator = null;
    calcState.waitingSecond = false;

    calcUpdateDisplay();
}


/* ================= EMERGÊNCIA ================= */

function callNumber(number) {

    window.location.href =
        "tel:" + number;

}


/* ================= RENDERIZAÇÃO ================= */

function renderAll() {

    renderMedications();

    renderRoutines();

    renderAppointments();

    renderShopping();

    renderContacts();

    loadSavedForms();

}


/* ================= CARREGAR FORMULÁRIOS ================= */

function loadSavedForms() {

    const health =
        data.healthCard || {};

    const personal =
        data.personal || {};


    $("blood").value =
        health.blood || "";

    $("allergies").value =
        health.allergies || "";

    $("continuous").value =
        health.continuous || "";

    $("healthNotes").value =
        health.notes || "";


    $("personName").value =
        personal.name || "";

    $("birth").value =
        personal.birth || "";

    $("phone").value =
        personal.phone || "";

    $("address").value =
        personal.address || "";

}


/* ================= UTILITÁRIOS ================= */

function formatDate(date) {

    if (!date) return "";

    const parts =
        date.split("-");

    return `${parts[2]}/${parts[1]}/${parts[0]}`;

}


function escapeHTML(text) {

    return String(text).replace(
        /[&<>"']/g,
        function(char) {

            return {

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"

            }[char];

        }
    );

}


function escapeAttribute(text) {

    return String(text)
        .replace(
            /[^0-9+ ()-]/g,
            ""
        );

}


/* ================= INICIALIZAÇÃO ================= */

updateDate();

document.addEventListener("DOMContentLoaded", () => {
  const botoesLetra = document.querySelectorAll(".btn-letra");
  const textoExemplo = document.getElementById("texto-exemplo");
  const toggleModo = document.getElementById("toggle-modo");
  const iconeModo = document.getElementById("icone-modo");
  const tituloModo = document.getElementById("titulo-modo");
  const subtituloModo = document.getElementById("subtitulo-modo");

  const CHAVE_TAMANHO = "acessibilidade_tamanho";
  const CHAVE_TEMA = "acessibilidade_tema";

  /* ===== Tamanho da letra ===== */
  function aplicarTamanho(tamanho) {
    textoExemplo.classList.remove("tam-normal", "tam-grande", "tam-enorme");
    textoExemplo.classList.add(`tam-${tamanho}`);

    botoesLetra.forEach((btn) => {
      btn.classList.toggle("ativo", btn.dataset.tamanho === tamanho);
    });

    localStorage.setItem(CHAVE_TAMANHO, tamanho);
  }

  botoesLetra.forEach((btn) => {
    btn.addEventListener("click", () => {
      aplicarTamanho(btn.dataset.tamanho);
    });
  });

  /* ===== Modo claro / escuro ===== */
  function aplicarTema(tema) {
    document.documentElement.setAttribute("data-tema", tema);

    if (tema === "escuro") {
      iconeModo.textContent = "🌙";
      tituloModo.textContent = "Modo Escuro";
      subtituloModo.textContent = "Tela com fundo escuro";
      toggleModo.checked = true;
    } else {
      iconeModo.textContent = "☀️";
      tituloModo.textContent = "Modo Claro";
      subtituloModo.textContent = "Tela com fundo claro";
      toggleModo.checked = false;
    }

    localStorage.setItem(CHAVE_TEMA, tema);
  }

  toggleModo.addEventListener("change", () => {
    aplicarTema(toggleModo.checked ? "escuro" : "claro");
  });

  /* ===== Carregar preferências salvas ===== */
  const tamanhoSalvo = localStorage.getItem(CHAVE_TAMANHO) || "enorme";
  const temaSalvo = localStorage.getItem(CHAVE_TEMA) || "claro";

  aplicarTamanho(tamanhoSalvo);
  aplicarTema(temaSalvo);
});