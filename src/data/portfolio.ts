// Single source of truth for every piece of content on the site.
// Used by the React UI, the interactive terminal, the build-time
// llms.txt / sitemap generator in vite.config.ts, and resume.json (src/lib/resume.ts).

export type SectionId =
  | 'about'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'personal-projects'
  | 'research'
  | 'education'
  | 'certifications'
  | 'contact'

/** Sections that are built but kept off the site for now: the page, nav, terminal and llms.txt all skip them.
    Remove an id here to bring its section back. */
export const hiddenSections: readonly SectionId[] = ['projects']
export const isShown = (id: SectionId) => !hiddenSections.includes(id)

export interface Link {
  label: string
  url: string
}

export interface Experience {
  role: string
  tag?: string
  company: string
  /** One-line description of the company, set in italics under its name as on the resume. */
  about?: string
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

export interface Certification {
  name: string
  issuer: string
  date: string
  credentialId?: string
  /** Public page that verifies the credential. */
  url: string
}

/** Client work from the resume. It has no public repo or page to link to. */
export interface Project {
  name: string
  period: string
  tagline: string
  points: string[]
  tech: string[]
}

/** Something I built on my own, published on GitHub. */
export interface PersonalProject {
  name: string
  /** GitHub repository name, used to merge in live stats and as a terminal `open` target. */
  repo: string
  tagline: string
  points: string[]
  tech: string[]
  url: string
}

export const personal = {
  firstName: 'Aaqib',
  lastName: 'Ansari',
  title: 'Senior Software Engineer',
  location: 'Mumbai, India',
  /** ISO 3166-1 alpha-2 country code, for resume.json. */
  countryCode: 'IN',
  /** The live site; resume.json links here wherever it is generated (build, terminal or CLI). */
  website: 'https://aaqib-ansari.dev',
  email: 'aaqib.ansari022@gmail.com',
  githubUser: 'Aaqib-A',
  resumeUrl: 'https://drive.google.com/file/d/1WK_HHL-oEFYW5sEQEzTmL_cHcaRg0VEU/view?usp=sharing',
  status: 'Open to Software Engineering roles & freelance work',
  /** Part of the bio that the hero sets in bold. */
  bioHighlight: '6+ years',
  bio: 'Senior Software Engineer with 6+ years of experience designing and scaling production backend systems in Python and Django. I build high-performance REST and GraphQL APIs and distributed services, run them on AWS and Kubernetes, and increasingly integrate LLM capabilities (RAG, natural-language-to-SQL, chatbots) into real-world products. I focus on clean architecture, reliability, and shipping software that holds up under real traffic.',
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

/** `short` replaces `label` in the desktop bar, where space is tight; the mobile menu shows `label`. */
type NavLink = { id: SectionId; label: string; short?: string }

export const navLinks: NavLink[] = (
  [
    { id: 'skills', label: 'Skills' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    // Shortened only while the client Projects link sits beside it.
    { id: 'personal-projects', label: 'Personal Projects', short: isShown('projects') ? 'Personal' : undefined },
    { id: 'research', label: 'Research' },
    { id: 'education', label: 'Education' },
    { id: 'certifications', label: 'Certifications' },
    { id: 'contact', label: 'Contact' },
  ] satisfies NavLink[]
).filter((l) => isShown(l.id))

export const sectionTitles: Record<Exclude<SectionId, 'about'>, string> = {
  skills: 'Skills',
  experience: 'Work Experience',
  projects: 'Projects',
  'personal-projects': 'Personal Projects',
  research: 'Research Papers',
  education: 'Education',
  certifications: 'Certifications',
  contact: 'Contact',
}

export const skills: Record<string, string[]> = {
  Languages: ['Python', 'TypeScript', 'JavaScript', 'SQL'],
  Backend: [
    'Django', 'Django REST Framework', 'Django ORM', 'FastAPI', 'Flask', 'Node.js', 'Express.js', 'Celery',
    'Django Channels', 'Microservices', 'REST APIs', 'GraphQL', 'Hasura', 'Jinja', 'Strapi', 'Nix', 'Nix Flakes',
    'Cron Jobs',
  ],
  Frontend: ['React', 'Streamlit', 'Tkinter'],
  Databases: ['PostgreSQL', 'MySQL', 'MongoDB', 'Cassandra', 'Redis', 'Elasticsearch', 'pgvector'],
  'Messaging & Realtime': ['Kafka', 'RabbitMQ', 'WebSockets', 'Socket.io', 'MQTT', 'UDP', 'Serialport (RS422)'],
  'AI / ML': [
    'LLMs', 'Generative AI', 'RAG (Retrieval-Augmented Generation)', 'LangChain', 'OpenAI API',
    'Hugging Face Transformers', 'NLP', 'spaCy', 'Whisper', 'Computer Vision', 'Text-to-SQL', 'Pandas', 'NumPy',
    'Matplotlib', 'PyTorch', 'scikit-learn', 'MCP (Model Context Protocol)', 'Vector Databases', 'Ollama',
  ],
  'DevOps & Cloud': [
    'Docker', 'Kubernetes', 'AWS (EC2, S3, Lambda, RDS, EKS)', 'CI/CD', 'GitHub Actions', 'Nginx',
    'Prometheus', 'Grafana', 'Linux', 'Git', 'Netlify', 'Cloudflare', 'CloudFront', 'Gunicorn',
  ],
  'Testing & Practices': ['pytest', 'TDD', 'Unit Testing', 'Selenium', 'Agile/Scrum'],
  'Auth & Security': ['OAuth2', 'JWT', 'Auth0', 'Clerk'],
  Tools: ['VS Code', 'Postman', 'Figma', 'Jira'],
}

export const skillsFootnote = '& whatever the software demands next.'

export const experience: Experience[] = [
  {
    role: 'Software Engineer',
    tag: 'Current',
    company: 'The Ninja Studio',
    about:
      'The Ninja Studio is a software development company specializing in delivering AI-powered, innovative, and flexible solutions to transform businesses.',
    location: 'Remote',
    period: 'Oct 2024 — Present',
    points: [
      'Cut cron job runtime by 85% through performance tuning and automation scripting.',
      'Engineered AI prototypes, including LLM chatbots and natural-language-to-SQL tools that turn plain-English questions into database queries, for rapid client-facing validation.',
      'Built lightweight internal tools that speed up AI proof-of-concept delivery.',
      'Remediated security vulnerabilities in large distributed systems, working from penetration-test reports.',
      "Serve as the team's DevOps engineer on Kubernetes (AWS EKS) and AWS, diagnosing and resolving production incidents.",
      'Maintain and improve software for IoT devices deployed on every continent except Antarctica.',
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
    about:
      'Getafix is a service based startup company that actively build web and mobile apps for industries like Fintech, Logistics, Retail, and ECommerce.',
    location: 'Bangalore, Karnataka, India · Hybrid',
    period: 'Apr 2022 — Jun 2024',
    points: [
      'Developed and maintained web applications and REST APIs using Python, Django, Django REST Framework, PostgreSQL, and Docker.',
      'Containerized applications with Docker and deployed them to AWS EC2.',
      'Integrated third-party services and APIs, including payment gateways, SMS, maps.',
      'Led a team of backend developers owning task planning and technical guidance through delivery.',
      'Mentored developers and conducted code reviews to raise code quality across the team.',
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
    about:
      'The Indian Institute of Geomagnetism is an autonomous research institute by Department of Science & Technology, Govt. of India.',
    location: 'Navi Mumbai, Maharashtra, India',
    period: 'Feb 2021 — Mar 2022',
    points: [
      'Gathered requirements directly from research scientists and translated them into software features.',
      'Built a Python desktop application with Tkinter that implements analysis methods from published research papers.',
      'Processed and visualized scientific datasets using NumPy, Pandas, and Matplotlib.',
      'Reviewing and comprehending research papers.',
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
    name: 'Analytiks-AI',
    period: 'Oct 2025 — Present',
    tagline:
      'Multi-tenant retail analytics SaaS turning in-store camera and WiFi data into footfall insights for ~80 brands, on Haskell, Go and EKS',
    points: [
      'Created real-time people counting and live occupancy for retail stores.',
      'Created camera calibration tooling, Prometheus and Grafana monitoring, and Slack and email alerts for device health.',
    ],
    tech: [
      'Haskell', 'React', 'TypeScript', 'Hasura', 'GraphQL', 'PostgreSQL', 'Cassandra', 'Kafka', 'MQTT',
      'Kubernetes (AWS EKS)', 'Cloudflare', 'CloudFront', 'Computer Vision',
    ],
  },
  {
    name: 'Happy Miles',
    period: 'Jun 2023 — Jan 2024',
    tagline: 'Travel management system where the company offers education tours to schools and colleges',
    points: [
      'The system is responsible to handle whole cycle, from creating itineraries and displaying its progress to students to managing various tours.',
      'Lead a team of back-end developers providing them with tasks and guiding them throughout the process.',
    ],
    tech: ['Python', 'Django', 'Django REST Framework', 'Django ORM', 'PostgreSQL', 'AWS', 'Nginx', 'Docker'],
  },
  {
    name: 'Counter Drone System (CDS) - Larsen & Toubro',
    period: 'Jan 2023 — Sep 2023',
    tagline:
      'Defense-grade counter-drone system integrating hardware for real-time drone detection, tracking, and neutralization. Presented to CHESS-DRDO',
    points: [
      'Developed an advanced HMI (Human Machine Interface) for real-time detection, tracking, and neutralization of unauthorized drones.',
      'Integrated multiple systems, including Radar, Jammer, RF Detector, Pedestal, Camera, and Directed Energy Weapon (DEW).',
    ],
    tech: ['Node.js', 'Socket.io', 'Redis', 'Serialport (RS422)', 'UDP'],
  },
]

export const personalProjects: PersonalProject[] = [
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
    period: 'Jul 2019 — Jan 2022',
    grade: 'CGPI: 9.18',
  },
  {
    degree: 'Bachelor of Engineering in Information Technology',
    institution: 'University of Mumbai',
    college: "Padmabhushan Vasantdada Patil Pratishthan's College of Engineering",
    location: 'Sion, Mumbai',
    period: 'Jul 2015 — Jul 2018',
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

export const certifications: Certification[] = [
  {
    name: 'Kubernetes Certified Application Developer (CKAD)',
    issuer: 'Udemy',
    date: 'Aug 2026',
    credentialId: 'UC-af9b43f7-cc27-42e8-8c21-861be12ef832',
    url: 'https://www.udemy.com/certificate/UC-af9b43f7-cc27-42e8-8c21-861be12ef832/',
  },
  {
    name: 'MongoDB: A Complete Database Administration Course',
    issuer: 'Udemy',
    date: 'Mar 2024',
    credentialId: 'UC-9f08b1cb-42d4-4caf-b5ae-2fbbb63e833e',
    url: 'https://www.udemy.com/certificate/UC-9f08b1cb-42d4-4caf-b5ae-2fbbb63e833e/',
  },
  {
    name: 'MATLAB Onramp',
    issuer: 'MathWorks',
    date: 'Apr 2021',
    url: 'https://matlabacademy.mathworks.com/progress/share/certificate.html?id=f3800828-c2f1-40db-9268-60b0eba837ef',
  },
  {
    name: 'Natural Language Processing with Classification and Vector Spaces',
    issuer: 'Coursera',
    date: 'Aug 2020',
    credentialId: 'BPGWGAD77NCF',
    url: 'https://www.coursera.org/account/accomplishments/verify/BPGWGAD77NCF',
  },
  {
    name: 'Introduction to Artificial Intelligence (AI)',
    issuer: 'Coursera',
    date: 'Jul 2020',
    credentialId: '4BW2AM27B9ZC',
    url: 'https://www.coursera.org/account/accomplishments/verify/4BW2AM27B9ZC',
  },
  {
    name: 'TensorFlow in Practice',
    issuer: 'Coursera',
    date: 'Jul 2020',
    credentialId: '8R4DZQSD4ABW',
    url: 'https://www.coursera.org/account/accomplishments/professional-cert/8R4DZQSD4ABW',
  },
  {
    name: 'AI For Everyone',
    issuer: 'Coursera',
    date: 'Jun 2020',
    credentialId: 'WTXDYLVYRJEG',
    url: 'https://www.coursera.org/account/accomplishments/verify/WTXDYLVYRJEG',
  },
  {
    name: 'Using Python to Interact with the Operating System',
    issuer: 'Coursera',
    date: 'Jun 2020',
    credentialId: '6ZST8RXHJGP4',
    url: 'https://www.coursera.org/account/accomplishments/verify/6ZST8RXHJGP4',
  },
  {
    name: 'Crash Course on Python',
    issuer: 'Coursera',
    date: 'May 2020',
    credentialId: 'SJBTYYJVZHPR',
    url: 'https://www.coursera.org/account/accomplishments/verify/SJBTYYJVZHPR',
  },
  {
    name: 'Introduction to Psychology',
    issuer: 'Coursera',
    date: 'Apr 2020',
    credentialId: 'J5NA8U3J2JFG',
    url: 'https://www.coursera.org/account/accomplishments/verify/J5NA8U3J2JFG',
  },
  {
    name: 'R-Programming A-Z: R For Data Science With Real Exercises',
    issuer: 'Udemy',
    date: 'Dec 2019',
    credentialId: 'UC-3SI26TJJ',
    url: 'https://www.udemy.com/certificate/UC-3SI26TJJ/',
  },
]

export const contact = {
  message:
    "I'm open to Software Engineering roles, freelance projects and interesting collaborations. Drop a message below or email me directly.",
}
