---
title: "Building a Slack Idea Agent with n8n and Claude"
description: "A stateful conversation loop that interviews stakeholders, narrows focus through AI-generated questions, and persists insights to Notion."
date: 2025-01-27
category: ai
image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&w=1600&q=80"
imageAlt: "Chat interface with message bubbles"
---

Getting ideas out of people's heads is harder than it sounds. You ask "any ideas?" and get back either a shrug or a brain dump. Neither is useful.

What actually works is a conversation. Something that pokes at the vague parts, asks "why does that matter?", and keeps going until there's something concrete. I built a Slack bot that does exactly this.

## How It Works

Three n8n workflows talk to each other:

```
Initiator → Handler → Cleanup

Schedule/Webhook → "Any ideas?" → Back-and-forth → Notion
```

**Initiator** pings someone every morning asking if they've got anything on their mind. **Handler** runs the actual conversation—Claude asks follow-up questions until the idea is fleshed out. **Cleanup** kills sessions that go quiet for 24 hours.

All the state lives in PostgreSQL. Every message, every question, every status change gets tracked. That way the conversation can pick up right where it left off, even if someone doesn't respond for hours.

## The Back-and-Forth

Here's where it gets interesting. When someone shares an idea, Claude doesn't just say "cool, got it." It asks a real follow-up:

> "You mentioned improving the onboarding flow. What's actually breaking for new users right now?"

Each answer triggers another question. This goes up to five rounds, or until Claude decides the idea is clear enough and signals `[COMPLETE]`. The person can also just say "done" or "that's all" whenever they want out.

Five questions is the sweet spot. Enough to get substance, not enough to be annoying.

## Keeping Track of Everything

Sessions move through a handful of states:

| State | What's Happening |
|-------|------------------|
| `pending` | Session created, haven't sent the DM yet |
| `awaiting_initial` | Waiting for them to respond |
| `active` | They shared something, now we're asking questions |
| `awaiting_answer` | Question sent, ball's in their court |
| `completed` | All done, saved to Notion |
| `cancelled` | They said "no thanks" |
| `timeout` | Went quiet for 24 hours |

The conversation history lives in a JSONB column. Every Q&A pair gets appended so Claude always has the full context when generating the next question.

## What Claude Actually Does

There are three different prompts, each doing something specific:

**First question** — After the initial idea drops, Claude generates a probing follow-up. The prompt tells it to be specific, not generic:

```
Generate ONE focused follow-up question that will help clarify
or expand on this idea. The question should:
- Be specific to their idea (not generic)
- Help uncover the 'why' or potential impact
- Be conversational and natural
```

**Follow-up questions** — These get the whole conversation so far. Claude sees the original idea plus everything that's been said, so it can build on what's already there instead of retreading ground.

**The summary** — When we're done, Claude turns the whole conversation into structured JSON:

```json
{
  "title": "Streamlined Onboarding Flow",
  "summary": "Two sentences on what this is about...",
  "key_details": ["The good stuff", "More good stuff"],
  "potential_impact": "Why this matters",
  "suggested_next_steps": ["Do this first", "Then this"],
  "priority": "High",
  "tags": ["onboarding", "ux"]
}
```

That JSON goes straight into a Notion page. No manual formatting.

## Making Sure It Doesn't Go Haywire

A few things keep this from being annoying or getting stuck in weird states:

- **Ignores its own messages** — Otherwise it'd talk to itself forever
- **One session at a time** — Can't spam someone with multiple interviews
- **Hard stop at 5 questions** — Even if Claude wants to keep going
- **Easy opt-out** — "no", "nothing", "skip" all work
- **Auto-cleanup** — A job runs every 6 hours and times out anything that's been sitting for a day

## What Ends Up in Notion

The finished interview becomes a nicely structured page:

- Title and a quick summary
- Key details as bullets
- What the impact might be
- Suggested next steps
- The original idea, quoted

And the Slack confirmation includes a link straight to the page.

## Why n8n?

The visual workflow builder makes all the branching logic actually readable. Each node is a question: Is this a bot message? Does a session exist? Are they opting out? Is Claude saying we're done?

You can also trigger interviews manually via webhook or let the schedule handle the daily check-ins. PostgreSQL keeps everything in sync without needing extra services.

## What I Learned

**State is everything.** Without tracking the conversation in the database, the bot has no memory. JSONB makes storing that conversation history dead simple.

**Cap the questions.** Five is plenty. Any more and people check out. Letting Claude end early when there's nothing left to ask keeps things tight.

**Structure the output.** A raw conversation transcript is a pain to read later. The Claude summary turns a messy dialogue into something you can actually scan.

**Handle the edge cases.** Timeouts, opt-outs, errors—they all need explicit paths. The cleanup workflow makes sure nothing hangs forever.

The conversation loop pattern works anywhere you need to turn rambling input into structured insight. Build something that respects people's time and they'll actually use it.
