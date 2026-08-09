import type { LearnerProfile, CurrentLevel, ActivityType } from "@/types/database.types"

export interface GeneratedActivity {
  title: string
  activity_type: ActivityType
  sequence_order: number
  estimated_minutes: number
  day_number: number
}

export interface GeneratedModule {
  title: string
  description: string
  rationale: string
  sequence_order: number
  estimated_minutes: number
  activities: GeneratedActivity[]
}

export interface GeneratedPlan {
  title: string
  goal_summary: string
  modules: GeneratedModule[]
}

/**
 * Calculates module estimated minutes as the exact sum of its activity estimated minutes.
 */
export function sumActivityMinutes(activities: GeneratedActivity[]): number {
  return activities.reduce((acc, act) => acc + (act.estimated_minutes || 20), 0)
}

/**
 * Target-Date Aware, Production-Grade Curriculum & Schedule Generator.
 * Generates realistic, educationally coherent learning paths scaled by:
 * 1. Learner Goal & Desired Outcome
 * 2. Starting Skill Baseline (Beginner, Intermediate, Advanced)
 * 3. Daily Study Time Budget (available_daily_minutes)
 * 4. Target Completion Date (target_date horizon)
 */
export function generateLearningPlan(profile: LearnerProfile): GeneratedPlan {
  const goal = (profile.learning_goal || "General Skill Mastery").trim()
  const outcome = (profile.desired_outcome || "Achieve practical mastery").trim()
  const level: CurrentLevel = profile.current_level || "beginner"

  const lowerGoal = goal.toLowerCase()
  const dailyBudget = profile.available_daily_minutes ? Math.max(profile.available_daily_minutes, 15) : 30

  // Calculate target date horizon in days
  let targetDays = 180 // default 6-month horizon
  if (profile.target_date) {
    const targetMs = new Date(profile.target_date).getTime()
    const nowMs = Date.now()
    if (!isNaN(targetMs) && targetMs > nowMs) {
      targetDays = Math.max(Math.ceil((targetMs - nowMs) / (1000 * 60 * 60 * 24)), 14)
    }
  }

  // Dynamic Plan Title & Summary
  const planTitle = `${goal} — Comprehensive Career Roadmap`
  const goalSummary = `A realistic, structured curriculum taking you from ${
    level === "beginner" ? "foundations" : level === "intermediate" ? "intermediate knowledge" : "advanced concepts"
  } to achieving "${outcome}" over a target horizon of ~${Math.round(targetDays / 30)} months.`

  let rawModules: {
    title: string
    description: string
    rationale: string
    activities: { title: string; activity_type: ActivityType; estimated_minutes: number }[]
  }[] = []

  // ============================================================================
  // 1. DATA SCIENCE / DATA ANALYTICS DOMAIN (Beginner -> Advanced)
  // ============================================================================
  if (lowerGoal.includes("data sci") || lowerGoal.includes("data analyst") || lowerGoal.includes("machine learning") || lowerGoal.includes("ai engineer")) {
    if (level === "beginner" || level === "basics" || level === "unknown") {
      rawModules = [
        {
          title: "Python Programming Foundations for Data Science",
          description: "Master essential Python syntax, primitive types, control flow, functions, module imports, and basic file I/O operations.",
          rationale: "Establishes core programming fluency required before handling numerical libraries and data frames.",
          activities: [
            { title: "Python Interpreter Setup, Variables & Primitive Data Types", activity_type: "concept", estimated_minutes: 45 },
            { title: "Conditional Statements & Boolean Logic Flow", activity_type: "exercise", estimated_minutes: 45 },
            { title: "Iteration Constructs: For & While Loops", activity_type: "exercise", estimated_minutes: 60 },
            { title: "Defining Functions, Scope & Keyword Parameters", activity_type: "concept", estimated_minutes: 60 },
            { title: "Lists, Tuples, Sets & Dictionary Mechanics", activity_type: "exercise", estimated_minutes: 75 },
            { title: "List & Dictionary Comprehensions", activity_type: "exercise", estimated_minutes: 45 },
            { title: "File Operations, Input/Output & Exception Handling", activity_type: "concept", estimated_minutes: 60 },
            { title: "Object-Oriented Programming: Classes & Attributes", activity_type: "exercise", estimated_minutes: 90 },
            { title: "Python Utility CLI Project for Data Parsing", activity_type: "project", estimated_minutes: 120 },
            { title: "Python Fundamentals Skill Review Checkpoint", activity_type: "reflection", estimated_minutes: 30 },
          ],
        },
        {
          title: "Mathematics, Statistics & Probability for Analytics",
          description: "Learn descriptive statistics, linear algebra vectors/matrices, calculus gradients, and probability distributions essential for machine learning.",
          rationale: "Provides theoretical grounding needed to understand model loss functions, optimization, and statistical inference.",
          activities: [
            { title: "Descriptive Statistics: Mean, Median, Variance & Standard Deviation", activity_type: "concept", estimated_minutes: 60 },
            { title: "Probability Distributions: Normal, Binomial & Poisson", activity_type: "exercise", estimated_minutes: 60 },
            { title: "Hypothesis Testing, P-Values & Confidence Intervals", activity_type: "exercise", estimated_minutes: 75 },
            { title: "Linear Algebra Vectors, Matrix Operations & Dot Products", activity_type: "concept", estimated_minutes: 75 },
            { title: "Derivatives, Gradients & Cost Function Optimization", activity_type: "exercise", estimated_minutes: 90 },
            { title: "Statistical Reasoning & Mathematical Checkpoint", activity_type: "reflection", estimated_minutes: 30 },
          ],
        },
        {
          title: "SQL Databases & Relational Querying",
          description: "Write production SELECT queries, filtering, aggregation, table JOINs, subqueries, and window functions for data extraction.",
          rationale: "Essential industry skill for pulling raw data from enterprise data warehouses.",
          activities: [
            { title: "Relational Database Concepts & SQL SELECT Fundamentals", activity_type: "concept", estimated_minutes: 45 },
            { title: "WHERE Filtering, ORDER BY & String/Date Functions", activity_type: "exercise", estimated_minutes: 60 },
            { title: "GROUP BY Aggregations & HAVING Clauses", activity_type: "exercise", estimated_minutes: 60 },
            { title: "Relational Joins: INNER, LEFT, RIGHT & FULL OUTER", activity_type: "exercise", estimated_minutes: 75 },
            { title: "Subqueries, Common Table Expressions (CTEs) & Window Functions", activity_type: "concept", estimated_minutes: 90 },
            { title: "SQL E-Commerce Analytics Querying Project", activity_type: "project", estimated_minutes: 120 },
            { title: "SQL Data Extraction Verification", activity_type: "reflection", estimated_minutes: 25 },
          ],
        },
        {
          title: "NumPy Vectorized Scientific Computing",
          description: "Perform high-performance N-dimensional array manipulations, broadcasting, slicing, and mathematical transformations.",
          rationale: "Serves as the foundational computational engine underlying Pandas and Scikit-Learn.",
          activities: [
            { title: "NumPy N-Dimensional Arrays & Memory Layout", activity_type: "concept", estimated_minutes: 45 },
            { title: "Array Slicing, Reshaping & Indexing Mechanics", activity_type: "exercise", estimated_minutes: 60 },
            { title: "Vectorized Operations, Universal Functions & Broadcasting Rules", activity_type: "exercise", estimated_minutes: 75 },
            { title: "Linear Algebra Operations in NumPy", activity_type: "exercise", estimated_minutes: 60 },
            { title: "NumPy Matrix Computation Practice Lab", activity_type: "project", estimated_minutes: 90 },
          ],
        },
        {
          title: "Pandas Data Wrangling & DataFrame Analysis",
          description: "Master Series and DataFrames, data ingestion (CSV/JSON), indexing, filtering, groupby aggregations, and merging datasets.",
          rationale: "The primary tool for exploratory data analysis and data preparation in data science.",
          activities: [
            { title: "Pandas Series & DataFrame Data Structures", activity_type: "concept", estimated_minutes: 45 },
            { title: "Data Ingestion: Reading CSV, Excel, and JSON Files", activity_type: "exercise", estimated_minutes: 45 },
            { title: "DataFrame Indexing: loc, iloc & Boolean Filtering", activity_type: "exercise", estimated_minutes: 60 },
            { title: "Data Transformation: Mutating, Renaming & Applying Functions", activity_type: "exercise", estimated_minutes: 60 },
            { title: "Groupby Aggregations, Pivot Tables & Reshaping", activity_type: "concept", estimated_minutes: 75 },
            { title: "Merging, Joining & Concatenating Multiple DataFrames", activity_type: "exercise", estimated_minutes: 75 },
            { title: "Financial Dataset Data Wrangling Project", activity_type: "project", estimated_minutes: 120 },
            { title: "Pandas Mastery Checkpoint", activity_type: "reflection", estimated_minutes: 25 },
          ],
        },
        {
          title: "Data Cleaning, Preprocessing & Feature Engineering",
          description: "Handle missing values, detect outliers, perform categorical encoding, feature scaling, and feature transformation.",
          rationale: "Real-world data is noisy; clean preprocessed data is critical for accurate machine learning models.",
          activities: [
            { title: "Identifying & Imputing Missing Data Techniques", activity_type: "concept", estimated_minutes: 60 },
            { title: "Outlier Detection Methods: Z-Score & IQR Bounds", activity_type: "exercise", estimated_minutes: 60 },
            { title: "Categorical Encoding: One-Hot, Label & Target Encoding", activity_type: "exercise", estimated_minutes: 60 },
            { title: "Feature Scaling: StandardScaler, MinMaxScaler & RobustScaler", activity_type: "concept", estimated_minutes: 60 },
            { title: "Feature Extraction, Interaction Terms & Polynomial Features", activity_type: "exercise", estimated_minutes: 75 },
            { title: "End-to-End Data Preprocessing Pipeline Project", activity_type: "project", estimated_minutes: 120 },
          ],
        },
        {
          title: "Exploratory Data Analysis (EDA) & Data Visualization",
          description: "Create informative charts using Matplotlib and Seaborn, plot univariate/bivariate distributions, and extract domain insights.",
          rationale: "Communicates data patterns visually to stake-holders and informs model feature selection.",
          activities: [
            { title: "Data Visualization Principles & Matplotlib Fundamentals", activity_type: "concept", estimated_minutes: 45 },
            { title: "Statistical Plotting with Seaborn: Histograms, Boxplots & Heatmaps", activity_type: "exercise", estimated_minutes: 60 },
            { title: "Univariate, Bivariate & Multivariate Relationship Analysis", activity_type: "exercise", estimated_minutes: 75 },
            { title: "Correlation Matrix Analysis & Multicollinearity", activity_type: "concept", estimated_minutes: 60 },
            { title: "Comprehensive EDA Report Capstone Project", activity_type: "project", estimated_minutes: 150 },
            { title: "EDA Insights Checkpoint", activity_type: "reflection", estimated_minutes: 30 },
          ],
        },
        {
          title: "Supervised Machine Learning: Regression & Classification",
          description: "Understand Scikit-Learn workflows, Linear Regression, Logistic Regression, Decision Trees, Random Forests, and Gradient Boosting.",
          rationale: "Core predictive modeling algorithms used in industry data science applications.",
          activities: [
            { title: "Supervised Learning Paradigm & Scikit-Learn API Workflow", activity_type: "concept", estimated_minutes: 45 },
            { title: "Linear Regression: Ordinary Least Squares & Assumptions", activity_type: "exercise", estimated_minutes: 75 },
            { title: "Logistic Regression: Binary Classification & Odds Ratios", activity_type: "exercise", estimated_minutes: 75 },
            { title: "Decision Trees & Impurity Metrics (Gini / Entropy)", activity_type: "concept", estimated_minutes: 60 },
            { title: "Ensemble Learning: Random Forests & Bagging", activity_type: "exercise", estimated_minutes: 90 },
            { title: "Gradient Boosting: XGBoost & LightGBM Principles", activity_type: "exercise", estimated_minutes: 90 },
            { title: "Predictive Housing Price Regression Project", activity_type: "project", estimated_minutes: 150 },
            { title: "Supervised ML Models Checkpoint", activity_type: "reflection", estimated_minutes: 30 },
          ],
        },
        {
          title: "Unsupervised Machine Learning & Dimensionality Reduction",
          description: "Implement K-Means clustering, Hierarchical clustering, Principal Component Analysis (PCA), and t-SNE visualization.",
          rationale: "Enables customer segmentation, anomaly detection, and high-dimensional data compression.",
          activities: [
            { title: "Unsupervised Learning Mechanics & Clustering Metrics", activity_type: "concept", estimated_minutes: 45 },
            { title: "K-Means Clustering: Elbow Method & Silhouette Score", activity_type: "exercise", estimated_minutes: 75 },
            { title: "Hierarchical Clustering & Dendrogram Analysis", activity_type: "exercise", estimated_minutes: 60 },
            { title: "Principal Component Analysis (PCA) & Variance Explained", activity_type: "concept", estimated_minutes: 90 },
            { title: "Customer Segmentation Unsupervised Project", activity_type: "project", estimated_minutes: 150 },
          ],
        },
        {
          title: "Model Evaluation, Cross-Validation & Hyperparameter Tuning",
          description: "Evaluate models using Precision/Recall, ROC-AUC curves, Confusion Matrices, K-Fold Cross-Validation, and Grid/Random Search.",
          rationale: "Prevents overfitting and guarantees reliable model performance on unseen production data.",
          activities: [
            { title: "Classification Metrics: Accuracy, Precision, Recall & F1-Score", activity_type: "concept", estimated_minutes: 60 },
            { title: "ROC-AUC Curves & Confusion Matrix Interpretation", activity_type: "exercise", estimated_minutes: 60 },
            { title: "K-Fold & Stratified Cross-Validation Techniques", activity_type: "concept", estimated_minutes: 60 },
            { title: "Hyperparameter Optimization: GridSearchCV & RandomizedSearchCV", activity_type: "exercise", estimated_minutes: 90 },
            { title: "Model Tuning & Cross-Validation Lab", activity_type: "project", estimated_minutes: 120 },
            { title: "Model Evaluation Rigor Checkpoint", activity_type: "reflection", estimated_minutes: 30 },
          ],
        },
        {
          title: "Deep Learning & Neural Network Architecture",
          description: "Understand Perceptrons, Artificial Neural Networks (ANN), activation functions, backpropagation, and PyTorch model training.",
          rationale: "Prepares you for modern AI modeling tasks involving complex non-linear patterns.",
          activities: [
            { title: "Artificial Neural Networks & Biological Inspiration", activity_type: "concept", estimated_minutes: 60 },
            { title: "Activation Functions: ReLU, Sigmoid, Softmax & Tanh", activity_type: "concept", estimated_minutes: 45 },
            { title: "Forward Propagation, Loss Functions & Backpropagation", activity_type: "concept", estimated_minutes: 90 },
            { title: "PyTorch Framework: Tensors & Autograd Mechanics", activity_type: "exercise", estimated_minutes: 90 },
            { title: "Building & Training a PyTorch Deep Neural Network", activity_type: "project", estimated_minutes: 150 },
            { title: "Deep Learning Fundamentals Review", activity_type: "reflection", estimated_minutes: 30 },
          ],
        },
        {
          title: "End-to-End Capstone Data Science Project & Deployment",
          description: "Build an end-to-end data pipeline from raw data acquisition to model training, evaluation, and FastAPI REST endpoint deployment.",
          rationale: "Directly fulfills your target outcome of becoming a job-ready Data Scientist.",
          activities: [
            { title: "Capstone Project Architecture & Business Requirement Scope", activity_type: "concept", estimated_minutes: 60 },
            { title: "Data Collection, Cleaning & Exploratory Analysis Phase", activity_type: "project", estimated_minutes: 180 },
            { title: "Feature Engineering & Model Selection Benchmark", activity_type: "project", estimated_minutes: 180 },
            { title: "Model Export & FastAPI REST Endpoint Packaging", activity_type: "exercise", estimated_minutes: 120 },
            { title: "Containerizing Machine Learning Model with Docker", activity_type: "exercise", estimated_minutes: 90 },
            { title: "Deploying Model Endpoint to Cloud Infrastructure", activity_type: "project", estimated_minutes: 150 },
            { title: "Full Capstone Portfolio Defense & Code Review", activity_type: "reflection", estimated_minutes: 60 },
          ],
        },
      ]
    } else {
      // Intermediate / Advanced Data Science Trajectory
      rawModules = [
        {
          title: "Advanced Machine Learning Algorithms & Ensemble Methods",
          description: "Master XGBoost, CatBoost, LightGBM, Stacking Ensembles, and Cost-Sensitive Learning for imbalanced datasets.",
          rationale: "Elevates existing machine learning knowledge to competitive industrial standards.",
          activities: [
            { title: "Gradient Boosting Theory: Loss Functions & Tree Splitting", activity_type: "concept", estimated_minutes: 60 },
            { title: "XGBoost & LightGBM Regularization & Tuning", activity_type: "exercise", estimated_minutes: 90 },
            { title: "CatBoost & Handling High-Cardinality Categorical Features", activity_type: "exercise", estimated_minutes: 75 },
            { title: "Stacking & Blending Ensemble Architectures", activity_type: "exercise", estimated_minutes: 90 },
            { title: "Imbalanced Classification: SMOTE & Cost-Sensitive Learning", activity_type: "concept", estimated_minutes: 75 },
            { title: "Advanced Ensemble Competition Model Project", activity_type: "project", estimated_minutes: 180 },
          ],
        },
        {
          title: "Deep Learning: Computer Vision & Natural Language Processing",
          description: "Implement Convolutional Neural Networks (CNNs), Recurrent Neural Networks (RNNs), and Transformer models in PyTorch.",
          rationale: "Unlocks capabilities in unstructured image, video, and text data processing.",
          activities: [
            { title: "Convolutional Layers, Pooling & CNN Architectures", activity_type: "concept", estimated_minutes: 75 },
            { title: "Transfer Learning with Pretrained ResNet / EfficientNet", activity_type: "exercise", estimated_minutes: 90 },
            { title: "Text Embeddings, Tokenization & Word2Vec/GloVe", activity_type: "concept", estimated_minutes: 60 },
            { title: "Transformer Self-Attention Mechanism & HuggingFace Models", activity_type: "exercise", estimated_minutes: 120 },
            { title: "PyTorch Vision or NLP Deep Learning Capstone", activity_type: "project", estimated_minutes: 180 },
          ],
        },
        {
          title: "MLOps, Model Governance & Production Monitoring",
          description: "Implement MLflow experiment tracking, Feature Stores, Model Drift Detection, and Automated CI/CD retraining pipelines.",
          rationale: "Ensures models remain accurate and compliant when deployed into enterprise production environments.",
          activities: [
            { title: "MLOps Architecture & MLflow Experiment Tracking", activity_type: "concept", estimated_minutes: 60 },
            { title: "Feature Store Design & Data Version Control (DVC)", activity_type: "exercise", estimated_minutes: 90 },
            { title: "Model Drift Monitoring: Data & Concept Drift Metrics", activity_type: "exercise", estimated_minutes: 75 },
            { title: "Production MLOps Pipeline Deployment Project", activity_type: "project", estimated_minutes: 180 },
          ],
        },
      ]
    }
  }
  // ============================================================================
  // 2. FULL-STACK / WEB DEVELOPMENT DOMAIN
  // ============================================================================
  else if (lowerGoal.includes("full-stack") || lowerGoal.includes("full stack") || lowerGoal.includes("web dev") || lowerGoal.includes("frontend") || lowerGoal.includes("react")) {
    if (level === "beginner" || level === "basics" || level === "unknown") {
      rawModules = [
        {
          title: "HTML5 Structural Syntax & Web Semantics",
          description: "Master modern HTML5 elements, document outlining, form inputs, validation rules, and ARIA accessibility standards.",
          rationale: "Establishes proper semantic document structure required before adding visual styling and dynamic scripting.",
          activities: [
            { title: "HTML5 Document Architecture & Head Metadata", activity_type: "concept", estimated_minutes: 30 },
            { title: "Semantic Tags: Main, Article, Section, Header & Footer", activity_type: "exercise", estimated_minutes: 45 },
            { title: "Form Design: Inputs, Labels, Fieldsets & Validation", activity_type: "exercise", estimated_minutes: 60 },
            { title: "Accessible Web Standards & ARIA Landmarks", activity_type: "concept", estimated_minutes: 45 },
            { title: "Semantic Accessible Webpage Structure Project", activity_type: "project", estimated_minutes: 90 },
          ],
        },
        {
          title: "CSS3 Architecture, Flexbox & Grid Spatial Layouts",
          description: "Master CSS selectors, specificity, box model, Flexbox one-dimensional alignment, Grid spatial systems, and media queries.",
          rationale: "Teaches responsive spatial layout techniques used in modern web design.",
          activities: [
            { title: "CSS Selectors, Specificity & Box Model Rules", activity_type: "concept", estimated_minutes: 45 },
            { title: "Flexbox Layout Mechanics: Main & Cross Axis Alignment", activity_type: "exercise", estimated_minutes: 60 },
            { title: "CSS Grid Systems: Template Columns, Rows & Areas", activity_type: "exercise", estimated_minutes: 60 },
            { title: "Responsive Breakpoints & Mobile-First Media Queries", activity_type: "concept", estimated_minutes: 45 },
            { title: "Responsive Multi-Layout Component Project", activity_type: "project", estimated_minutes: 120 },
          ],
        },
        {
          title: "JavaScript Engine Mechanics & ES6+ Fundamentals",
          description: "Deep dive into JS variables, data types, control flow, functions, objects, arrays, and ES6+ features.",
          rationale: "The core programming language governing frontend browser interaction.",
          activities: [
            { title: "JS Engine Execution, Variables & Scope Rules", activity_type: "concept", estimated_minutes: 45 },
            { title: "Functions, Arrow Functions & Return Values", activity_type: "exercise", estimated_minutes: 45 },
            { title: "Array Methods: map, filter, reduce & find", activity_type: "exercise", estimated_minutes: 60 },
            { title: "Object Manipulation, Destructuring & Spread Syntax", activity_type: "exercise", estimated_minutes: 60 },
            { title: "DOM Manipulation & Browser Event Handling", activity_type: "exercise", estimated_minutes: 75 },
            { title: "Interactive DOM Dashboard Project", activity_type: "project", estimated_minutes: 120 },
          ],
        },
        {
          title: "Asynchronous JavaScript, Promises & Fetch API",
          description: "Master event loop execution, Promises, async/await syntax, and REST API network requests using Fetch.",
          rationale: "Essential for connecting browser interfaces to remote backend servers.",
          activities: [
            { title: "JavaScript Single-Threaded Event Loop & Callback Queue", activity_type: "concept", estimated_minutes: 45 },
            { title: "Promises State Machine & Chaining Patterns", activity_type: "concept", estimated_minutes: 60 },
            { title: "Async/Await Syntax & Try/Catch Error Handling", activity_type: "exercise", estimated_minutes: 60 },
            { title: "Fetch API Requests: GET, POST, PUT & DELETE", activity_type: "exercise", estimated_minutes: 75 },
            { title: "Weather API Integration App Project", activity_type: "project", estimated_minutes: 120 },
          ],
        },
        {
          title: "React Component Architecture & State Management",
          description: "Build declarative component hierarchies, JSX syntax, props flow, local state with useState, and form handling.",
          rationale: "The dominant frontend library for scalable user interface development.",
          activities: [
            { title: "JSX Syntax & Declarative UI Paradigm", activity_type: "concept", estimated_minutes: 45 },
            { title: "Component Composition & Props Data Flow", activity_type: "exercise", estimated_minutes: 45 },
            { title: "Local Component State & useState Patterns", activity_type: "exercise", estimated_minutes: 60 },
            { title: "Controlled Inputs & Form Submission Handling", activity_type: "exercise", estimated_minutes: 60 },
            { title: "Interactive React Task Management Project", activity_type: "project", estimated_minutes: 120 },
          ],
        },
        {
          title: "React Lifecycle Side Effects & Advanced Hooks",
          description: "Master useEffect lifecycle triggers, custom hooks abstraction, useRef, useMemo, and Context API global state.",
          rationale: "Enables predictable state management and clean component code reuse.",
          activities: [
            { title: "useEffect Dependencies & Clean-up Handlers", activity_type: "concept", estimated_minutes: 60 },
            { title: "Custom React Hooks Abstraction & Data Fetching", activity_type: "exercise", estimated_minutes: 75 },
            { title: "useRef Hook for DOM References & Persistent Values", activity_type: "exercise", estimated_minutes: 45 },
            { title: "Context API for Global State Sharing", activity_type: "concept", estimated_minutes: 75 },
            { title: "E-Commerce Cart State React Application Project", activity_type: "project", estimated_minutes: 150 },
          ],
        },
        {
          title: "Next.js App Router, Server Components & Actions",
          description: "Build full-stack React applications using Next.js App Router, Server Components, Route Handlers, and Server Actions.",
          rationale: "Combines client rendering with server-side performance and backend API integration.",
          activities: [
            { title: "Next.js App Router Directory Conventions & Layouts", activity_type: "concept", estimated_minutes: 45 },
            { title: "React Server Components vs Client Components", activity_type: "concept", estimated_minutes: 60 },
            { title: "Next.js Route Handlers & API Endpoints", activity_type: "exercise", estimated_minutes: 75 },
            { title: "Server Actions for Form Mutations", activity_type: "exercise", estimated_minutes: 75 },
            { title: "Full-Stack Next.js Blog & Content Platform Project", activity_type: "project", estimated_minutes: 150 },
          ],
        },
        {
          title: "PostgreSQL Database Schema Design & Supabase RLS",
          description: "Design relational SQL schemas, foreign key constraints, indexes, and implement granular Supabase Row Level Security.",
          rationale: "Provides multi-tenant data isolation and secure backend storage.",
          activities: [
            { title: "Relational Database Modeling & Normalization Rules", activity_type: "concept", estimated_minutes: 60 },
            { title: "PostgreSQL SQL Queries: DDL, DML & Join Operations", activity_type: "exercise", estimated_minutes: 75 },
            { title: "Supabase Client Integration & Database Triggers", activity_type: "exercise", estimated_minutes: 75 },
            { title: "Granular Row Level Security (RLS) Policy Crafting", activity_type: "concept", estimated_minutes: 90 },
            { title: "Secure Multi-Tenant Database Project", activity_type: "project", estimated_minutes: 150 },
          ],
        },
        {
          title: "Full-Stack Capstone Deployment & CI/CD Workflows",
          description: "Build an end-to-end full-stack web app, implement authentication, automated testing, and deploy on Vercel.",
          rationale: "Fulfills your target outcome of building production-grade web applications.",
          activities: [
            { title: "Full-Stack Application Architecture Planning", activity_type: "concept", estimated_minutes: 60 },
            { title: "Authentication Flow & Session Guard Implementation", activity_type: "exercise", estimated_minutes: 90 },
            { title: "Unit & Integration Testing Workflows", activity_type: "exercise", estimated_minutes: 90 },
            { title: "Production Vercel Deployment & Environment Configuration", activity_type: "project", estimated_minutes: 150 },
            { title: "Full-Stack Capstone Project Code Review & Reflection", activity_type: "reflection", estimated_minutes: 45 },
          ],
        },
      ]
    } else {
      // Advanced Web Dev
      rawModules = [
        {
          title: "Advanced Next.js Architecture & Edge Infrastructure",
          description: "Implement streaming SSR, middleware proxying, ISR caching strategies, and edge runtime optimizations.",
          rationale: "Pushes existing web knowledge into enterprise performance engineering.",
          activities: [
            { title: "React Suspense & Streaming SSR Hydration Boundaries", activity_type: "concept", estimated_minutes: 60 },
            { title: "Edge Middleware Proxying & Dynamic Rate Limiting", activity_type: "exercise", estimated_minutes: 90 },
            { title: "Incremental Static Regeneration (ISR) Caching Strategies", activity_type: "exercise", estimated_minutes: 75 },
            { title: "Enterprise Next.js Performance Capstone Project", activity_type: "project", estimated_minutes: 180 },
          ],
        },
        {
          title: "Distributed Backend Microservices & Message Queues",
          description: "Design event-driven microservices, RabbitMQ/Kafka queues, Redis caching, and gRPC communication.",
          rationale: "Teaches backend scaling techniques for high-concurrency systems.",
          activities: [
            { title: "Event-Driven Microservices Architecture", activity_type: "concept", estimated_minutes: 60 },
            { title: "Redis In-Memory Caching & Session Management", activity_type: "exercise", estimated_minutes: 90 },
            { title: "Message Queue Integration with RabbitMQ / Redis Streams", activity_type: "exercise", estimated_minutes: 90 },
            { title: "High-Throughput Distributed System Project", activity_type: "project", estimated_minutes: 180 },
          ],
        },
      ]
    }
  }
  // ============================================================================
  // 3. OTHER GENERAL / DOMAIN-SPECIFIC CURRICULUM TRAJECTORY
  // ============================================================================
  else {
    rawModules = [
      {
        title: `${goal} — Core Conceptual Foundations`,
        description: `Establish essential terminology, foundational theories, and baseline mechanics for ${goal}.`,
        rationale: `Tailored for your baseline skill level of ${level}.`,
        activities: [
          { title: `${goal} Core Terminology & Fundamental Rules`, activity_type: "concept", estimated_minutes: 45 },
          { title: `Environment Setup & Tooling Configuration`, activity_type: "exercise", estimated_minutes: 45 },
          { title: `Guided Practice: Basic Syntax & Operations`, activity_type: "exercise", estimated_minutes: 60 },
          { title: `Starter Practical Application Project`, activity_type: "project", estimated_minutes: 90 },
          { title: "Foundations Mastery Reflection", activity_type: "reflection", estimated_minutes: 20 },
        ],
      },
      {
        title: `${goal} — Intermediate Workflows & Methodologies`,
        description: `Develop practical problem-solving skills, structured design patterns, and standard industry workflows.`,
        rationale: "Transitions foundational knowledge into functional practical capability.",
        activities: [
          { title: "Core Design Patterns & System Structure", activity_type: "concept", estimated_minutes: 45 },
          { title: "Intermediate Hands-On Feature Implementation", activity_type: "exercise", estimated_minutes: 60 },
          { title: "Error Isolation & Quality Assurance Practice", activity_type: "exercise", estimated_minutes: 60 },
          { title: "Intermediate Practical Feature Project", activity_type: "project", estimated_minutes: 120 },
          { title: "Workflow Checkpoint Review", activity_type: "reflection", estimated_minutes: 25 },
        ],
      },
      {
        title: `${goal} — Advanced Integration & Optimization`,
        description: `Apply advanced techniques, performance tuning, security practices, and comprehensive system integration.`,
        rationale: `Directly aligned with your target outcome: "${outcome}".`,
        activities: [
          { title: "Advanced System Optimization & Performance Tuning", activity_type: "concept", estimated_minutes: 60 },
          { title: "Security Protocols & Architecture Integration", activity_type: "exercise", estimated_minutes: 75 },
          { title: "Full Portfolio Capstone Implementation", activity_type: "project", estimated_minutes: 180 },
          { title: "Target Outcome Verification Reflection", activity_type: "reflection", estimated_minutes: 30 },
        ],
      },
    ]
  }

  // ============================================================================
  // DETERMINISTIC DAY SCHEDULING LOOP & EXACT DURATION SUMMATION
  // ============================================================================
  let currentDay = 1
  let currentDayAccumulated = 0

  const modules: GeneratedModule[] = rawModules.map((m, mIdx) => {
    const activities: GeneratedActivity[] = m.activities.map((a, aIdx) => {
      const estMins = a.estimated_minutes || 30

      // If adding this activity exceeds dailyBudget, start a new day
      if (currentDayAccumulated > 0 && currentDayAccumulated + estMins > dailyBudget) {
        currentDay += 1
        currentDayAccumulated = 0
      }

      const assignedDay = currentDay
      currentDayAccumulated += estMins

      return {
        title: a.title,
        activity_type: a.activity_type,
        sequence_order: aIdx + 1,
        estimated_minutes: estMins,
        day_number: assignedDay,
      }
    })

    // Strict rule: module.estimated_minutes MUST EQUAL sum(activity.estimated_minutes)
    const estimated_minutes = sumActivityMinutes(activities)

    return {
      title: m.title,
      description: m.description,
      rationale: m.rationale,
      sequence_order: mIdx + 1,
      estimated_minutes,
      activities,
    }
  })

  return {
    title: planTitle,
    goal_summary: goalSummary,
    modules,
  }
}
