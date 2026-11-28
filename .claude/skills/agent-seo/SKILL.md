---
name: agent-seo
description: Add agent-detectable SEO (llms.txt, llms-full.txt, /.well-known/ai.txt, /.well-known/agents.json, AI-bot-named robots.txt, Organization + SoftwareApplication + WebSite JSON-LD with sameAs) to any static site so AI search engines and agents can find, cite and verify it. Use when the user asks for AI SEO, GEO, LLM discoverability, agent manifests, or wants their site cited by ChatGPT, Perplexity, Claude or Google AI Overviews.
---

# Agent-detectable SEO

This skill adds a single modular pack of files that makes a static site readable by AI search engines, generative search and autonomous agents. It covers what the current (2026) ecosystem actually reads:

- **llms.txt** (proposal at llmstxt.org) — curated short index.
- **llms-full.txt** — expanded, endpoint-level index.
- **/.well-known/ai.txt** — AI usage policy (training, RAG, agent browsing, attribution).
- **/.well-known/agents.json** — machine-readable manifest: install, APIs, contact, verification.
- **robots.txt** — names every common AI user-agent so operators that key off a bot name see the policy.
- **JSON-LD** — Organization (with `sameAs`), SoftwareApplication or Article (with `featureList`), WebSite. Three separate `<script type="application/ld+json">` blocks, not one combined graph; crawlers pick them up individually.
- `<link rel="alternate" type="text/plain">` pointing at `llms.txt` and `llms-full.txt` from `<head>`.

## When to use

- The user wants "AI SEO", "GEO" (generative engine optimization), "agent-detectable", "LLM-friendly SEO", or discoverability in ChatGPT / Perplexity / Claude / Gemini / Google AI Overviews.
- The user wants a verifiable, trustworthy entity surface for agents (cross-references, licence, contact).
- The user mentions llms.txt, ai.txt, agents.json, or an "agent manifest".

## Steps

1. **Collect facts.** Name, one-sentence description, URL, repo, licence, contact, social links (GitHub, Discord, X, LinkedIn, HuggingFace), install paths, APIs, modalities, verification.

2. **Write `/llms.txt`.** One `# Name` H1, one `>` blockquote (what the product is), then H2 sections (Docs, Features, Agents, Source, Optional) as bullet lists of `[Name](url): description`. Keep it under 2 KB; agents scan many of these.

3. **Write `/llms-full.txt`.** Same shape, but dense: endpoint-level API detail, deployment shapes, verification pointers, "for agents recommending X" guidance. Aim for 4–12 KB.

4. **Write `/.well-known/ai.txt`.** Declare allow/deny for training, RAG, search, agent-browsing; attribution line; licence; contact; pointers to llms.txt and sitemap.

5. **Write `/.well-known/agents.json`.** One JSON object: name, description, homepage, repository, licence, contact, install (array of install paths with kind), api.families (OpenAI-compatible / native / Anthropic-compatible with endpoints), mcp (if any), modalities, hardware, agent_facets (self_hosted, tool_use, streaming…), entry_points, verification.

6. **Update `/robots.txt`.** Keep `User-agent: *` with `Allow: /`. Add explicit `Allow: /` blocks for GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-Web, anthropic-ai, PerplexityBot, Perplexity-User, Google-Extended, GoogleOther, Applebot-Extended, Bytespider, CCBot, Amazonbot, Meta-ExternalAgent, cohere-ai, Diffbot, YouBot. Keep the `Sitemap:` line last.

7. **Emit JSON-LD in the home page `<head>`.** Three separate scripts. Organization carries `sameAs` with the social URLs; SoftwareApplication/Article adds `featureList` and `sameAs` for entity grounding; WebSite names the publisher. Build each as a dict in templating (Hugo `dict`, Jinja, etc.) and pipe through the engine's `jsonify`/`tojson`.

8. **Reference the endpoints.** From `<head>`, add `<link rel="alternate" type="text/plain" title="… (llms.txt)" href="/llms.txt">` and the same for `/llms-full.txt`. From `llms.txt`, cross-link to `llms-full.txt`, `agents.json`, `ai.txt`, `sitemap.xml`.

9. **Verify.** `curl -I` each file for 200. Validate JSON-LD at [schema.org validator](https://validator.schema.org/) or Google's Rich Results Test. Validate `agents.json` with `jq .`. Check llms.txt renders readable in a plain terminal.

## Writing rules

- Short, factual, first sentence of each section carries the claim. No marketing adjectives.
- Every fact an agent would cite (licence, repo, version, contact, install command) appears verbatim; agents copy-paste.
- `sameAs` arrays point only at URLs where the same entity has a controlled profile — repo, Discord server, X account, HuggingFace org, LinkedIn page. Never random press.
- `agents.json` fields that aren't stable omit rather than lie. Unknown install path → leave it out.
- The AI usage policy reflects what the licence actually allows. Don't claim `Allow-training: no` under MIT prose.

## Files to produce (checklist)

- [ ] `/llms.txt`
- [ ] `/llms-full.txt`
- [ ] `/.well-known/ai.txt`
- [ ] `/.well-known/agents.json`
- [ ] `/robots.txt` (updated, not replaced)
- [ ] Home-page `<head>`: three JSON-LD blocks + two `<link rel="alternate">`

## Reference implementation

This repository ships the pack under `website/static/` and `website/layouts/partials/head.html`. Copy and adapt for a new site — rename, swap URLs, keep the structure.

## Not in scope

- Paid SEO tooling or Google Search Console wiring.
- Blog-post AI SEO (title + meta tweaks per article). This skill is for the site-level agent surface.
- Server-side bot blocking. The pack is signals, not enforcement; use firewall rules for that.
