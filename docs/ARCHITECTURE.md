# LearnPilot — System Architecture

## 1. Architecture Principle

Separate:

Presentation
Application
Intelligence
Data

into independent responsibilities.

---

## 2. High-Level Architecture

Learner
   ↓
Next.js
   ↓
Express
   ↓
FastAPI
   ↓
AI / RAG / Agent
   ↓
Supabase PostgreSQL
   ↓
Updated learner state
   ↓
Next.js

---

## 3. Frontend

Technology:

Next.js
TypeScript
Tailwind CSS

Responsibilities:

- UI
- navigation
- forms
- loading states
- error states
- displaying API responses
- user interaction

Frontend MUST NOT:

- contain Gemini API keys
- contain agent reasoning
- directly manipulate AI state
- hardcode user-specific data
- contain business-critical database logic

---

## 4. Express Application Layer

Technology:

Node.js
Express.js

Responsibilities:

- API gateway for frontend
- request validation
- authentication/authorization checks
- application CRUD
- database interaction
- assessment submission
- progress operations
- communication with FastAPI

Example routes:

GET    /api/profile
PUT    /api/profile

POST   /api/goals
GET    /api/goals/:id

POST   /api/roadmaps
GET    /api/roadmaps/:id

GET    /api/tasks/today
POST   /api/tasks/:id/complete

GET    /api/assessments/:id
POST   /api/assessments/:id/submit

GET    /api/progress

POST   /api/intelligence/adapt
## 5. FastAPI Intelligence Layer

Technology:

Python
FastAPI

Responsibilities:

AI orchestration
LLM interaction
roadmap generation
learner analysis
recommendation engine
memory retrieval
RAG
agent orchestration
adaptive decisions

FastAPI MUST NOT become a second general-purpose application backend.

It owns intelligence.

## 6. Gemini

Gemini is the primary LLM.

Responsibilities:

roadmap generation
performance analysis
personalized explanations
recommendation reasoning
agent reasoning

LLM outputs MUST use structured schemas.

Never rely on arbitrary free-form text where the application expects structured data.

## 7. Supabase

Supabase provides:

PostgreSQL
authentication
database APIs
persistent storage
pgvector where required

PostgreSQL is the source of truth.

## 8. RAG

RAG is responsible for retrieving relevant knowledge.

RAG MUST NOT replace normal database queries.

Use PostgreSQL for:

learner profile
progress
roadmap
quiz scores
task status

Use RAG for:

learning concepts
explanations
relevant learning material
resource retrieval
contextual knowledge
## 9. Agent

The agent is responsible for:

UNDERSTAND
→ REASON
→ DECIDE
→ ACT
→ OBSERVE
→ REMEMBER

The agent does not directly receive unrestricted database access.

It uses controlled tools.

## 10. Agent Tools

get_learner_profile()
get_current_roadmap()
get_progress()
get_assessment_results()
find_resources()
generate_practice()
create_task()
update_roadmap()
store_memory()
log_agent_action()

## 11. Memory
Structured Memory

Stored in PostgreSQL:

profile
goals
skills
roadmap
progress
Episodic Memory

Stored in PostgreSQL:

assessments
learning activity
previous agent actions
previous adaptations
Semantic Memory

Stored using:

PostgreSQL + pgvector

Potential contents:

learner preferences
persistent observations
important feedback
recurring weaknesses
useful learning context
## 12. Service Boundary

Next.js:
"What should the learner see?"

Express:
"What does the application need to do?"

FastAPI:
"What does the learner need?"

Gemini:
"What does the information mean / what should be generated?"

RAG:
"What relevant knowledge should be retrieved?"

Agent:
"What action should happen next?"

PostgreSQL:
"What is the current truth about this learner?"

## 13. Failure Handling

If Gemini fails:

do not destroy existing roadmap
preserve database state
return controlled error
allow retry

If FastAPI fails:

Express remains functional for normal application operations
existing learner state remains intact

If RAG fails:

fallback to normal application data where appropriate
never fabricate retrieved content
## 14. Security

Secrets must remain server-side.

Never expose:

GEMINI_API_KEY
database service credentials
private API keys

to the frontend.

## 15. Deployment

Frontend:
Vercel

Express:
Suitable Node.js backend host

FastAPI:
Suitable Python backend host

Supabase:
Managed PostgreSQL/Auth