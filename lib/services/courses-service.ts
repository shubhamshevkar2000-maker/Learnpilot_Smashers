import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

export type CourseDifficulty = "Beginner" | "Intermediate" | "Advanced"
export type CourseLessonType = "concept" | "exercise" | "project" | "reflection"

export interface CourseLesson {
  id: string
  course_id: string
  title: string
  lesson_type: CourseLessonType
  sequence_order: number
  estimated_minutes: number
  is_completed?: boolean
  objective: string
  concept_guide: string
  code_example?: string
  code_explanation?: string
  practical_exercise: string
  checkpoint_question: string
  checkpoint_options?: string[]
  checkpoint_correct_index?: number
  checkpoint_explanation?: string
}

export interface Course {
  id: string
  title: string
  description: string
  category: string
  difficulty: CourseDifficulty
  estimated_minutes: number
  domain: "data_analytics" | "full_stack" | "ui_ux" | "devops" | "cybersecurity" | "general"
  isRecommended?: boolean
  recommendation_reason?: string
  lessons: CourseLesson[]
}

export interface UserCourseProgress {
  course_id: string
  completed_lesson_ids: string[]
  total_lessons: number
  completed_lessons: number
  progress_percentage: number
}

// ============================================================================
// DOMAIN 1: DATA ANALYTICS & DATA SCIENCE COURSES
// ============================================================================
export const DATA_ANALYTICS_COURSES: Course[] = [
  {
    id: "course-py-data-analysis",
    title: "Python for Data Analysis & Pandas",
    description: "Master Python data structures, Pandas DataFrames, NumPy array vectorization, data cleaning, and exploratory data analysis (EDA).",
    category: "data_science",
    domain: "data_analytics",
    difficulty: "Beginner",
    estimated_minutes: 150,
    lessons: [
      {
        id: "py-data-l1",
        course_id: "course-py-data-analysis",
        title: "Python Data Structures & NumPy Vectorization",
        lesson_type: "concept",
        sequence_order: 1,
        estimated_minutes: 20,
        objective: "Understand memory layout of Python lists versus NumPy vectorized N-dimensional arrays for high-performance data computation.",
        concept_guide: `Python is the leading language for Data Analytics and Data Science. Standard Python lists store pointers to objects scattered across system memory, introducing iteration overhead during mathematical calculations.

NumPy (Numerical Python) introduces contiguous memory array structures (\`ndarray\`) that execute operations in compiled C routines. Vectorization allows applying mathematical operations across entire datasets simultaneously without explicit slow Python \`for\` loops!`,
        code_example: `import numpy as np

# Create 1D array of sales figures
sales = np.array([1200, 1450, 980, 2100, 1750])

# Vectorized operation: 10% tax calculation on all sales
tax_amount = sales * 0.10
total_sales = sales + tax_amount

print(f"Mean Sale: USD {np.mean(sales):.2f}")
print(f"Total Revenue with Tax: USD {np.sum(total_sales):.2f}")`,
        code_explanation: "Demonstrates vectorized element-wise multiplication and summary statistical operations (mean, sum) using NumPy.",
        practical_exercise: "Create a NumPy array containing monthly customer acquisition counts for 12 months. Calculate total annual acquisitions, monthly average, and find months exceeding 1,000 customers using boolean indexing.",
        checkpoint_question: "Why is NumPy array vectorization significantly faster than standard Python list iteration?",
        checkpoint_options: [
          "NumPy automatically uploads data to remote GPU cloud servers.",
          "NumPy stores homogeneous data in contiguous memory blocks and executes vectorized operations in compiled C routines.",
          "Standard Python lists encrypt variables during loops.",
          "NumPy converts numbers into text strings before computing."
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "Contiguous memory layout and compiled C vectorization allow NumPy to execute array operations without loop interpreter overhead."
      },
      {
        id: "py-data-l2",
        course_id: "course-py-data-analysis",
        title: "Pandas DataFrames & Data Manipulation",
        lesson_type: "exercise",
        sequence_order: 2,
        estimated_minutes: 25,
        objective: "Load structured CSV datasets into Pandas DataFrames, inspect schema metadata, and query rows using loc and iloc.",
        concept_guide: `Pandas is the core library for tabular data manipulation. A DataFrame is a two-dimensional labeled data structure with columns of potentially different types, similar to a spreadsheet or SQL table.

Indexing Methods:
- \`df.loc[row_indexer, col_indexer]\`: Label-based indexing using row index values and column header names.
- \`df.iloc[row_indexer, col_indexer]\`: Positional integer-based indexing (0 to N-1).

Filtering Data:
Pandas uses boolean indexing (\`df[df['age'] > 30]\`) to extract subsets meeting explicit filtering criteria.`,
        code_example: `import pandas as pd

# Read customer transaction dataset
df = pd.read_csv('transactions.csv')

# Inspect top 5 rows and summary statistics
print(df.head())
print(df.info())

# Filter high-value customer transactions
high_value = df[df['amount'] >= 500.0]
regional_summary = high_value.groupby('region')['amount'].sum()

print(regional_summary)`,
        code_explanation: "Loads a CSV file, inspects data types, performs boolean filtering for transactions >= $500, and aggregates totals by region.",
        practical_exercise: "Load a sample sales DataFrame, drop rows with missing values, filter orders placed in 2026, and calculate total revenue grouped by product category.",
        checkpoint_question: "Which Pandas method is used for label-based row and column selection?",
        checkpoint_options: [
          "df.iloc[]",
          "df.loc[]",
          "df.select[]",
          "df.filter_by[]"
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "df.loc[] performs label-based indexing using explicit index labels and column names."
      },
      {
        id: "py-data-l3",
        course_id: "course-py-data-analysis",
        title: "Data Cleaning, Imputation & Reshaping",
        lesson_type: "concept",
        sequence_order: 3,
        estimated_minutes: 25,
        objective: "Handle missing null values (NaN), detect duplicate records, retype data columns, and apply pivot tables.",
        concept_guide: `Real-world raw data is messy, incomplete, and noisy. Data Cleaning typically consumes 60-80% of a Data Analyst's daily time budget!

Missing Value Strategies:
1. Drop Missing Data (\`dropna()\`) when missingness is completely random and small (< 5%).
2. Impute Values (\`fillna()\`) using column mean, median (for skewed distributions), or mode for categorical features.

Duplicate Handling: \`df.drop_duplicates()\` ensures transactional uniqueness.
Pivot Tables: \`df.pivot_table()\` reshapes long format data into wide summary matrices.`,
        code_example: `# Check missing value counts
print(df.isnull().sum())

# Fill missing numerical income with median value
median_income = df['income'].median()
df['income'] = df['income'].fillna(median_income)

# Remove duplicate customer records
df_clean = df.drop_duplicates(subset=['customer_id'])

# Create pivot table comparing segment vs churn rate
pivot = df_clean.pivot_table(index='segment', values='churned', aggfunc='mean')
print(pivot)`,
        code_explanation: "Demonstrates checking null counts, median imputation, removing duplicates based on unique customer ID, and pivoting summary statistics.",
        practical_exercise: "Given an employee dataset with null salary entries, impute missing salaries using department median values and output a summary pivot table of average tenure by department.",
        checkpoint_question: "Why is median imputation preferred over mean imputation for skewed income datasets containing outliers?",
        checkpoint_options: [
          "Because mean imputation deletes the column automatically.",
          "Because extreme outlier values heavily distort the mean, while the median reflects the robust central tendency.",
          "Because median works only on text strings.",
          "Because mean imputation requires installing extra R libraries."
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "The median is robust against extreme outliers that skew arithmetic mean calculations."
      },
      {
        id: "py-data-l4",
        course_id: "course-py-data-analysis",
        title: "Exploratory Data Analysis (EDA) Capstone Project",
        lesson_type: "project",
        sequence_order: 4,
        estimated_minutes: 30,
        objective: "Perform an end-to-end Exploratory Data Analysis workflow to uncover business insights and anomaly patterns.",
        concept_guide: `Exploratory Data Analysis (EDA) is an iterative approach to analyzing datasets to summarize main statistical characteristics, uncover underlying patterns, spot anomalies, and test hypotheses before building predictive models or executive dashboards.`,
        code_example: `# Exploratory Summary Pipeline
def run_eda(dataframe):
    summary = {
        "shape": dataframe.shape,
        "missing_pct": (dataframe.isnull().sum() / len(dataframe)) * 100,
        "numeric_stats": dataframe.describe()
    }
    return summary`,
        code_explanation: "Modular EDA helper returning dataset shape, missing value percentages, and key statistical quantiles.",
        practical_exercise: "Perform EDA on a retail sales dataset to identify top 3 revenue-generating product lines and seasonal monthly trends.",
        checkpoint_question: "What is the primary objective of Exploratory Data Analysis (EDA)?",
        checkpoint_options: [
          "To format CSS buttons on a web page.",
          "To summarize key statistical properties, detect anomalies, and uncover business patterns in data.",
          "To encrypt database passwords.",
          "To build mobile iOS applications."
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "EDA aims to understand data structure, distributions, missingness, and underlying patterns."
      }
    ]
  },
  {
    id: "course-sql-analytics",
    title: "SQL & Relational Querying for Analytics",
    description: "Master relational database models, SELECT querying, WHERE filtering, GROUP BY aggregations, JOINs, subqueries, and window functions.",
    category: "database",
    domain: "data_analytics",
    difficulty: "Beginner",
    estimated_minutes: 140,
    lessons: [
      {
        id: "sql-an-l1",
        course_id: "course-sql-analytics",
        title: "Relational Concepts & SELECT Query Filtering",
        lesson_type: "concept",
        sequence_order: 1,
        estimated_minutes: 20,
        objective: "Understand relational table schemas, primary/foreign keys, SELECT column projections, and WHERE logical filters.",
        concept_guide: `SQL (Structured Query Language) is the universal language for querying relational database management systems (RDBMS) like PostgreSQL, MySQL, and Snowflake.

Relational Structure:
- Entity Tables store records in rows and attributes in columns.
- Primary Key (PK): Uniquely identifies each row in a table.
- Foreign Key (FK): Establishes relational links between tables.

Query Execution Order:
\`FROM\` → \`WHERE\` → \`GROUP BY\` → \`HAVING\` → \`SELECT\` → \`ORDER BY\` → \`LIMIT\`.
Understanding execution order is crucial for writing performant queries!`,
        code_example: `SELECT 
  customer_id,
  first_name,
  last_name,
  signup_date
FROM customers
WHERE signup_date >= '2026-01-01'
  AND status = 'Active'
ORDER BY signup_date DESC
LIMIT 10;`,
        code_explanation: "Filters active customers who signed up in 2026, sorts by newest signup date, and limits results to 10 rows.",
        practical_exercise: "Write a SQL query selecting `order_id`, `customer_id`, and `total_amount` from an `orders` table where order status is 'Completed' and total_amount exceeds $150.",
        checkpoint_question: "In standard SQL query processing, which clause is evaluated FIRST by the database engine?",
        checkpoint_options: [
          "SELECT",
          "ORDER BY",
          "FROM",
          "WHERE"
        ],
        checkpoint_correct_index: 2,
        checkpoint_explanation: "The database engine first evaluates FROM to identify source tables before filtering rows with WHERE."
      },
      {
        id: "sql-an-l2",
        course_id: "course-sql-analytics",
        title: "Aggregations & GROUP BY Summarization",
        lesson_type: "exercise",
        sequence_order: 2,
        estimated_minutes: 25,
        objective: "Summarize metrics using aggregate functions (SUM, AVG, COUNT, MIN, MAX) and filter aggregated groups with HAVING.",
        concept_guide: `Aggregate functions compute a single summary value from a set of values in a column.

Key Aggregate Functions:
- \`COUNT(*)\` / \`COUNT(DISTINCT col)\`: Counts total rows or unique values.
- \`SUM(col)\` & \`AVG(col)\`: Calculates numeric totals and averages.

\`GROUP BY\` groups rows sharing common values into summary rows.
Crucial distinction: Use \`WHERE\` to filter individual rows BEFORE grouping; use \`HAVING\` to filter summary groups AFTER aggregation!`,
        code_example: `SELECT 
  region,
  COUNT(order_id) AS total_orders,
  ROUND(AVG(order_value), 2) AS avg_order_value,
  SUM(order_value) AS total_revenue
FROM sales_records
WHERE status = 'Shipped'
GROUP BY region
HAVING SUM(order_value) >= 50000.00
ORDER BY total_revenue DESC;`,
        code_explanation: "Groups shipped sales by region, computes order counts and revenue metrics, and filters regions with revenue >= $50,000 using HAVING.",
        practical_exercise: "Write a SQL query grouping employees by department to find department headcounts and average salary, keeping only departments with more than 5 employees.",
        checkpoint_question: "What is the difference between WHERE and HAVING clauses in SQL?",
        checkpoint_options: [
          "WHERE filters rows before grouping; HAVING filters aggregated groups after GROUP BY execution.",
          "WHERE works only on numbers; HAVING works only on dates.",
          "HAVING executes before FROM.",
          "There is no difference; they are aliases."
        ],
        checkpoint_correct_index: 0,
        checkpoint_explanation: "WHERE filters raw individual records prior to aggregation; HAVING filters aggregated summary rows."
      },
      {
        id: "sql-an-l3",
        course_id: "course-sql-analytics",
        title: "Multi-Table JOINs & Entity Relationships",
        lesson_type: "exercise",
        sequence_order: 3,
        estimated_minutes: 25,
        objective: "Combine data across multiple tables using INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN.",
        concept_guide: `Relational normalization stores entities across separate tables to prevent redundancy. JOIN operations reconstruct unified datasets at query time using foreign key references.

Types of JOINs:
1. INNER JOIN: Returns only rows where matching keys exist in BOTH tables.
2. LEFT JOIN: Returns ALL rows from the left table and matching rows from the right table (filling NULLs when no match exists).
3. RIGHT JOIN: Returns ALL rows from right table and matching left rows.
4. FULL OUTER JOIN: Returns all rows from both tables regardless of matching.`,
        code_example: `SELECT 
  c.customer_id,
  c.email,
  o.order_id,
  o.order_date,
  o.total_amount
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_date >= '2026-01-01';`,
        code_explanation: "Performs an INNER JOIN matching customer profiles with orders placed in 2026 using customer_id keys.",
        practical_exercise: "Write a SQL LEFT JOIN query displaying all product names and their total sales quantities, ensuring products with zero sales are still listed with NULL or 0.",
        checkpoint_question: "Which JOIN type guarantees that ALL records from the left table are preserved even if no matching row exists in the right table?",
        checkpoint_options: [
          "INNER JOIN",
          "LEFT JOIN",
          "CROSS JOIN",
          "SELF JOIN"
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "LEFT JOIN preserves every record from the left table, supplying NULL values for unmatched right table columns."
      },
      {
        id: "sql-an-l4",
        course_id: "course-sql-analytics",
        title: "Advanced Analytic Window Functions",
        lesson_type: "project",
        sequence_order: 4,
        estimated_minutes: 30,
        objective: "Compute running totals, moving averages, and ranks across row partitions using OVER(), PARTITION BY, and ROW_NUMBER()/RANK().",
        concept_guide: `Window Functions perform calculations across a set of table rows related to the current row without collapsing rows into a single summary output (unlike GROUP BY).

Syntax: \`FUNCTION() OVER (PARTITION BY col ORDER BY col)\`

Common Analytic Functions:
- \`ROW_NUMBER()\`: Assigns sequential unique integers to rows within a partition.
- \`RANK()\`: Assigns ranks with gaps on tied values.
- \`DENSE_RANK()\`: Assigns ranks without skipping numbers.
- \`SUM(val) OVER (PARTITION BY dept ORDER BY date)\`: Calculates cumulative running totals!`,
        code_example: `SELECT 
  employee_id,
  department,
  salary,
  DENSE_RANK() OVER (
    PARTITION BY department 
    ORDER BY salary DESC
  ) AS salary_rank,
  SUM(salary) OVER (
    PARTITION BY department
  ) AS total_dept_spend
FROM employees;`,
        code_explanation: "Ranks employees by salary within each department and calculates total department spend without collapsing individual employee rows.",
        practical_exercise: "Write a SQL query using `ROW_NUMBER()` to select the single most recent order placed by each customer.",
        checkpoint_question: "Unlike GROUP BY, how do Window Functions affect the number of rows returned in a query result set?",
        checkpoint_options: [
          "Window functions collapse all rows into 1 summary row.",
          "Window functions preserve all original detail rows while attaching calculated partition values.",
          "Window functions automatically delete duplicate rows.",
          "Window functions double the total row count."
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "Window functions append computed aggregate values to every row without reducing or grouping the original dataset."
      }
    ]
  },
  {
    id: "course-stats-data-analysis",
    title: "Statistics & Probability for Data Science",
    description: "Understand descriptive statistics, probability distributions, central limit theorem, hypothesis testing, p-values, and A/B testing.",
    category: "statistics",
    domain: "data_analytics",
    difficulty: "Intermediate",
    estimated_minutes: 130,
    lessons: [
      {
        id: "stats-l1",
        course_id: "course-stats-data-analysis",
        title: "Descriptive Metrics, Variance & Distributions",
        lesson_type: "concept",
        sequence_order: 1,
        estimated_minutes: 20,
        objective: "Calculate measures of central tendency (mean, median, mode) and dispersion (range, variance, standard deviation, IQR).",
        concept_guide: `Descriptive statistics quantitatively summarize features of a collected dataset.

Central Tendency:
- Mean: Arithmetic average. Sensitive to extreme outliers.
- Median: Middle value of ordered data. Robust to skewness.
- Mode: Most frequently occurring value.

Dispersion & Variance:
- Variance (\`σ²\`): Average squared deviation from the mean.
- Standard Deviation (\`σ\`): Square root of variance, expressed in original data units.
- Interquartile Range (IQR): Difference between 75th (Q3) and 25th (Q1) percentiles.`,
        code_example: `import scipy.stats as stats
import numpy as np

data = np.array([23, 25, 28, 32, 35, 38, 42, 95]) # Contains outlier 95

print(f"Mean: {np.mean(data):.1f}")     # 39.8 (inflated)
print(f"Median: {np.median(data):.1f}") # 30.0 (robust)
print(f"Std Dev: {np.std(data):.1f}")   # 21.6
print(f"IQR: {stats.iqr(data):.1f}")    # 10.8`,
        code_explanation: "Calculates summary metrics highlighting how mean is inflated by outlier 95 compared to median and IQR.",
        practical_exercise: "Calculate mean, median, standard deviation, and IQR for a dataset of customer delivery times and interpret whether the distribution is right-skewed.",
        checkpoint_question: "Which measure of dispersion represents the distance between the 25th and 75th percentiles of a dataset?",
        checkpoint_options: [
          "Standard Deviation",
          "Interquartile Range (IQR)",
          "Variance",
          "Standard Error"
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "The Interquartile Range (IQR = Q3 - Q1) measures the middle 50% spread of a dataset."
      },
      {
        id: "stats-l2",
        course_id: "course-stats-data-analysis",
        title: "Hypothesis Testing & A/B Experimentation",
        lesson_type: "exercise",
        sequence_order: 2,
        estimated_minutes: 25,
        objective: "Formulate null (H₀) and alternative (H₁) hypotheses, execute two-sample t-tests, and evaluate p-values against significance thresholds (α = 0.05).",
        concept_guide: `Hypothesis Testing is a statistical framework for determining whether observed sample differences represent true underlying effects or random chance.

A/B Testing Framework:
- Null Hypothesis (H₀): No difference exists between Control (A) and Treatment (B) variants.
- Alternative Hypothesis (H₁): Treatment (B) produces a statistically significant change.
- p-value: Probability of observing sample results as extreme as measured assuming H₀ is true.
- Alpha Threshold (α = 0.05): If p-value < 0.05, reject H₀ in favor of H₁!`,
        code_example: `from scipy import stats

# Conversion rates for Control (A) vs New Feature (B)
control = [1, 0, 0, 1, 0, 1, 0, 0, 1, 0] # 40% conversion
variant = [1, 1, 0, 1, 1, 1, 0, 1, 1, 0] # 70% conversion

# Perform Independent 2-Sample T-Test
t_stat, p_val = stats.ttest_ind(control, variant)

print(f"P-value: {p_val:.4f}")
if p_val < 0.05:
    print("Statistically significant result: Launch Variant B!")
else:
    print("Fail to reject H₀: Insufficient evidence.")`,
        code_explanation: "Executes a two-sample t-test comparing conversion results and evaluates p-value against 0.05 alpha threshold.",
        practical_exercise: "Run an A/B test analysis comparing email click-through rates between Subject Line A and Subject Line B using SciPy t-test functions.",
        checkpoint_question: "If an A/B experiment yields a p-value of 0.02 with an alpha threshold of 0.05, what conclusion should the analyst draw?",
        checkpoint_options: [
          "Accept the null hypothesis that no difference exists.",
          "Reject the null hypothesis; the observed variant improvement is statistically significant.",
          "Discard all data and restart the test.",
          "Increase the p-value to 0.10."
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "A p-value less than alpha (0.02 < 0.05) provides sufficient statistical evidence to reject H₀."
      }
    ]
  }
]

// ============================================================================
// DOMAIN 2: FULL-STACK & WEB ENGINEERING COURSES
// ============================================================================
export const FULL_STACK_COURSES: Course[] = [
  {
    id: "course-html-css",
    title: "HTML & CSS Foundations",
    description: "Master modern HTML5 semantics, accessibility standards, Flexbox/Grid spatial layouts, and responsive CSS architecture.",
    category: "frontend",
    domain: "full_stack",
    difficulty: "Beginner",
    estimated_minutes: 145,
    lessons: [
      {
        id: "html-css-l1",
        course_id: "course-html-css",
        title: "HTML5 Document Structure & Syntax Rules",
        lesson_type: "concept",
        sequence_order: 1,
        estimated_minutes: 20,
        objective: "Master standard HTML5 document syntax, doctype declarations, head metadata, and tag nesting hierarchy.",
        concept_guide: `HTML (HyperText Markup Language) provides the fundamental structural blueprint of every webpage on the internet. Browsers parse HTML documents from top to bottom, constructing a Document Object Model (DOM) tree in memory.

The <!DOCTYPE html> declaration informs the browser engine that the document complies with modern HTML5 specs, preventing legacy quirks mode.`,
        code_example: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HTML5 Structure</title>
</head>
<body>
  <h1>LearnPilot Web Architecture</h1>
</body>
</html>`,
        code_explanation: "Demonstrates standard HTML5 document boilerplate structure.",
        practical_exercise: "Create an HTML file with semantic header, main, and footer tags.",
        checkpoint_question: "Why is <!DOCTYPE html> placed on line 1 of an HTML document?",
        checkpoint_options: [
          "To speed up images.",
          "To inform the browser to use standard HTML5 rendering rules.",
          "To connect to Supabase database.",
          "To enable dark mode CSS."
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "It signals HTML5 standard rendering mode to browser engines."
      }
    ]
  },
  {
    id: "course-javascript-fundamentals",
    title: "JavaScript Fundamentals & Async Control",
    description: "Deep dive into ES6+ syntax, functions, closures, DOM manipulation, promises, async/await, and event handling.",
    category: "javascript",
    domain: "full_stack",
    difficulty: "Beginner",
    estimated_minutes: 140,
    lessons: [
      {
        id: "js-fund-l1",
        course_id: "course-javascript-fundamentals",
        title: "ES6+ Syntax, Let/Const & Scoping Rules",
        lesson_type: "concept",
        sequence_order: 1,
        estimated_minutes: 20,
        objective: "Understand block scoping, temporal dead zone, and const immutability rules.",
        concept_guide: `ES6 introduced let and const for block-scoped variable declarations, eliminating var function-hoisting quirks.`,
        code_example: `const user = { name: "Alex" };
user.name = "Sam"; // Valid mutation

let count = 1;
count = 2; // Valid reassignment`,
        code_explanation: "Demonstrates block-scoped const object mutation vs let reassignment.",
        practical_exercise: "Write a function returning a template literal string summary using const and let variables.",
        checkpoint_question: "What happens when reassigning a const variable?",
        checkpoint_options: [
          "Converts to let silently.",
          "Throws a TypeError at runtime.",
          "Returns null.",
          "Reloads the page."
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "Reassigning a const identifier triggers a TypeError."
      }
    ]
  },
  {
    id: "course-react-architecture",
    title: "React & Component Architecture",
    description: "Build declarative component hierarchies, props flow, useState, useEffect side effects, custom hooks, and predictable state.",
    category: "frontend",
    domain: "full_stack",
    difficulty: "Intermediate",
    estimated_minutes: 160,
    lessons: [
      {
        id: "react-l1",
        course_id: "course-react-architecture",
        title: "Declarative Components & JSX Syntax Rules",
        lesson_type: "concept",
        sequence_order: 1,
        estimated_minutes: 20,
        objective: "Understand Virtual DOM reconciliation and declarative component rendering.",
        concept_guide: `React uses a virtual DOM tree in memory to calculate minimal UI diff updates.`,
        code_example: `export function AppCard({ title }: { title: string }) {
  return <div className="card"><h3>{title}</h3></div>;
}`,
        code_explanation: "Functional component returning JSX markup.",
        practical_exercise: "Build a custom React badge component accepting status props.",
        checkpoint_question: "Why must JSX components return a single root element?",
        checkpoint_options: [
          "For 3D graphics.",
          "Because JSX transpiles into React.createElement function calls expecting one parent node.",
          "To enable SSL encryption.",
          "To format CSS fonts."
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "JSX compiles to function calls expecting a single root expression."
      }
    ]
  }
]

// ============================================================================
// DOMAIN 3: UI/UX DESIGN COURSES
// ============================================================================
export const UI_UX_COURSES: Course[] = [
  {
    id: "course-ux-research",
    title: "UX Research & User Discovery",
    description: "Master qualitative user interviews, persona creation, empathy maps, journey mapping, and problem framing.",
    category: "design",
    domain: "ui_ux",
    difficulty: "Beginner",
    estimated_minutes: 120,
    lessons: [
      {
        id: "ux-res-l1",
        course_id: "course-ux-research",
        title: "User Interviewing & Qualitative Discovery",
        lesson_type: "concept",
        sequence_order: 1,
        estimated_minutes: 20,
        objective: "Design non-leading user interview protocols to uncover core user pain points and motivations.",
        concept_guide: `UX Research establishes user needs before building products. Qualitative user interviews focus on understanding behaviors, attitudes, and friction points through open-ended questions.`,
        code_example: `/* Non-Leading Interview Protocol */
Bad: "Did you find our navigation menu confusing?"
Good: "Walk me through how you attempted to find course information on the homepage."`,
        code_explanation: "Contrasts leading biased questions against open behavioral prompt techniques.",
        practical_exercise: "Draft a 5-question qualitative interview script for testing a new mobile learning app onboarding flow.",
        checkpoint_question: "Why should UX researchers avoid leading questions during user interviews?",
        checkpoint_options: [
          "Leading questions slow down audio recording.",
          "Leading questions bias participant answers toward expected responses, invalidating real user insights.",
          "Leading questions require legal contracts.",
          "Leading questions disable Figma prototypes."
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "Leading questions introduce confirmation bias and obscure true user behaviors."
      }
    ]
  },
  {
    id: "course-figma-design-systems",
    title: "Figma & UI Design Systems",
    description: "Construct scalable Figma component libraries, auto-layout spatial constraints, design tokens, and variants.",
    category: "design",
    domain: "ui_ux",
    difficulty: "Intermediate",
    estimated_minutes: 135,
    lessons: [
      {
        id: "figma-l1",
        course_id: "course-figma-design-systems",
        title: "Auto Layout & Spatial Layout Physics",
        lesson_type: "exercise",
        sequence_order: 1,
        estimated_minutes: 25,
        objective: "Apply Figma Auto Layout padding, gap distribution, and fill-container responsiveness.",
        concept_guide: `Auto Layout in Figma mirrors CSS Flexbox. It allows UI components to resize dynamically based on text content and container constraints.`,
        code_example: `Figma Auto Layout Specs:
Direction: Vertical Column
Padding: 24px Top/Bottom, 32px Left/Right
Gap: 16px
Child Constraints: Fill Container (Horizontal)`,
        code_explanation: "Translates responsive component layout rules into Figma Auto Layout parameters.",
        practical_exercise: "Build a responsive button component in Figma with default, hover, and disabled state variants using Auto Layout.",
        checkpoint_question: "Which Figma Auto Layout setting allows a child frame to expand fluidly with its parent container width?",
        checkpoint_options: [
          "Fixed Width",
          "Fill Container",
          "Hug Contents",
          "Absolute Position"
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "Fill Container causes child layers to adapt fluidly to parent frame dimensions."
      }
    ]
  }
]

// ============================================================================
// DOMAIN 4: CLOUD & DEVOPS COURSES
// ============================================================================
export const DEVOPS_COURSES: Course[] = [
  {
    id: "course-docker-containers",
    title: "Docker & Container Architecture",
    description: "Build lightweight container images, multi-stage Dockerfiles, port mappings, volumes, and Docker Compose environments.",
    category: "devops",
    domain: "devops",
    difficulty: "Intermediate",
    estimated_minutes: 130,
    lessons: [
      {
        id: "docker-l1",
        course_id: "course-docker-containers",
        title: "Container Concepts & Dockerfile Instructions",
        lesson_type: "concept",
        sequence_order: 1,
        estimated_minutes: 20,
        objective: "Understand OS-level virtualization, container image layering, and Dockerfile commands.",
        concept_guide: `Containers package code and all dependencies into lightweight isolated execution environments. Unlike virtual machines, containers share the host OS kernel.`,
        code_example: `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]`,
        code_explanation: "Multi-layer Dockerfile for a production Node.js application.",
        practical_exercise: "Write a Dockerfile for a Python FastAPI microservice specifying base image, workdir, dependency installation, and start command.",
        checkpoint_question: "What is the primary difference between a Docker container and a traditional Virtual Machine (VM)?",
        checkpoint_options: [
          "VMs run faster than containers.",
          "Containers share the host OS kernel without needing full guest operating systems per instance.",
          "Containers require dedicated hardware servers.",
          "VMs do not use disk space."
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "Containers virtualize at the OS layer sharing host kernel resources, making them faster and lighter than full VMs."
      }
    ]
  }
]

// ============================================================================
// DOMAIN 5: CYBERSECURITY COURSES
// ============================================================================
export const CYBERSECURITY_COURSES: Course[] = [
  {
    id: "course-cyber-sec-fundamentals",
    title: "Cybersecurity Principles & Threat Defense",
    description: "Understand the CIA Triad, threat vectors, network encryption protocols, OWASP Top 10 vulnerabilities, and security operations.",
    category: "security",
    domain: "cybersecurity",
    difficulty: "Beginner",
    estimated_minutes: 130,
    lessons: [
      {
        id: "sec-l1",
        course_id: "course-cyber-sec-fundamentals",
        title: "The CIA Triad & Threat Vector Analysis",
        lesson_type: "concept",
        sequence_order: 1,
        estimated_minutes: 20,
        objective: "Apply Confidentiality, Integrity, and Availability principles to security policy design.",
        concept_guide: `The CIA Triad is the core security model:
- Confidentiality: Protecting data from unauthorized exposure.
- Integrity: Preventing unauthorized data alteration.
- Availability: Ensuring reliable access to systems for authorized users.`,
        code_example: `Security Matrix:
Confidentiality Control -> TLS 1.3 Encryption & AES-256
Integrity Control       -> SHA-256 Cryptographic Hashes
Availability Control    -> Multi-Region Redundant Load Balancing`,
        code_explanation: "Maps security controls to the 3 pillars of the CIA Triad.",
        practical_exercise: "Analyze a data breach scenario and categorize affected systems under CIA triad failures.",
        checkpoint_question: "Which pillar of the CIA Triad is compromised when an attacker alters financial record amounts in a database?",
        checkpoint_options: [
          "Confidentiality",
          "Integrity",
          "Availability",
          "Authentication"
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "Integrity ensures data remains accurate and unaltered by unauthorized parties."
      }
    ]
  }
]

// ============================================================================
// DOMAIN 6: NEUTRAL GENERAL TECH COURSES (FALLBACK FOR UNKNOWN GOALS)
// ============================================================================
export const GENERAL_TECH_COURSES: Course[] = [
  {
    id: "course-tech-problem-solving",
    title: "Problem Solving & Computational Logic",
    description: "Master algorithmic thinking, decomposition, pattern recognition, and structured technical problem solving.",
    category: "general",
    domain: "general",
    difficulty: "Beginner",
    estimated_minutes: 110,
    lessons: [
      {
        id: "gen-l1",
        course_id: "course-tech-problem-solving",
        title: "Decomposition & Algorithmic Thinking",
        lesson_type: "concept",
        sequence_order: 1,
        estimated_minutes: 20,
        objective: "Break complex real-world problems into manageable, testable sub-problems.",
        concept_guide: `Computational thinking involves breaking down ambiguous challenges into explicit step-by-step algorithms.`,
        code_example: `# Pseudocode for Problem Decomposition
1. Identify Inputs & Expected Outputs
2. Divide into Sub-tasks (Validation, Processing, Response)
3. Test Sub-tasks independently`,
        code_explanation: "Standard step-by-step problem breakdown template.",
        practical_exercise: "Write pseudo-code step sequence for automating email notification dispatches.",
        checkpoint_question: "What does problem decomposition mean in computer science?",
        checkpoint_options: [
          "Deleting broken code files.",
          "Breaking a complex problem into smaller, solvable sub-problems.",
          "Formatting text strings.",
          "Installing software updates."
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "Decomposition breaks complex problems down into manageable components."
      }
    ]
  }
]

// Map of all domain catalogs
export const DOMAIN_CATALOGS: Record<string, Course[]> = {
  data_analytics: DATA_ANALYTICS_COURSES,
  full_stack: FULL_STACK_COURSES,
  ui_ux: UI_UX_COURSES,
  devops: DEVOPS_COURSES,
  cybersecurity: CYBERSECURITY_COURSES,
  general: GENERAL_TECH_COURSES,
}

// Flat list of all available courses for lookup
export const ALL_COURSES: Course[] = [
  ...DATA_ANALYTICS_COURSES,
  ...FULL_STACK_COURSES,
  ...UI_UX_COURSES,
  ...DEVOPS_COURSES,
  ...CYBERSECURITY_COURSES,
  ...GENERAL_TECH_COURSES,
]

// ============================================================================
// DYNAMIC ADAPTIVE COURSE SELECTION & RECOMMENDATION ENGINE
// ============================================================================

export function getStandaloneCourses(
  userGoal?: string,
  userLevel?: string,
  activeModuleTitles: string[] = []
): Course[] {
  const goalText = (userGoal || "").trim().toLowerCase()
  const pathContextText = activeModuleTitles.join(" ").toLowerCase()

  // Determine Primary Domain based on Learner Goal
  let domainKey: "data_analytics" | "full_stack" | "ui_ux" | "devops" | "cybersecurity" | "general" = "general"

  if (
    goalText.includes("data") ||
    goalText.includes("analyst") ||
    goalText.includes("analytics") ||
    goalText.includes("python data") ||
    goalText.includes("pandas") ||
    goalText.includes("business intelligence") ||
    goalText.includes("sql analyst")
  ) {
    domainKey = "data_analytics"
  } else if (
    goalText.includes("web") ||
    goalText.includes("full-stack") ||
    goalText.includes("fullstack") ||
    goalText.includes("frontend") ||
    goalText.includes("backend") ||
    goalText.includes("developer") ||
    goalText.includes("javascript") ||
    goalText.includes("react") ||
    goalText.includes("software engineer")
  ) {
    domainKey = "full_stack"
  } else if (
    goalText.includes("design") ||
    goalText.includes("ui") ||
    goalText.includes("ux") ||
    goalText.includes("figma") ||
    goalText.includes("product design")
  ) {
    domainKey = "ui_ux"
  } else if (
    goalText.includes("cloud") ||
    goalText.includes("devops") ||
    goalText.includes("aws") ||
    goalText.includes("docker") ||
    goalText.includes("system")
  ) {
    domainKey = "devops"
  } else if (
    goalText.includes("cyber") ||
    goalText.includes("security") ||
    goalText.includes("infosec") ||
    goalText.includes("ethical hacking")
  ) {
    domainKey = "cybersecurity"
  }

  // Select catalog matching domain
  let catalogToUse = DOMAIN_CATALOGS[domainKey] || GENERAL_TECH_COURSES

  // If goal is generic/missing, show neutral domain-mixed catalog
  if (domainKey === "general" && (!goalText || goalText === "general tech")) {
    catalogToUse = [
      ...GENERAL_TECH_COURSES,
      ...DATA_ANALYTICS_COURSES.slice(0, 1),
      ...FULL_STACK_COURSES.slice(0, 1),
      ...UI_UX_COURSES.slice(0, 1),
    ]
  }

  const cleanGoalDisplay = userGoal && userGoal.trim() ? userGoal : "your target domain"

  return catalogToUse.map((course, idx) => {
    let isRec = false
    let recReason = ""

    // Domain-aware recommendation logic
    if (domainKey !== "general") {
      // First 2 courses in primary domain catalog are recommended by default for goal
      if (idx === 0 || idx === 1) {
        isRec = true
        recReason = `Recommended for your ${cleanGoalDisplay} goal`
      } else if (userLevel && course.difficulty.toLowerCase() === userLevel.toLowerCase()) {
        isRec = true
        recReason = `Matches your ${userLevel} level in ${cleanGoalDisplay}`
      }
    }

    // Check active Learning Path roadmap signals
    if (!isRec && pathContextText) {
      const cTitle = course.title.toLowerCase()
      if (
        (cTitle.includes("python") && pathContextText.includes("python")) ||
        (cTitle.includes("sql") && pathContextText.includes("sql")) ||
        (cTitle.includes("html") && pathContextText.includes("html")) ||
        (cTitle.includes("react") && pathContextText.includes("react")) ||
        (cTitle.includes("figma") && pathContextText.includes("figma")) ||
        (cTitle.includes("docker") && pathContextText.includes("docker"))
      ) {
        isRec = true
        recReason = `Complements your active Learning Path roadmap`
      }
    }

    return {
      ...course,
      isRecommended: isRec,
      recommendation_reason: recReason,
    }
  })
}

// Storage key helper
function getStorageKey(userId: string): string {
  return `learnpilot_course_completions_${userId}`
}

// Persistent course progress fetcher
export async function getUserCompletedCourseLessons(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<string[]> {
  if (!userId) return []

  try {
    const { data, error } = await supabase
      .from("agent_insights")
      .select("content")
      .eq("user_id", userId)
      .eq("category", "note")
      .eq("topic", "course_lesson_completion")

    if (!error && data && data.length > 0) {
      const ids: string[] = []
      data.forEach((row) => {
        try {
          const parsed = JSON.parse(row.content)
          if (parsed && parsed.lesson_id) {
            ids.push(parsed.lesson_id)
          }
        } catch (e) {}
      })
      if (ids.length > 0) return ids
    }
  } catch (err) {
    console.warn("Supabase course completion fetch fallback to local storage", err)
  }

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(getStorageKey(userId))
      if (stored) {
        return JSON.parse(stored) as string[]
      }
    } catch (e) {
      console.error("Local storage error:", e)
    }
  }

  return []
}

// Persistent course lesson completion handler
export async function completeCourseLesson(
  supabase: SupabaseClient<Database>,
  userId: string,
  courseId: string,
  lessonId: string
): Promise<boolean> {
  if (!userId || !courseId || !lessonId) return false

  try {
    const payload = JSON.stringify({ course_id: courseId, lesson_id: lessonId, completed_at: new Date().toISOString() })
    
    const { data: existing } = await supabase
      .from("agent_insights")
      .select("id, content")
      .eq("user_id", userId)
      .eq("category", "note")
      .eq("topic", "course_lesson_completion")

    const alreadyStored = existing?.some((row) => {
      try {
        const p = JSON.parse((row as any).content)
        return p.lesson_id === lessonId
      } catch (e) {
        return false
      }
    })

    if (!alreadyStored) {
      await supabase.from("agent_insights").insert({
        user_id: userId,
        category: "note",
        topic: "course_lesson_completion",
        content: payload,
        active: true,
      })
    }
  } catch (err) {
    console.warn("Supabase course completion save fallback", err)
  }

  if (typeof window !== "undefined") {
    try {
      const key = getStorageKey(userId)
      const current = await getUserCompletedCourseLessons(supabase, userId)
      if (!current.includes(lessonId)) {
        const updated = [...current, lessonId]
        localStorage.setItem(key, JSON.stringify(updated))
      }
    } catch (e) {
      console.error("LocalStorage write error:", e)
    }
  }

  return true
}
