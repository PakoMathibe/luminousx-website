/**
 * ============================================================
 * LUMINOUS X TECHNOLOGIES 
 * ============================================================
 */
(function () {
    'use strict';

    if (window.__lxbotLoaded) return;
    window.__lxbotLoaded = true;

    // ============================================================
    // CONFIGURATION
    // ============================================================
    const CONFIG = {
        brandName: 'Luminous X',
        botName: 'Lumi',
        botAvatar: 'X',
        sessionKey: 'lxbot_session_v2',
        persistentKey: 'lxbot_persistent_v2',
        teaserDismissKey: 'lxbot_teaser_dismissed_v2',
        teaserDelay: 25000,
        maxHistory: 60,
        maxRecentResponses: 8,
        typingSpeed: 28,
        minTypingDelay: 400,
        maxTypingDelay: 1600,
        enableVoice: true,
        sessionExpiryMs: 1000 * 60 * 60 * 24,
        debug: false
    };

    const log = (...args) => CONFIG.debug && console.log('[Lumi]', ...args);
    const warn = (...args) => CONFIG.debug && console.warn('[Lumi]', ...args);

    // ============================================================
    // KNOWLEDGE BASE — Structured documents
    // Each doc: { id, category, title, content, keywords[], url? }
    // ============================================================
    const KNOWLEDGE = [
        // ---------- COMPANY ----------
        {
            id: 'company.about',
            category: 'company',
            title: 'About Luminous X Technologies',
            content: 'Luminous X Technologies is a South African technology company founded in 2019 in Mmabatho, North West. We are 100% black-owned, youth-led, and a Level 1 B-BBEE contributor. We deliver bespoke software, cloud, cybersecurity, and infrastructure solutions to organisations across South Africa.',
            keywords: ['about', 'company', 'who', 'luminous', 'history', 'founded', 'story', 'established', 'started'],
            url: 'about.html'
        },
        {
            id: 'company.leadership',
            category: 'company',
            title: 'Leadership and Team',
            content: 'Luminous X is led by Julian Motswenyane (Founder & Director) and a small, senior team of hands-on technologists. The people who scope your project are the people who build it — no layers, no handoffs.',
            keywords: ['leadership', 'founder', 'director', 'team', 'who runs', 'management', 'julian'],
            url: 'about.html'
        },
        {
            id: 'company.bbbee',
            category: 'company',
            title: 'B-BBEE and Transformation',
            content: 'Luminous X is a 100% black-owned, youth-led enterprise with Level 1 B-BBEE contributor status and 135% procurement recognition — the maximum empowerment value available to our partners. We are CIDB registered, SARS compliant, and POPIA ready.',
            keywords: ['bbbee', 'b-bbee', 'bee', 'level 1', 'black owned', 'procurement', 'transformation', 'empowerment', '135'],
            url: 'about.html'
        },
        {
            id: 'company.registration',
            category: 'company',
            title: 'Company Registration',
            content: 'Luminous X Technologies (Pty) Ltd is registered with CIPC under registration number 2019/197828/07, incorporated on 03 May 2019. We are CIDB registered (Grade 1CE, 1GB, 1ME) and SARS compliant.',
            keywords: ['registration', 'cipc', 'reg number', 'cidb', 'company number', 'legal'],
            url: 'about.html'
        },
        {
            id: 'company.location',
            category: 'company',
            title: 'Head Office',
            content: 'Our head office is at 1362 Tsheko Moloko Street, Montshioa, Mmabatho, North West, 2735, South Africa. We serve clients nationally across all nine provinces.',
            keywords: ['address', 'location', 'where', 'office', 'mmabatho', 'north west', 'headquarters'],
            url: 'contact.html'
        },
        {
            id: 'company.contact',
            category: 'company',
            title: 'Contact Details',
            content: 'Phone: 073 252 9507 or 062 242 2544. Email: info@luminousxtech.co.za. Business hours: Monday to Friday, 08:00 – 17:00 SAST.',
            keywords: ['contact', 'phone', 'email', 'call', 'reach', 'get in touch', 'hours', 'open'],
            url: 'contact.html'
        },
        {
            id: 'company.hours',
            category: 'company',
            title: 'Business Hours',
            content: 'We are available Monday to Friday, 08:00 – 17:00 SAST. Weekend support is available for existing partners and managed IT clients.',
            keywords: ['hours', 'open', 'business hours', 'time', 'available', 'when'],
            url: 'contact.html'
        },

        // ---------- SERVICES ----------
        {
            id: 'service.software',
            category: 'service',
            title: 'Custom Software Development',
            content: 'We design and build bespoke enterprise applications, web systems, mobile apps, workflow automation tools, and API integrations. Projects start at R150,000 for focused builds; complex platforms typically take 4–8 months. Full IP transfer on final payment.',
            keywords: ['software', 'app', 'application', 'web', 'mobile', 'development', 'dev', 'code', 'build', 'custom', 'programming', 'api', 'integration', 'platform', 'system'],
            url: 'services/custom-software-development.html'
        },
        {
            id: 'service.hardware',
            category: 'service',
            title: 'Hardware & IT Infrastructure',
            content: 'End-to-end supply, installation, configuration, and lifecycle management of servers, workstations, networking equipment, and smart devices. Manufacturer warranties 3–5 years. Single-office rollout in 1–2 weeks; multi-site in 4–12 weeks.',
            keywords: ['hardware', 'server', 'workstation', 'laptop', 'computer', 'supply', 'infrastructure', 'procurement', 'cabling', 'smart device'],
            url: 'services/hardware-it-infrastructure.html'
        },
        {
            id: 'service.transformation',
            category: 'service',
            title: 'Digital Transformation',
            content: 'Strategic advisory and hands-on delivery to modernise legacy systems, migrate to cloud, automate processes, and embed data-driven decision-making. Phased, measurable waves — 3–6 month quick wins, 18–36 month full journey.',
            keywords: ['transformation', 'modernise', 'modernize', 'legacy', 'digital', 'change', 'roadmap', 'digitise'],
            url: 'services/digital-transformation.html'
        },
        {
            id: 'service.consulting',
            category: 'service',
            title: 'IT Consulting & Advisory',
            content: 'Independent IT audits, strategy development, solution architecture, vendor selection, and vendor management. We are vendor-neutral — we don\'t resell the products we recommend. Free 30-minute consultation.',
            keywords: ['consulting', 'advisory', 'consult', 'advice', 'audit', 'strategy', 'cio', 'cto', 'vendor', 'independent'],
            url: 'services/it-consulting-advisory.html'
        },
        {
            id: 'service.cloud',
            category: 'service',
            title: 'Cloud Solutions',
            content: 'Cloud migration planning, hybrid cloud architecture, SaaS onboarding, and cost optimisation across AWS, Microsoft Azure, and Google Cloud. Focused migration 4–8 weeks. Typical cost savings 20–40%.',
            keywords: ['cloud', 'aws', 'azure', 'gcp', 'google cloud', 'migration', 'saas', 'paas', 'iaas', 'hosting', 'finops'],
            url: 'services/cloud-solutions.html'
        },
        {
            id: 'service.cybersecurity',
            category: 'service',
            title: 'Cybersecurity',
            content: 'Threat detection, endpoint protection (EDR), network security, vulnerability assessments, POPIA compliance, and incident response. 24/7 SOC-as-a-Service. Security posture assessment produces a risk register in 10 business days.',
            keywords: ['security', 'cyber', 'cybersecurity', 'popia', 'threat', 'hack', 'breach', 'firewall', 'endpoint', 'edr', 'ransomware', 'phishing', 'compliance'],
            url: 'services/cybersecurity.html'
        },
        {
            id: 'service.networking',
            category: 'service',
            title: 'Networking Solutions',
            content: 'Enterprise LAN/WAN design, structured cabling (Cat6, Cat6a, fibre), Wi-Fi 6/6E wireless, VPNs, and firewall configuration. Single-site LAN in 1–2 weeks; multi-site rollouts 4–12 weeks.',
            keywords: ['network', 'networking', 'lan', 'wan', 'wifi', 'wi-fi', 'wireless', 'vpn', 'router', 'switch', 'firewall'],
            url: 'services/networking-solutions.html'
        },
        {
            id: 'service.voip',
            category: 'service',
            title: 'VoIP & Communications',
            content: 'Cloud-hosted PBX, SIP trunking, VoIP desk phones, auto-attendant, conferencing, and unified communications. Single-office migration 1–2 weeks. Typical cost savings 50%+ over traditional telephony.',
            keywords: ['voip', 'phone', 'pbx', 'sip', 'call', 'telephone', 'communications', 'conferencing', 'call centre'],
            url: 'services/voip-communications.html'
        },
        {
            id: 'service.managed',
            category: 'service',
            title: 'Managed IT Services',
            content: '24/7 helpdesk, remote monitoring, patch management, backup management, and proactive maintenance. Three service tiers (Essential, Professional, Enterprise). Critical response SLA: 15 minutes.',
            keywords: ['managed', 'support', 'helpdesk', 'help desk', 'monitoring', 'outsource', 'msp', 'maintenance', 'sla', 'it support'],
            url: 'services/managed-it-services.html'
        },
        {
            id: 'service.analytics',
            category: 'service',
            title: 'Data Analytics & BI',
            content: 'Business intelligence dashboards (Power BI, Tableau, Looker), data warehousing, ETL pipelines, reporting automation, and predictive analytics. First meaningful dashboard typically in 4–6 weeks.',
            keywords: ['analytics', 'data', 'bi', 'business intelligence', 'dashboard', 'reporting', 'power bi', 'tableau', 'predictive', 'warehouse'],
            url: 'services/data-analytics-bi.html'
        },
        {
            id: 'service.erp',
            category: 'service',
            title: 'ERP & Business Systems',
            content: 'ERP selection, implementation, and customisation (Sage, SYSPRO, Microsoft Dynamics, Odoo). CRM (HubSpot, Zoho, Salesforce). HR and payroll systems. Mid-market implementation 4–9 months.',
            keywords: ['erp', 'crm', 'business system', 'sage', 'syspro', 'dynamics', 'odoo', 'hubspot', 'salesforce', 'payroll', 'hr'],
            url: 'services/erp-business-systems.html'
        },
        {
            id: 'service.training',
            category: 'service',
            title: 'ICT Training',
            content: 'Corporate ICT training, cybersecurity awareness, software-specific training (ERP, CRM, custom apps), digital literacy programmes, youth learnerships, and train-the-trainer. Skills development aligned to B-BBEE scorecard.',
            keywords: ['training', 'learn', 'course', 'skills', 'upskill', 'education', 'learnership', 'empowerment', 'literacy'],
            url: 'services/ict-training.html'
        },

        // ---------- INDUSTRIES ----------
        {
            id: 'industry.government',
            category: 'industry',
            title: 'Government & Public Sector',
            content: 'We serve national, provincial, and municipal government — delivering e-services, systems integration, digital service delivery, and secure IT infrastructure. CIDB registered for public infrastructure projects.',
            keywords: ['government', 'municipality', 'public sector', 'department', 'state', 'provincial'],
            url: 'index.html#industries'
        },
        {
            id: 'industry.mining',
            category: 'industry',
            title: 'Mining & Resources',
            content: 'We support mining operations with IoT, real-time monitoring, OT/IT integration, cybersecurity for SCADA environments, and connectivity for remote sites.',
            keywords: ['mining', 'mine', 'resources', 'industrial', 'operations', 'scada', 'ot'],
            url: 'index.html#industries'
        },
        {
            id: 'industry.education',
            category: 'industry',
            title: 'Education & Training',
            content: 'We deliver e-learning platforms, campus networks, student information systems, and digital literacy programmes for schools, colleges, and universities.',
            keywords: ['education', 'school', 'university', 'college', 'training', 'learning'],
            url: 'index.html#industries'
        },
        {
            id: 'industry.healthcare',
            category: 'industry',
            title: 'Healthcare',
            content: 'We support healthcare providers with electronic health records (EHR), telehealth platforms, POPIA-compliant data exchange, and secure clinical networks.',
            keywords: ['healthcare', 'hospital', 'clinic', 'medical', 'health', 'ehr', 'telehealth'],
            url: 'index.html#industries'
        },
        {
            id: 'industry.financial',
            category: 'industry',
            title: 'Financial Services',
            content: 'We build fintech-ready software, compliance platforms, and secure transactional systems for banks, insurers, and financial services providers.',
            keywords: ['financial', 'finance', 'bank', 'insurance', 'fintech', 'payment'],
            url: 'index.html#industries'
        },
        {
            id: 'industry.retail',
            category: 'industry',
            title: 'Retail & E-Commerce',
            content: 'We deliver point-of-sale systems, inventory management, omni-channel platforms, and integrated retail ERP for retailers and e-commerce businesses.',
            keywords: ['retail', 'ecommerce', 'e-commerce', 'shop', 'store', 'pos', 'inventory'],
            url: 'index.html#industries'
        },
        {
            id: 'industry.logistics',
            category: 'industry',
            title: 'Logistics & Supply Chain',
            content: 'We support logistics companies with fleet management, route optimisation, warehouse systems, and supply chain visibility platforms.',
            keywords: ['logistics', 'supply chain', 'transport', 'fleet', 'warehouse', 'delivery'],
            url: 'index.html#industries'
        },
        {
            id: 'industry.legal',
            category: 'industry',
            title: 'Legal Services',
            content: 'We deliver case management systems, secure document platforms, and practice management software for law firms and legal departments.',
            keywords: ['legal', 'law', 'lawyer', 'attorney', 'firm', 'case management'],
            url: 'index.html#industries'
        },
        {
            id: 'industry.construction',
            category: 'industry',
            title: 'Construction & Engineering',
            content: 'We support construction firms with project management platforms, BIM integration, site connectivity, and document control systems.',
            keywords: ['construction', 'engineering', 'build', 'contractor', 'bim', 'site'],
            url: 'index.html#industries'
        },

        // ---------- COMMERCIAL ----------
        {
            id: 'commercial.pricing',
            category: 'commercial',
            title: 'Pricing and Quotes',
            content: 'Software projects from R150,000. IT audits are fixed-fee based on environment size. Managed IT is a monthly retainer tiered by user count. Cloud migration costs are modelled during a free assessment. Training is priced per programme, per cohort. Every engagement starts with a free consultation and fixed-scope quote.',
            keywords: ['price', 'pricing', 'cost', 'how much', 'quote', 'quotation', 'budget', 'fee', 'rate', 'billing'],
            url: 'contact.html'
        },
        {
            id: 'commercial.process',
            category: 'commercial',
            title: 'How Projects Work',
            content: 'Every engagement follows the same framework: 1) Discover (immerse in your business), 2) Design (architecture and roadmap reviewed with you), 3) Deliver (agile sprints, weekly demos), 4) Support (hypercare, managed support, continuous optimisation).',
            keywords: ['process', 'methodology', 'how do you work', 'engagement', 'project steps', 'delivery'],
            url: 'index.html#about'
        },
        {
            id: 'commercial.consultation',
            category: 'commercial',
            title: 'Free Consultation',
            content: 'We offer a free 30-minute consultation for new enquiries. For software projects, this includes a scoping discussion with our lead engineer. No obligation, no sales pressure.',
            keywords: ['consultation', 'consult', 'meeting', 'book', 'schedule', 'discovery', 'call'],
            url: 'contact.html'
        },
        {
            id: 'commercial.procurement',
            category: 'commercial',
            title: 'Procurement & Tenders',
            content: 'We are registered on the Central Supplier Database (CSD) and can respond to RFQs, RFPs, and tenders at national, provincial, and municipal level. Our Level 1 B-BBEE status with 135% procurement recognition gives our partners maximum empowerment value.',
            keywords: ['procurement', 'tender', 'rfp', 'rfq', 'csd', 'supplier', 'bid'],
            url: 'contact.html'
        },
        {
            id: 'commercial.support',
            category: 'commercial',
            title: 'Support & SLA',
            content: 'Managed IT clients receive 24/7 support with critical issue response in 15 minutes, high priority in 1 hour, standard in 4 hours. Support is delivered under a clear SLA with defined escalation paths.',
            keywords: ['support', 'sla', 'response', 'helpdesk', 'urgent', 'emergency'],
            url: 'services/managed-it-services.html'
        },

        // ---------- FAQ ----------
        {
            id: 'faq.websites',
            category: 'faq',
            title: 'Do you build websites?',
            content: 'Yes. We build corporate websites, e-commerce platforms, web portals, and web applications as part of our Custom Software Development service. We handle design, development, hosting, and ongoing maintenance.',
            keywords: ['website', 'web site', 'web', 'site', 'portal', 'ecommerce', 'online'],
            url: 'services/custom-software-development.html'
        },
        {
            id: 'faq.small_business',
            category: 'faq',
            title: 'Do you work with small businesses?',
            content: 'Yes. While we serve enterprise and government clients, we also work with mid-market and growing businesses. Our managed IT and cloud services are tiered so smaller organisations can access enterprise-grade capability at accessible price points.',
            keywords: ['small business', 'sme', 'startup', 'small', 'growing', 'mid-market'],
            url: 'contact.html'
        },
        {
            id: 'faq.existing_systems',
            category: 'faq',
            title: 'Do you support existing systems?',
            content: 'Yes. We regularly take over legacy systems, refactor them, and add new capability without a full rewrite — unless a rewrite genuinely makes sense. We\'ll tell you honestly which is the better path.',
            keywords: ['existing', 'legacy', 'takeover', 'maintain', 'old system', 'support existing'],
            url: 'services/custom-software-development.html'
        },
        {
            id: 'faq.outside_northwest',
            category: 'faq',
            title: 'Do you work outside North West?',
            content: 'Yes. We serve clients nationally across all nine provinces of South Africa, with both remote and on-site delivery options.',
            keywords: ['outside', 'national', 'gauteng', 'cape town', 'durban', 'province', 'travel'],
            url: 'contact.html'
        },
        {
            id: 'faq.remote_support',
            category: 'faq',
            title: 'Can you support us remotely?',
            content: 'Yes. Most of our managed IT, cloud, and cybersecurity services are delivered remotely. On-site visits are available when needed, particularly for hardware, networking, and infrastructure work.',
            keywords: ['remote', 'offsite', 'online support', 'away', 'distance'],
            url: 'services/managed-it-services.html'
        }
    ];

    // ============================================================
    // CONCEPTS — Semantic clusters (user words → concepts)
    // ============================================================
    const CONCEPTS = {
        software: ['software', 'system', 'application', 'app', 'platform', 'program', 'solution', 'build', 'develop', 'code', 'website', 'web', 'portal', 'mobile'],
        cybersecurity: ['cybersecurity', 'cyber', 'security', 'hacking', 'hack', 'penetration', 'vulnerability', 'phishing', 'ransomware', 'breach', 'threat', 'firewall', 'edr', 'endpoint'],
        cloud: ['cloud', 'aws', 'azure', 'gcp', 'google cloud', 'migration', 'hosting', 'saas', 'iaas', 'paas'],
        networking: ['network', 'networking', 'lan', 'wan', 'wifi', 'wi-fi', 'wireless', 'vpn', 'router', 'switch', 'cabling', 'connectivity'],
        infrastructure: ['infrastructure', 'server', 'servers', 'hardware', 'workstation', 'laptop', 'computer', 'equipment', 'data centre'],
        communications: ['voip', 'phone', 'pbx', 'sip', 'calling', 'telephony', 'conferencing', 'call centre', 'communications'],
        data: ['data', 'analytics', 'bi', 'business intelligence', 'dashboard', 'reporting', 'power bi', 'tableau', 'warehouse', 'predictive'],
        business_systems: ['erp', 'crm', 'business system', 'sage', 'syspro', 'dynamics', 'odoo', 'hubspot', 'salesforce', 'payroll', 'hr'],
        managed: ['managed', 'support', 'helpdesk', 'monitoring', 'outsource', 'msp', 'maintenance', 'sla'],
        training: ['training', 'learn', 'course', 'skills', 'upskill', 'education', 'learnership', 'empowerment', 'literacy'],
        pricing: ['price', 'pricing', 'cost', 'quote', 'quotation', 'how much', 'fee', 'budget', 'rate'],
        timeline: ['time', 'timeline', 'long', 'weeks', 'months', 'duration', 'fast', 'quick'],
        contact: ['contact', 'call', 'email', 'reach', 'phone', 'talk', 'speak'],
        government: ['government', 'municipality', 'public sector', 'department', 'state', 'provincial'],
        mining: ['mining', 'mine', 'resources', 'industrial', 'scada', 'ot'],
        healthcare: ['healthcare', 'hospital', 'clinic', 'medical', 'health', 'ehr', 'telehealth'],
        education: ['education', 'school', 'university', 'college', 'learning'],
        financial: ['financial', 'finance', 'bank', 'insurance', 'fintech', 'payment'],
        retail: ['retail', 'ecommerce', 'e-commerce', 'shop', 'store', 'pos', 'inventory'],
        logistics: ['logistics', 'supply chain', 'transport', 'fleet', 'warehouse', 'delivery'],
        legal: ['legal', 'law', 'lawyer', 'attorney', 'firm'],
        construction: ['construction', 'engineering', 'build', 'contractor', 'bim'],
        greeting: ['hi', 'hello', 'hey', 'howzit', 'morning', 'afternoon', 'evening', 'greetings'],
        thanks: ['thanks', 'thank', 'appreciate', 'cheers', 'awesome', 'great', 'perfect'],
        goodbye: ['bye', 'goodbye', 'later', 'see you', 'cheers'],
        frustration: ['frustrated', 'annoying', 'useless', 'terrible', 'awful', 'hate', 'angry', 'ridiculous', 'disappointed', 'waste'],
        urgency: ['urgent', 'asap', 'immediately', 'emergency', 'critical', 'now', 'quickly'],
        human: ['human', 'person', 'agent', 'representative', 'manager', 'sales', 'speak to someone']
    };

    // ============================================================
    // SYNONYMS — Expand user vocabulary
    // ============================================================
    const SYNONYMS = {
        'app': 'application',
        'apps': 'application',
        'dev': 'development',
        'devs': 'development',
        'sec': 'security',
        'cyber sec': 'cybersecurity',
        'it support': 'managed it',
        'help desk': 'helpdesk',
        'bi': 'business intelligence',
        'ai': 'analytics',
        'ml': 'analytics',
        'db': 'database',
        'phone system': 'voip',
        'calling': 'voip',
        'telephony': 'voip',
        'site': 'website',
        'web site': 'website',
        'web-site': 'website',
        'networking': 'network',
        'networks': 'network',
        'wifi': 'wi-fi',
        'servers': 'server',
        'workstations': 'workstation',
        'laptops': 'laptop',
        'computers': 'computer',
        'backups': 'backup',
        'ransomware': 'ransomware',
        'popia': 'popia',
        'gdpr': 'popia'
    };

    // ============================================================
    // INTENT PATTERNS — Coarse-grained intent classification
    // ============================================================
    const INTENTS = [
        { id: 'greeting', patterns: ['hi', 'hello', 'hey', 'howzit', 'good morning', 'good afternoon', 'good evening', 'yo'] },
        { id: 'thanks', patterns: ['thanks', 'thank you', 'appreciate', 'cheers', 'ta', 'shot'] },
        { id: 'goodbye', patterns: ['bye', 'goodbye', 'see you', 'later', 'good night'] },
        { id: 'help', patterns: ['help', 'what can you do', 'what can i ask', 'options', 'guide me'] },
        { id: 'pricing', patterns: ['how much', 'price', 'pricing', 'cost', 'quote', 'quotation', 'budget', 'fees'] },
        { id: 'timeline', patterns: ['how long', 'timeline', 'duration', 'when will', 'how soon'] },
        { id: 'contact', patterns: ['contact', 'call you', 'email you', 'reach you', 'phone number', 'get in touch'] },
        { id: 'human_handoff', patterns: ['human', 'real person', 'speak to someone', 'talk to human', 'agent', 'manager', 'sales rep'] },
        { id: 'services_overview', patterns: ['services', 'what do you do', 'what do you offer', 'capabilities'] },
        { id: 'industries', patterns: ['industries', 'sectors', 'who do you work with', 'what industries'] },
        { id: 'about', patterns: ['about you', 'who are you', 'company', 'history', 'founded'] },
        { id: 'bbbee', patterns: ['bbbee', 'b-bbee', 'level 1', 'black owned', 'procurement', 'empowerment'] },
        { id: 'process', patterns: ['how do you work', 'process', 'methodology', 'engagement'] },
        { id: 'quote_request', patterns: ['i need a quote', 'get a quote', 'request a quote', 'send me a quote', 'want a quote'] },
        { id: 'consultation', patterns: ['book a call', 'book consultation', 'schedule a meeting', 'set up a call', 'talk to someone'] },
        { id: 'problem_statement', patterns: ['we have a problem', 'we need help with', 'we are struggling', 'we keep losing', 'our system keeps'] }
    ];

    // ============================================================
    // STATE MACHINE
    // ============================================================
    const STATES = {
        IDLE: 'idle',
        DISCOVERY: 'discovery',
        SERVICE_DISCUSSION: 'service_discussion',
        PRICING: 'pricing',
        PROJECT_SCOPING: 'project_scoping',
        SUPPORT: 'support',
        ESCALATION: 'escalation'
    };

    // ============================================================
    // UTILITIES
    // ============================================================

    function normalize(text) {
        return String(text || '')
            .toLowerCase()
            .trim()
            .replace(/[^\w\s'\-\.@]/g, ' ')
            .replace(/\s+/g, ' ');
    }

    function tokenize(text) {
        return normalize(text).split(' ').filter(w => w.length > 1);
    }

    function applySynonyms(text) {
        let result = ' ' + text + ' ';
        for (const [from, to] of Object.entries(SYNONYMS)) {
            const re = new RegExp(`\\b${from.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
            result = result.replace(re, ` ${to} `);
        }
        return result.replace(/\s+/g, ' ').trim();
    }

    function levenshtein(a, b) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;
        const m = [];
        for (let i = 0; i <= b.length; i++) m[i] = [i];
        for (let j = 0; j <= a.length; j++) m[0][j] = j;
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                m[i][j] = b[i-1] === a[j-1]
                    ? m[i-1][j-1]
                    : Math.min(m[i-1][j-1] + 1, m[i][j-1] + 1, m[i-1][j] + 1);
            }
        }
        return m[b.length][a.length];
    }

    function fuzzyMatch(a, b) {
        if (a === b) return 1;
        if (a.length < 4 || b.length < 4) return 0;
        const dist = levenshtein(a, b);
        return (1 - dist / Math.max(a.length, b.length)) >= 0.82 ? 1 : 0;
    }

    function pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function escapeHtml(str) {
        const d = document.createElement('div');
        d.textContent = String(str || '');
        return d.innerHTML;
    }

    function renderMarkdown(text) {
        let html = escapeHtml(text);
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        const lines = html.split('\n');
        let inList = false;
        const out = [];
        for (const line of lines) {
            const t = line.trim();
            if (t.startsWith('• ')) {
                if (!inList) { out.push('<ul>'); inList = true; }
                out.push('<li>' + t.substring(2) + '</li>');
            } else {
                if (inList) { out.push('</ul>'); inList = false; }
                out.push(t ? t + '<br>' : '<br>');
            }
        }
        if (inList) out.push('</ul>');
        return out.join('').replace(/(<br>\s*){3,}/g, '<br><br>');
    }

    function stringSimilarity(a, b) {
        if (!a || !b) return 0;
        const aTokens = new Set(tokenize(a));
        const bTokens = new Set(tokenize(b));
        const intersection = [...aTokens].filter(t => bTokens.has(t)).length;
        const union = new Set([...aTokens, ...bTokens]).size;
        return union === 0 ? 0 : intersection / union;
    }

    // ============================================================
    // MEMORY — session + persistent + summary
    // ============================================================
    const memory = {
        session: {
            id: 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
            started: Date.now(),
            history: [],
            recentResponses: [],
            summary: '',
            state: STATES.IDLE,
            context: {
                currentTopic: null,
                previousTopic: null,
                currentService: null,
                currentIndustry: null,
                lastIntent: null,
                lastQuestion: null,
                awaitingClarification: false,
                clarificationType: null,
                discussedServices: [],
                discussedIndustries: [],
                entities: {}
            },
            emotions: {
                frustration: 0,
                urgency: 0,
                satisfaction: 0
            },
            userGoal: {
                category: null,
                confidence: 0
            }
        },
        persistent: {
            name: null,
            company: null,
            industry: null,
            role: null,
            previousServices: [],
            visitCount: 0,
            lastVisit: null
        }
    };

    function loadMemory() {
        try {
            const s = sessionStorage.getItem(CONFIG.sessionKey);
            if (s) {
                const parsed = JSON.parse(s);
                if (parsed && parsed.savedAt && (Date.now() - parsed.savedAt) < CONFIG.sessionExpiryMs) {
                    Object.assign(memory.session, parsed.data);
                    log('Session restored', memory.session.history.length, 'messages');
                }
            }
        } catch (e) { warn('Session load failed', e); }

        try {
            const p = localStorage.getItem(CONFIG.persistentKey);
            if (p) {
                const parsed = JSON.parse(p);
                Object.assign(memory.persistent, parsed);
                memory.persistent.visitCount = (memory.persistent.visitCount || 0) + 1;
                memory.persistent.lastVisit = Date.now();
            } else {
                memory.persistent.visitCount = 1;
                memory.persistent.lastVisit = Date.now();
            }
        } catch (e) { warn('Persistent load failed', e); }
    }

    function saveMemory() {
        try {
            sessionStorage.setItem(CONFIG.sessionKey, JSON.stringify({
                savedAt: Date.now(),
                data: memory.session
            }));
        } catch (e) { warn('Session save failed', e); }

        try {
            localStorage.setItem(CONFIG.persistentKey, JSON.stringify(memory.persistent));
        } catch (e) { warn('Persistent save failed', e); }
    }

    // ============================================================
    // 1. PREPROCESSING
    // ============================================================
    function preprocess(rawText) {
        const normalized = normalize(rawText);
        const withSynonyms = applySynonyms(normalized);
        const tokens = tokenize(withSynonyms);
        return {
            raw: rawText,
            normalized,
            expanded: withSynonyms,
            tokens,
            length: rawText.length
        };
    }

    // ============================================================
    // 2. UNDERSTANDING
    // ============================================================

    // --- Emotion ---
    function detectEmotion(input) {
        const text = input.normalized;
        const emotion = { frustration: 0, urgency: 0, satisfaction: 0 };

        // Frustration
        const frustrationPhrases = [
            'this is useless', 'not helpful', 'not what i asked', 'waste of time',
            'ridiculous', 'wrong answer', 'you keep', 'you dont understand',
            'you don\'t understand', 'are you listening', 'stop', 'ugh'
        ];
        frustrationPhrases.forEach(p => {
            if (text.includes(p)) emotion.frustration += 0.35;
        });
        CONCEPTS.frustration.forEach(w => {
            if (text.includes(w)) emotion.frustration += 0.12;
        });
        if (input.raw === input.raw.toUpperCase() && input.raw.length > 8) emotion.frustration += 0.2;
        const exclamations = (input.raw.match(/!/g) || []).length;
        emotion.frustration += Math.min(exclamations * 0.05, 0.2);
        emotion.frustration = Math.min(emotion.frustration, 1);

        // Urgency
        CONCEPTS.urgency.forEach(w => {
            if (text.includes(w)) emotion.urgency += 0.25;
        });
        emotion.urgency = Math.min(emotion.urgency, 1);

        // Satisfaction
        const satisfactionPhrases = ['thanks', 'thank you', 'perfect', 'great', 'helpful', 'got it', 'understood', 'excellent', 'brilliant', 'awesome'];
        satisfactionPhrases.forEach(p => {
            if (text.includes(p)) emotion.satisfaction += 0.3;
        });
        emotion.satisfaction = Math.min(emotion.satisfaction, 1);

        return emotion;
    }

    // --- Entities ---
    function extractEntities(input) {
        const entities = {};
        const text = input.expanded;

        // Service concepts
        const conceptHits = [];
        for (const [concept, words] of Object.entries(CONCEPTS)) {
            for (const w of words) {
                if (text.includes(w)) {
                    conceptHits.push(concept);
                    break;
                }
            }
        }
        if (conceptHits.length) entities.concepts = conceptHits;

        // Industry
        const industryMap = {
            government: ['government', 'municipality', 'public sector', 'department', 'provincial'],
            mining: ['mining', 'mine', 'scada', 'ot'],
            education: ['education', 'school', 'university', 'college'],
            healthcare: ['healthcare', 'hospital', 'clinic', 'medical', 'health'],
            financial: ['financial', 'bank', 'insurance', 'fintech'],
            retail: ['retail', 'ecommerce', 'shop', 'store'],
            logistics: ['logistics', 'supply chain', 'fleet', 'warehouse'],
            legal: ['legal', 'law firm', 'attorney', 'lawyer'],
            construction: ['construction', 'engineering', 'contractor']
        };
        for (const [industry, words] of Object.entries(industryMap)) {
            if (words.some(w => text.includes(w))) {
                entities.industry = industry;
                break;
            }
        }

        // Email / phone
        const emailMatch = input.raw.match(/\b[\w.+-]+@[\w-]+\.[\w.-]+\b/);
        if (emailMatch) entities.email = emailMatch[0];
        const phoneMatch = input.raw.match(/\b(?:\+27|0)[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{4}\b/);
        if (phoneMatch) entities.phone = phoneMatch[0];

        // Business size
        if (/small|sme|startup|start-up|growing/.test(text)) entities.size = 'small';
        if (/enterprise|large|corporate|national/.test(text)) entities.size = 'enterprise';
        if (/government|municipal|public/.test(text)) entities.size = 'government';

        return entities;
    }

    // --- Intent classification ---
    function classifyIntent(input) {
        const text = input.expanded;
        const tokens = input.tokens;

        let best = null;
        let bestScore = 0;

        for (const intent of INTENTS) {
            for (const pattern of intent.patterns) {
                const patternNorm = normalize(pattern);
                if (text.includes(patternNorm)) {
                    const score = patternNorm.split(' ').length * 3;
                    if (score > bestScore) {
                        bestScore = score;
                        best = intent.id;
                    }
                    continue;
                }
                // Fuzzy token match
                let hits = 0;
                for (const tok of tokens) {
                    for (const pw of patternNorm.split(' ')) {
                        if (fuzzyMatch(tok, pw)) hits++;
                    }
                }
                if (hits > 0) {
                    const score = hits * 1.5;
                    if (score > bestScore) {
                        bestScore = score;
                        best = intent.id;
                    }
                }
            }
        }

        return bestScore >= 1.5 ? { id: best, score: bestScore } : { id: null, score: 0 };
    }

    // ============================================================
    // 3. CONTEXT RESOLUTION
    // ============================================================
    const VAGUE_WORDS = ['it', 'that', 'this', 'they', 'them', 'those', 'these', 'how much', 'what about', 'and', 'also', 'the same'];

    function resolveContext(input, entities) {
        const ctx = memory.session.context;
        const text = input.expanded;

        const isContextDependent = VAGUE_WORDS.some(v => {
            const re = new RegExp(`\\b${v}\\b`, 'i');
            return re.test(text);
        });

        // If we have a current topic and user used a vague pronoun, keep topic
        if (isContextDependent && ctx.currentTopic) {
            return { resolved: true, topic: ctx.currentTopic, service: ctx.currentService, industry: ctx.currentIndustry };
        }

        // If we extracted a service concept, set the topic
        if (entities.concepts) {
            const svcConcepts = ['software', 'cybersecurity', 'cloud', 'networking', 'infrastructure', 'communications', 'data', 'business_systems', 'managed', 'training'];
            const matched = entities.concepts.find(c => svcConcepts.includes(c));
            if (matched) {
                return { resolved: false, topic: matched, service: matched, industry: entities.industry || ctx.currentIndustry };
            }
        }

        return { resolved: false, topic: ctx.currentTopic, service: ctx.currentService, industry: entities.industry || ctx.currentIndustry };
    }

    // ============================================================
    // 4. KNOWLEDGE RETRIEVAL
    // ============================================================

    function scoreDocument(input, doc, context) {
        const tokens = input.tokens;
        const expanded = input.expanded;
        let score = 0;

        // Keyword matches (highest weight)
        for (const kw of doc.keywords) {
            const kwNorm = normalize(kw);
            if (expanded.includes(kwNorm)) {
                score += 5;
            } else {
                for (const tok of tokens) {
                    if (fuzzyMatch(tok, kwNorm)) { score += 2; break; }
                }
            }
        }

        // Title matches
        const titleTokens = tokenize(doc.title);
        for (const tok of tokens) {
            if (titleTokens.some(tt => fuzzyMatch(tok, tt))) score += 3;
        }

        // Content matches
        const contentTokens = new Set(tokenize(doc.content));
        for (const tok of tokens) {
            if (contentTokens.has(tok)) score += 1;
        }

        // Context boost: if conversation topic matches doc category
        if (context.topic) {
            const topicMap = {
                software: 'service.software',
                cybersecurity: 'service.cybersecurity',
                cloud: 'service.cloud',
                networking: 'service.networking',
                infrastructure: 'service.hardware',
                communications: 'service.voip',
                data: 'service.analytics',
                business_systems: 'service.erp',
                managed: 'service.managed',
                training: 'service.training'
            };
            if (topicMap[context.topic] === doc.id) score += 4;
        }

        // Industry context boost
        if (context.industry && doc.id.startsWith('industry.' + context.industry)) score += 3;

        return score;
    }

    function searchKnowledge(input, context) {
        const results = KNOWLEDGE
            .map(doc => ({ ...doc, score: scoreDocument(input, doc, context) }))
            .filter(doc => doc.score > 0)
            .sort((a, b) => b.score - a.score);

        const topScore = results.length ? results[0].score : 0;
        return { results: results.slice(0, 5), topScore };
    }

    // ============================================================
    // 5. DECISION ENGINE
    // ============================================================

    function decide(input, understanding, context, retrieval) {
        const { emotion, entities, intent } = understanding;
        const { results, topScore } = retrieval;

        // Handle intent-only matches first
        if (intent.id === 'greeting') return { type: 'greeting', confidence: 1 };
        if (intent.id === 'thanks') return { type: 'thanks', confidence: 1 };
        if (intent.id === 'goodbye') return { type: 'goodbye', confidence: 1 };
        if (intent.id === 'help') return { type: 'help', confidence: 1 };
        if (intent.id === 'human_handoff') return { type: 'handoff', confidence: 1 };
        if (intent.id === 'pricing' && !context.topic) return { type: 'pricing_general', confidence: 0.9 };
        if (intent.id === 'contact') return { type: 'contact', confidence: 1 };
        if (intent.id === 'bbbee') return { type: 'bbbee', confidence: 1 };
        if (intent.id === 'industries') return { type: 'industries', confidence: 1 };
        if (intent.id === 'about') return { type: 'about', confidence: 1 };
        if (intent.id === 'process') return { type: 'process', confidence: 1 };
        if (intent.id === 'services_overview') return { type: 'services_overview', confidence: 1 };

        // Knowledge-based decision
        if (topScore >= 8) {
            return { type: 'knowledge', confidence: 0.9, doc: results[0], related: results.slice(1, 3) };
        }
        if (topScore >= 4) {
            return { type: 'knowledge', confidence: 0.7, doc: results[0], related: results.slice(1, 3) };
        }
        if (topScore >= 2) {
            return { type: 'knowledge_soft', confidence: 0.5, doc: results[0], related: results.slice(1, 3) };
        }

        // Clarification
        if (context.topic === null && input.tokens.length > 0) {
            return { type: 'clarify', confidence: 0.3 };
        }

        return { type: 'unknown', confidence: 0 };
    }

    // ============================================================
    // 6. RESPONSE GENERATION
    // ============================================================

    function isRecentResponse(text) {
        return memory.session.recentResponses.some(prev => stringSimilarity(prev, text) > 0.85);
    }

    function pushRecentResponse(text) {
        memory.session.recentResponses.unshift(text);
        if (memory.session.recentResponses.length > CONFIG.maxRecentResponses) {
            memory.session.recentResponses.pop();
        }
    }

    function generateResponse(decision, understanding, context) {
        const { emotion, entities, intent } = understanding;
        const { type, doc, related } = decision;
        let response = {};

        // Personalization helpers
        const userIndustry = entities.industry || memory.session.context.currentIndustry || memory.persistent.industry;
        const userSize = entities.size;

        switch (type) {
            case 'greeting':
                response.text = personalGreeting();
                response.chips = [
                    { label: '🛠 Our services', value: 'What services do you offer?' },
                    { label: '💰 Pricing info', value: 'How much do your services cost?' },
                    { label: '📩 Get in touch', value: 'How can I contact you?' }
                ];
                break;

            case 'thanks':
                response.text = pickRandom([
                    "You're very welcome! Anything else I can help with?",
                    "My pleasure. If anything else comes up, I'm here.",
                    "Happy to help! Let me know if you'd like to dig into anything else."
                ]);
                response.chips = [
                    { label: '🛠 Explore services', value: 'What services do you offer?' },
                    { label: '📩 Get in touch', value: 'How can I contact you?' }
                ];
                break;

            case 'goodbye':
                response.text = pickRandom([
                    "Goodbye! Come back anytime. 👋",
                    "Take care! We're one message away if you need us. 👋",
                    "Bye for now — looking forward to working together. 👋"
                ]);
                break;

            case 'help':
                response.text = "Here's what I can help with:\n\n• **Explore services** — \"tell me about cloud\"\n• **Pricing** — \"how much does it cost\"\n• **Company info** — history, B-BBEE, location\n• **Book a consultation** — I'll set you up\n• **Find the right service** — describe your problem\n\nWhat would you like to explore?";
                response.chips = [
                    { label: '🛠 All services', value: 'What services do you offer?' },
                    { label: '💰 Pricing', value: 'How much do your services cost?' },
                    { label: '📩 Contact', value: 'How can I contact you?' }
                ];
                break;

            case 'handoff':
                response.text = "Of course. Let me connect you with the right specialist.\n\nThe fastest route is our contact form — the right person responds within one business day. Or call us directly during business hours.";
                response.ctas = [
                    { label: 'Open contact form', url: 'contact.html', primary: true },
                    { label: 'Call 073 252 9507', url: 'tel:+27732529507' }
                ];
                break;

            case 'contact':
                response.text = "Here's how to reach us:\n\n• **Phone** — 073 252 9507 or 062 242 2544\n• **Email** — info@luminousxtech.co.za\n• **Address** — 1362 Tsheko Moloko Street, Montshioa, Mmabatho, North West\n• **Hours** — Mon–Fri, 08:00–17:00 SAST";
                response.ctas = [
                    { label: 'Contact form', url: 'contact.html', primary: true },
                    { label: 'Call 073 252 9507', url: 'tel:+27732529507' }
                ];
                break;

            case 'bbbee':
                response.text = "We're a **100% black-owned, Level 1 B-BBEE contributor** with **135% procurement recognition** — the maximum empowerment value available to our partners.\n\nWe're also youth-led, CIDB registered, SARS compliant, and POPIA ready.";
                response.chips = [
                    { label: '💼 About us', value: 'Tell me about the company' },
                    { label: '📩 Contact', value: 'How can I contact you?' }
                ];
                break;

            case 'about':
                response.text = "**Luminous X Technologies** was founded in 2019 in Mmabatho, North West. We're a small, senior team focused on building technology that South African organisations actually want to use.\n\n• 100% black-owned, youth-led\n• Level 1 B-BBEE (135% procurement)\n• CIDB registered\n• 12 service disciplines in-house\n• 9 industries served nationwide";
                response.chips = [
                    { label: '🛠 See services', value: 'What services do you offer?' },
                    { label: '🏭 Industries', value: 'Which industries do you serve?' },
                    { label: '📩 Contact', value: 'How can I contact you?' }
                ];
                break;

            case 'industries':
                response.text = "We serve **nine market segments** across all 9 provinces:\n\n• Government & Public Sector\n• Mining & Resources\n• Education & Training\n• Healthcare\n• Financial Services\n• Retail & E-Commerce\n• Logistics & Supply Chain\n• Legal Services\n• Construction & Engineering";
                if (userIndustry) {
                    response.text += `\n\nYou mentioned **${userIndustry}** — I can tell you specifically how we work in that sector if you'd like.`;
                }
                response.chips = [
                    { label: '🛠 See services', value: 'What services do you offer?' },
                    { label: '💼 Consulting', value: 'Tell me about IT consulting' }
                ];
                break;

            case 'process':
                response.text = "Every engagement follows the same framework:\n\n**1. Discover** — we immerse in your business\n**2. Design** — architecture and roadmap, reviewed with you\n**3. Deliver** — agile sprints, weekly demos\n**4. Support** — hypercare, managed support, continuous improvement\n\nNo black boxes. You see progress weekly.";
                response.chips = [
                    { label: '🛠 See services', value: 'What services do you offer?' },
                    { label: '📅 Book a call', value: 'Can I book a consultation?' }
                ];
                break;

            case 'services_overview':
                response.text = "We deliver **twelve disciplines**, all in-house:\n\n• Software · Hardware · Transformation · Consulting\n• Cloud · Cybersecurity · Networking · VoIP\n• Managed IT · Analytics · ERP · Training\n\nWhich one would you like to explore?";
                response.chips = [
                    { label: '☁ Cloud', value: 'Tell me about cloud solutions' },
                    { label: '🛡 Cybersecurity', value: 'Tell me about cybersecurity' },
                    { label: '⌨ Software', value: 'Tell me about software development' },
                    { label: '⚙ Managed IT', value: 'Tell me about managed IT services' }
                ];
                break;

            case 'pricing_general':
                response.text = "Pricing depends on scope, but here's a rough guide:\n\n• **Software projects** — from R150,000\n• **IT audits** — fixed-fee, environment-sized\n• **Managed IT** — monthly retainer by user count\n• **Cloud migration** — cost-modelled during free assessment\n• **Training** — per programme, per cohort\n\nEvery engagement starts with a **free consultation** and fixed-scope quote.";
                response.chips = [
                    { label: '📩 Get a quote', value: 'How can I get a quote?' },
                    { label: '☁ Cloud', value: 'Tell me about cloud solutions' },
                    { label: '⌨ Software', value: 'Tell me about software development' }
                ];
                break;

            case 'knowledge':
            case 'knowledge_soft': {
                // Build response from doc
                let body = doc.content;

                // Add context-aware prefix
                if (decision.confidence >= 0.85) {
                    // High confidence — direct answer
                } else {
                    // Medium confidence — soft hedging
                    body = "I think this is what you're looking for — let me know if I've missed the mark:\n\n" + body;
                }

                // Industry personalization
                if (userIndustry && !doc.content.toLowerCase().includes(userIndustry)) {
                    body += `\n\nSince you're in **${userIndustry}**, I can also explain how we apply this specifically to your sector.`;
                }

                // Size personalization
                if (userSize === 'small' && doc.category === 'service') {
                    body += "\n\nFor smaller organisations, we scale our approach to match your team and budget.";
                }

                response.text = body;

                // CTA / chips
                response.chips = [];
                if (doc.url) {
                    response.ctas = [{ label: 'Learn more', url: doc.url, primary: true }];
                }
                response.chips.push({ label: '💰 Pricing', value: 'How much does this cost?' });
                response.chips.push({ label: '⏱ Timeline', value: 'How long does it take?' });
                response.chips.push({ label: '📩 Contact', value: 'How can I contact you?' });

                // Mention related docs
                if (related && related.length) {
                    const relatedNames = related.slice(0, 2).map(r => r.title);
                    if (relatedNames.length === 1) {
                        response.text += `\n\nRelated: **${relatedNames[0]}**`;
                    } else if (relatedNames.length >= 2) {
                        response.text += `\n\nRelated: **${relatedNames[0]}** · **${relatedNames[1]}**`;
                    }
                }
                break;
            }

            case 'clarify':
                response.text = pickRandom([
                    "Happy to help — could you tell me a bit more about what you're looking for? Are you after a specific service, pricing, or something else?",
                    "I want to make sure I give you the right answer. Could you describe the problem or service you're interested in?",
                    "Let me point you in the right direction — are you looking at software, security, cloud, IT support, or something else?"
                ]);
                response.chips = [
                    { label: '⌨ Software', value: 'Tell me about software development' },
                    { label: '🛡 Cybersecurity', value: 'Tell me about cybersecurity' },
                    { label: '☁ Cloud', value: 'Tell me about cloud solutions' },
                    { label: '⚙ Managed IT', value: 'Tell me about managed IT services' }
                ];
                break;

            default:
                response.text = pickRandom([
                    "I'm not entirely sure I caught that — could you rephrase or pick one of these?",
                    "Let me help you find the right thing. Are you after a service, pricing, or contact details?",
                    "I didn't quite get that one. Here are some things I'm great at:"
                ]);
                response.chips = [
                    { label: '🛠 Services', value: 'What services do you offer?' },
                    { label: '💰 Pricing', value: 'How much do your services cost?' },
                    { label: '📩 Contact', value: 'How can I contact you?' },
                    { label: '👤 Talk to a human', value: 'I want to speak to a human' }
                ];
        }

        // Emotion-based adjustments
        if (emotion.frustration > 0.75) {
            response.text = "I understand — let me get straight to the point.\n\n" + response.text;
            response.ctas = response.ctas || [];
            response.ctas.push({ label: 'Speak to a person', url: 'contact.html', primary: true });
        } else if (emotion.urgency > 0.5) {
            response.text = "Understood — this sounds time-sensitive.\n\n" + response.text;
            if (!response.ctas) {
                response.ctas = [{ label: 'Call 073 252 9507', url: 'tel:+27732529507', primary: true }];
            }
        }

        // Deduplication
        if (isRecentResponse(response.text)) {
            response.text = "Let me put that differently — " + response.text;
        }
        pushRecentResponse(response.text);

        return response;
    }

    function personalGreeting() {
        const p = memory.persistent;
        const visits = p.visitCount || 1;
        const hour = new Date().getHours();
        const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

        if (p.name && visits > 2) {
            return `${timeGreeting}, ${p.name} 👋 Welcome back. What can I help with today?`;
        }
        if (visits > 1) {
            return `${timeGreeting}! 👋 Welcome back. What would you like to explore today?`;
        }
        return `Hi! 👋 I'm **${CONFIG.botName}**, your Luminous X assistant.\n\nI can help with services, pricing, or connecting you with the right team. What brings you here today?`;
    }

    // ============================================================
    // 7. MAIN PIPELINE
    // ============================================================
    async function processMessage(userText) {
        // 1. Preprocess
        const input = preprocess(userText);

        // 2. Understanding
        const emotion = detectEmotion(input);
        const entities = extractEntities(input);
        const intent = classifyIntent(input);

        // 3. Context
        const context = resolveContext(input, entities);

        // 4. Retrieval
        const retrieval = searchKnowledge(input, context);

        // 5. Decision
        const decision = decide(input, { emotion, entities, intent }, context, retrieval);

        // 6. Response
        const response = generateResponse(decision, { emotion, entities, intent }, context);

        // 7. Memory update
        memory.session.history.push({
            ts: Date.now(),
            user: userText,
            intent: intent.id,
            topic: context.topic,
            entities,
            emotion,
            decision: decision.type,
            confidence: decision.confidence
        });
        if (memory.session.history.length > CONFIG.maxHistory) {
            memory.session.history = memory.session.history.slice(-CONFIG.maxHistory);
        }

        // Update context
        memory.session.context.previousTopic = memory.session.context.currentTopic;
        if (context.topic) memory.session.context.currentTopic = context.topic;
        if (context.service) memory.session.context.currentService = context.service;
        if (entities.industry) memory.session.context.currentIndustry = entities.industry;
        if (intent.id) memory.session.context.lastIntent = intent.id;
        memory.session.context.lastQuestion = userText;
        Object.assign(memory.session.context.entities, entities);

        // Update emotions (with decay)
        memory.session.emotions.frustration = Math.max(0, memory.session.emotions.frustration * 0.7 + emotion.frustration * 0.3);
        memory.session.emotions.urgency = Math.max(0, memory.session.emotions.urgency * 0.7 + emotion.urgency * 0.3);
        memory.session.emotions.satisfaction = Math.max(0, memory.session.emotions.satisfaction * 0.7 + emotion.satisfaction * 0.3);

        // Update persistent memory if we learned something
        if (entities.email) memory.persistent.email = entities.email;
        if (entities.industry) memory.persistent.industry = entities.industry;
        if (context.topic) {
            const list = memory.persistent.previousServices;
            if (!list.includes(context.topic)) {
                list.push(context.topic);
                memory.persistent.previousServices = list.slice(-5);
            }
        }

        saveMemory();
        log('Decision:', decision.type, '| Confidence:', decision.confidence, '| Topic:', context.topic);

        return { response, decision, context, entities, emotion };
    }

    // ============================================================
    // UI LAYER
    // ============================================================
    let elements = null;

    function buildUI() {
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
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            <span class="lxbot-badge" aria-hidden="true">1</span>
        `;

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
                    <textarea class="lxbot-input" id="lxbotInput" placeholder="Ask me anything…" rows="1" maxlength="500" aria-label="Type your message"></textarea>
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

    function renderMessage(role, text) {
        const container = elements.win.querySelector('#lxbotMessages');
        const msg = document.createElement('div');
        msg.className = `lxbot-msg lxbot-msg-${role}`;
        const avatarHtml = role === 'bot'
            ? `<div class="lxbot-msg-avatar" aria-hidden="true">${CONFIG.botAvatar}</div>`
            : `<div class="lxbot-msg-avatar" aria-hidden="true">You</div>`;
        const bodyHtml = role === 'bot' ? renderMarkdown(text) : escapeHtml(text).replace(/\n/g, '<br>');
        msg.innerHTML = `${avatarHtml}<div class="lxbot-msg-bubble">${bodyHtml}</div>`;
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
    }

    function removeTyping() {
        const t = elements.win.querySelector('#lxbotTyping');
        if (t) t.remove();
    }

    function renderChips(chips) {
        if (!chips || !chips.length) return;
        const container = elements.win.querySelector('#lxbotMessages');
        const row = document.createElement('div');
        row.className = 'lxbot-chips';
        row.setAttribute('role', 'group');
        row.setAttribute('aria-label', 'Quick replies');
        chips.forEach(chip => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'lxbot-chip';
            btn.textContent = chip.label;
            btn.addEventListener('click', () => {
                row.remove();
                handleUserInput(chip.value);
            });
            row.appendChild(btn);
        });
        container.appendChild(row);
        scrollToBottom();
    }

    function renderCTAs(ctas) {
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
        requestAnimationFrame(() => { container.scrollTop = container.scrollHeight; });
    }

    async function handleUserInput(text) {
        if (!text || !text.trim()) return;
        text = text.trim().slice(0, 500);

        renderMessage('user', text);

        elements.win.querySelectorAll('.lxbot-chips, .lxbot-cards, .lxbot-cta-group').forEach(el => el.remove());

        renderTyping();

        const { response } = await processMessage(text);

        const delay = Math.min(
            CONFIG.maxTypingDelay,
            CONFIG.minTypingDelay + response.text.length * CONFIG.typingSpeed
        ) * (0.85 + Math.random() * 0.3);

        await new Promise(r => setTimeout(r, delay));

        removeTyping();
        renderMessage('bot', response.text);

        if (response.ctas) renderCTAs(response.ctas);
        if (response.chips) renderChips(response.chips);
    }

    function openChat() {
        if (memory.session.isOpen) return;
        memory.session.isOpen = true;
        elements.win.classList.add('lxbot-open');
        elements.win.setAttribute('aria-hidden', 'false');
        elements.bubble.classList.add('lxbot-open');
        elements.bubble.setAttribute('aria-expanded', 'true');
        elements.bubble.classList.remove('lxbot-has-unread');
        hideTeaser();

        const messages = elements.win.querySelector('#lxbotMessages');
        if (messages.children.length === 0) {
            if (memory.session.history.length > 0) {
                // Restore history
                memory.session.history.forEach(entry => {
                    renderMessage('user', entry.user);
                    // We don't store bot responses in history — just summarize
                });
                setTimeout(() => {
                    renderMessage('bot', "Welcome back! 👋 Where would you like to continue?");
                    renderChips([
                        { label: '🛠 Services', value: 'What services do you offer?' },
                        { label: '📩 Contact', value: 'How can I contact you?' },
                        { label: '🔄 Start over', value: 'hello' }
                    ]);
                }, 300);
            } else {
                setTimeout(() => {
                    renderMessage('bot', personalGreeting());
                    renderChips([
                        { label: '🛠 Our services', value: 'What services do you offer?' },
                        { label: '💰 Pricing info', value: 'How much do your services cost?' },
                        { label: '📩 Get in touch', value: 'How can I contact you?' },
                        { label: '🎓 ICT Training', value: 'Tell me about ICT training' }
                    ]);
                }, 400);
            }
        }

        setTimeout(() => elements.win.querySelector('#lxbotInput').focus(), 500);
    }

    function closeChat() {
        if (!memory.session.isOpen) return;
        memory.session.isOpen = false;
        elements.win.classList.remove('lxbot-open');
        elements.win.setAttribute('aria-hidden', 'true');
        elements.bubble.classList.remove('lxbot-open');
        elements.bubble.setAttribute('aria-expanded', 'false');
        elements.bubble.focus();
    }

    function clearChat() {
        if (!confirm('Clear this conversation? This cannot be undone.')) return;
        elements.win.querySelector('#lxbotMessages').innerHTML = '';
        memory.session.history = [];
        memory.session.recentResponses = [];
        memory.session.context = {
            currentTopic: null, previousTopic: null, currentService: null, currentIndustry: null,
            lastIntent: null, lastQuestion: null, awaitingClarification: false, clarificationType: null,
            discussedServices: [], discussedIndustries: [], entities: {}
        };
        memory.session.emotions = { frustration: 0, urgency: 0, satisfaction: 0 };
        saveMemory();
        setTimeout(() => {
            renderMessage('bot', 'Fresh start! 👋 What can I help you with?');
            renderChips([
                { label: '🛠 Services', value: 'What services do you offer?' },
                { label: '💰 Pricing', value: 'How much do your services cost?' },
                { label: '📩 Contact', value: 'How can I contact you?' }
            ]);
        }, 300);
    }

    function scheduleTeaser() {
        if (memory.session.teaserDismissed || memory.session.isOpen) return;
        memory.session.teaserTimer = setTimeout(showTeaser, CONFIG.teaserDelay);
    }

    function showTeaser() {
        if (memory.session.isOpen || memory.session.teaserDismissed) return;
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

        setTimeout(() => { if (teaser.parentNode) dismissTeaser(teaser); }, 15000);
    }

    function dismissTeaser(teaser) {
        teaser.classList.remove('lxbot-visible');
        memory.session.teaserDismissed = true;
        try { sessionStorage.setItem(CONFIG.teaserDismissKey, '1'); } catch (e) {}
        setTimeout(() => teaser.remove(), 400);
    }

    function hideTeaser() {
        const t = document.querySelector('.lxbot-teaser');
        if (t) t.remove();
        if (memory.session.teaserTimer) {
            clearTimeout(memory.session.teaserTimer);
            memory.session.teaserTimer = null;
        }
    }

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
            if (recording) { recognition.stop(); return; }
            try { recognition.start(); recording = true; voiceBtn.classList.add('lxbot-recording'); }
            catch (e) { warn('Voice failed', e); }
        });
        recognition.addEventListener('result', (event) => {
            elements.win.querySelector('#lxbotInput').value = event.results[0][0].transcript;
            handleSend();
        });
        recognition.addEventListener('end', () => {
            recording = false;
            voiceBtn.classList.remove('lxbot-recording');
        });
        recognition.addEventListener('error', () => {
            recording = false;
            voiceBtn.classList.remove('lxbot-recording');
        });
    }

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

        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 100) + 'px';
            sendBtn.disabled = !input.value.trim();
        });
        input.addEventListener('focus', () => inputRow.classList.add('lxbot-focused'));
        input.addEventListener('blur', () => inputRow.classList.remove('lxbot-focused'));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
        });
        sendBtn.addEventListener('click', handleSend);
        elements.win.addEventListener('transitionend', () => {
            if (memory.session.isOpen) input.focus();
        });
    }

    function init() {
        loadMemory();
        try { memory.session.teaserDismissed = sessionStorage.getItem(CONFIG.teaserDismissKey) === '1'; } catch (e) {}
        elements = buildUI();

        elements.bubble.addEventListener('click', () => {
            memory.session.isOpen ? closeChat() : openChat();
        });
        elements.win.querySelector('[data-action="close"]').addEventListener('click', closeChat);
        elements.win.querySelector('[data-action="clear"]').addEventListener('click', clearChat);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && memory.session.isOpen) closeChat();
        });

        initInput();
        initVoice();

        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && !memory.session.isOpen
                && document.activeElement.tagName !== 'INPUT'
                && document.activeElement.tagName !== 'TEXTAREA') {
                e.preventDefault();
                openChat();
            }
        });

        scheduleTeaser();
        ['click', 'scroll', 'touchstart'].forEach(evt => {
            window.addEventListener(evt, () => {
                if (memory.session.teaserTimer && !memory.session.isOpen) {
                    clearTimeout(memory.session.teaserTimer);
                    scheduleTeaser();
                }
            }, { passive: true });
        });

        if (!memory.session.teaserDismissed && !memory.session.isOpen) {
            setTimeout(() => elements.bubble.classList.add('lxbot-has-unread'), 8000);
        }

        log('Lumi v2 initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();