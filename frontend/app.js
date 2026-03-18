/**
 * LeadHunter — Frontend Application
 * Handles form submission, SSE streaming, and dynamic UI updates.
 */

// ── DOM Elements ────────────────────────────────────────────────────
const huntForm = document.getElementById('huntForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const btnLoader = document.getElementById('btnLoader');
const btnArrow = document.getElementById('btnArrow');
const charCount = document.getElementById('charCount');
const productDesc = document.getElementById('productDescription');

const inputSection = document.getElementById('inputSection');
const pipelineSection = document.getElementById('pipelineSection');
const resultsSection = document.getElementById('resultsSection');
const errorSection = document.getElementById('errorSection');

const leadsGrid = document.getElementById('leadsGrid');
const leadsCount = document.getElementById('leadsCount');
const errorMessage = document.getElementById('errorMessage');
const retryBtn = document.getElementById('retryBtn');

// ── Config ──────────────────────────────────────────────────────────
const API_URL = "https://leadhunter1.onrender.com";

// ── State ───────────────────────────────────────────────────────────
let isRunning = false;
let finalLeads = [];

// ── Character Counter ───────────────────────────────────────────────
productDesc.addEventListener('input', () => {
    charCount.textContent = productDesc.value.length;
});

// ── Form Submission ─────────────────────────────────────────────────
huntForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isRunning) return;

    const formData = {
        product_name: document.getElementById('productName').value.trim(),
        competitor_name: document.getElementById('competitorName').value.trim(),
        product_description: productDesc.value.trim(),
    };

    // Validate
    if (!formData.product_name || !formData.competitor_name || formData.product_description.length < 10) {
        return;
    }

    startPipeline(formData);
});

retryBtn.addEventListener('click', () => {
    errorSection.hidden = true;
    resultsSection.hidden = true;
    resetPipeline();
});

// ── Pipeline Control ────────────────────────────────────────────────
function startPipeline(formData) {
    isRunning = true;

    // Update button state
    btnText.style.display = 'none';
    btnArrow.style.display = 'none';
    btnLoader.style.display = 'inline-flex';
    submitBtn.disabled = true;

    // Show pipeline, hide previous results/errors
    pipelineSection.hidden = false;
    resultsSection.hidden = true;
    errorSection.hidden = true;
    leadsGrid.innerHTML = '';
    finalLeads = [];

    // Reset all stages
    for (let i = 1; i <= 4; i++) {
        setStageStatus(i, 'waiting', 'Waiting...');
    }

    // Reset connectors
    document.querySelectorAll('.pipeline__connector').forEach(c => {
        c.classList.remove('active', 'complete');
    });

    // Scroll to pipeline
    pipelineSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Start SSE
    streamPipeline(formData);
}

function resetPipeline() {
    isRunning = false;
    btnText.style.display = '';
    btnArrow.style.display = '';
    btnLoader.style.display = 'none';
    submitBtn.disabled = false;
    pipelineSection.hidden = true;
}


// ── SSE Streaming ───────────────────────────────────────────────────
async function streamPipeline(formData) {
    try {
        const response = await fetch(`${API_URL}/hunt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ detail: 'Server error' }));
            throw new Error(err.detail || `HTTP ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // Process complete SSE messages
            const lines = buffer.split('\n\n');
            buffer = lines.pop(); // Keep incomplete chunk

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;

                if (trimmed === 'data: [DONE]') {
                    onPipelineComplete();
                    return;
                }

                if (trimmed.startsWith('data: ')) {
                    try {
                        const event = JSON.parse(trimmed.slice(6));
                        handlePipelineEvent(event);
                    } catch (parseErr) {
                        console.warn('Failed to parse SSE event:', parseErr);
                    }
                }
            }
        }

        // Stream ended without [DONE]
        onPipelineComplete();

    } catch (err) {
        showError(err.message);
        resetPipeline();
    }
}

// ── Event Handling ──────────────────────────────────────────────────
function handlePipelineEvent(event) {
    const { stage, status, message, data } = event;

    switch (status) {
        case 'start':
            setStageStatus(stage, 'active', message);
            // Activate connector before this stage
            activateConnector(stage - 1, 'active');
            break;

        case 'progress':
            setStageStatus(stage, 'active', message);
            break;

        case 'complete':
            setStageStatus(stage, 'complete', message);
            activateConnector(stage - 1, 'complete');

            // If stage 4 completes with data, those are our final leads
            if (stage === 4 && data && Array.isArray(data)) {
                finalLeads = data;
            }
            break;

        case 'error':
            setStageStatus(stage, 'error', message);
            break;
    }
}

function onPipelineComplete() {
    isRunning = false;
    btnText.style.display = '';
    btnArrow.style.display = '';
    btnLoader.style.display = 'none';
    submitBtn.disabled = false;
    btnText.textContent = 'Hunt Again';

    if (finalLeads.length > 0) {
        renderLeads(finalLeads);
        resultsSection.hidden = false;
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}


// ── Stage UI Updates ────────────────────────────────────────────────
function setStageStatus(stageNum, status, message) {
    const stageEl = document.querySelector(`.pipeline__stage[data-stage="${stageNum}"]`);
    if (!stageEl) return;

    stageEl.dataset.status = status;
    const statusEl = document.getElementById(`stage${stageNum}Status`);
    if (statusEl) {
        statusEl.textContent = message;
    }
}

function activateConnector(index, state) {
    // Connectors are 0-indexed (between stages)
    const connectors = document.querySelectorAll('.pipeline__connector');
    if (index >= 0 && index < connectors.length) {
        connectors[index].classList.remove('active', 'complete');
        connectors[index].classList.add(state);
    }
}

// ── Lead Card Rendering ─────────────────────────────────────────────
function renderLeads(leads) {
    leadsGrid.innerHTML = '';
    leadsCount.textContent = `${leads.length} lead${leads.length !== 1 ? 's' : ''}`;

    leads.forEach((lead, idx) => {
        const card = createLeadCard(lead, idx);
        leadsGrid.appendChild(card);
    });
}

function createLeadCard(lead, index) {
    const card = document.createElement('div');
    card.className = 'lead-card';
    card.style.animationDelay = `${index * 0.1}s`;

    const scoreClass = lead.frustration_score >= 9 ? 'high' : 'medium';
    const sourceLabel = formatSource(lead.source);

    card.innerHTML = `
        <div class="lead-card__header">
            <h3 class="lead-card__title">
                <a href="${escapeHtml(lead.url)}" target="_blank" rel="noopener noreferrer">
                    ${escapeHtml(lead.title)}
                </a>
            </h3>
            <div class="lead-card__meta">
                <span class="lead-card__source">${escapeHtml(sourceLabel)}</span>
                <span class="lead-card__score lead-card__score--${scoreClass}">
                    🔥 ${lead.frustration_score}/10
                </span>
            </div>
        </div>

        <div class="lead-card__problem">
            ${escapeHtml(lead.core_problem)}
        </div>

        ${lead.specific_complaints && lead.specific_complaints.length > 0 ? `
            <div class="lead-card__complaints">
                ${lead.specific_complaints.map(c => `
                    <span class="lead-card__complaint-tag">${escapeHtml(c)}</span>
                `).join('')}
            </div>
        ` : ''}

        <div class="lead-card__outreach">
            <div class="lead-card__outreach-label">
                ✉️ Draft Outreach Message
                <button class="lead-card__copy-btn" onclick="copyOutreach(this, ${index})">
                    📋 Copy
                </button>
            </div>
            <div class="lead-card__outreach-text">${escapeHtml(lead.outreach_message)}</div>
        </div>
    `;

    return card;
}

// ── Copy to Clipboard ───────────────────────────────────────────────
window.copyOutreach = function (btn, index) {
    const text = finalLeads[index]?.outreach_message;
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
        btn.classList.add('copied');
        btn.innerHTML = '✅ Copied';
        setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = '📋 Copy';
        }, 2000);
    }).catch(() => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        btn.classList.add('copied');
        btn.innerHTML = '✅ Copied';
        setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = '📋 Copy';
        }, 2000);
    });
};

// ── Error Handling ──────────────────────────────────────────────────
function showError(message) {
    errorMessage.textContent = message;
    errorSection.hidden = false;
    errorSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ── Utilities ───────────────────────────────────────────────────────
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatSource(source) {
    const map = {
        reddit: 'Reddit',
        hn: 'Hacker News',
        stackoverflow: 'Stack Overflow',
        forum: 'Forum',
        other: 'Web',
    };
    return map[source] || source;
}
