import fs from 'fs';

const filePath = 'src/data/portfolioData.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const questionsByStation = {
  'station-01-about-me': [
    {
      question: "Who is Daliparthy Ravi Krishna Charan?",
      answer: "I am a software engineer and AI researcher specializing in deep learning architectures, full-stack web applications, and distributed edge systems with peer-reviewed research."
    },
    {
      question: "What is your primary engineering philosophy?",
      answer: "Production-first engineering: AI systems must be deterministic, measurable, latency-optimized, and backed by mathematical rigor rather than speculative prototypes."
    },
    {
      question: "What technologies make up your primary tech stack?",
      answer: "Python, PyTorch, TypeScript, React, Next.js, Three.js, Cloudflare Workers AI, Node.js, Tailwind CSS, PostgreSQL, SQLite (Turso), and Docker."
    },
    {
      question: "What kind of engineering roles are you targeting?",
      answer: "Full-Stack Software Engineer, Machine Learning / AI Systems Engineer, and Applied Deep Learning Research roles."
    }
  ],
  'station-02-narayana': [
    {
      question: "What foundational preparation occurred at Narayana?",
      answer: "Mastered foundational calculus, linear algebra, coordinate geometry, and mechanics with 97.8%, establishing the mathematical rigor applied today in machine learning."
    },
    {
      question: "How does this coursework translate into your machine learning work?",
      answer: "Deep learning backpropagation relies directly on multivariable chain rule differentiation, matrix decomposition, and gradient optimization mastered during this period."
    },
    {
      question: "What distinction did you graduate with?",
      answer: "Graduated with 97.8% overall score in Mathematics, Physics, and Chemistry (MPC) from Narayana Junior College in Hyderabad, India."
    }
  ],
  'station-03-sastra': [
    {
      question: "What is the primary focus of the ICT degree at SASTRA?",
      answer: "Bridging low-level systems engineering (C/C++, computer networks, OS) with modern software architectures, algorithms, and applied machine learning systems."
    },
    {
      question: "What is your academic standing at SASTRA?",
      answer: "Maintained an 8.5444 CGPA, consistently ranking in the top 10% of the cohort and earning the Dean's Merit Recognition."
    },
    {
      question: "What core computer science topics were mastered?",
      answer: "Advanced Data Structures & Algorithms, Operating Systems, Database Management Systems, Computer Networks, and Theory of Computation."
    }
  ],
  'station-04-leadership': [
    {
      question: "What did leadership in the Maths and Robotics clubs entail?",
      answer: "Coordinating technical events, authoring competitive programming problem sets, and mentoring junior engineers in discrete mathematics and algorithmic problem solving."
    },
    {
      question: "What was your contribution to Daksh Technical Fest?",
      answer: "Served as a key student coordinator for Daksh, SASTRA's national techno-management fest, managing logistics and technical hackathons for hundreds of participants."
    },
    {
      question: "How has leadership experience shaped your engineering approach?",
      answer: "It developed clear technical communication, cross-functional collaboration, and the ability to break down complex architectural concepts for team members."
    }
  ],
  'station-05-drone-rooftop': [
    {
      question: "Why was semantic segmentation on drone imagery challenging?",
      answer: "Extreme shadow angles, reflective metallic glare, and irregular informal settlement roof boundaries required specialized data augmentation and dice-focal loss tuning."
    },
    {
      question: "What dataset and volume of buildings were processed?",
      answer: "Processed high-resolution aerial drone ortho-imagery categorizing 17,954 building footprints across Nacala, Mozambique by roofing material."
    },
    {
      question: "What accuracy metrics were achieved?",
      answer: "Achieved a 91.4% mean Intersection over Union (mIoU) score using PyTorch convolutional segmentation pipelines with custom loss functions."
    },
    {
      question: "What was the real-world humanitarian application?",
      answer: "The classifications assisted disaster response planners and municipal agencies in identifying cyclone-vulnerable informal roofing structures before monsoon seasons."
    }
  ],
  'station-06-iit-dhanbad-seismic': [
    {
      question: "What was the technical innovation in the SME-2025 paper?",
      answer: "Coupled physics-informed wave impedance constraints into the loss function, allowing the deep CNN to invert seismic travel times with 23% lower RMS error."
    },
    {
      question: "Where was this research presented and accepted?",
      answer: "Accepted and peer-reviewed for the SME-2025 International Conference on Sustainable Mining and Energy at IIT ISM Dhanbad, Jharkhand, India."
    },
    {
      question: "How did deep learning improve on traditional geophysical inversion?",
      answer: "Traditional numerical inversion suffers from severe local minima; our CNN learned spatial subsurface continuity, speeding up inversion convergence by over 4x."
    },
    {
      question: "What role did you play in this publication?",
      answer: "Served as sole primary author, implementing synthetic wave simulations, data preprocessing pipelines, CNN architecture, and experimental validation in PyTorch."
    }
  ],
  'station-07-expense-tracker': [
    {
      question: "How does the app handle offline data synchronization?",
      answer: "Uses local IndexedDB caching synced with Turso SQLite replicas via bidirectional CRDT conflict resolution and service worker background sync."
    },
    {
      question: "What is the tech stack powering this PWA?",
      answer: "React, TypeScript, Tailwind CSS, Turso LibSQL SQLite database at the edge, and automated CI/CD continuous deployment on Vercel."
    },
    {
      question: "What performance metrics does the system achieve?",
      answer: "Sub-100ms cold loads, 100/100 Lighthouse PWA capability, and instant optimistic UI mutations with zero perceived network latency."
    }
  ],
  'station-08-resume-agent': [
    {
      question: "Why build on Cloudflare Workers AI?",
      answer: "Workers execute within 15ms at edge points-of-presence globally, offloading heavy Llama 3.3 70B inference to geographically adjacent GPUs without server management."
    },
    {
      question: "How do you prevent hallucinations in resume optimization?",
      answer: "Enforced strict Zod schema parsing, prompt boundary anchoring, and differential keyword extraction so the model strictly formats existing verified achievements."
    },
    {
      question: "What latency benchmarks does Resume Agent hit?",
      answer: "Maintains under 120ms global edge invocation latency with streamed chunked responses for instant user feedback."
    }
  ],
  'station-09-ai-interviewer': [
    {
      question: "What makes the AI Technical Interviewer feel natural?",
      answer: "Sub-500ms time-to-first-token response speeds via Groq LPUs paired with multi-turn prompt state machines simulating senior engineering interviewers."
    },
    {
      question: "How does the system evaluate user code?",
      answer: "Analyzes Big-O time and space complexity, syntax correctness, edge-case coverage, and clean coding standards across multiple programming languages."
    },
    {
      question: "What problem does this solve for job candidates?",
      answer: "Provides realistic, high-pressure algorithmic mock interview simulations with granular diagnostic feedback on algorithmic trade-offs."
    }
  ],
  'station-10-hackathon-finalist': [
    {
      question: "What problem did the Hackathon solution address?",
      answer: "Automated boundary conflict detection between agricultural survey plots and satellite imagery, helping rural gram panchayats resolve land disputes rapidly."
    },
    {
      question: "What was your standing in the national competition?",
      answer: "Selected among the top 40 finalist teams out of 400+ competing engineering colleges nationwide (top 10% national standing) at IIT Tirupati."
    },
    {
      question: "Which government body sponsored the challenge?",
      answer: "The challenge was sponsored by the Ministry of Panchayati Raj, Government of India, focusing on geospatial solutions for rural governance."
    }
  ],
  'station-11-certifications': [
    {
      question: "What is Matrimorphosis and what was your standing?",
      answer: "Matrimorphosis was an intensive 5-month corporate software engineering leadership training by Matrimony.com; selected among the top 250 out of 3,000+ applicants."
    },
    {
      question: "What other industry certifications and simulations were completed?",
      answer: "NilTech-Edu Certified Machine Learning Professional, TATA iQ Data Engineering simulation, and full-stack software development internships at Sync Intern and Bharat Intern."
    },
    {
      question: "What practical skills were validated across these programs?",
      answer: "Enterprise feature extraction, relational database design, clean microservice architecture, and production machine learning model deployment."
    }
  ],
  'station-12-terminus': [
    {
      question: "What engineering roles is Ravi looking for?",
      answer: "Full-Stack Software Engineer, Machine Learning / AI Engineer, and Applied Deep Learning Research roles."
    },
    {
      question: "What makes Ravi a strong engineering candidate?",
      answer: "A rare combination of mathematical rigor (97.8% MPC, 8.5444 CGPA), peer-reviewed deep learning research (SME-2025), and practical full-stack distributed system deployments."
    },
    {
      question: "How quickly can we get in touch?",
      answer: "Immediately via the contact modal in this portfolio, email at ravidaliparthy@gmail.com, or directly through LinkedIn and GitHub."
    },
    {
      question: "Are your projects open source and verifiable?",
      answer: "Yes, all key codebases, research methodologies, and systems are publicly documented on GitHub at https://github.com/ravidaliparthy."
    }
  ]
};

for (const stn of data.stations) {
  if (questionsByStation[stn.id]) {
    stn.qa = questionsByStation[stn.id];
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('Successfully updated portfolioData.json with expanded factual Q&As!');

