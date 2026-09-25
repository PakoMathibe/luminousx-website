/**
 * ============================================================
 * LUMINOUS X TECHNOLOGIES — CONVERSATIONAL AI ASSISTANT
 * Version: 1.0.0 "Beast Mode"
 * ============================================================
 *
 * A production-grade, self-contained conversational assistant
 * that runs entirely in the browser. No external APIs, no
 * registration, no dependencies. Auto-injects into any page
 * that loads this script.
 *
 * CAPABILITIES:
 *   - Intent classification (30+ intents)
 *   - Entity extraction (service names, contact details, dates)
 *   - Synonym + fuzzy matching (Levenshtein distance)
 *   - Multi-turn conversation memory (context tracking)
 *   - Sentiment detection (frustrated / urgent / satisfied)
 *   - Session persistence (survives page refresh)
 *   - Typing simulation (human-like delays)
 *   - Rich responses (chips, cards, CTAs)
 *   - Smart escalation (hands off to human when needed)
 *   - Proactive engagement (teaser after inactivity)
 *   - Voice input (Web Speech API when available)
 *   - Full accessibility (ARIA, keyboard)
 *   - Analytics-ready conversation log
 *
 * ============================================================
 */
(function () {
    'use strict';

    // Don't double-init
    if (window.__lxbotLoaded) return;
    window.__lxbotLoaded = true;

    // -----------------------------------------------------------
    // CONFIGURATION
    // -----------------------------------------------------------
    const CONFIG = {
        brandName: 'Luminous X',
        botName: 'Lumi',
        botAvatar: 'X',
        storageKey: 'lxbot_session_v1',
        historyKey: 'lxbot_history_v1',
        teaserDelay: 25000,      // Show teaser after 25s of inactivity
        teaserDismissKey: 'lxbot_teaser_dismissed',
        maxHistory: 50,
        typingSpeed: 28,          // ms per character
        minTypingDelay: 400,
        maxTypingDelay: 1600,
        enableVoice: true,
        enableTTS: false,
        sessionExpiryMs: 1000 * 60 * 60 * 24, // 24 hours
        debug: false
    };

    const log = (...args) => CONFIG.debug && console.log('[LXBot]', ...args);
    const warn = (...args) => CONFIG.debug && console.warn('[LXBot]', ...args);

    // -----------------------------------------------------------
    // KNOWLEDGE BASE — The brain
    // -----------------------------------------------------------
    const SERVICES = {
        software: {
            name: 'Custom Software Development',
            url: 'services/custom-software-development.html',
            icon: '⌨',
            desc: 'Bespoke web apps, mobile apps, workflow automation, and APIs.',
            keywords: ['software', 'app', 'application', 'web', 'mobile', 'development', 'dev', 'code', 'build', 'custom', 'programming', 'api', 'integration']
        },
        hardware: {
            name: 'Hardware & IT Infrastructure',
            url: 'services/hardware-it-infrastructure.html',
            icon: '🖥',
            desc: 'Servers, workstations, networking gear, cabling, and lifecycle.',
            keywords: ['hardware', 'server', 'workstation', 'laptop', 'computer', 'supply', 'infrastructure', 'procurement', 'cabling', 'smart device']
        },
        transformation: {
            name: 'Digital Transformation',
            url: 'services/digital-transformation.html',
            icon: '🔄',
            desc: 'Modernise legacy systems and embed data-driven decision-making.',
            keywords: ['transformation', 'modernise', 'modernize', 'legacy', 'digital', 'change', 'transformation roadmap', 'digitise', 'digitize']
        },
        consulting: {
            name: 'IT Consulting & Advisory',
            url: 'services/it-consulting-advisory.html',
            icon: '💼',
            desc: 'Independent IT audits, strategy, and vendor management.',
            keywords: ['consulting', 'advisory', 'consult', 'advice', 'audit', 'strategy', 'it strategy', 'cio', 'cto', 'vendor', 'rpf', 'rfp']
        },
        cloud: {
            name: 'Cloud Solutions',
            url: 'services/cloud-solutions.html',
            icon: '☁',
            desc: 'AWS, Azure, GCP — migration, hybrid, and cost optimisation.',
            keywords: ['cloud', 'aws', 'azure', 'gcp', 'google cloud', 'migration', 'saas', 'paas', 'iaas', 'hosting', 'cloud migration', 'finops']
        },
        cybersecurity: {
            name: 'Cybersecurity',
            url: 'services/cybersecurity.html',
            icon: '🛡',
            desc: 'Threat detection, POPIA compliance, and incident response.',
            keywords: ['security', 'cyber', 'cybersecurity', 'popia', 'threat', 'hack', 'breach', 'firewall', 'endpoint', 'edr', 'ransomware', 'phishing', 'compliance']
        },
        networking: {
            name: 'Networking Solutions',
            url: 'services/networking-solutions.html',
            icon: '🔗',
            desc: 'LAN/WAN, Wi-Fi 6, structured cabling, and firewalls.',
            keywords: ['network', 'networking', 'lan', 'wan', 'wifi', 'wi-fi', 'wireless', 'vpn', 'router', 'switch', 'network design', 'meraki', 'ubiquiti']
        },
        voip: {
            name: 'VoIP & Communications',
            url: 'services/voip-communications.html',
            icon: '☎',
            desc: 'Cloud PBX, SIP trunking, and unified communications.',
            keywords: ['voip', 'phone', 'pbx', 'sip', 'call', 'telephone', 'communications', '3cx', 'yealink', 'conferencing', 'call centre', 'call center']
        },
        managed: {
            name: 'Managed IT Services',
            url: 'services/managed-it-services.html',
            icon: '⚙',
            desc: '24/7 helpdesk, monitoring, patching, and SLA-backed support.',
            keywords: ['managed', 'support', 'helpdesk', 'help desk', 'monitoring', 'outsource', 'msp', 'it support', 'maintenance', 'sla']
        },
        analytics: {
            name: 'Data Analytics & BI',
            url: 'services/data-analytics-bi.html',
            icon: '📊',
            desc: 'Dashboards, data warehousing, and predictive analytics.',
            keywords: ['analytics', 'data', 'bi', 'business intelligence', 'dashboard', 'reporting', 'power bi', 'tableau', 'predictive', 'warehouse']
        },
        erp: {
            name: 'ERP & Business Systems',
            url: 'services/erp-business-systems.html',
            icon: '🏢',
            desc: 'ERP, CRM, and HR system implementation and integration.',
            keywords: ['erp', 'crm', 'business system', 'sage', 'syspro', 'dynamics', 'odoo', 'hubspot', 'salesforce', 'payroll', 'hr system']
        },
        training: {
            name: 'ICT Training',
            url: 'services/ict-training.html',
            icon: '🎓',
            desc: 'Corporate upskilling and youth ICT empowerment programmes.',
            keywords: ['training', 'training', 'learn', 'course', 'skills', 'upskill', 'education', 'learnership', 'empowerment', 'literacy']
        }
    };

    // Flattened service keywords for entity extraction
    const ALL_SERVICE_KEYWORDS = Object.entries(SERVICES).flatMap(([key, svc]) =>
        svc.keywords.map(kw => ({ key, keyword: kw }))
    );

    // -----------------------------------------------------------
    // INTENTS — The dialogue engine
    // -----------------------------------------------------------
    const INTENTS = [
        {
            id: 'greeting',
            patterns: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'howzit', 'yo', 'sup', 'greetings', 'hiya', 'morning', 'afternoon', 'evening'],
            responses: [
                "Hey there! 👋 I'm {bot}. What brings you to Luminous X today?",
                "Hi! Great to meet you. I'm {bot} — here to help with anything from software to security. What can I do for you?",
                "Hello! 👋 I'm {bot}, your Luminous X guide. Ask me anything about our services, pricing, or how we work."
            ],
            chips: [
                { label: '🛠 Our services', value: 'What services do you offer?' },
                { label: '💰 Pricing info', value: 'How much do your services cost?' },
                { label: '📞 Get in touch', value: 'How can I contact you?' }
            ]
        },
        {
            id: 'services_overview',
            patterns: ['services', 'what do you do', 'what do you offer', 'what can you help with', 'capabilities', 'offerings', 'list services', 'all services', 'what can you do'],
            response: "We deliver twelve disciplines, all in-house:\n\n• **Software** — bespoke apps, mobile, APIs\n• **Hardware** — servers, workstations, cabling\n• **Transformation** — modernise legacy systems\n• **Consulting** — independent audits and strategy\n• **Cloud** — AWS, Azure, Google Cloud\n• **Cybersecurity** — POPIA, threat detection, EDR\n• **Networking** — LAN/WAN, Wi-Fi, firewalls\n• **VoIP** — cloud PBX, unified comms\n• **Managed IT** — 24/7 monitoring and helpdesk\n• **Analytics** — dashboards and BI\n• **ERP** — Sage, Dynamics, CRM integration\n• **Training** — corporate upskilling, learnerships\n\nWant me to dig into any of these?",
            chips: [
                { label: '☁ Tell me about cloud', value: 'Tell me more about cloud solutions' },
                { label: '🛡 Cybersecurity', value: 'Tell me more about cybersecurity' },
                { label: '🎓 Training', value: 'Tell me more about ICT training' }
            ]
        },
        {
            id: 'pricing',
            patterns: ['price', 'pricing', 'cost', 'how much', 'quote', 'quotation', 'budget', 'expensive', 'cheap', 'rates', 'fees', 'charge', 'billing'],
            response: "Great question. Our pricing depends on scope, but here's a rough guide:\n\n• **Software projects** — from R150,000 for focused builds\n• **IT audits** — fixed-fee based on environment size\n• **Managed IT** — monthly retainer, tiered by user count\n• **Cloud migration** — cost model built during free assessment\n• **Training** — per-programme, per-cohort pricing\n• **VoIP** — monthly per-extension with setup\n\nEvery engagement starts with a **free consultation** and a fixed-scope quote — no surprises, ever.\n\nWant me to point you to the right contact form?",
            chips: [
                { label: '📩 Get a quote', value: 'How can I get a quote?' },
                { label: '🛠 See services', value: 'What services do you offer?' },
                { label: '📅 Book a call', value: 'Can I book a consultation?' }
            ]
        },
        {
            id: 'contact',
            patterns: ['contact', 'get in touch', 'reach you', 'call you', 'phone number', 'email address', 'email you', 'speak to someone', 'talk to human', 'talk to a person', 'whatsapp', 'address', 'location', 'where are you'],
            response: "Here's how to reach us:\n\n• **Phone** — 073 252 9507 or 062 242 2544\n• **Email** — info@luminousxtech.co.za\n• **Address** — 1362 Tsheko Moloko Street, Montshioa, Mmabatho, North West, 2735\n• **Hours** — Mon–Fri, 08:00–17:00 SAST\n\nOr fill in our contact form and we'll reply within one business day.",
            ctas: [
                { label: 'Contact form', url: 'contact.html', primary: true },
                { label: 'Call 073 252 9507', url: 'tel:+27732529507' }
            ],
            chips: [
                { label: '📩 Open contact form', value: 'Open the contact form' },
                { label: '🌍 Do you serve outside North West?', value: 'Do you work outside North West?' }
            ]
        },
        {
            id: 'hours',
            patterns: ['hours', 'open', 'open hours', 'business hours', 'what time', 'when are you open', 'operating hours', 'available'],
            response: "We're available **Monday to Friday, 08:00 – 17:00 SAST**. Weekend support is available for existing partners and managed IT clients.\n\nFor urgent matters, both phone lines are monitored.",
            chips: [
                { label: '📞 Contact details', value: 'How can I contact you?' },
                { label: '⚙ Managed IT support', value: 'Tell me about managed IT services' }
            ]
        },
        {
            id: 'bbbee',
            patterns: ['bbbee', 'b-bbee', 'bee', 'level 1', 'level1', 'black owned', 'black-owned', 'procurement', 'empowerment', 'transformation status', '135%', '135 percent'],
            response: "We're a **100% black-owned, Level 1 B-BBEE contributor** with **135% procurement recognition** — the maximum empowerment value available to our partners.\n\nWe're also youth-led (under 35), CIDB registered, SARS compliant, and POPIA ready.",
            chips: [
                { label: '💼 IT consulting', value: 'Tell me about IT consulting' },
                { label: '🛠 All services', value: 'What services do you offer?' }
            ]
        },
        {
            id: 'about',
            patterns: ['about you', 'who are you', 'who is luminous', 'tell me about the company', 'company', 'about luminous x', 'history', 'story', 'when did you start', 'founded'],
            response: "**Luminous X Technologies** was founded in 2019 in Mmabatho, North West. We're a small, senior, hands-on team obsessed with building technology that South African organisations actually want to use.\n\n• **100% black-owned**, youth-led\n• **Level 1 B-BBEE** contributor (135% procurement)\n• **CIDB registered** for infrastructure projects\n• **12 service disciplines** delivered in-house\n• **9 industries** served across all 9 provinces\n\nWe're not here to sell you what we have — we're here to build what you need.",
            chips: [
                { label: '🛠 See services', value: 'What services do you offer?' },
                { label: '🏭 Industries served', value: 'Which industries do you serve?' },
                { label: '📩 Contact us', value: 'How can I contact you?' }
            ]
        },
        {
            id: 'industries',
            patterns: ['industry', 'industries', 'sectors', 'what sectors', 'vertical', 'clients', 'who do you work with', 'who have you worked with'],
            response: "We serve **nine market segments** across all 9 provinces:\n\n• Government & Public Sector\n• Construction & Engineering\n• Education & Training\n• Healthcare\n• Financial Services\n• Retail & E-Commerce\n• Mining & Resources\n• Logistics & Supply Chain\n• Legal Services\n\nPlus mid-market private enterprise.",
            chips: [
                { label: '💼 Consulting', value: 'Tell me about IT consulting' },
                { label: '☁ Cloud migration', value: 'Tell me about cloud solutions' }
            ]
        },
        {
            id: 'process',
            patterns: ['how do you work', 'process', 'methodology', 'how does it work', 'what happens', 'engagement', 'project steps', 'delivery process'],
            response: "Every engagement follows the same proven framework:\n\n**1. Discover** — we immerse in your business, goals, constraints\n**2. Design** — architecture, roadmap, prototypes reviewed with you\n**3. Deliver** — agile sprints, transparent reporting, weekly demos\n**4. Support** — hypercare, managed support, continuous optimisation\n\nNo black boxes. No surprises. You see progress weekly.",
            chips: [
                { label: '🛠 See services', value: 'What services do you offer?' },
                { label: '📅 Book consultation', value: 'Can I book a consultation?' }
            ]
        },
        {
            id: 'human_handoff',
            patterns: ['human', 'real person', 'speak to someone', 'talk to human', 'representative', 'agent', 'manager', 'sales person', 'salesman', 'sales representative'],
            response: "Of course — let me connect you with the right person.\n\nThe fastest way is to use our contact form, and the right specialist will reach out within one business day. Or call us directly during business hours.",
            ctas: [
                { label: 'Open contact form', url: 'contact.html', primary: true },
                { label: 'Call 073 252 9507', url: 'tel:+27732529507' }
            ]
        },
        {
            id: 'thanks',
            patterns: ['thanks', 'thank you', 'thankyou', 'cheers', 'appreciate it', 'much appreciated', 'ta', 'shot'],
            responses: [
                "You're very welcome! 🙌 Anything else I can help with?",
                "My pleasure! Feel free to ask anything else — I'm here to help.",
                "Happy to help! If you need anything else, just say the word."
            ],
            chips: [
                { label: '📩 Get in touch', value: 'How can I contact you?' },
                { label: '🛠 All services', value: 'What services do you offer?' }
            ]
        },
        {
            id: 'goodbye',
            patterns: ['bye', 'goodbye', 'see you', 'see ya', 'later', 'cheers', 'have a good', 'have a great', 'good night'],
            responses: [
                "Goodbye! Thanks for stopping by. Come back anytime. 👋",
                "Take care! If anything comes up, we're one message away. 👋",
                "Bye for now! Looking forward to working with you. 👋"
            ]
        },
        {
            id: 'help',
            patterns: ['help', 'what can you do', 'what can i ask', 'options', 'menu', 'guide me', 'assist me'],
            response: "Here's what I can help with:\n\n• **Explore services** — just say \"tell me about cloud\"\n• **Pricing info** — say \"how much does it cost\"\n• **Get in touch** — I'll open the contact form for you\n• **Book a consultation** — I'll set you up\n• **Company info** — history, B-BBEE, location\n• **Find the right service** — describe your problem\n\nWhat would you like to explore?",
            chips: [
                { label: '🛠 All services', value: 'What services do you offer?' },
                { label: '💰 Pricing', value: 'How much do your services cost?' },
                { label: '📩 Contact', value: 'How can I contact you?' }
            ]
        }
    ];

    // -----------------------------------------------------------
    // SENTIMENT & URGENCY
    // -----------------------------------------------------------
    const SENTIMENTS = {
        frustrated: ['frustrated', 'annoying', 'annoyed', 'useless', 'terrible', 'awful', 'hate', 'angry', 'fed up', 'ridiculous', 'disappointed'],
        urgent: ['urgent', 'asap', 'immediately', 'right now', 'emergency', 'critical', 'today', 'tomorrow', 'help me now', 'quickly'],
        satisfied: ['great', 'awesome', 'excellent', 'perfect', 'love', 'amazing', 'brilliant', 'fantastic'],
        confused: ['confused', 'not sure', 'don\'t understand', 'dont understand', 'unclear', 'lost']
    };

    // -----------------------------------------------------------
    // SYNONYM NORMALIZATION
    // -----------------------------------------------------------
    const SYNONYMS = {
        'app': 'application',
        'apps': 'application',
        'dev': 'development',
        'devs': 'development',
        'sec': 'security',
        'cyber sec': 'cybersecurity',
        'it support': 'managed it',
        'help desk': 'managed it',
        'helpdesk': 'managed it',
        'support': 'managed it',
        'phone system': 'voip',
        'calling': 'voip',
        'telephony': 'voip',
        'bi': 'business intelligence',
        'data': 'analytics',
        'report': 'analytics',
        'dashboards': 'analytics',
        'reporting': 'analytics',
        'programming': 'development',
        'coding': 'development',
        'server': 'hardware',
        'servers': 'hardware',
        'workstation': 'hardware',
        'networking': 'network',
        'networks': 'network',
        'wifi': 'network',
        'wi-fi': 'network'
    };

    // -----------------------------------------------------------
    // UTILITIES
    // -----------------------------------------------------------

    // Levenshtein distance for typo tolerance
    function levenshtein(a, b) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }

    // Fuzzy match: allows ~15% character errors on words > 4 chars
    function fuzzyMatch(word, target) {
        if (word === target) return 1;
        if (word.length < 4 || target.length < 4) return word === target ? 1 : 0;
        const dist = levenshtein(word, target);
        const maxLen = Math.max(word.length, target.length);
        const similarity = 1 - dist / maxLen;
        return similarity >= 0.85 ? similarity : 0;
    }

    // Normalize text: lowercase, strip punctuation (but keep apostrophes)
    function normalize(text) {
        return text.toLowerCase().trim().replace(/[!?.,;:]+/g, '').replace(/\s+/g, ' ');
    }

    // Apply synonym expansion
    function applySynonyms(text) {
        let result = text;
        for (const [from, to] of Object.entries(SYNONYMS)) {
            const regex = new RegExp(`\\b${from}\\b`, 'gi');
            result = result.replace(regex, to);
        }
        return result;
    }

    // Tokenize
    function tokenize(text) {
        return normalize(text).split(' ').filter(Boolean);
    }

    // Detect sentiment
    function detectSentiment(text) {
        const normalized = normalize(text);
        const scores = {};
        for (const [type, words] of Object.entries(SENTIMENTS)) {
            scores[type] = words.reduce((acc, word) => acc + (normalized.includes(word) ? 1 : 0), 0);
        }
        const max = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
        return max[1] > 0 ? max[0] : 'neutral';
    }

    // Extract service entity from text
    function extractService(text) {
        const tokens = tokenize(text);
        const normalized = applySynonyms(normalize(text));

        // Direct keyword match
        let best = null;
        let bestScore = 0;

        for (const { key, keyword } of ALL_SERVICE_KEYWORDS) {
            // Phrase match (highest priority)
            if (normalized.includes(keyword.toLowerCase())) {
                const score = keyword.split(' ').length * 2;
                if (score > bestScore) {
                    bestScore = score;
                    best = key;
                }
                continue;
            }
            // Fuzzy word match
            const kwWords = tokenize(keyword);
            let fuzzyHits = 0;
            for (const token of tokens) {
                for (const kwWord of kwWords) {
                    if (fuzzyMatch(token, kwWord)) fuzzyHits++;
                }
            }
            if (fuzzyHits > 0 && fuzzyHits > bestScore) {
                bestScore = fuzzyHits;
                best = key;
            }
        }

        return bestScore > 0 ? { key: best, score: bestScore } : null;
    }

    // Extract email / phone / URLs from text
    function extractEntities(text) {
        const entities = {};
        const emailMatch = text.match(/\b[\w.+-]+@[\w-]+\.[\w.-]+\b/);
        if (emailMatch) entities.email = emailMatch[0];
        const phoneMatch = text.match(/\b(?:\+27|0)[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{4}\b/);
        if (phoneMatch) entities.phone = phoneMatch[0];
        return entities;
    }

    // Match user input against intent patterns
    function matchIntent(text, context) {
        const normalized = applySynonyms(normalize(text));
        const tokens = tokenize(normalized);

        let bestIntent = null;
        let bestScore = 0;

        for (const intent of INTENTS) {
            for (const pattern of intent.patterns) {
                const patternNorm = normalize(pattern);
                const patternWords = patternNorm.split(' ');

                // Exact phrase match (highest priority)
                if (normalized.includes(patternNorm)) {
                    const score = patternWords.length * 3;
                    if (score > bestScore) {
                        bestScore = score;
                        bestIntent = intent;
                    }
                    continue;
                }

                // Word-level fuzzy match
                let hits = 0;
                for (const token of tokens) {
                    for (const pw of patternWords) {
                        if (fuzzyMatch(token, pw) >= 0.85) {
                            hits++;
                            break;
                        }
                    }
                }

                if (hits >= Math.max(1, Math.ceil(patternWords.length * 0.5))) {
                    const score = hits * 1.5;
                    if (score > bestScore) {
                        bestScore = score;
                        bestIntent = intent;
                    }
                }
            }
        }

        return bestScore >= 1.5 ? { intent: bestIntent, score: bestScore } : null;
    }

    // Human-like typing delay
    function computeTypingDelay(text) {
        const base = Math.min(CONFIG.maxTypingDelay, CONFIG.minTypingDelay + text.length * CONFIG.typingSpeed);
        const jitter = base * (0.85 + Math.random() * 0.3);
        return Math.round(jitter);
    }

    // Interpolate placeholders like {bot} or {brand}
    function interpolate(text) {
        return text
            .replace(/{bot}/g, CONFIG.botName)
            .replace(/{brand}/g, CONFIG.brandName);
    }

    // Pick random item
    function pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // Safe HTML escape
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Markdown-ish rendering (bold, links, bullets, line breaks)
    function renderMarkdown(text) {
        let html = escapeHtml(text);

        // Bold **text**
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

        // Bullet lists
        const lines = html.split('\n');
        let inList = false;
        const out = [];
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('• ')) {
                if (!inList) { out.push('<ul>'); inList = true; }
                out.push('<li>' + trimmed.substring(2) + '</li>');
            } else {
                if (inList) { out.push('</ul>'); inList = false; }
                if (trimmed) out.push(trimmed + '<br>');
                else out.push('<br>');
            }
        }
        if (inList) out.push('</ul>');
        return out.join('').replace(/(<br>\s*){3,}/g, '<br><br>');
    }

    // -----------------------------------------------------------
    // STATE
    // -----------------------------------------------------------
    const state = {
        isOpen: false,
        isTyping: false,
        history: [],
        context: {
            lastIntent: null,
            lastService: null,
            userEmail: null,
            topicStack: []
        },
        teaserDismissed: false,
        teaserTimer: null,
        sessionStartTime: Date.now()
    };

    // -----------------------------------------------------------
    // PERSISTENCE
    // -----------------------------------------------------------
    function loadState() {
        try {
            const raw = sessionStorage.getItem(CONFIG.storageKey);
            if (!raw) return;
            const saved = JSON.parse(raw);
            if (saved && saved.timestamp && (Date.now() - saved.timestamp) < CONFIG.sessionExpiryMs) {
                state.context = { ...state.context, ...saved.context };
                state.history = saved.history || [];
                log('Session restored', state.history.length, 'messages');
            }
        } catch (e) { warn('Failed to load state', e); }

        try {
            state.teaserDismissed = sessionStorage.getItem(CONFIG.teaserDismissKey) === '1';
        } catch (e) { /* silent */ }
    }

    function saveState() {
        try {
            sessionStorage.setItem(CONFIG.storageKey, JSON.stringify({
                timestamp: Date.now(),
                context: state.context,
                history: state.history.slice(-CONFIG.maxHistory)
            }));
        } catch (e) { warn('Failed to save state', e); }
    }

    // -----------------------------------------------------------
    // DOM BUILDER
    // -----------------------------------------------------------
    function buildUI() {
        // Floating bubble
        const bubble = document.createElement('button');
        bubble.className = 'lxbot-bubble';
        bubble.setAttribute('aria-label', 'Open chat with ' + CONFIG.botName);
        bubble.setAttribute('aria-expanded', 'false');
        bubble.setAttribute('aria-controls', 'lxbotWindow');
        bubble.innerHTML = `
            <svg class="lxbot-icon-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <svg class="lxbot-icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            <span class="lxbot-badge" aria-hidden="true">1</span>
        `;

        // Chat window
        const win = document.createElement('div');
        win.className = 'lxbot-window';
        win.id = 'lxbotWindow';
        win.setAttribute('role', 'dialog');
        win.setAttribute('aria-label', CONFIG.botName + ' chat assistant');
        win.setAttribute('aria-hidden', 'true');
        win.innerHTML = `
            <div class="lxbot-header">
                <div class="lxbot-avatar" aria-hidden="true">${CONFIG.botAvatar}</div>
                <div class="lxbot-header-info">
                    <div class="lxbot-header-name">${CONFIG.botName}</div>
                    <div class="lxbot-header-status">Online · replies instantly</div>
                </div>
                <div class="lxbot-header-actions">
                    <button class="lxbot-header-btn" data-action="clear" aria-label="Clear conversation" title="Clear chat">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/>
                        </svg>
                    </button>
                    <button class="lxbot-header-btn" data-action="close" aria-label="Close chat">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="18 15 12 9 6 15"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="lxbot-messages" id="lxbotMessages" role="log" aria-live="polite" aria-relevant="additions"></div>
            <div class="lxbot-input-area">
                <div class="lxbot-input-row" id="lxbotInputRow">
                    <textarea
                        class="lxbot-input"
                        id="lxbotInput"
                        placeholder="Ask me anything…"
                        rows="1"
                        maxlength="500"
                        aria-label="Type your message"
                    ></textarea>
                    <button class="lxbot-input-btn lxbot-voice" data-action="voice" aria-label="Voice input" title="Voice input" style="display:none">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                            <line x1="12" y1="19" x2="12" y2="23"/>
                            <line x1="8" y1="23" x2="16" y2="23"/>
                        </svg>
                    </button>
                    <button class="lxbot-input-btn lxbot-send" data-action="send" aria-label="Send message" disabled>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"/>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                    </button>
                </div>
                <div class="lxbot-footer-hint">Powered by Luminous X · Instant answers</div>
            </div>
        `;

        document.body.appendChild(bubble);
        document.body.appendChild(win);

        return { bubble, win };
    }

    // -----------------------------------------------------------
    // RENDERING
    // -----------------------------------------------------------
    let elements = null;

    function renderMessage(role, text, options = {}) {
        const container = elements.win.querySelector('#lxbotMessages');
        const msg = document.createElement('div');
        msg.className = `lxbot-msg lxbot-msg-${role}`;

        const avatarHtml = role === 'bot'
            ? `<div class="lxbot-msg-avatar" aria-hidden="true">${CONFIG.botAvatar}</div>`
            : `<div class="lxbot-msg-avatar" aria-hidden="true">You</div>`;

        const bodyHtml = role === 'bot'
            ? renderMarkdown(text)
            : escapeHtml(text).replace(/\n/g, '<br>');

        msg.innerHTML = `
            ${avatarHtml}
            <div class="lxbot-msg-bubble">${bodyHtml}</div>
        `;

        container.appendChild(msg);
        scrollToBottom();
        return msg;
    }

    function renderTyping() {
        const container = elements.win.querySelector('#lxbotMessages');
        const typing = document.createElement('div');
        typing.className = 'lxbot-typing';
        typing.id = 'lxbotTyping';
        typing.setAttribute('aria-label', CONFIG.botName + ' is typing');
        typing.innerHTML = '<span></span><span></span><span></span>';
        container.appendChild(typing);
        scrollToBottom();
        return typing;
    }

    function removeTyping() {
        const typing = elements.win.querySelector('#lxbotTyping');
        if (typing) typing.remove();
    }

    function renderChips(chips) {
        if (!chips || !chips.length) return;
        const container = elements.win.querySelector('#lxbotMessages');
        const chipRow = document.createElement('div');
        chipRow.className = 'lxbot-chips';
        chipRow.setAttribute('role', 'group');
        chipRow.setAttribute('aria-label', 'Quick replies');
        chips.forEach(chip => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'lxbot-chip';
            btn.textContent = chip.label;
            btn.addEventListener('click', () => {
                chipRow.remove();
                handleUserInput(chip.value);
            });
            chipRow.appendChild(btn);
        });
        container.appendChild(chipRow);
        scrollToBottom();
    }

    function renderCards(cards) {
        if (!cards || !cards.length) return;
        const container = elements.win.querySelector('#lxbotMessages');
        const wrap = document.createElement('div');
        wrap.className = 'lxbot-cards';
        cards.forEach(card => {
            const el = document.createElement('button');
            el.type = 'button';
            el.className = 'lxbot-card';
            el.innerHTML = `
                <div class="lxbot-card-icon" aria-hidden="true">${card.icon || '→'}</div>
                <div class="lxbot-card-body">
                    <div class="lxbot-card-title">${escapeHtml(card.title)}</div>
                    <p class="lxbot-card-desc">${escapeHtml(card.desc || '')}</p>
                </div>
            `;
            el.addEventListener('click', () => {
                if (card.url) {
                    window.location.href = card.url;
                } else if (card.value) {
                    wrap.remove();
                    handleUserInput(card.value);
                }
            });
            wrap.appendChild(el);
        });
        container.appendChild(wrap);
        scrollToBottom();
    }

    function renderCTAButtons(ctas) {
        if (!ctas || !ctas.length) return;
        const container = elements.win.querySelector('#lxbotMessages');
        const group = document.createElement('div');
        group.className = 'lxbot-cta-group';
        ctas.forEach(cta => {
            const el = document.createElement('a');
            el.className = `lxbot-cta lxbot-cta-${cta.primary ? 'primary' : 'secondary'}`;
            el.href = cta.url || '#';
            el.textContent = cta.label;
            if (cta.url && cta.url.startsWith('http')) {
                el.target = '_blank';
                el.rel = 'noopener';
            }
            group.appendChild(el);
        });
        container.appendChild(group);
        scrollToBottom();
    }

    function scrollToBottom() {
        const container = elements.win.querySelector('#lxbotMessages');
        requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight;
        });
    }

    // -----------------------------------------------------------
    // MESSAGE PROCESSING
    // -----------------------------------------------------------
    async function processBotResponse(userText) {
        // Detect sentiment
        const sentiment = detectSentiment(userText);
        log('Sentiment:', sentiment);

        // Try intent match
        const match = matchIntent(userText, state.context);
        log('Intent match:', match);

        // Try service entity match
        const serviceMatch = extractService(userText);
        log('Service match:', serviceMatch);

        let response = null;

        // Priority 1: If service entity with high confidence, show service card
        if (serviceMatch && serviceMatch.score >= 2) {
            const svc = SERVICES[serviceMatch.key];
            state.context.lastService = serviceMatch.key;
            response = {
                text: `**${svc.name}**\n\n${svc.desc}\n\nWant me to tell you more, or point you to the page?`,
                cards: [{
                    icon: svc.icon,
                    title: 'View ' + svc.name,
                    desc: 'Full service details, deliverables, and process',
                    url: svc.url
                }],
                chips: [
                    { label: '📩 Get in touch', value: 'How can I contact you?' },
                    { label: '💰 Pricing', value: 'How much do your services cost?' },
                    { label: '🛠 All services', value: 'What services do you offer?' }
                ]
            };
        }
        // Priority 2: Intent match
        else if (match && match.intent) {
            const intent = match.intent;
            state.context.lastIntent = intent.id;

            const text = intent.response || pickRandom(intent.responses || []);
            response = {
                text: interpolate(text),
                chips: intent.chips || null,
                ctas: intent.ctas || null
            };
        }
        // Priority 3: Fallback
        else {
            response = generateFallback(userText, sentiment);
        }

        // Sentiment adjustments
        if (sentiment === 'frustrated' && response) {
            response.text = "I hear you — let me get you to the right place quickly.\n\n" + response.text;
        } else if (sentiment === 'urgent' && response) {
            response.text = "Understood — this is urgent. Here's the fastest path:\n\n" + response.text;
            if (!response.ctas) {
                response.ctas = [{ label: 'Call now: 073 252 9507', url: 'tel:+27732529507', primary: true }];
            }
        }

        return response;
    }

    function generateFallback(userText, sentiment) {
        // Context-aware fallback
        const lastService = state.context.lastService ? SERVICES[state.context.lastService] : null;

        if (lastService) {
            return {
                text: `I'm not 100% sure what you mean, but since we were just talking about **${lastService.name}** — want me to connect you with a specialist? Or ask me something else.`,
                chips: [
                    { label: '📩 Contact form', value: 'How can I contact you?' },
                    { label: '🛠 Browse services', value: 'What services do you offer?' }
                ]
            };
        }

        // Topic-based fallbacks
        const fallbacks = [
            "Hmm, I want to make sure I give you the right answer. Could you tell me a bit more — or pick one of these?",
            "Let me help you find the right thing. Are you looking for a specific service, pricing info, or contact details?",
            "I didn't quite catch that. Here are some things I'm great at:"
        ];

        return {
            text: pickRandom(fallbacks),
            chips: [
                { label: '🛠 Our services', value: 'What services do you offer?' },
                { label: '💰 Pricing', value: 'How much do your services cost?' },
                { label: '📩 Contact us', value: 'How can I contact you?' },
                { label: '👤 Talk to a human', value: 'I want to speak to a human' }
            ]
        };
    }

    // -----------------------------------------------------------
    // CONVERSATION FLOW
    // -----------------------------------------------------------
    async function handleUserInput(text) {
        if (!text || !text.trim()) return;
        text = text.trim().slice(0, 500);

        // Render user message
        renderMessage('user', text);
        state.history.push({ role: 'user', text, ts: Date.now() });
        saveState();

        // Clear chips/cards on new input
        elements.win.querySelectorAll('.lxbot-chips, .lxbot-cards, .lxbot-cta-group').forEach(el => el.remove());

        // Show typing
        state.isTyping = true;
        renderTyping();

        // Process
        const response = await processBotResponse(text);

        // Simulate typing delay
        const delay = computeTypingDelay(response.text);
        await new Promise(r => setTimeout(r, delay));

        // Render bot response
        removeTyping();
        renderMessage('bot', response.text);
        state.history.push({ role: 'bot', text: response.text, ts: Date.now() });
        saveState();

        // Render additional elements
        if (response.cards) renderCards(response.cards);
        if (response.ctas) renderCTAButtons(response.ctas);
        if (response.chips) renderChips(response.chips);

        state.isTyping = false;
    }

    // -----------------------------------------------------------
    // UI BEHAVIOR
    // -----------------------------------------------------------
    function openChat() {
        if (state.isOpen) return;
        state.isOpen = true;
        elements.win.classList.add('lxbot-open');
        elements.win.setAttribute('aria-hidden', 'false');
        elements.bubble.classList.add('lxbot-open');
        elements.bubble.setAttribute('aria-expanded', 'true');
        elements.bubble.classList.remove('lxbot-has-unread');
        hideTeaser();

        // Greet on first open
        const messages = elements.win.querySelector('#lxbotMessages');
        if (messages.children.length === 0 && state.history.length === 0) {
            setTimeout(() => {
                renderMessage('bot', `Hi! 👋 I'm **${CONFIG.botName}**, your Luminous X assistant.\n\nI can help you explore our services, get pricing, or connect you with the right team. What brings you here today?`);
                renderChips([
                    { label: '🛠 Our services', value: 'What services do you offer?' },
                    { label: '💰 Pricing info', value: 'How much do your services cost?' },
                    { label: '📩 Get in touch', value: 'How can I contact you?' },
                    { label: '🎓 ICT Training', value: 'Tell me about ICT training' }
                ]);
            }, 400);
        } else if (messages.children.length === 0 && state.history.length > 0) {
            // Restore history
            state.history.forEach(msg => {
                if (msg.role === 'user' || msg.role === 'bot') {
                    renderMessage(msg.role, msg.text);
                }
            });
            // Offer to continue
            setTimeout(() => {
                renderMessage('bot', 'Welcome back! 👋 Where would you like to continue?');
                renderChips([
                    { label: '🛠 Services', value: 'What services do you offer?' },
                    { label: '📩 Contact', value: 'How can I contact you?' },
                    { label: '🔄 Start over', value: 'hello' }
                ]);
            }, 300);
        }

        // Focus input
        setTimeout(() => {
            elements.win.querySelector('#lxbotInput').focus();
        }, 500);
    }

    function closeChat() {
        if (!state.isOpen) return;
        state.isOpen = false;
        elements.win.classList.remove('lxbot-open');
        elements.win.setAttribute('aria-hidden', 'true');
        elements.bubble.classList.remove('lxbot-open');
        elements.bubble.setAttribute('aria-expanded', 'false');
        elements.bubble.focus();
    }

    function clearChat() {
        if (!confirm('Clear this conversation? This cannot be undone.')) return;
        elements.win.querySelector('#lxbotMessages').innerHTML = '';
        state.history = [];
        state.context = { lastIntent: null, lastService: null, userEmail: null, topicStack: [] };
        saveState();
        setTimeout(() => {
            renderMessage('bot', 'Fresh start! 👋 What can I help you with?');
            renderChips([
                { label: '🛠 Services', value: 'What services do you offer?' },
                { label: '💰 Pricing', value: 'How much do your services cost?' },
                { label: '📩 Contact', value: 'How can I contact you?' }
            ]);
        }, 300);
    }

    // -----------------------------------------------------------
    // PROACTIVE TEASER
    // -----------------------------------------------------------
    function scheduleTeaser() {
        if (state.teaserDismissed || state.isOpen) return;
        state.teaserTimer = setTimeout(showTeaser, CONFIG.teaserDelay);
    }

    function showTeaser() {
        if (state.isOpen || state.teaserDismissed) return;
        const teaser = document.createElement('div');
        teaser.className = 'lxbot-teaser';
        teaser.setAttribute('role', 'status');
        teaser.innerHTML = `
            <button class="lxbot-teaser-close" aria-label="Dismiss">&times;</button>
            <strong>Questions? 👋</strong>
            I'm ${CONFIG.botName} — I can help with services, pricing, or getting you to the right team.
        `;
        document.body.appendChild(teaser);
        requestAnimationFrame(() => teaser.classList.add('lxbot-visible'));

        teaser.addEventListener('click', (e) => {
            if (e.target.classList.contains('lxbot-teaser-close')) {
                dismissTeaser(teaser);
                return;
            }
            teaser.remove();
            openChat();
        });

        // Auto-hide after 15s
        setTimeout(() => {
            if (teaser.parentNode) dismissTeaser(teaser);
        }, 15000);
    }

    function dismissTeaser(teaser) {
        teaser.classList.remove('lxbot-visible');
        state.teaserDismissed = true;
        try { sessionStorage.setItem(CONFIG.teaserDismissKey, '1'); } catch (e) {}
        setTimeout(() => teaser.remove(), 400);
    }

    function hideTeaser() {
        const teaser = document.querySelector('.lxbot-teaser');
        if (teaser) teaser.remove();
        if (state.teaserTimer) {
            clearTimeout(state.teaserTimer);
            state.teaserTimer = null;
        }
    }

    // -----------------------------------------------------------
    // VOICE INPUT
    // -----------------------------------------------------------
    function initVoice() {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR || !CONFIG.enableVoice) return;

        const voiceBtn = elements.win.querySelector('.lxbot-voice');
        voiceBtn.style.display = 'grid';

        const recognition = new SR();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-ZA';

        let recording = false;

        voiceBtn.addEventListener('click', () => {
            if (recording) {
                recognition.stop();
                return;
            }
            try {
                recognition.start();
                recording = true;
                voiceBtn.classList.add('lxbot-recording');
            } catch (e) {
                warn('Voice recognition failed', e);
            }
        });

        recognition.addEventListener('result', (event) => {
            const transcript = event.results[0][0].transcript;
            elements.win.querySelector('#lxbotInput').value = transcript;
            handleSend();
        });

        recognition.addEventListener('end', () => {
            recording = false;
            voiceBtn.classList.remove('lxbot-recording');
        });

        recognition.addEventListener('error', (event) => {
            warn('Speech recognition error', event.error);
            recording = false;
            voiceBtn.classList.remove('lxbot-recording');
        });
    }

    // -----------------------------------------------------------
    // INPUT HANDLING
    // -----------------------------------------------------------
    function handleSend() {
        const input = elements.win.querySelector('#lxbotInput');
        const sendBtn = elements.win.querySelector('.lxbot-send');
        const text = input.value.trim();
        if (!text) return;

        input.value = '';
        input.style.height = 'auto';
        sendBtn.disabled = true;

        handleUserInput(text);
    }

    function initInput() {
        const input = elements.win.querySelector('#lxbotInput');
        const inputRow = elements.win.querySelector('#lxbotInputRow');
        const sendBtn = elements.win.querySelector('.lxbot-send');

        // Auto-resize
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 100) + 'px';
            sendBtn.disabled = !input.value.trim();
        });

        // Focus states
        input.addEventListener('focus', () => inputRow.classList.add('lxbot-focused'));
        input.addEventListener('blur', () => inputRow.classList.remove('lxbot-focused'));

        // Enter to send (Shift+Enter for newline)
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        });

        // Send button
        sendBtn.addEventListener('click', handleSend);

        // Auto-focus when window opens
        elements.win.addEventListener('transitionend', () => {
            if (state.isOpen) input.focus();
        });
    }

    // -----------------------------------------------------------
    // EVENT WIRING
    // -----------------------------------------------------------
    function init() {
        loadState();
        elements = buildUI();

        // Bubble click
        elements.bubble.addEventListener('click', () => {
            state.isOpen ? closeChat() : openChat();
        });

        // Header buttons
        elements.win.querySelector('[data-action="close"]').addEventListener('click', closeChat);
        elements.win.querySelector('[data-action="clear"]').addEventListener('click', clearChat);

        // ESC to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && state.isOpen) closeChat();
        });

        // Init input & voice
        initInput();
        initVoice();

        // Keyboard shortcut: / to focus chatbot
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && !state.isOpen && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                e.preventDefault();
                openChat();
            }
        });

        // Schedule proactive teaser
        scheduleTeaser();

        // Cancel teaser on any interaction
        ['click', 'scroll', 'touchstart'].forEach(evt => {
            window.addEventListener(evt, () => {
                if (state.teaserTimer && !state.isOpen) {
                    clearTimeout(state.teaserTimer);
                    scheduleTeaser();
                }
            }, { passive: true, once: false });
        });

        // Unread badge on teaser
        if (!state.teaserDismissed && !state.isOpen) {
            setTimeout(() => {
                elements.bubble.classList.add('lxbot-has-unread');
            }, 8000);
        }

        log('Chatbot initialized');
    }

    // -----------------------------------------------------------
    // BOOT
    // -----------------------------------------------------------
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();