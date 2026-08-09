# LearnPilot — Product Specification

## 1. Product Identity

Product Name:
LearnPilot

Product Type:
AI-powered adaptive learning companion

Core Promise:
LearnPilot transforms a learner's goal into a personalized learning path,
continuously evaluates learning performance, remembers learner context,
and adapts the next learning action accordingly.

---

## 2. Problem

Learners have access to large amounts of educational content but often
struggle to convert that content into measurable skills and outcomes.

LearnPilot addresses:

- lack of personalized direction
- static learning paths
- weak progress visibility
- lack of continuous feedback
- difficulty identifying knowledge gaps
- lack of adaptive next-step guidance
- weak connection between learning and outcomes

---

## 3. Primary User

Hackathon MVP:

Student / early-career learner.

Example:

"I want to become a Data Scientist in 6 months."

The architecture should remain extensible to:

- working professionals
- certification aspirants
- career-growth seekers

but these do NOT require separate application experiences in the MVP.

---

## 4. Core Product Loop

Goal
→ Understand learner
→ Generate personalized roadmap
→ Learn
→ Assess
→ Analyze
→ Remember
→ Decide
→ Adapt
→ Continue learning

This adaptive loop is the central product feature.

---

## 5. P0 Features

### 5.1 Learner Onboarding

Collect:

- target goal
- current level
- current skills
- daily available learning time
- target duration
- learning preference

Do not collect unnecessary information.

---

### 5.2 AI Goal Understanding

The AI converts onboarding information into a structured learner context.

Input:

- goal
- current level
- skills
- time
- duration
- preferences

Output:

- normalized goal
- learning objectives
- initial skill areas
- roadmap requirements

---

### 5.3 Personalized Roadmap

The system generates a roadmap specifically for the learner.

Roadmap contains:

- milestones
- skills
- learning tasks
- estimated duration
- difficulty
- dependencies
- status

Roadmaps MUST NOT be hardcoded in the frontend.

---

### 5.4 Learning Tasks

Each roadmap contains actionable learning tasks.

Each task can:

- be viewed
- be started
- be completed
- be associated with a skill
- be associated with resources
- contribute to progress

---

### 5.5 Assessment

The learner can take assessments associated with learning topics/tasks.

MVP:

- 5–10 questions
- objective scoring
- skill/topic mapping

---

### 5.6 Performance Analysis

After assessment:

System determines:

- score
- strengths
- weak topics
- performance trend
- recommended next action

Basic score calculations are deterministic.

Higher-level analysis can use the LLM.

---

### 5.7 Adaptive Agent

The agent receives:

- current learner state
- roadmap
- progress
- assessment results
- historical performance
- learner memory
- relevant knowledge

It decides whether the learner's plan should change.

Possible actions:

- create remedial task
- change task priority
- recommend resource
- generate targeted practice
- delay advanced topic
- advance learner
- store important learner memory

---

### 5.8 Persistent Memory

The system remembers useful learner information.

Memory includes:

- goals
- strengths
- weaknesses
- preferences
- learning behavior
- previous assessments
- previous agent actions
- important learner observations

---

### 5.9 Dashboard

Dashboard dynamically displays:

- learner name
- current goal
- overall progress
- current milestone
- today's task
- skill status
- latest assessment
- weak areas
- latest AI insight
- latest adaptive action

All values must come from actual data/calculations.

---

## 6. P1 Features

Only after P0 is stable:

- RAG knowledge retrieval
- pgvector semantic memory
- AI mentor
- advanced recommendations
- accountability
- richer analytics

---

## 7. P2 / Future Scope

Not part of the hackathon MVP:

- LMS integrations
- voice learning
- collaborative learning
- mobile application
- resume/portfolio builder
- institutional analytics

---

## 8. Dynamic Data Policy

NEVER hardcode:

- learner information
- progress
- quiz results
- roadmap content
- recommendations
- AI responses
- agent actions
- skill percentages
- fake statistics

Allowed:

- UI labels
- constants
- business rules
- formulas
- validation thresholds
- application configuration
- seeded database records
- empty-state content

If data doesn't exist:

SHOW AN EMPTY STATE.

Never invent data to make the interface look populated.

---

## 9. Product Success Condition

The MVP is successful when:

A learner can enter a goal,
receive a personalized roadmap,
complete learning,
take an assessment,
receive performance analysis,
and have LearnPilot automatically adapt the next learning action
using persistent learner context.