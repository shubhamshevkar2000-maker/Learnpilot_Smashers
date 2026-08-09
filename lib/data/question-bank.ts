import type { AssessmentQuestion, QuestionDifficulty } from "@/types/assessment"

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
      questionType: "mcq"
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
      question: "You have an async function that fetches user data. What happens if you forget to use the 'await' keyword before the fetch call?",
      options: [
        { id: "a", text: "The variable receives the resolved data immediately." },
        { id: "b", text: "A syntax error is thrown." },
        { id: "c", text: "The variable receives a Promise object instead of the actual data." },
        { id: "d", text: "The function execution blocks until the fetch completes." },
      ],
      correct_answer_id: "c",
      explanation: "Without 'await', fetch returns a Promise representing the eventual completion of the request, not the actual response data.",
      topic: "JS Async/Await",
      difficulty: "beginner",
      questionType: "mcq"
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
      questionType: "mcq"
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
    }
  ]
}
