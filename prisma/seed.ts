import { PrismaClient, QuestionType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create Profession Categories
  const techCategory = await prisma.professionCategory.create({
    data: {
      category: 'Technology & Engineering',
    },
  });

  const businessCategory = await prisma.professionCategory.create({
    data: {
      category: 'Business & Management',
    },
  });

  const designCategory = await prisma.professionCategory.create({
    data: {
      category: 'Design & Creative',
    },
  });

  const marketingCategory = await prisma.professionCategory.create({
    data: {
      category: 'Marketing & Sales',
    },
  });

  const financeCategory = await prisma.professionCategory.create({
    data: {
      category: 'Finance & Accounting',
    },
  });

  const healthcareCategory = await prisma.professionCategory.create({
    data: {
      category: 'Healthcare & Medical',
    },
  });

  const educationCategory = await prisma.professionCategory.create({
    data: {
      category: 'Education & Training',
    },
  });

  const legalCategory = await prisma.professionCategory.create({
    data: {
      category: 'Legal & Compliance',
    },
  });

  // Create Professions
  await prisma.profession.createMany({
    data: [
      // Technology & Engineering
      { profession_category_id: techCategory.id, name: 'Software Engineer' },
      { profession_category_id: techCategory.id, name: 'Frontend Developer' },
      { profession_category_id: techCategory.id, name: 'Backend Developer' },
      { profession_category_id: techCategory.id, name: 'Full Stack Developer' },
      { profession_category_id: techCategory.id, name: 'DevOps Engineer' },
      { profession_category_id: techCategory.id, name: 'Data Scientist' },
      { profession_category_id: techCategory.id, name: 'Data Engineer' },
      { profession_category_id: techCategory.id, name: 'Machine Learning Engineer' },
      { profession_category_id: techCategory.id, name: 'Product Manager' },
      { profession_category_id: techCategory.id, name: 'Technical Product Manager' },
      { profession_category_id: techCategory.id, name: 'QA Engineer' },
      { profession_category_id: techCategory.id, name: 'Security Engineer' },
      { profession_category_id: techCategory.id, name: 'Cloud Architect' },
      { profession_category_id: techCategory.id, name: 'Mobile Developer' },
      { profession_category_id: techCategory.id, name: 'System Administrator' },

      // Business & Management
      { profession_category_id: businessCategory.id, name: 'CEO' },
      { profession_category_id: businessCategory.id, name: 'CTO' },
      { profession_category_id: businessCategory.id, name: 'COO' },
      { profession_category_id: businessCategory.id, name: 'Business Analyst' },
      { profession_category_id: businessCategory.id, name: 'Project Manager' },
      { profession_category_id: businessCategory.id, name: 'Operations Manager' },
      { profession_category_id: businessCategory.id, name: 'Strategy Consultant' },
      { profession_category_id: businessCategory.id, name: 'Business Development Manager' },
      { profession_category_id: businessCategory.id, name: 'General Manager' },
      { profession_category_id: businessCategory.id, name: 'Entrepreneur' },
      { profession_category_id: businessCategory.id, name: 'Startup Founder' },
      { profession_category_id: businessCategory.id, name: 'Venture Capitalist' },
      { profession_category_id: businessCategory.id, name: 'Investment Banker' },

      // Design & Creative
      { profession_category_id: designCategory.id, name: 'UI/UX Designer' },
      { profession_category_id: designCategory.id, name: 'Graphic Designer' },
      { profession_category_id: designCategory.id, name: 'Product Designer' },
      { profession_category_id: designCategory.id, name: 'Visual Designer' },
      { profession_category_id: designCategory.id, name: 'Brand Designer' },
      { profession_category_id: designCategory.id, name: 'Web Designer' },
      { profession_category_id: designCategory.id, name: 'Motion Graphics Designer' },
      { profession_category_id: designCategory.id, name: 'Creative Director' },
      { profession_category_id: designCategory.id, name: 'Art Director' },
      { profession_category_id: designCategory.id, name: 'Illustrator' },
      { profession_category_id: designCategory.id, name: 'Photographer' },
      { profession_category_id: designCategory.id, name: 'Video Editor' },

      // Marketing & Sales
      { profession_category_id: marketingCategory.id, name: 'Marketing Manager' },
      { profession_category_id: marketingCategory.id, name: 'Digital Marketing Specialist' },
      { profession_category_id: marketingCategory.id, name: 'Content Marketing Manager' },
      { profession_category_id: marketingCategory.id, name: 'Social Media Manager' },
      { profession_category_id: marketingCategory.id, name: 'SEO Specialist' },
      { profession_category_id: marketingCategory.id, name: 'Growth Hacker' },
      { profession_category_id: marketingCategory.id, name: 'Sales Manager' },
      { profession_category_id: marketingCategory.id, name: 'Sales Representative' },
      { profession_category_id: marketingCategory.id, name: 'Account Manager' },
      { profession_category_id: marketingCategory.id, name: 'Customer Success Manager' },
      { profession_category_id: marketingCategory.id, name: 'Brand Manager' },
      { profession_category_id: marketingCategory.id, name: 'PR Manager' },

      // Finance & Accounting
      { profession_category_id: financeCategory.id, name: 'Financial Analyst' },
      { profession_category_id: financeCategory.id, name: 'Accountant' },
      { profession_category_id: financeCategory.id, name: 'CFO' },
      { profession_category_id: financeCategory.id, name: 'Controller' },
      { profession_category_id: financeCategory.id, name: 'Tax Specialist' },
      { profession_category_id: financeCategory.id, name: 'Auditor' },
      { profession_category_id: financeCategory.id, name: 'Financial Planner' },
      { profession_category_id: financeCategory.id, name: 'Investment Advisor' },
      { profession_category_id: financeCategory.id, name: 'Risk Manager' },
      { profession_category_id: financeCategory.id, name: 'Treasury Analyst' },

      // Healthcare & Medical
      { profession_category_id: healthcareCategory.id, name: 'Doctor' },
      { profession_category_id: healthcareCategory.id, name: 'Nurse' },
      { profession_category_id: healthcareCategory.id, name: 'Pharmacist' },
      { profession_category_id: healthcareCategory.id, name: 'Medical Researcher' },
      { profession_category_id: healthcareCategory.id, name: 'Healthcare Administrator' },
      { profession_category_id: healthcareCategory.id, name: 'Physical Therapist' },
      { profession_category_id: healthcareCategory.id, name: 'Medical Device Engineer' },
      { profession_category_id: healthcareCategory.id, name: 'Biomedical Engineer' },
      { profession_category_id: healthcareCategory.id, name: 'Health Data Analyst' },

      // Education & Training
      { profession_category_id: educationCategory.id, name: 'Teacher' },
      { profession_category_id: educationCategory.id, name: 'Professor' },
      { profession_category_id: educationCategory.id, name: 'Training Specialist' },
      { profession_category_id: educationCategory.id, name: 'Instructional Designer' },
      { profession_category_id: educationCategory.id, name: 'Education Administrator' },
      { profession_category_id: educationCategory.id, name: 'Corporate Trainer' },
      { profession_category_id: educationCategory.id, name: 'Curriculum Developer' },
      { profession_category_id: educationCategory.id, name: 'Educational Consultant' },

      // Legal & Compliance
      { profession_category_id: legalCategory.id, name: 'Lawyer' },
      { profession_category_id: legalCategory.id, name: 'Legal Counsel' },
      { profession_category_id: legalCategory.id, name: 'Compliance Officer' },
      { profession_category_id: legalCategory.id, name: 'Paralegal' },
      { profession_category_id: legalCategory.id, name: 'Contract Manager' },
      { profession_category_id: legalCategory.id, name: 'Intellectual Property Specialist' },
      { profession_category_id: legalCategory.id, name: 'Regulatory Affairs Specialist' },
    ],
  });

  // Create Goals Categories
  const jobSeekingCategory = await prisma.goalsCategory.create({
    data: {
      name: 'Job Seeking & Career Growth',
    },
  });

  const businessDevCategory = await prisma.goalsCategory.create({
    data: {
      name: 'Business Development',
    },
  });

  const investingCategory = await prisma.goalsCategory.create({
    data: {
      name: 'Investing',
    },
  });

  const findingInvestorCategory = await prisma.goalsCategory.create({
    data: {
      name: 'Finding Investor',
    },
  });

  const learningCategory = await prisma.goalsCategory.create({
    data: {
      name: 'Learning & Skill Building',
    },
  });

  const networkingCategory = await prisma.goalsCategory.create({
    data: {
      name: 'Networking',
    },
  });

  // Job Seeking & Career Growth Questions
  const jobQ1 = await prisma.question.create({
    data: {
      goals_category_id: jobSeekingCategory.id,
      question: 'What kind of work experience do you bring?',
      type: QuestionType.MULTI_SELECT,
      min_select: 1,
      max_select: null,
      is_required: false,
      answerOptions: {
        create: [
          { label: 'Tech & Product', display_order: 1 },
          { label: 'Design & Creative', display_order: 2 },
          { label: 'Marketing & Growth', display_order: 3 },
          { label: 'Business & Strategy', display_order: 4 },
        ],
      },
    },
  });

  const jobQ2 = await prisma.question.create({
    data: {
      goals_category_id: jobSeekingCategory.id,
      question: 'Tell us a bit more about your experience',
      type: QuestionType.FREE_TEXT,
      placeholder: 'Add a quick note — like your role, years of experience, or a key highlight (e.g. 3 years in UI design, led product launches, managed partnerships in fintech).',
      is_required: false,
    },
  });

  const jobQ3 = await prisma.question.create({
    data: {
      goals_category_id: jobSeekingCategory.id,
      question: 'Nice! Which industries are you most interested in?',
      type: QuestionType.SINGLE_CHOICE,
      min_select: 1,
      max_select: 1,
      is_required: false,
      answerOptions: {
        create: [
          { label: 'Tech & Software', display_order: 1 },
          { label: 'Finance & Fintech', display_order: 2 },
          { label: 'Healthcare & Medtech', display_order: 3 },
          { label: 'Education', display_order: 4 },
          { label: 'Retail & E-commerce', display_order: 5 },
          { label: 'Media & Entertainment', display_order: 6 },
        ],
      },
    },
  });

  const jobQ4 = await prisma.question.create({
    data: {
      goals_category_id: jobSeekingCategory.id,
      question: 'What types of roles are you open to right now?',
      type: QuestionType.MULTI_SELECT,
      min_select: 1,
      max_select: null,
      is_required: false,
      answerOptions: {
        create: [
          { label: 'Full-time', display_order: 1 },
          { label: 'Part-time', display_order: 2 },
          { label: 'Freelance / Contract', display_order: 3 },
          { label: 'Internship', display_order: 4 },
          { label: 'Mentorship', display_order: 5 },
        ],
      },
    },
  });

  const jobQ5 = await prisma.question.create({
    data: {
      goals_category_id: jobSeekingCategory.id,
      question: 'Last one — who would you most like to meet today?',
      type: QuestionType.SINGLE_CHOICE,
      min_select: 1,
      max_select: 1,
      is_required: false,
      answerOptions: {
        create: [
          { label: 'Potential employers', display_order: 1 },
          { label: 'Recruiters', display_order: 2 },
          { label: 'Mentors', display_order: 3 },
          { label: 'Industry peers', display_order: 4 },
          { label: 'Collaborators', display_order: 5 },
        ],
      },
    },
  });

  // Business Development Questions
  const bizQ1 = await prisma.question.create({
    data: {
      goals_category_id: businessDevCategory.id,
      question: 'Tell us a little about your business, what do you do?',
      type: QuestionType.FREE_TEXT,
      placeholder: 'We\'re a SaaS platform helping small businesses with accounting.',
      is_required: false,
    },
  });

  const bizQ2 = await prisma.question.create({
    data: {
      goals_category_id: businessDevCategory.id,
      question: 'Open to teaming up with others?',
      type: QuestionType.SINGLE_CHOICE,
      min_select: 1,
      max_select: 1,
      is_required: false,
      answerOptions: {
        create: [
          { label: 'Yes, definitely', display_order: 1 },
          { label: 'Maybe, depends on the fit', display_order: 2 },
          { label: 'Not right now', display_order: 3 },
        ],
      },
    },
  });

  const bizQ3 = await prisma.question.create({
    data: {
      goals_category_id: businessDevCategory.id,
      question: 'Who would you like most to meet here?',
      type: QuestionType.SINGLE_CHOICE,
      min_select: 1,
      max_select: 1,
      is_required: false,
      answerOptions: {
        create: [
          { label: 'Potential clients', display_order: 1 },
          { label: 'Partners', display_order: 2 },
          { label: 'Distributors', display_order: 3 },
          { label: 'Investors', display_order: 4 },
          { label: 'Media / PR contacts', display_order: 5 },
        ],
      },
    },
  });

  const bizQ4 = await prisma.question.create({
    data: {
      goals_category_id: businessDevCategory.id,
      question: 'Which industries or markets are you focusing on right now?',
      type: QuestionType.MULTI_SELECT,
      min_select: 1,
      max_select: null,
      is_required: false,
      answerOptions: {
        create: [
          { label: 'Technology', display_order: 1 },
          { label: 'Finance', display_order: 2 },
          { label: 'Healthcare', display_order: 3 },
          { label: 'Retail / E-commerce', display_order: 4 },
          { label: 'Education', display_order: 5 },
          { label: 'Manufacturing', display_order: 6 },
          { label: 'Other', display_order: 7 },
        ],
      },
    },
  });

  // Investing Questions
  const invQ1 = await prisma.question.create({
    data: {
      goals_category_id: investingCategory.id,
      question: 'What kind of funding or investment do you provide?',
      type: QuestionType.SINGLE_CHOICE,
      min_select: 1,
      max_select: 1,
      is_required: false,
      answerOptions: {
        create: [
          { label: 'Equity investment', display_order: 1 },
          { label: 'Debt financing / loans', display_order: 2 },
          { label: 'Grants', display_order: 3 },
          { label: 'Convertible notes', display_order: 4 },
          { label: 'Other', display_order: 5 },
        ],
      },
    },
  });

  const invQ2 = await prisma.question.create({
    data: {
      goals_category_id: investingCategory.id,
      question: 'Do you also offer mentorship or strategic support?',
      type: QuestionType.SINGLE_CHOICE,
      min_select: 1,
      max_select: 1,
      is_required: false,
      answerOptions: {
        create: [
          { label: 'Yes, mentorship and strategic guidance', display_order: 1 },
          { label: 'Yes, mentorship only', display_order: 2 },
          { label: 'No, just investment', display_order: 3 },
        ],
      },
    },
  });

  const invQ3 = await prisma.question.create({
    data: {
      goals_category_id: investingCategory.id,
      question: 'Who would you most like to meet here?',
      type: QuestionType.SINGLE_CHOICE,
      min_select: 1,
      max_select: 1,
      is_required: false,
      answerOptions: {
        create: [
          { label: 'Founders / Startups', display_order: 1 },
          { label: 'Co-investors', display_order: 2 },
          { label: 'Venture capital firms', display_order: 3 },
          { label: 'Accelerators / Incubators', display_order: 4 },
          { label: 'Advisors / Mentors', display_order: 5 },
        ],
      },
    },
  });

  const invQ4 = await prisma.question.create({
    data: {
      goals_category_id: investingCategory.id,
      question: 'Which sectors or project types interest you most?',
      type: QuestionType.SINGLE_CHOICE,
      min_select: 1,
      max_select: 1,
      is_required: false,
      answerOptions: {
        create: [
          { label: 'Technology', display_order: 1 },
          { label: 'Finance / Fintech', display_order: 2 },
          { label: 'Healthcare / Medtech', display_order: 3 },
          { label: 'Sustainability / Green tech', display_order: 4 },
          { label: 'Consumer products', display_order: 5 },
          { label: 'Education', display_order: 6 },
          { label: 'Other', display_order: 7 },
        ],
      },
    },
  });

  // Finding Investor Questions
  const findInvQ1 = await prisma.question.create({
    data: {
      goals_category_id: findingInvestorCategory.id,
      question: 'Tell us what you\'re building — what\'s your project or business about?',
      type: QuestionType.MULTI_SELECT,
      min_select: 1,
      max_select: null,
      is_required: false,
      answerOptions: {
        create: [
          { label: 'Tech / Software', display_order: 1 },
          { label: 'Consumer products', display_order: 2 },
          { label: 'Food & beverage', display_order: 3 },
          { label: 'Health & wellness', display_order: 4 },
          { label: 'Education', display_order: 5 },
          { label: 'Sustainability / Green tech', display_order: 6 },
          { label: 'Creative / Media', display_order: 7 },
          { label: 'Finance / Fintech', display_order: 8 },
        ],
      },
    },
  });

  const findInvQ2 = await prisma.question.create({
    data: {
      goals_category_id: findingInvestorCategory.id,
      question: 'What will the funding help you do?',
      type: QuestionType.MULTI_SELECT,
      min_select: 1,
      max_select: null,
      is_required: false,
      answerOptions: {
        create: [
          { label: 'Launch a product', display_order: 1 },
          { label: 'Grow the team', display_order: 2 },
          { label: 'Scale marketing & sales', display_order: 3 },
          { label: 'Buy equipment or set up infrastructure', display_order: 4 },
          { label: 'Fund research & development', display_order: 5 },
          { label: 'Cover operations & working capital', display_order: 6 },
        ],
      },
    },
  });

  const findInvQ3 = await prisma.question.create({
    data: {
      goals_category_id: findingInvestorCategory.id,
      question: 'Who would you most like to meet here?',
      type: QuestionType.SINGLE_CHOICE,
      min_select: 1,
      max_select: 1,
      is_required: false,
      answerOptions: {
        create: [
          { label: 'Founders / Startups', display_order: 1 },
          { label: 'Co-investors', display_order: 2 },
          { label: 'Venture capital firms', display_order: 3 },
          { label: 'Accelerators / Incubators', display_order: 4 },
          { label: 'Advisors / Mentors', display_order: 5 },
        ],
      },
    },
  });

  const findInvQ4 = await prisma.question.create({
    data: {
      goals_category_id: findingInvestorCategory.id,
      question: 'Which sectors or project types interest you most?',
      type: QuestionType.SINGLE_CHOICE,
      min_select: 1,
      max_select: 1,
      is_required: false,
      answerOptions: {
        create: [
          { label: 'Technology', display_order: 1 },
          { label: 'Finance / Fintech', display_order: 2 },
          { label: 'Healthcare / Medtech', display_order: 3 },
          { label: 'Sustainability / Green tech', display_order: 4 },
          { label: 'Consumer products', display_order: 5 },
          { label: 'Education', display_order: 6 },
        ],
      },
    },
  });

  // Learning & Skill Building Questions
  const learnQ1 = await prisma.question.create({
    data: {
      goals_category_id: learningCategory.id,
      question: 'First, Tell us what you could share with others!',
      type: QuestionType.MULTI_SELECT,
      min_select: 1,
      max_select: null,
      is_required: false,
      answerOptions: {
        create: [
          { label: 'Technical skills (e.g. coding, design, data)', display_order: 1 },
          { label: 'Business / Strategy', display_order: 2 },
          { label: 'Marketing / Branding', display_order: 3 },
          { label: 'Creative skills (e.g. writing, art, music)', display_order: 4 },
          { label: 'Education / Coaching', display_order: 5 },
          { label: 'Industry-specific expertise', display_order: 6 },
        ],
      },
    },
  });

  const learnQ2 = await prisma.question.create({
    data: {
      goals_category_id: learningCategory.id,
      question: 'How do you usually share your knowledge?',
      type: QuestionType.SINGLE_CHOICE,
      min_select: 1,
      max_select: 1,
      is_required: false,
      answerOptions: {
        create: [
          { label: 'Training & workshops', display_order: 1 },
          { label: 'Resources & materials', display_order: 2 },
          { label: 'Both', display_order: 3 },
          { label: 'I\'m not sharing (yet)', display_order: 4 },
        ],
      },
    },
  });

  const learnQ3 = await prisma.question.create({
    data: {
      goals_category_id: learningCategory.id,
      question: 'What skills or topics are you looking to learn right now?',
      type: QuestionType.MULTI_SELECT,
      min_select: 1,
      max_select: null,
      is_required: false,
      answerOptions: {
        create: [
          { label: 'Technical skills (e.g. coding, design, data)', display_order: 1 },
          { label: 'Business / Strategy', display_order: 2 },
          { label: 'Marketing / Branding', display_order: 3 },
          { label: 'Creative skills (e.g. writing, art, music)', display_order: 4 },
          { label: 'Education / Coaching', display_order: 5 },
          { label: 'Industry-specific expertise', display_order: 6 },
        ],
      },
    },
  });

  const learnQ4 = await prisma.question.create({
    data: {
      goals_category_id: learningCategory.id,
      question: 'Who would you love to connect with here?',
      type: QuestionType.MULTI_SELECT,
      min_select: 1,
      max_select: null,
      is_required: false,
      answerOptions: {
        create: [
          { label: 'Mentors', display_order: 1 },
          { label: 'Industry experts', display_order: 2 },
          { label: 'Fellow learners', display_order: 3 },
          { label: 'Coaches / Trainers', display_order: 4 },
          { label: 'Collaborators', display_order: 5 },
        ],
      },
    },
  });

  // Networking Questions
  const netQ1 = await prisma.question.create({
    data: {
      goals_category_id: networkingCategory.id,
      question: 'What kind of work experience do you bring?',
      type: QuestionType.MULTI_SELECT,
      min_select: 1,
      max_select: null,
      is_required: false,
      answerOptions: {
        create: [
          { label: 'Tech & Product', display_order: 1 },
          { label: 'Design & Creative', display_order: 2 },
          { label: 'Marketing & Growth', display_order: 3 },
          { label: 'Business & Strategy', display_order: 4 },
        ],
      },
    },
  });

  const netQ2 = await prisma.question.create({
    data: {
      goals_category_id: networkingCategory.id,
      question: 'Tell us a bit more about your experience',
      type: QuestionType.FREE_TEXT,
      placeholder: 'Add a quick note — like your role, years of experience, or a key highlight (e.g. 3 years in UI design, led product launches, managed partnerships in fintech).',
      is_required: false,
    },
  });

  const netQ3 = await prisma.question.create({
    data: {
      goals_category_id: networkingCategory.id,
      question: 'What do you want to get out of networking at this event?',
      type: QuestionType.MULTI_SELECT,
      min_select: 1,
      max_select: null,
      is_required: false,
      answerOptions: {
        create: [
          { label: 'Find potential partners', display_order: 1 },
          { label: 'Explore collaborations', display_order: 2 },
          { label: 'Meet industry peers', display_order: 3 },
          { label: 'Expand my professional circle', display_order: 4 },
          { label: 'Stay updated on trends', display_order: 5 },
          { label: 'Other', display_order: 6 },
        ],
      },
    },
  });

  const netQ4 = await prisma.question.create({
    data: {
      goals_category_id: networkingCategory.id,
      question: 'Who would you want to meet the most?',
      type: QuestionType.MULTI_SELECT,
      min_select: 1,
      max_select: null,
      is_required: false,
      answerOptions: {
        create: [
          { label: 'Possible business partners', display_order: 1 },
          { label: 'Collaborators', display_order: 2 },
          { label: 'Mentors / Advisors', display_order: 3 },
          { label: 'Potential clients', display_order: 4 },
          { label: 'Industry peers', display_order: 5 },
          { label: 'Friends in the field', display_order: 6 },
        ],
      },
    },
  });

  const netQ5 = await prisma.question.create({
    data: {
      goals_category_id: networkingCategory.id,
      question: 'Lastly, which sectors, industries, or topics get you excited?',
      type: QuestionType.MULTI_SELECT,
      min_select: 1,
      max_select: null,
      is_required: false,
      answerOptions: {
        create: [
          { label: 'Technology', display_order: 1 },
          { label: 'Creative / Media', display_order: 2 },
          { label: 'Finance / Business', display_order: 3 },
          { label: 'Healthcare / Wellness', display_order: 4 },
          { label: 'Education', display_order: 5 },
          { label: 'Sustainability / Green tech', display_order: 6 },
          { label: 'Consumer products & services', display_order: 7 },
        ],
      },
    },
  });

  // Create Question Orders
  await prisma.questionOrder.createMany({
    data: [
      // Job Seeking & Career Growth
      { goals_category_id: jobSeekingCategory.id, question_id: jobQ1.id, display_order: 1 },
      { goals_category_id: jobSeekingCategory.id, question_id: jobQ2.id, display_order: 2 },
      { goals_category_id: jobSeekingCategory.id, question_id: jobQ3.id, display_order: 3 },
      { goals_category_id: jobSeekingCategory.id, question_id: jobQ4.id, display_order: 4 },
      { goals_category_id: jobSeekingCategory.id, question_id: jobQ5.id, display_order: 5 },
      // Business Development
      { goals_category_id: businessDevCategory.id, question_id: bizQ1.id, display_order: 1 },
      { goals_category_id: businessDevCategory.id, question_id: bizQ2.id, display_order: 2 },
      { goals_category_id: businessDevCategory.id, question_id: bizQ3.id, display_order: 3 },
      { goals_category_id: businessDevCategory.id, question_id: bizQ4.id, display_order: 4 },
      // Investing
      { goals_category_id: investingCategory.id, question_id: invQ1.id, display_order: 1 },
      { goals_category_id: investingCategory.id, question_id: invQ2.id, display_order: 2 },
      { goals_category_id: investingCategory.id, question_id: invQ3.id, display_order: 3 },
      { goals_category_id: investingCategory.id, question_id: invQ4.id, display_order: 4 },
      // Finding Investor
      { goals_category_id: findingInvestorCategory.id, question_id: findInvQ1.id, display_order: 1 },
      { goals_category_id: findingInvestorCategory.id, question_id: findInvQ2.id, display_order: 2 },
      { goals_category_id: findingInvestorCategory.id, question_id: findInvQ3.id, display_order: 3 },
      { goals_category_id: findingInvestorCategory.id, question_id: findInvQ4.id, display_order: 4 },
      // Learning & Skill Building
      { goals_category_id: learningCategory.id, question_id: learnQ1.id, display_order: 1 },
      { goals_category_id: learningCategory.id, question_id: learnQ2.id, display_order: 2 },
      { goals_category_id: learningCategory.id, question_id: learnQ3.id, display_order: 3 },
      { goals_category_id: learningCategory.id, question_id: learnQ4.id, display_order: 4 },
      // Networking
      { goals_category_id: networkingCategory.id, question_id: netQ1.id, display_order: 1 },
      { goals_category_id: networkingCategory.id, question_id: netQ2.id, display_order: 2 },
      { goals_category_id: networkingCategory.id, question_id: netQ3.id, display_order: 3 },
      { goals_category_id: networkingCategory.id, question_id: netQ4.id, display_order: 4 },
      { goals_category_id: networkingCategory.id, question_id: netQ5.id, display_order: 5 },
    ],
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });