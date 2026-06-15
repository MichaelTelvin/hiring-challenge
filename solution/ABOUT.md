
## Why this role

I am interested in AI-native engineering because it combines product judgment, systems design, and rapid iteration. AgentCollect is solving a real operational problem with AI rather than building AI for its own sake, and I like the emphasis on planning, ambiguity, and practical outcomes. The team’s focus on AI-assisted development, fast feedback loops, and high ownership is particularly appealing.

## How I work with AI tools

I use ChatGPT, Codex, and Claude-style workflows daily for architecture exploration, implementation, debugging, and code review. I treat AI as a force multiplier rather than an authority. I rely on it heavily for generating options, identifying blind spots, and accelerating implementation, but I verify assumptions, challenge designs, and make the final technical decisions myself. For ambiguous problems, I prefer to define constraints and evaluation criteria first before asking AI to propose solutions.

## My last project

### One ambiguity I faced and how I resolved it

I built Rheonic, an observability and control layer for LLM applications. One challenge was deciding how much control the platform should have over customer applications. Some users wanted monitoring only, while others wanted automatic intervention when risky runtime behavior was detected (retry storms, looping agents, token explosions, etc.). I resolved this by separating observability and protection into distinct operating modes rather than forcing a single workflow.

### One tradeoff I made and why

I chose a rule-based detection and mitigation system instead of a more complex ML-driven approach. While this reduced flexibility, it made system behavior predictable, explainable, and easier to operate. For an infrastructure product, transparency was more important than sophistication.

### One mistake I made and what I changed

I spent too much time building advanced protection features before validating market demand. The product worked technically, but I learned that validating willingness to adopt and pay should happen earlier than expanding functionality. If I were starting again, I would invest more effort in customer discovery, waitlist validation, and market research before extending the product.

One review comment that changed my mind

A reviewer challenged my assumption that automatic intervention should be the default behavior. That feedback led me to separate monitoring and protection into independent modes, giving users visibility first and control second. In hindsight, this made the product easier to understand, easier to adopt, and created a clearer path for monetization.

### Shipped

Rheonic – Observability & Control Platform for LLM Applications

GitHub: https://github.com/MichaelTelvin/Rheonic

The hosted demo is currently offline because the infrastructure has been repurposed for other projects, but the application can be deployed and demonstrated on demand.

### Anything I’d improve about this challenge

I liked the emphasis on planning before implementation. The requirement to commit PLAN.md before writing code is a good signal because it rewards engineering judgment rather than coding speed. The confidence-scoring and “cannot verify” requirements also reflect real-world data quality problems where precision matters more than returning an answer for every record.


## Approach used in coding challenge

The solution prioritizes precision over recall, following the challenge requirements. 
When evidence is weak or conflicting, contacts are routed to human review instead of returning potentially incorrect results.

### Confidence Scoring

The final confidence score combines multiple signals:

- Registry source present: +25
- Listing source present: +15
- Enrichment source present: +20
- Enrichment provider confidence: +0..20
- Matching names across sources: +20
- Matching phone across sources: +10
- Preferred decision-maker roles (Owner, Founder, President): positive adjustment
- Registered Agent: negative adjustment
- Conflicting contacts across sources: -25
- Single-source evidence: penalty

### Decision Rule

- Confidence ≥ 70 → return contact
- Confidence < 70 → `needs_human_review = true` and contact method omitted

This follows the challenge guidance of preferring a verifiable contact over multiple low-confidence guesses.

Later I would also add identity-level corroboration between contact names and enrichment emails. For example, if a registry returns “Karen Liu” and enrichment returns “karen@company.com”, that should increase confidence beyond simple source counting. I left it out because I optimized for a minimal explainable slice rather than building a more sophisticated matching engine.