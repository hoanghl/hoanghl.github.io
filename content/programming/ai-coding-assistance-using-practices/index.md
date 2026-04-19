+++
title = "AI Coding assistance using practices"
date = 2026-04-19
description = "Notes on practical ways to use AI coding tools for development and debugging"
draft = false

[taxonomies]
tags = ["ai", "programming"]

[extra]
show_toc = true
show_copyright = false
show_comments = false
show_shares = false
keywords = "ai,coding,programming,practices,debugging"
+++

# 0. General

- Encourage to use tool to explain new concepts, system design
- Do not blindly accept the output of the tool because it is you, not tool, who is responsible for the work
- Do not let AI tool describes the solution first, come up with yours and request AI tool to debate on that, then later request AI tool to propose its idea
- As writing Linear ticket, PR description, compose a version by your own first, then may use coding assistant to polish your text

Rationale: Even you've delegated the coding task to coding agent, you're still the one who takes responsibility for that PR. Thus, at least, make sure you acknowledge this PR as much as possible, and writing your own description is one of the step for that acknowledgement.

- Leverage testing modules: Apply testing whenever, whereever, as much as possible. Unit test, integration test, functional test, use test verify the code written by coding AI assistant behaves as expected.

(This is like not checking the solution right after reading the question, but instead come up with your solution first, then compare with the "sample" solution)

# 1. For developing
These are the steps that I usually follow as working with new feature/fix the bug.

1. Grasp the general understanding

Discuss about the following points with AI tools:

  - Current system design
  - Requirements

2. Brainstorming the solution

From the collected understanding, come up with one or several together with pros/cons -> Request AI tool to check all of those and provide explanation with reference

# 2. For debugging

During debugging, the working flow is not as linear as working with new feature. In particular, these are several practices that I try to follow.

- Try to grasp the every information about the feature, the system
- Forbidden to ask for the explanation of the problem as first, instead use your understanding about every aspect to come up with an explanation -> request AI tool to debate that idea.
- During debate, always request AI tool to provide supporting reasons

# 3. Some ideas under experimenting

## 3.1. Multi-task

Date starting: Apr 10, 2026

> Use an agent orchestrator like [Superset](https://superset.sh/) to run multiple projects in parallel instead of treating AI-assisted work as a strictly single-threaded process.

The working style here is asynchronous. For each project, the loop is simple:

1. Work on a new feature or bug fix while following the practices described above.
2. After handing off a message or task to the coding agent, switch to another project instead of waiting idly.

Pros:

- In theory, this can accelerate overall output by keeping several streams of work moving at the same time.

Cons:

- Instant context switching can drain attention quickly and put more pressure on the brain than a single-project workflow.
