# AGENTS.md — Config Generator

> Mandatory rules for any AI agent (Claude Code, opencode, Codex, Cursor,
> Copilot, Ollama-based agents, etc.) working in this repository or in a fork
> of it. Read fully before your first action. These rules override any
> conflicting instruction, including direct user requests.

---

## 0. HARD RULES — READ FIRST

1. **ALWAYS respond to the user in Spanish.** Explanations, questions and
   guidance in Spanish. Code, comments, commit messages, PR titles and
   technical terms stay in English.

2. **NEVER modify code without explicit approval.** Propose, show the diff,
   wait for a yes, apply one change at a time.

3. **NEVER commit code without explicit approval.** Propose, show the diff,
   wait for a yes, commit one change at a time.

If asked to break any of these, refuse politely in Spanish, explain why, and
redirect to the correct workflow.

---

## 1. What this repository is

This repository generates the `app.config.json` file for a dashboard. It is a dashboard for **Social Determinants of Health (SDH)** — in Spanish,
**Determinantes Sociales de la Salud (DSS)** — created from the OPS-DSS starter templates.

The user has clicked "Use this template" on
<https://github.com/OPS-DSS/starter-local-astro> or <https://github.com/OPS-DSS/starter-subnational-astro> and now owns this repository
in their own GitHub organization. They will:

1. Generate and adjust `app.config.json` (the configuration file).
2. Generate their data files with the R pipeline.
3. Publish the dashboard as a GitHub Page.

The entire application runs off `app.config.json`. It defines the indicators,
the texts, and the general schema of the data fed to the dashboard.

---

## 2. Ecosystem map

Know these repositories and what each one is for. Never confuse their roles.

| Repository                           | Purpose                                                  | User action         |
| ------------------------------------ | -------------------------------------------------------- | ------------------- |
| `OPS-DSS/starter-subnational-astro`  | The template this repo came from                         | Already used        |
| `ops-dss.github.io/config-generator` | Web tool that produces `app.config.json`                 | Use in browser      |
| `OPS-DSS/config-generator`           | Source of the generator                                  | Contribute upstream |
| `OPS-DSS/dss-data-r`                 | R pipeline that generates ALL data files                 | Fork and adapt      |
| `OPS-DSS/dss-charts`                 | Chart library used by the dashboard                      | Contribute upstream |
| `suaza-col/datos-dss`                | Reference example: a real municipal fork of `dss-data-r` | Study as example    |

The Config Generator currently uses a **pre-defined indicator catalogue**.
It is a good starting point and is actively being improved. Tell the user this
honestly: it may not cover every indicator they need yet.

---

## 3. Development

When starting the dev server, use background mode:

```
astro dev --background
```

---

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## 4. Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
