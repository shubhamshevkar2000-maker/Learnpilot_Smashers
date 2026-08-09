
---

# DOCUMENT 3 — `DATABASE_SCHEMA.md`

Now the **database becomes our source of truth**.

```md
# LearnPilot — Database Schema

## 1. Design Principle

The database stores actual learner state.

The frontend must never be the source of truth.

---

## 2. users

id
email
name
created_at

Purpose:
Authentication/user identity.

---

## 3. learner_profiles

id
user_id
current_level
target_role
daily_hours
target_duration
learning_preference
created_at
updated_at

Purpose:
Persistent learner context.

---

## 4. goals

id
learner_id
title
description
target_date
status
created_at
updated_at

Purpose:
Learner objectives.

---

## 5. skills

id
name
category
description

Purpose:
Normalized skill catalogue.

---

## 6. learner_skills

id
learner_id
skill_id
proficiency
evidence_count
last_assessed_at
updated_at

Purpose:
Current learner skill state.

---

## 7. roadmaps

id
learner_id
goal_id
title
description
version
status
generated_by
created_at
updated_at

generated_by:

ai
manual
adaptive_agent

Purpose:
Personalized learning plans.

---

## 8. roadmap_milestones

id
roadmap_id
title
description
order_index
status
created_at

Purpose:
Roadmap phases.

---

## 9. roadmap_tasks

id
milestone_id
title
description
skill_id
difficulty
estimated_minutes
order_index
status
priority
due_date
created_at
updated_at

Purpose:
Actionable learning units.

---

## 10. resources

id
title
description
url
resource_type
skill_id
difficulty
estimated_minutes
source
tags
created_at

Purpose:
Curated learning resources.

---

## 11. task_resources

id
task_id
resource_id

Purpose:
Links resources to learning tasks.

---

## 12. assessments

id
task_id
title
description
created_at

Purpose:
Assessments associated with learning.

---

## 13. questions

id
assessment_id
question
options
correct_answer
skill_id
difficulty
explanation

Purpose:
Assessment question bank.

---

## 14. quiz_attempts

id
user_id
assessment_id
score
total_questions
correct_answers
answers
weak_topics
started_at
completed_at

Purpose:
Historical assessment evidence.

---

## 15. learning_activity

id
user_id
task_id
activity_type
started_at
completed_at
duration_minutes
status

Purpose:
Learner behavioral history.

---

## 16. progress

id
user_id
task_id
completion_percentage
status
updated_at

Purpose:
Task-level progress.

Overall progress MUST be calculated from actual task state.

---

## 17. ai_insights

id
user_id
insight_type
content
source
related_skill_id
created_at

Purpose:
Persisted AI-generated insights.

---

## 18. learner_memories

id
user_id
memory
memory_type
importance
embedding
created_at
updated_at

Memory types:

preference
strength
weakness
goal
constraint
behavior
feedback
observation

Purpose:
Persistent semantic learner context.

---

## 19. agent_actions

id
user_id
trigger
decision
action
tool_name
input_data
result
created_at

Purpose:
Audit trail of agent decisions.

---

## 20. Important Relationships

users
  ↓
learner_profiles
  ↓
goals
  ↓
roadmaps
  ↓
milestones
  ↓
tasks
  ↓
assessments
  ↓
quiz_attempts

users
  ↓
learning_activity

users
  ↓
learner_skills

users
  ↓
learner_memories

users
  ↓
agent_actions

---

## 21. Data Integrity

Do not store calculated values unnecessarily.

Example:

Overall progress should be calculated from:

completed tasks / total applicable tasks

rather than manually storing:

overall_progress = 72

unless there is a specific caching requirement.

---

## 22. Demo Data

Seeded data is allowed.

However:

- it must exist in the database
- it must be retrievable through APIs
- it must not be embedded directly in frontend components

Demo data should behave exactly like real data.