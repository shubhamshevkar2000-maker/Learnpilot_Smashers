# LearnPilot — AI + Agent Specification

## 1. AI Architecture

LearnPilot uses:

LLM
+
RAG
+
Persistent Memory
+
Agent
+
Tools

Each has a separate responsibility.

---

# 2. AI Responsibilities

The LLM performs:

1. Goal understanding
2. Roadmap generation
3. Performance analysis
4. Personalized explanation
5. Recommendation reasoning
6. Agent reasoning

---

# 3. Roadmap Generation

Endpoint:

POST /ai/generate-roadmap

Input:

{
  goal,
  current_level,
  skills,
  daily_hours,
  duration,
  learning_preference
}

Process:

1. Validate input.
2. Normalize learner context.
3. Send structured prompt to Gemini.
4. Require structured JSON output.
5. Validate output.
6. Store roadmap.
7. Return roadmap.

Output:

{
  goal,
  milestones: [
    {
      title,
      description,
      duration,
      skills,
      tasks
    }
  ]
}

---

# 4. Performance Analysis

Trigger:

Assessment submitted.

Input:

- current assessment
- learner profile
- current roadmap
- recent attempts
- historical attempts
- current skill levels

AI should determine:

- strengths
- weaknesses
- trends
- confidence
- recommended next focus

Output:

{
  summary,
  strengths[],
  weaknesses[],
  trends[],
  recommended_focus,
  priority
}

---

# 5. Memory Retrieval

Before important agent decisions:

Retrieve:

1. learner profile
2. current goal
3. current roadmap
4. recent progress
5. assessment history
6. previous agent actions
7. relevant learner memories

If semantic retrieval is enabled:

retrieve relevant memories using pgvector.

---

# 6. RAG

RAG should retrieve relevant learning knowledge.

Inputs:

- current topic
- learner level
- weak skill
- user query
- learning preference

Optional metadata filters:

- skill
- difficulty
- duration
- resource type

Retrieved context is passed to Gemini.

---

# 7. Agent Mission

The agent's mission is:

"Determine and execute the next best learning action for the learner based on
current performance, historical evidence, memory, roadmap state and relevant
knowledge."

---

# 8. Agent Decision Cycle

TRIGGER
↓
LOAD CONTEXT
↓
RETRIEVE MEMORY
↓
RETRIEVE KNOWLEDGE
↓
ANALYZE
↓
DECIDE
↓
VALIDATE DECISION
↓
CALL TOOL
↓
STORE ACTION
↓
UPDATE MEMORY
↓
RETURN RESULT

---

# 9. Agent Triggers

Primary MVP trigger:

assessment_submitted

Optional triggers:

task_completed
learning_session_completed
repeated_low_performance
learner_feedback

---

# 10. Agent Tools

### get_learner_profile

Returns:
Current learner context.

---

### get_current_roadmap

Returns:
Current roadmap and active tasks.

---

### get_progress

Returns:
Task completion and skill progress.

---

### get_assessment_results

Returns:
Recent and historical assessment performance.

---

### find_resources

Returns:
Relevant resources.

Can use:
database filters
RAG retrieval
ranking logic

---

### generate_practice

Creates targeted practice content.

---

### create_task

Creates a new learning task.

---

### update_roadmap

Modifies future roadmap state.

Allowed modifications:

- reorder
- delay
- add task
- change priority
- mark adaptation

---

### store_memory

Stores only useful long-term learner information.

---

### log_agent_action

Stores:

- trigger
- reasoning summary
- action
- tool
- result
- timestamp

---

# 11. Agent Constraints

Agent CANNOT:

- delete user
- modify authentication
- expose secrets
- delete learner history
- arbitrarily rewrite completed history
- fabricate assessment results
- fabricate learner activity
- invent resource URLs
- claim an action succeeded if it failed

Agent SHOULD:

- prefer evidence
- preserve historical records
- make reversible future-plan changes
- explain significant adaptations
- log actions

---

# 12. Adaptive Decision Example

Input:

Statistics quiz:
42%

Previous statistics quiz:
45%

Current roadmap:
Machine Learning → next

Memory:
Learner repeatedly struggles with probability.

Agent reasoning:

Repeated weakness detected.

Decision:

Delay advanced ML progression.

Actions:

1. Add probability revision task.
2. Retrieve beginner practical resource.
3. Generate targeted practice.
4. Update next learning task.
5. Store adaptation.
6. Log agent action.

User-facing explanation:

"LearnPilot detected a recurring gap in probability and adjusted your next
learning step before advancing to the next ML topic."

---

# 13. Adaptation Must Be Evidence-Based

The agent should not adapt solely because of one arbitrary signal.

Use:

- current assessment
- historical performance
- task completion
- skill evidence
- learner constraints
- previous interventions

where available.

---

# 14. Memory Policy

Do not store every conversation.

Store information that can influence future learning decisions.

Examples:

STORE:

"Learner prefers practical examples."

"Learner repeatedly struggles with probability."

"Learner has only one hour on weekdays."

DO NOT STORE:

"Hello."

"Thanks."

"Explain Python."

unless it reveals useful persistent learner context.

---

# 15. Memory Lifecycle

Interaction
↓
Determine whether information is useful
↓
Extract memory
↓
Classify
↓
Assign importance
↓
Store
↓
Retrieve when relevant
↓
Update if new evidence contradicts old memory

---

# 16. LLM Output Validation

All important structured LLM outputs must be validated before
database persistence.

Expected flow:

Gemini
↓
JSON
↓
Schema validation
↓
Business validation
↓
Database