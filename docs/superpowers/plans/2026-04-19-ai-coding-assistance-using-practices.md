# AI Coding Assistance Using Practices Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new draft Zola blog page under the `programming` section using the provided markdown content with minimal transformation.

**Architecture:** Create a standard Zola leaf bundle at `content/programming/ai-coding-assistance-using-practices/` and place the imported article in `index.md` with repo-consistent front matter. Keep the article body close to the source markdown, using only minor cleanup required for valid Zola markdown.

**Tech Stack:** Zola, Markdown, TOML front matter

---

### Task 1: Create The Post Bundle

**Files:**
- Create: `content/programming/ai-coding-assistance-using-practices/index.md`

- [ ] **Step 1: Add repo-standard front matter**

Use:

```toml
+++
title = "AI Coding assistance using practices"
date = 2026-04-19
description = "Notes on practical ways to use AI coding tools for development and debugging"
draft = true

[taxonomies]
tags = ["ai", "programming"]

[extra]
show_toc = true
show_copyright = false
show_comments = false
show_shares = false
keywords = "ai,coding,programming,practices,debugging"
+++
```

- [ ] **Step 2: Import the markdown body with minimal cleanup**

Use the provided source headings and bullet lists as the article body, preserving wording unless a markdown or formatting fix is required for rendering.

- [ ] **Step 3: Verify the file exists at the expected location**

Run: `test -f content/programming/ai-coding-assistance-using-practices/index.md`
Expected: exit code `0`

### Task 2: Validate The Site Build

**Files:**
- Verify: `content/programming/ai-coding-assistance-using-practices/index.md`

- [ ] **Step 1: Run the site build**

Run: `zola build`
Expected: exit code `0` and generated output in `public/`

- [ ] **Step 2: Inspect git diff**

Run: `git status --short`
Expected: new plan file and new post bundle shown as added or modified
