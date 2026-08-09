export type ResourceType = "COURSE" | "VIDEO" | "ARTICLE" | "DOCUMENTATION" | "PRACTICE" | "PROJECT" | "SPECIALIZATION"

export interface ExternalResource {
  id: string
  title: string
  provider: string
  type: ResourceType
  domain: string
  level: "beginner" | "intermediate" | "advanced"
  description: string
  url: string
  estimated_hours?: string
  skills: string[]
  prerequisites: string[]
  is_free: boolean
  instructor?: string
}

export const RESOURCE_REGISTRY: ExternalResource[] = [
  // PYTHON
  {
    id: "res-py-1",
    title: "Python for Everybody Specialization",
    provider: "University of Michigan / Coursera",
    type: "SPECIALIZATION",
    domain: "python",
    level: "beginner",
    description: "A comprehensive 5-course specialization covering Python programming, data structures, APIs, and databases. Ideal for beginners.",
    url: "https://www.coursera.org/specializations/python",
    estimated_hours: "30+ hours",
    skills: ["Python", "Data Structures", "APIs", "Databases"],
    prerequisites: [],
    is_free: false,
  },
  {
    id: "res-py-cs50p",
    title: "CS50's Introduction to Programming with Python",
    provider: "Harvard / edX",
    type: "COURSE",
    domain: "python",
    level: "beginner",
    description: "A 10-week introductory Python course covering functions, variables, conditionals, loops, exceptions, testing, file I/O, regex, and OOP.",
    url: "https://www.edx.org/learn/python/harvard-university-cs50-s-introduction-to-programming-with-python",
    skills: ["Python", "OOP", "File I/O", "Testing"],
    prerequisites: [],
    is_free: true,
  },
  
  // JAVA
  {
    id: "res-java-1",
    title: "Java Programming",
    provider: "University of Helsinki",
    type: "COURSE",
    domain: "java",
    level: "beginner",
    description: "A substantial programming course covering Java, object-oriented programming, algorithms, collections, interfaces, and inheritance.",
    url: "https://java-programming.mooc.fi/",
    skills: ["Java", "OOP", "Collections", "Algorithms"],
    prerequisites: [],
    is_free: true,
  },

  // DSA
  {
    id: "res-dsa-1",
    title: "Data Structures and Algorithms - Self Paced",
    provider: "GeeksforGeeks",
    type: "COURSE",
    domain: "dsa",
    level: "intermediate",
    description: "Master data structures and algorithms with this self-paced course. Learn arrays, linked lists, trees, graphs, dynamic programming and more.",
    url: "https://www.geeksforgeeks.org/courses/dsa-self-paced",
    skills: ["Algorithms", "Data Structures", "Dynamic Programming", "Graphs"],
    prerequisites: ["Basic Programming"],
    is_free: false,
  },

  // FRONTEND / WEB DEV
  {
    id: "res-fe-1",
    title: "Learn Web Development",
    provider: "MDN Web Docs",
    type: "DOCUMENTATION",
    domain: "frontend",
    level: "beginner",
    description: "The gold standard text-based curriculum for modern web development (HTML, CSS, JavaScript).",
    url: "https://developer.mozilla.org/en-US/docs/Learn_web_development",
    estimated_hours: "40+ hours",
    skills: ["HTML", "CSS", "JavaScript", "Accessibility", "Responsive Design"],
    prerequisites: [],
    is_free: true,
  },
  {
    id: "res-fe-react",
    title: "React Official Tutorial",
    provider: "Meta / React Team",
    type: "COURSE",
    domain: "frontend",
    level: "intermediate",
    description: "Learn to think in React and build interactive UIs using components and state.",
    url: "https://react.dev/learn",
    estimated_hours: "10 hours",
    skills: ["React", "Components", "State Management", "Hooks"],
    prerequisites: ["JavaScript", "HTML"],
    is_free: true,
  },

  // BACKEND
  {
    id: "res-be-node",
    title: "Node.js Tutorial",
    provider: "freeCodeCamp",
    type: "COURSE",
    domain: "backend",
    level: "intermediate",
    description: "Learn to build fast, scalable backend applications with Node.js and Express.",
    url: "https://www.freecodecamp.org/learn/back-end-development-and-apis/",
    skills: ["Node.js", "Express", "REST APIs"],
    prerequisites: ["JavaScript"],
    is_free: true,
  },

  // DATA SCIENCE & ML
  {
    id: "res-ds-ml",
    title: "Machine Learning Specialization",
    provider: "DeepLearning.AI / Stanford Online",
    type: "SPECIALIZATION",
    domain: "ml",
    level: "intermediate",
    instructor: "Andrew Ng",
    description: "A real 3-course specialization covering foundational machine learning concepts and practical implementation.",
    url: "https://www.deeplearning.ai/specializations/machine-learning",
    skills: ["Machine Learning", "Supervised Learning", "Neural Networks"],
    prerequisites: ["Python", "Basic Math"],
    is_free: false,
  },

  // AI
  {
    id: "res-ai-cs50ai",
    title: "CS50's Introduction to Artificial Intelligence with Python",
    provider: "Harvard / edX",
    type: "COURSE",
    domain: "ai",
    level: "intermediate",
    description: "Learn to use machine learning in Python to create AI algorithms capable of performing tasks on their own.",
    url: "https://www.edx.org/learn/artificial-intelligence/harvard-university-cs50-s-introduction-to-artificial-intelligence-with-python",
    skills: ["Artificial Intelligence", "Python", "Search Algorithms", "Optimization"],
    prerequisites: ["Python Fundamentals"],
    is_free: true,
  },

  // DATABASES
  {
    id: "res-db-sql",
    title: "Introduction to Databases (SQL)",
    provider: "Stanford Online",
    type: "COURSE",
    domain: "databases",
    level: "beginner",
    description: "A comprehensive introduction to relational databases and SQL programming.",
    url: "https://online.stanford.edu/courses/soe-ydatabases-databases",
    skills: ["SQL", "Relational Databases", "Data Modeling"],
    prerequisites: [],
    is_free: true,
  },

  // CLOUD / DEVOPS
  {
    id: "res-cloud-aws",
    title: "AWS Cloud Practitioner Essentials",
    provider: "AWS Training and Certification",
    type: "COURSE",
    domain: "cloud",
    level: "beginner",
    description: "Learn the overall understanding of the AWS Cloud, basic cloud concepts, and security.",
    url: "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/",
    skills: ["AWS", "Cloud Computing", "Security", "Infrastructure"],
    prerequisites: [],
    is_free: true,
  }
]
