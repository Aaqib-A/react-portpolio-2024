// Single source of truth for every piece of content on the site.
// Used by the React UI, the interactive terminal, and the build-time
// llms.txt / sitemap generator in vite.config.ts.

export type SectionId =
  | 'about'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'research'
  | 'education'
  | 'contact'

export interface Link {
  label: string
  url: string
}

export interface Experience {
  role: string
  tag?: string
  company: string
  companyUrl?: string
  location?: string
  period: string
  points: string[]
  tech: string[]
}

export interface Education {
  degree: string
  /** The degree-awarding body, shown with the most emphasis. */
  institution: string
  /** Affiliated college, when the institution is a university. */
  college?: string
  location: string
  period: string
  grade: string
}

export interface Publication {
  title: string
  venue: string
  publisher?: string
  date: string
  url: string
  doi?: string
  /** Code that accompanies the paper. */
  codeUrl?: string
}

export interface Project {
  name: string
  /** GitHub repository name, used to merge in live stats. */
  repo: string
  tagline: string
  points: string[]
  tech: string[]
  url: string
}

export const personal = {
  firstName: 'Aaqib',
  lastName: 'Ansari',
  title: 'Senior Backend Engineer',
  location: 'Mumbai, India',
  email: 'aaqib.ansari022@gmail.com',
  githubUser: 'Aaqib-A',
  resumeUrl: 'https://drive.google.com/file/d/1WK_HHL-oEFYW5sEQEzTmL_cHcaRg0VEU/view?usp=sharing',
  status: 'Open to Software Engineering roles & freelance work',
  /** Part of the bio that the hero sets in bold. */
  bioHighlight: '8+ years',
  bio: 'Software engineer with 8+ years across industry and research. I design and ship Python/Django and Node.js services: REST and real-time APIs on PostgreSQL, Redis and Elasticsearch, run on Docker, Kubernetes and AWS and also design and create distributed systems capable of handling 1000s of requests per second. Lately I also build AI prototypes, such as chatbots and natural-language-to-SQL tools.',
  currentWork: {
    text: 'Currently a Software Engineer at',
    company: 'The Ninja Studio',
  },
} as const

export const fullName = `${personal.firstName} ${personal.lastName}`

export const socials: Link[] = [
  { label: 'GitHub', url: 'https://github.com/Aaqib-A' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/aaqib-ansari-8021118a/' },
  { label: 'ORCID', url: 'https://orcid.org/0000-0002-2018-5132' },
  { label: 'Email', url: `mailto:${personal.email}` },
]

export const terminalIntro: { prompt: string; output: string }[] = [
  { prompt: 'echo $STATUS', output: personal.status },
  { prompt: 'echo $LOCATION', output: personal.location },
  { prompt: 'echo $STACK', output: 'Python · Django · Node.js · PostgreSQL · Redis · Docker · Kubernetes · AWS' },
]

export const navLinks: { id: SectionId; label: string }[] = [
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'research', label: 'Research' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
]

export const sectionTitles: Record<Exclude<SectionId, 'about'>, string> = {
  skills: 'Skills',
  experience: 'Work Experience',
  projects: 'Projects',
  research: 'Research Papers',
  education: 'Education',
  contact: 'Contact',
}

export const skills: Record<string, string[]> = {
  Languages: ['Python', 'TypeScript', 'JavaScript', 'Haskell', 'SQL', 'C#'],
  Backend: ['Django', 'Django REST Framework', 'Django Channels', 'Jinja', 'Celery', 'Node.js', 'Express', 'Flask', 'Strapi'],
  Frontend: ['React'],
  'Data Stores': ['PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch'],
  'APIs & Realtime': ['REST', 'GraphQL', 'WebSockets', 'Socket.io', 'OAuth2', 'Auth0', 'Clerk', 'Cron Jobs'],
  'DevOps & Cloud': ['Docker', 'Docker Compose', 'Kubernetes', 'Nix', 'Nix Flakes', 'AWS', 'Netlify', 'nginx', 'Gunicorn', 'Linux', 'Git'],
  'AI / ML & Data': ['LLM Prototyping', 'NL-to-SQL', 'Whisper', 'spaCy', 'NLP', 'Pandas', 'NumPy', 'Matplotlib', 'Selenium', 'ReportLab'],
  Tools: ['VS Code', 'Postman', 'Figma', 'Jira'],
}

export const skillsFootnote = '& whatever the backend demands next.'

export const experience: Experience[] = [
  {
    role: 'Software Engineer',
    tag: 'Current',
    company: 'The Ninja Studio',
    location: 'Remote',
    period: 'Oct 2024 — Present',
    points: [
      'Improved cron job efficiency by 85% through performance tuning and automation scripting.',
      'Engineered AI-powered prototypes, such as chatbots and natural-language-to-SQL tools, for rapid client-facing validation.',
      'Developed intelligent systems that link natural-language input to structured databases for actionable insights.',
      'Created lightweight internal tools for fast AI proof-of-concept delivery.',
      'Remediated security vulnerabilities in large distributed systems, working from penetration-test reports.',
      'Act as the DevOps engineer on Kubernetes and AWS, resolving production system failures.',
      'Maintain and improve software for hardware deployed on every continent except Antarctica.',
    ],
    tech: [
      'Python', 'Haskell', 'TypeScript', 'React', 'PostgreSQL', 'Redis', 'SQL', 'Kubernetes', 'Nix',
      'Nix Flakes', 'AWS', 'Auth0', 'Clerk', 'LLMs', 'NL-to-SQL', 'Cron Jobs', 'Linux',
    ],
  },
  {
    role: 'Python Developer',
    company: 'Rentokil PCI',
    location: 'Mumbai, Maharashtra, India · Hybrid',
    period: 'Jul 2024 — Oct 2024',
    points: [
      'Built and maintained the internal systems used across the company.',
      'Worked full stack in Django: server-rendered Jinja templates on the front end, Django services on the back end.',
      'Designed REST APIs and integrated third-party services.',
      'Wrote and ran scripts that safely modify production databases.',
    ],
    tech: ['Python', 'Django', 'Jinja', 'HTML', 'CSS', 'JavaScript', 'PostgreSQL', 'REST', 'Docker', 'Git'],
  },
  {
    role: 'Senior Backend Developer',
    company: 'Getafix Technologies',
    location: 'Bangalore, Karnataka, India · Hybrid',
    period: 'Apr 2022 — Jun 2024',
    points: [
      'Build and maintain web applications with Python, Django, PostgreSQL and Docker.',
      'Design and ship RESTful web services and APIs.',
      'Write and run scripts that safely modify production databases.',
      'Integrate third-party services and APIs into the platform.',
      "Trained and mentored 2 engineers, helping them grow and contribute to the team's success.",
      'Review code and give feedback to other developers.',
    ],
    tech: [
      'Python', 'Django', 'Node.js', 'Express', 'TypeScript', 'PostgreSQL', 'MongoDB', 'Redis',
      'Elasticsearch', 'REST', 'WebSockets', 'Socket.io', 'Docker', 'AWS', 'Linux', 'Cron Jobs',
    ],
  },
  {
    role: 'Research Intern',
    tag: 'Research',
    company: 'Indian Institute of Geomagnetism',
    location: 'Navi Mumbai, Maharashtra, India',
    period: 'Feb 2021 — Mar 2022',
    points: [
      "Worked directly with scientists to understand their research goals and track the project's progress.",
      'Built a project grounded in current research papers.',
      'Built a Python/Tkinter desktop application that reads encrypted data files and turns them into graphs.',
      'Filtered the data with established algorithms using pandas and Matplotlib to produce clear visualisations.',
    ],
    tech: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Tkinter', 'C'],
  },
  {
    role: 'Associate Analyst',
    company: 'Ugam Solutions',
    location: 'Mumbai, Maharashtra, India',
    period: 'Jul 2018 — Jun 2019',
    points: [
      'Built online surveys with Python, CSS, jQuery, XML and C# on the Decipher and ConfirmIt platforms.',
      'Coordinated with clients to understand their requirements and suggest new ones.',
    ],
    tech: ['Python', 'JavaScript', 'jQuery', 'HTML', 'CSS', 'C#', '.NET', 'Decipher', 'ConfirmIt'],
  },
]

export const projects: Project[] = [
  {
    name: 'Shop Titans Planner',
    repo: 'shop-titans-planner',
    tagline: 'Isometric shop-layout planner for the game Shop Titans',
    points: [
      'Catalog of ~900 furniture stages with real footprints, prestige and sprites, kept current by a TypeScript sync pipeline over official data, the wiki and community sheets.',
      'Validates layouts: furniture limits, overlaps, zone rules, and door-to-display reachability via path-finding.',
      'Canvas renderer with isometric and top-down views, PNG export and compressed shareable layouts.',
    ],
    tech: ['TypeScript', 'React', 'Zustand', 'Canvas', 'Vitest', 'Docker', 'nginx'],
    url: 'https://github.com/Aaqib-A/shop-titans-planner',
  },
  {
    name: 'AI Subtitle Generator',
    repo: 'subtitle-generator',
    tagline: 'Whisper-powered subtitles, from any language to any language',
    points: [
      'Streamlit front end that streams videos of up to 20 GB from disk to a transcription backend, then polls for results.',
      'Configurable Whisper model size, automatic source-language detection and optional translation to a target language.',
      'Exports timed .srt subtitles, with optional .vtt output.',
    ],
    tech: ['Python', 'OpenAI Whisper', 'Streamlit', 'MoviePy', 'deep-translator'],
    url: 'https://github.com/Aaqib-A/subtitle-generator',
  },
  {
    name: 'Elasticsearch Book Search',
    repo: 'django-elasticsearch',
    tagline: 'Fast full-text search for a Django app, backed by Elasticsearch',
    points: [
      'Book model indexed into Elasticsearch with django-elasticsearch-dsl; one management command rebuilds the index.',
      'Django REST Framework search endpoint that runs match queries and returns serialized results; a Postman collection is included.',
      'Search page with typo-tolerant (fuzzy) multi-field matching.',
      'Single-node Elasticsearch 8 runs in Docker Compose; a seed script loads 100 classic books.',
    ],
    tech: ['Python', 'Django', 'DRF', 'Elasticsearch', 'Docker'],
    url: 'https://github.com/Aaqib-A/django-elasticsearch',
  },
  {
    name: 'Realtime Chat',
    repo: 'django-chatapp',
    tagline: 'Group chat with live presence on Django Channels',
    points: [
      'WebSocket consumers broadcast messages and online counts through a Redis channel layer.',
      'HTMX-driven UI with allauth sign-in, profiles and group-chat management.',
      'App and Redis containerised with Docker Compose for deployment.',
    ],
    tech: ['Django', 'Channels', 'Redis', 'WebSockets', 'HTMX', 'Docker'],
    url: 'https://github.com/Aaqib-A/django-chatapp',
  },
  {
    name: 'Mini Blockchain',
    repo: 'mini-blockchain',
    tagline: 'Proof-of-work blockchain with multi-node consensus',
    points: [
      'Flask REST API to mine blocks, submit transactions and inspect the chain.',
      'Nodes register peers and resolve conflicts with a longest-valid-chain consensus algorithm.',
      'Run several nodes as Docker containers; a Postman collection is included.',
    ],
    tech: ['Python', 'Flask', 'REST', 'Docker'],
    url: 'https://github.com/Aaqib-A/mini-blockchain',
  },
  {
    name: 'Budget Management API',
    repo: 'budget-management-backend',
    tagline: 'Role-based budgeting REST API',
    points: [
      'Django REST Framework API for users, categories and transactions, with django-filter querying.',
      'OAuth2 authentication, role-based permission classes and request-logging middleware.',
      'Containerised with Docker and served by Gunicorn; PostgreSQL-ready.',
    ],
    tech: ['Django', 'DRF', 'OAuth2', 'PostgreSQL', 'Docker'],
    url: 'https://github.com/Aaqib-A/budget-management-backend',
  },
]

export const publications: Publication[] = [
  {
    title: 'NLI-GSC: A Natural Language Interface for Generating SourceCode',
    venue: 'International Journal of Advanced Computer Science and Applications (IJACSA), Vol. 13, No. 1',
    publisher: 'The Science and Information (SAI) Organization',
    date: 'Feb 2022',
    url: 'https://thesai.org/Downloads/Volume13No1/Paper_98-NLI_GSC_A_Natural_Language_Interface_for_Generating_SourceCode.pdf',
    doi: '10.14569/IJACSA.2022.0130198',
    codeUrl: 'https://github.com/Aaqib-A/Creating-PseudoCode-using-NLP',
  },
  {
    title: 'A Review on Generative Adversarial Nets and Its Types',
    venue: 'Vidyabharati International Interdisciplinary Research Journal (VIIRJ)',
    date: 'Oct 2021',
    url: 'https://www.viirj.org/specialissues/SP11/Part%2027.pdf#page=170',
  },
  {
    title: 'A Space Shooter Game',
    venue: 'International Journal of Engineering Research in Computer Science and Engineering (IJERCSE)',
    date: 'Mar 2018',
    url: 'https://ijercse.com/specissue/march-2018/30.pdf',
  },
]

export const education: Education[] = [
  {
    degree: 'Master of Engineering in Information Technology',
    institution: 'University of Mumbai',
    college: 'Vidyalankar Institute of Technology',
    location: 'Wadala, Mumbai',
    period: 'Aug 2019 — Jan 2022',
    grade: 'CGPA: 9.18',
  },
  {
    degree: 'Bachelor of Engineering in Information Technology',
    institution: 'University of Mumbai',
    college: "Padmabhushan Vasantdada Patil Pratishthan's College of Engineering",
    location: 'Sion, Mumbai',
    period: 'Apr 2015 — Apr 2018',
    grade: 'CGPA: 7.4',
  },
  {
    degree: 'Diploma in Information Technology',
    institution: 'Autonomous institute affiliated with the Maharashtra State Board of Technical Education (MSBTE)',
    college: 'Shri Bhagubhai Mafatlal Polytechnic',
    location: 'Vile Parle, Mumbai',
    period: 'Jul 2012 — Jul 2015',
    grade: 'GPA: 7.35',
  },
]

export const contact = {
  message:
    "I'm open to Software Engineering roles, freelance projects and interesting collaborations. Drop a message below or email me directly.",
}
