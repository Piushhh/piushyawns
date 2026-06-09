import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from './models/Project.js';
import Blog from './models/Blog.js';

dotenv.config();

const seedProjects = [
  {
    title: 'CollegeSpace',
    description: 'A collaborative platform for college students to share resources, notes, and connect with peers.',
    tech: ['React', 'Node.js', 'MongoDB', 'Socket.io'],
    link: '',
    status: 'wip',
  },
  {
    title: 'PiushOS',
    description: 'This very portfolio — a retro terminal-themed personal website with CRT effects and custom themes.',
    tech: ['React', 'Vite', 'Express', 'TailwindCSS'],
    link: 'https://github.com/Piushhh/piushyawns',
    status: 'live',
  },
  {
    title: 'BlockChain Explorer',
    description: 'A lightweight blockchain explorer to visualize transactions and blocks on a custom test chain.',
    tech: ['Solidity', 'Ethers.js', 'React', 'Hardhat'],
    link: '',
    status: 'coming-soon',
  },
];

const seedBlogs = [
  {
    title: 'Why I Built a Terminal Portfolio',
    slug: 'why-terminal-portfolio',
    content: `When I set out to build my personal site, I wanted something that would stand out. Not another cookie-cutter template with a hero section and a grid of cards.\n\nI've always loved the aesthetic of old-school terminals — the blinking cursor, the monospaced fonts, the feeling of raw power at your fingertips.\n\nSo I built PiushOS: a fully interactive terminal you can type commands into, complete with CRT scanline effects, retro boot sequences, and even mechanical keyboard sounds.\n\nThe best part? It's not just a gimmick. Every command actually does something useful — you can explore my projects, read my blog, send me a message, and even change the theme.\n\nIf you're a developer thinking about building a portfolio, my advice is: make it YOU. Don't follow trends — set them.`,
    tags: ['portfolio', 'web-dev', 'design'],
    published: true,
  },
  {
    title: 'Getting Started with Blockchain Development',
    slug: 'getting-started-blockchain',
    content: `Blockchain development can seem intimidating at first, but it's more accessible than you think.\n\nHere's my recommended path:\n\n1. Learn Solidity basics — start with simple smart contracts\n2. Set up a local development environment with Hardhat\n3. Write your first ERC-20 token contract\n4. Deploy to a testnet (Sepolia is great for beginners)\n5. Build a frontend that interacts with your contract using Ethers.js\n\nThe key is to build small projects and iterate. Don't try to build the next DeFi protocol on day one.\n\nResources I recommend:\n- Solidity by Example (solidity-by-example.org)\n- Patrick Collins' YouTube course\n- Hardhat documentation\n\nHappy building!`,
    tags: ['blockchain', 'solidity', 'web3'],
    published: true,
  },
  {
    title: 'My Full-Stack Tech Stack in 2025',
    slug: 'fullstack-techstack-2025',
    content: `Here's what I'm using in 2025 and why:\n\nFrontend: React + Vite\n- Vite's hot reload is lightning fast\n- React's ecosystem is unmatched\n\nStyling: TailwindCSS\n- Utility-first CSS saves so much time\n- Dark mode support built-in\n\nBackend: Node.js + Express\n- JavaScript everywhere = less context switching\n- Express is battle-tested and minimal\n\nDatabase: MongoDB + Mongoose\n- Flexible schemas for rapid prototyping\n- Atlas free tier is perfect for side projects\n\nDeployment: Render + Vercel\n- Render for the backend (free tier with auto-deploy)\n- Vercel for the frontend (instant deploys from GitHub)\n\nThis stack lets me move fast, ship often, and keep costs at zero for side projects. What's your stack?`,
    tags: ['tech-stack', 'full-stack', 'tools'],
    published: true,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Project.deleteMany({});
    await Blog.deleteMany({});
    console.log('Cleared existing projects and blogs.');

    // Insert seed data
    await Project.insertMany(seedProjects);
    await Blog.insertMany(seedBlogs);

    console.log(`Seeded ${seedProjects.length} projects and ${seedBlogs.length} blog posts.`);
    console.log('Done! You can now start the server.');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
