# Hindsight Refactor - Design Document

**Date:** 2026-01-23
**Status:** Implemented

## Concept

A skill that takes a completed feature implementation and evaluates it with fresh perspective. Like a senior developer mentoring a junior: give credit where due, provide firm critique where needed, and optionally build a competing "clean room" version.

## Key Design Decisions

### 1. Functional Scope (not git-based)
The agent understands what the feature *does*, not just what files changed. Git history informs the journey but doesn't define the boundaries.

### 2. Fair Evaluation Philosophy
- Credit where credit is due
- Understand the journey before judging
- Firm but constructive critique
- "Original wins" is a valid outcome

### 3. Hybrid Verification
- Tests for mechanical behavior
- Documented behaviors for experiential aspects (UI flows, edge cases)

### 4. Separate Branch for Rebuild
New implementation lives on `claude/hindsight/<feature>` - original preserved for comparison.

### 5. Competitive Framing
New agent "competes" against original - motivation to demonstrably improve, not just shuffle code.

## Process Flow

1. **Behavior Capture** - Lock down what the feature must do
2. **Critique** - Fair analysis with strengths AND issues
3. **Decision Point** - User approves direction (original wins / rebuild / hybrid)
4. **Competitive Rebuild** - Fresh implementation (if approved)
5. **Verification** - Prove behavioral equivalence
6. **Comparison** - Side-by-side for user judgment

## Possible Outcomes

| Outcome | Description |
|---------|-------------|
| Original wins | Critique finds only minor issues; no rebuild needed |
| Rebuild warranted | Significant issues justify fresh implementation |
| Hybrid | Targeted fixes to original better than full rebuild |

## Files Created

- `~/.claude/skills/hindsight-refactor/SKILL.md` - The skill definition

## Usage

```
User: Let's do a hindsight refactor on the tank sharing feature
```

The skill will guide through behavior capture, fair critique, and optional rebuild.
