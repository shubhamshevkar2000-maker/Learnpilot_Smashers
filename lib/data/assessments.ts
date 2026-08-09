import type { StaticAssessment } from "@/types/assessment"

export const STATIC_ASSESSMENTS: StaticAssessment[] = [
  {
    id: "css-basics",
    title: "CSS Basics",
    description: "Test your foundational knowledge of CSS selectors, layout, and styling.",
    roleTarget: ["Frontend Developer", "Web Developer", "UI Developer"],
    level: "beginner",
    topic: "CSS",
    estimated_minutes: 10,
    passingScore: 70,
    questions: [
      {
        id: "q1",
        question: "What does CSS stand for?",
        options: [
          { id: "a", text: "Computer Style Sheets" },
          { id: "b", text: "Cascading Style Sheets" },
          { id: "c", text: "Colorful Style Sheets" },
          { id: "d", text: "Creative Style Sheets" },
        ],
        correct_answer_id: "b",
        explanation: "CSS stands for Cascading Style Sheets.",
        topic: "CSS Fundamentals",
        difficulty: "beginner",
        questionType: "mcq"
      },
      {
        id: "q2",
        question: "Which HTML attribute is used to define inline styles?",
        options: [
          { id: "a", text: "class" },
          { id: "b", text: "styles" },
          { id: "c", text: "font" },
          { id: "d", text: "style" },
        ],
        correct_answer_id: "d",
        explanation: "The style attribute is used to apply inline styles.",
        topic: "CSS Fundamentals",
        difficulty: "beginner",
        questionType: "mcq"
      },
      {
        id: "q3",
        question: "Which property is used to change the background color?",
        options: [
          { id: "a", text: "bgcolor" },
          { id: "b", text: "background-color" },
          { id: "c", text: "color" },
          { id: "d", text: "bg-color" },
        ],
        correct_answer_id: "b",
        explanation: "The background-color property is used in CSS.",
        topic: "CSS Styling",
        difficulty: "beginner",
        questionType: "mcq"
      }
    ]
  },
  {
    id: "react-basics",
    title: "React Basics",
    description: "Evaluate your understanding of React components, state, and props.",
    roleTarget: ["Frontend Developer", "Web Developer", "React Developer", "Full Stack Developer"],
    level: "intermediate",
    topic: "React",
    estimated_minutes: 15,
    passingScore: 70,
    questions: [
      {
        id: "q1",
        question: "What is a React component?",
        options: [
          { id: "a", text: "A database table" },
          { id: "b", text: "A server-side route" },
          { id: "c", text: "A reusable piece of UI" },
          { id: "d", text: "A styling framework" },
        ],
        correct_answer_id: "c",
        explanation: "React components let you split the UI into independent, reusable pieces.",
        topic: "React Components",
        difficulty: "beginner",
        questionType: "mcq"
      },
      {
        id: "q2",
        question: "Which hook is used to manage state in a functional component?",
        options: [
          { id: "a", text: "useEffect" },
          { id: "b", text: "useContext" },
          { id: "c", text: "useState" },
          { id: "d", text: "useReducer" },
        ],
        correct_answer_id: "c",
        explanation: "useState is the hook used to add React state to function components.",
        topic: "React Hooks",
        difficulty: "intermediate",
        questionType: "mcq"
      },
      {
        id: "q3",
        question: "How do you pass data to a child component?",
        options: [
          { id: "a", text: "Using state" },
          { id: "b", text: "Using props" },
          { id: "c", text: "Using local storage" },
          { id: "d", text: "Using context exclusively" },
        ],
        correct_answer_id: "b",
        explanation: "Props are used to pass data from parent to child components.",
        topic: "React Props",
        difficulty: "intermediate",
        questionType: "mcq"
      }
    ]
  },
  {
    id: "node-basics",
    title: "Node.js Basics",
    description: "Test your foundational knowledge of Node.js modules and event loops.",
    roleTarget: ["Backend Developer", "Full Stack Developer", "Node Developer"],
    level: "beginner",
    topic: "Node.js",
    estimated_minutes: 10,
    passingScore: 70,
    questions: [
      {
        id: "q1",
        question: "What is Node.js?",
        options: [
          { id: "a", text: "A frontend framework" },
          { id: "b", text: "A JavaScript runtime built on Chrome's V8 engine" },
          { id: "c", text: "A database" },
          { id: "d", text: "A programming language" },
        ],
        correct_answer_id: "b",
        explanation: "Node.js is a runtime that allows you to run JavaScript on the server.",
        topic: "Node Fundamentals",
        difficulty: "beginner",
        questionType: "mcq"
      }
    ]
  }
]
