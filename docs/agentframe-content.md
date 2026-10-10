# Agentframe — Content Extraction & Specification

Extracted from live production deployment: `https://agentframe.vercel.app/`  
Extraction method: Headless browser rendered DOM, text parsing, and computed inspection  
Date: 2026-10-10  

---

## 1. Page Title & Meta

- **Browser `<title>`**: `Agentframe: A frame for what comes next`
- **Meta Description**: `Give your agents the tools, memory, and room to turn a good thought into finished work. An AI harness for what comes next.`
- **Live URL**: `https://agentframe.vercel.app/`

---

## 2. Brand Identity & Value Proposition

- **Brand Name**: **AGENTFRAME**
- **Hero Main Headline**:
  ```text
  A home for agents that see it through.
  ```
- **Kicker / Badge**: `NEW · Persistent workspaces. Pick up where you left off.`
- **Tagline / Subhead**:
  > *"Tools, memory, and execution in one dependable harness. From the first instruction to the finished work."*
- **Primary CTAs**: `SEE IT IN ACTION` · `START BUILDING` · `npm i agentframe`
- **Category**: AI Agent Runtime · Autonomous Systems Harness · Developer Infrastructure

---

## 3. Core Architecture & Feature Pillars

### Pillar 01 — The Agent Harness & SDK
- **Kicker**: `#01 / THE AGENT HARNESS`
- **Headline**: *"From an instruction to work you can use."*
- **Capabilities**:
  - **Agent SDK**: Describe the job, connect your tools, and make the first call. No orchestration maze.
  - **Persistent Context**: Carry useful context between runs. Your agent learns the job, not relearns the brief.
  - **Tool Permissions**: Choose which actions run freely and which ones wait for a person. You set boundaries.
  - **Bring Your Own Model**: Compatible with OpenAI, Anthropic, Google, Ollama, and local models.

### Pillar 02 — Context, Memory & Durable Workspaces
- **Kicker**: `#02 / CONTEXT & MEMORY`
- **Headline**: *"The next run starts with what you already know."*
- **Capabilities**:
  - **Workspaces**: Keep briefs, source files, and finished work together. Your agent always knows where to pick things up.
  - **Persistent Memory**: Save preferences and decisions that matter (e.g. SQLite context, `decisions.json`).
  - **Checkpoints**: Checkpoint work as it happens. Paused runs resume with files, decisions, and next steps intact.
  - **Semantic Context Search**: Search across context and return relevant passages with source citations.

### Pillar 03 — Governance & Human-in-the-Loop Execution
- **Kicker**: `#03 / CONTROL & EXECUTION`
- **Headline**: *"Let agents get on with it. Stay in control."*
- **Capabilities**:
  - **Tool Permissions**: Let routine actions run freely, gate sensitive mutations.
  - **Human Approvals**: Pause before critical actions, review, approve, and resume.
  - **Execution History**: Full inspectable history of tool calls, inputs, and decision traces.

### Open Ecosystem: Model Context Protocol (MCP)
- Open protocol support across local and remote MCP servers.
- Connect existing toolchains without vendor lock-in.

---

## 4. Design & Aesthetics

- **Visual Style**: Clean, engineering-grade dark theme (`#0E0E10`)
- **Accent Color**: Burnt Orange / Warm Amber (`#E07A3F` / `#CC5500` compatible)
- **Typography**: Geist Sans, Geist Mono, Lora
- **Micro-interactions**: Interactive terminal/runtime preview, checkpoint state indicators, live agent status tags.

---

## 5. Portfolio Work Item Summary

- **Index**: `03 / 04` (Project 3)
- **Rail Label**: `AGENTFRAME`
- **Project Title**: `AGENTFRAME · AI AGENT RUNTIME HARNESS`
- **Short Category**: `AI Systems & Infrastructure`
- **Timeline**: `2026`
- **Short Description**:
  `An open AI harness giving autonomous agents persistent memory, tool execution, and human-in-the-loop governance — turning single-prompt runs into durable, verifiable work.`
- **Tags**: `AI Runtime`, `TypeScript`, `MCP Protocol`, `Persistent Memory`, `Autonomous Systems`, `Developer Tools`
- **Live Link**: `https://agentframe.vercel.app/`
