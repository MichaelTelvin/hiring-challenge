# PLAN.md


## Architecture

Company Data Normalizer -> Provider Adapters -> Candidate Aggregator -> Confidence Scoring module -> Decision module -> Output

Each stage is independent and testable.
The system never emits a verified contact without provenance and confidence metadata.

## Sources & strategy

I would combine multiple independent source categories rather than trusting a single source,
 because alone they may appear incomplete or outdated. I would roughly start with:

- Company website/contact pages
- Business directories
- Professional/personnel directories
- Business registries
- Internal customer data if available

For each company:

1. Normalize company identity using company name and address
2. Query providers
3. Extract candidate contacts
4. Deduplicate candidates
5. Score confidence
6. Return either:
    - verified candidate
    - low-confidence candidate requiring review
    - cannot verify

## Quality

Deduplication:

- normalize names
- normalize emails
- normalize phone numbers

Confidence scoring:

- source reliability
- company match quality
- role relevance
- number of additional/supporting sources
- contact completeness

Provenance:

- every field linked to its source

False positives:

- penalize conflicting sources (reduce their score)
- prefer no result over an incorrect result

Cannot Verify:

- explicit output state
- never fabricate missing information

## Privacy / compliance

I would:

- use publicly available business information
- store provenance and confidence metadata
- prefer business contacts over personal contacts

I would not:

- bypass access controls
- scrape prohibited sources
- infer personal information without evidence
- contact individuals when confidence is insufficient

## Clarifying questions

1. **What contact type is preferred?**

   - Why it matters:
        A named decision-maker and a department inbox may lead to different scoring outcomes.

   - Default assumption:
        Prefer a named decision-maker.

   - What changes if answered:
        Scoring and selection rules change.

2. **What confidence threshold triggers human review?**

   - Why it matters:
        False positives are more damaging than missing contacts.

   - Default assumption:
        Anything below 'high confidence' requires review.

   - What changes if answered:
        Human-review routing and scoring thresholds.        

3. **Are providers equally trusted?**

   - Why it matters:
        Confidence depends heavily on source reliability.

   - Default assumption:
        Treat providers as having different trust levels.

   - What changes if answered:
        Provider weighting inside confidence scoring.