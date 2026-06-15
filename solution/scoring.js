
const REVIEW_THRESHOLD = 70;

function processCompany(company, providerData) {
    if (!providerData) {
        return emptyReviewResult(company, 0);
    }

    const candidate = buildCandidate(providerData);
    const { score, sources } = scoreEvidence(providerData);

    const needsHumanReview = score < REVIEW_THRESHOLD;

    return {
        company_name: company.company_name,
        contact_name: candidate.name || "",
        contact_role: candidate.role || "",
        contact_email_or_phone: needsHumanReview
            ? ""
            : candidate.email || candidate.phone || "",
        confidence_score: score,
        source: sources,
        needs_human_review: needsHumanReview,
    };
}

function buildCandidate(providerData) {
    const { registry, listing, enrichment } = providerData;

    return {
        name: registry?.name || listing?.name || "",
        role: registry?.role || "",
        email: enrichment?.email || "",
        phone: enrichment?.phone || listing?.phone || "",
    };
}

function scoreEvidence(providerData) {
    const { registry, listing, enrichment } = providerData;

    let score = 0;
    const sources = [];

    if (registry) {
        score += 25;
        sources.push(registry.source_url);
    }

    if (listing) {
        score += 15;
        sources.push(listing.source_url);
    }

    if (enrichment) {
        score += 20;
        sources.push(enrichment.source_url);

        if (typeof enrichment.provider_confidence === "number") {
            score += Math.floor(enrichment.provider_confidence / 5);
        }
    }

    if (sameName(registry?.name, listing?.name)) {
        score += 20;
    } else if (partialNameMatch(registry?.name, listing?.name)) {
        score += 10;
    } else if (registry?.name && listing?.name) {
        score -= 25;
    }

    if (listing?.phone && enrichment?.phone && normalizePhone(listing.phone) === normalizePhone(enrichment.phone)) {
        score += 10;
    }

    score += roleScore(registry?.role);

    const sourceCount = [registry, listing, enrichment].filter(Boolean).length;

    if (sourceCount === 1) {
        score -= 15;
    }

    if (enrichment && !registry && !listing) {
        score -= 10;
    }

    return {
        score: clamp(score, 0, 100),
        sources,
    };
}

function roleScore(role = "") {
    const normalized = role.toLowerCase();

    if (normalized.includes("accounts payable") || normalized.includes("ap manager")) return 15;
    if (normalized.includes("owner")) return 10;
    if (normalized.includes("founder")) return 10;
    if (normalized.includes("president")) return 10;
    if (normalized.includes("cfo")) return 8;
    if (normalized.includes("finance")) return 8;
    if (normalized.includes("office manager")) return 5;
    if (normalized.includes("manager")) return 5;
    if (normalized.includes("registered agent")) return -15;

    return 0;
}

function sameName(a, b) {
    if (!a || !b) return false;
    return normalizeName(a) === normalizeName(b);
}

function partialNameMatch(a, b) {
    if (!a || !b) return false;

    const left = normalizeName(a).split(" ");
    const right = normalizeName(b).split(" ");

    const leftLast = left[left.length - 1];
    const rightLast = right[right.length - 1];

    return leftLast && rightLast && leftLast === rightLast;
}

function normalizeName(name) {
    return name
        .toLowerCase()
        .replace(/\bdr\b\.?/g, "")
        .replace(/\([^)]*\)/g, "")
        .replace(/[^a-z\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function normalizePhone(phone) {
    return phone.replace(/[^\d]/g, "");
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function emptyReviewResult(company, score) {
    return {
        company_name: company.company_name,
        contact_name: "",
        contact_role: "",
        contact_email_or_phone: "",
        confidence_score: score,
        source: [],
        needs_human_review: true,
    };
}

module.exports = {
    processCompany,
};