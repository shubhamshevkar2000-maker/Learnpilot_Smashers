import type { AssessmentQuestion } from "@/types/assessment"

// A deterministic question bank that the assessment generator pulls from.
// It maps domains/keywords to sets of questions, tiered by difficulty.
// This allows the assessment to adapt to the learner's specific path and level.

export const QUESTION_BANK: Record<string, Omit<AssessmentQuestion, "id">[]> = {
  // ---------------------------------------------------------
  // WEB FUNDAMENTALS & CSS
  // ---------------------------------------------------------
  "html": [
    {
      question: "You are building an article component. Which HTML5 tag is most semantically appropriate for the main content?",
      options: [
        { id: "a", text: "<div>" },
        { id: "b", text: "<section>" },
        { id: "c", text: "<article>" },
        { id: "d", text: "<main>" },
      ],
      correct_answer_id: "c",
      explanation: "<article> is the most semantically correct tag for a self-contained composition like a blog post or news story.",
      topic: "HTML5 Semantics",
      difficulty: "beginner",
      questionType: "mcq"
    },
    {
      question: "Which of the following are valid HTML5 semantic tags? (Select all that apply)",
      options: [
        { id: "a", text: "<header>" },
        { id: "b", text: "<nav>" },
        { id: "c", text: "<bold>" },
        { id: "d", text: "<aside>" },
      ],
      multiple_correct_ids: ["a", "b", "d"],
      explanation: "<header>, <nav>, and <aside> are valid semantic tags. <bold> is not a valid HTML5 tag (use <b> or <strong>).",
      topic: "HTML5 Semantics",
      difficulty: "beginner",
      questionType: "multiple_select"
    }
  ],
  "css": [
    {
      question: "You need to horizontally and vertically center a child div inside a container. Which CSS approach is the most modern and concise?",
      options: [
        { id: "a", text: "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);" },
        { id: "b", text: "display: flex; justify-content: center; align-items: center;" },
        { id: "c", text: "display: grid; place-items: center;" },
        { id: "d", text: "margin: 0 auto; padding-top: 50%;" },
      ],
      correct_answer_id: "c",
      explanation: "display: grid; place-items: center; is the most modern and concise way to perfectly center an element in both axes.",
      topic: "CSS Layout",
      difficulty: "intermediate",
      questionType: "mcq"
    },
    {
      question: "A button's hover state is jumping abruptly instead of transitioning smoothly. What property should you apply to the button's base state to fix this?",
      options: [
        { id: "a", text: "animation: 0.3s ease-in-out;" },
        { id: "b", text: "transition: all 0.3s ease;" },
        { id: "c", text: "transform: smooth;" },
        { id: "d", text: "hover-transition: 0.3s;" },
      ],
      correct_answer_id: "b",
      explanation: "The transition property must be applied to the base state (not the hover state) to animate both the mouse-enter and mouse-leave events.",
      topic: "CSS Animations",
      difficulty: "beginner",
      questionType: "mcq"
    },
    {
      question: "When building a responsive dashboard, a layout using container queries is preferred over media queries when:",
      options: [
        { id: "a", text: "The component needs to adapt to the screen's viewport size." },
        { id: "b", text: "The component needs to adapt to its parent container's width, allowing it to be reused in different layout contexts." },
        { id: "c", text: "You need to change the typography scale globally." },
        { id: "d", text: "Container queries are deprecated and should not be used." },
      ],
      correct_answer_id: "b",
      explanation: "Container queries allow a component to style itself based on the size of its parent container, making it highly modular and reusable.",
      topic: "Responsive Design",
      difficulty: "advanced",
      questionType: "scenario"
    },
    {
      question: "Why is the flex item overflowing its container?",
      codeSnippet: ".container {\n  display: flex;\n  width: 300px;\n}\n.item {\n  flex-shrink: 0;\n  width: 400px;\n}",
      options: [
        { id: "a", text: "Because display: flex forces items to wrap." },
        { id: "b", text: "Because flex-shrink is 0, preventing the item from shrinking below its specified width of 400px." },
        { id: "c", text: "Because width should be max-width." },
        { id: "d", text: "Because the container needs overflow: hidden." },
      ],
      correct_answer_id: "b",
      explanation: "Setting flex-shrink to 0 tells the browser not to shrink the element even if it overflows the flex container.",
      topic: "CSS Layout",
      difficulty: "intermediate",
      questionType: "debugging"
    }
  ],

  // ---------------------------------------------------------
  // JAVASCRIPT
  // ---------------------------------------------------------
  "javascript": [
    {
      question: "Which of the following creates a closure in JavaScript?",
      options: [
        { id: "a", text: "An object with methods." },
        { id: "b", text: "A function accessing variables from its outer lexical scope." },
        { id: "c", text: "A class extending another class." },
        { id: "d", text: "An async function awaiting a Promise." },
      ],
      correct_answer_id: "b",
      explanation: "A closure is created when a function remembers and accesses variables from its lexical scope even when executed outside that scope.",
      topic: "JS Closures",
      difficulty: "intermediate",
      questionType: "mcq"
    },
    {
      question: "What will this code output?",
      codeSnippet: "console.log(1);\nsetTimeout(() => console.log(2), 0);\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);",
      options: [
        { id: "a", text: "1, 2, 3, 4" },
        { id: "b", text: "1, 4, 3, 2" },
        { id: "c", text: "1, 4, 2, 3" },
        { id: "d", text: "1, 3, 4, 2" }
      ],
      correct_answer_id: "b",
      explanation: "1 and 4 are synchronous. 3 is a microtask (Promise) so it runs before the macrotask (setTimeout) which logs 2.",
      topic: "JS Event Loop",
      difficulty: "advanced",
      questionType: "code_output"
    },
    {
      question: "A production dashboard has three independent API requests that currently execute sequentially using await. Which approach would improve latency while preserving independent error handling?",
      options: [
        { id: "a", text: "Promise.all([req1, req2, req3])" },
        { id: "b", text: "Promise.race([req1, req2, req3])" },
        { id: "c", text: "Promise.allSettled([req1, req2, req3])" },
        { id: "d", text: "Remove the async keyword from the function." },
      ],
      correct_answer_id: "c",
      explanation: "Promise.allSettled runs them concurrently and waits for all to finish (success or failure), preserving independent error handling, whereas Promise.all would reject immediately if one fails.",
      topic: "JS Concurrency",
      difficulty: "advanced",
      questionType: "scenario"
    },
    {
      question: "In JavaScript, 'let' and 'const' variables are hoisted but reside in the Temporal Dead Zone until their declaration is evaluated.",
      options: [
        { id: "true", text: "True" },
        { id: "false", text: "False" }
      ],
      correct_answer_id: "true",
      explanation: "let and const are indeed hoisted, but accessing them before initialization throws a ReferenceError because they are in the TDZ.",
      topic: "JS Fundamentals",
      difficulty: "beginner",
      questionType: "true_false"
    },
    {
      question: "Explain the difference between let, const, and var.",
      selfReviewCriteria: [
        "Mentioned block scope for let and const.",
        "Mentioned function scope for var.",
        "Mentioned that const cannot be reassigned.",
        "Mentioned hoisting differences (TDZ for let/const)."
      ],
      topic: "JS Fundamentals",
      difficulty: "beginner",
      questionType: "short_answer"
    },
    {
      question: "Write a function that calculates the total sum of an array of numbers. If the array is empty, return 0.",
      language: "javascript",
      starterCode: "function calculateTotal(numbers) {\n  // your code here\n}",
      testCases: [
        { input: "[1, 2, 3]", expected: "6" },
        { input: "[10, 5]", expected: "15" },
        { input: "[]", expected: "0" }
      ],
      expectedBehavior: "The function should iterate over the array (using reduce or a loop) and return the total sum of its elements.",
      hints: ["Consider using the Array.prototype.reduce() method.", "Make sure to handle the empty array case."],
      explanation: "Using reduce: numbers.reduce((sum, n) => sum + n, 0) is a clean way to sum an array in JavaScript.",
      topic: "JS Fundamentals",
      difficulty: "beginner",
      questionType: "code_write"
    }
  ],

  // ---------------------------------------------------------
  // REACT
  // ---------------------------------------------------------
  "react": [
    {
      question: "A React component fetches user data whenever its `userId` changes. The current implementation causes an unnecessary request on every render. Which change would correctly control when the request runs?",
      options: [
        { id: "a", text: "Wrap the fetch call in a useMemo hook." },
        { id: "b", text: "Move the fetch call into a useEffect with [userId] in the dependency array." },
        { id: "c", text: "Store the data in localStorage to prevent re-fetching." },
        { id: "d", text: "Use the useState hook to cache the request." },
      ],
      correct_answer_id: "b",
      explanation: "useEffect with a dependency array ensures the effect (fetching data) only runs when the specified dependencies (userId) change.",
      topic: "React Hooks",
      difficulty: "intermediate",
      questionType: "mcq"
    },
    {
      question: "Why is the counter updating to 1 instead of 3?",
      codeSnippet: "const [count, setCount] = useState(0);\nconst incrementThree = () => {\n  setCount(count + 1);\n  setCount(count + 1);\n  setCount(count + 1);\n};",
      options: [
        { id: "a", text: "Because React only allows one state update per function call." },
        { id: "b", text: "Because the updates are batched and 'count' is stale in the closure. Use setCount(prev => prev + 1)." },
        { id: "c", text: "Because useState is asynchronous and fails." },
        { id: "d", text: "Because the component hasn't mounted yet." },
      ],
      correct_answer_id: "b",
      explanation: "React batches state updates. Since `count` is captured in the closure as 0, all three calls effectively do `setCount(0 + 1)`. Using the functional updater `prev => prev + 1` resolves this.",
      topic: "React State",
      difficulty: "intermediate",
      questionType: "debugging"
    },
    {
      question: "What is the primary benefit of React Server Components (RSC) in Next.js?",
      options: [
        { id: "a", text: "They completely replace client-side state management." },
        { id: "b", text: "They run exclusively on the server, reducing the client bundle size and accessing backend resources directly." },
        { id: "c", text: "They are faster to write than standard React components." },
        { id: "d", text: "They automatically add CSS animations." },
      ],
      correct_answer_id: "b",
      explanation: "RSCs render on the server, meaning their dependencies are not sent to the client, reducing bundle size and allowing direct database access.",
      topic: "React Server Components",
      difficulty: "advanced",
      questionType: "mcq"
    },
    {
      question: "Which hooks will trigger a component re-render when their value changes? (Select all that apply)",
      options: [
        { id: "a", text: "useState" },
        { id: "b", text: "useRef" },
        { id: "c", text: "useReducer" },
        { id: "d", text: "useEffect" },
      ],
      multiple_correct_ids: ["a", "c"],
      explanation: "useState and useReducer trigger re-renders. useRef mutations do not. useEffect is a side-effect hook, not a state holder.",
      topic: "React Hooks",
      difficulty: "intermediate",
      questionType: "multiple_select"
    },
    {
      question: "Write a React hook `useToggle` that returns a boolean state and a toggle function.",
      language: "javascript",
      starterCode: "import { useState } from 'react';\n\nexport function useToggle(initialValue = false) {\n  // your code here\n}",
      testCases: [
        { input: "const [, t] = useToggle(false); t(); const [v] = useToggle(false); return String(v);", expected: "true" },
        { input: "const [v] = useToggle(true); return String(v);", expected: "true" }
      ],
      expectedBehavior: "The hook should return an array where the first element is the state value and the second is a function that toggles it.",
      hints: ["Use the useState hook.", "The toggle function should ideally use the previous state updater pattern: setState(prev => !prev)."],
      explanation: "A custom hook `useToggle` simplifies boolean state management.",
      topic: "React Hooks",
      difficulty: "intermediate",
      questionType: "code_write"
    }
  ],

  // ---------------------------------------------------------
  // AI / LLM
  // ---------------------------------------------------------
  "ai": [
    {
      question: "In a Retrieval-Augmented Generation (RAG) system, what is the primary purpose of the vector database?",
      options: [
        { id: "a", text: "To format the final AI response." },
        { id: "b", text: "To store embedded chunks of text and perform fast similarity search against a user's query." },
        { id: "c", text: "To train the LLM on new data overnight." },
        { id: "d", text: "To handle user authentication." }
      ],
      correct_answer_id: "b",
      explanation: "Vector databases store text embeddings and use cosine similarity to retrieve relevant context rapidly during a RAG pipeline.",
      topic: "RAG Architecture",
      difficulty: "advanced",
      questionType: "mcq"
    },
    {
      question: "You are building an AI chatbot. It keeps forgetting the user's name from two messages ago. What is the standard architectural fix?",
      options: [
        { id: "a", text: "Switch to a larger LLM model like GPT-4." },
        { id: "b", text: "Append the recent conversation history to the prompt payload on every new request." },
        { id: "c", text: "Decrease the model's temperature parameter." },
        { id: "d", text: "Fine-tune the model with the user's name." }
      ],
      correct_answer_id: "b",
      explanation: "LLM APIs are stateless. The standard approach is to maintain conversation history (context window) and append it to each new request.",
      topic: "AI Agents",
      difficulty: "intermediate",
      questionType: "scenario"
    },
    {
      question: "Write a function to compute cosine similarity between two 1D arrays of equal length representing embeddings.",
      language: "javascript",
      starterCode: "function cosineSimilarity(a, b) {\n  // your code here\n}",
      testCases: [
        { input: "[1, 0, 0], [1, 0, 0]", expected: "1" },
        { input: "[1, 0, 0], [0, 1, 0]", expected: "0" }
      ],
      expectedBehavior: "Calculate the dot product of the vectors divided by the product of their magnitudes.",
      hints: ["Dot product is the sum of a[i] * b[i].", "Magnitude is the square root of the sum of squared elements."],
      explanation: "Cosine similarity measures the angle between two vectors and is fundamental to vector search.",
      topic: "RAG Architecture",
      difficulty: "advanced",
      questionType: "code_write"
    }
  ],
  
  // ---------------------------------------------------------
  // PYTHON
  // ---------------------------------------------------------
  "python": [
    {
      question: "Which of the following is immutable in Python?",
      options: [
        { id: "a", text: "list" },
        { id: "b", text: "dict" },
        { id: "c", text: "set" },
        { id: "d", text: "tuple" },
      ],
      correct_answer_id: "d",
      explanation: "Tuples in Python are immutable, meaning their elements cannot be changed after creation.",
      topic: "Python Fundamentals",
      difficulty: "beginner",
      questionType: "mcq"
    },
    {
      question: "You want to dynamically modify the behavior of a function without changing its source code. What Python feature should you use?",
      options: [
        { id: "a", text: "Inheritance" },
        { id: "b", text: "Decorators" },
        { id: "c", text: "Metaclasses" },
        { id: "d", text: "Generators" },
      ],
      correct_answer_id: "b",
      explanation: "Decorators wrap a function, allowing you to execute code before and after the wrapped function runs.",
      topic: "Advanced Python",
      difficulty: "intermediate",
      questionType: "mcq"
    },
    {
      question: "What is the primary advantage of using a generator (yield) instead of returning a list?",
      options: [
        { id: "a", text: "Generators are more memory efficient because they yield items one at a time lazily." },
        { id: "b", text: "Generators execute much faster than standard functions." },
        { id: "c", text: "Generators automatically sort the data." },
        { id: "d", text: "Generators bypass the Global Interpreter Lock (GIL)." },
      ],
      correct_answer_id: "a",
      explanation: "Generators do not store all items in memory at once; they generate them on the fly.",
      topic: "Python Generators",
      difficulty: "intermediate",
      questionType: "mcq"
    },
    {
      question: "Why does this code raise an UnboundLocalError?",
      codeSnippet: "count = 0\ndef increment():\n    count += 1\n    return count\nincrement()",
      options: [
        { id: "a", text: "Because count is an integer and cannot be incremented." },
        { id: "b", text: "Because Python assumes count is a local variable since it is assigned within the function, but it has not been initialized locally." },
        { id: "c", text: "Because you cannot return variables named count." },
        { id: "d", text: "Because count should be defined as const." },
      ],
      correct_answer_id: "b",
      explanation: "When you assign to a variable in a scope, Python treats it as local. To modify the global count, you must declare 'global count'.",
      topic: "Python Scope",
      difficulty: "beginner",
      questionType: "debugging"
    },
    {
      question: "Write a function to return the sum of all keyword arguments passed to it.",
      language: "python",
      starterCode: "def sum_kwargs(**kwargs):\n    # your code here\n    pass",
      testCases: [
        { input: "a=1, b=2", expected: "3" },
        { input: "x=10, y=5, z=5", expected: "20" }
      ],
      expectedBehavior: "Sum all values in the kwargs dictionary.",
      hints: ["Use kwargs.values()", "Use the built-in sum() function"],
      explanation: "kwargs is a dictionary of keyword arguments. You can sum its values easily.",
      topic: "Python Functions",
      difficulty: "intermediate",
      questionType: "code_write"
    }
  ],

  // ---------------------------------------------------------
  // FALLBACK / GENERAL
  // ---------------------------------------------------------
  "general": [
    {
      question: "When applying a new technical concept in a real-world project, what is the most important consideration?",
      options: [
        { id: "a", text: "Using the most code possible to demonstrate knowledge." },
        { id: "b", text: "Understanding the trade-offs and ensuring it solves the specific problem efficiently." },
        { id: "c", text: "Copying a tutorial exactly without modifications." },
        { id: "d", text: "Ignoring performance implications until the project is deployed." },
      ],
      correct_answer_id: "b",
      explanation: "Practical application requires understanding trade-offs. No single technology or pattern is perfect for every situation.",
      topic: "Application & Trade-offs",
      difficulty: "beginner",
      questionType: "mcq"
    },
    {
      question: "Unit tests are meant to test the entire application stack end-to-end, including the database.",
      options: [
        { id: "true", text: "True" },
        { id: "false", text: "False" }
      ],
      correct_answer_id: "false",
      explanation: "Unit tests focus on isolated functions or components. End-to-end (E2E) tests cover the entire stack including the database.",
      topic: "Testing",
      difficulty: "beginner",
      questionType: "true_false"
    }
  ]
}
