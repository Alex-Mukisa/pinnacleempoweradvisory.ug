export const company = {
  name: 'Pinnacle Empower Advisory Limited',
  tagline: 'Turning Business Decisions into Profitable Opportunities',
  mission: 'To empower entrepreneurs and investors with the knowledge, financial insights, technology, and business tools they need to build, manage, and grow profitable enterprises.',
  intro: 'We bring together business intelligence, financial analysis, and technology to help businesses operate smarter. We help clients understand their businesses, measure opportunities, manage risks, and build systems that support sustainable growth.',
  promise: 'Analyze. Plan. Invest Wisely. Manage Efficiently. Grow Profitably.',
  strengths: [
    { title: 'Business Intelligence', description: 'Understand business performance and identify opportunities for informed action.' },
    { title: 'Financial Analysis', description: 'Assess profitability, returns, projections, and pricing decisions.' },
    { title: 'Technology', description: 'Apply business systems and technology solutions to support operations.' },
  ],
  phone: '+256 751 206 482',
  additionalPhone: '+256 775 674 134',
  email: 'pinnacleempoweradvisory@gmail.com',
  contactName: 'Alex Mukisa',
  contactRole: 'Chief Executive Officer',
  address: '14 Katalima Rd, Kampala',
} as const

export const navigation = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Who we support', to: '/industries' },
  { label: 'Projects', to: '/projects' },
  { label: 'Insights', to: '/insights' },
] as const

export const services = [
  {
    id: '01',
    title: 'Investment & Business Profitability Analysis',
    description: 'Analyze business performance and investment opportunities with a focus on understanding profitability and informing decisions.',
  },
  {
    id: '02',
    title: 'Return on Investment & Financial Projections',
    description: 'Examine expected returns and financial projections to help entrepreneurs and investors assess opportunities and plan ahead.',
  },
  {
    id: '03',
    title: 'Strategic Pricing of Goods & Services',
    description: 'Develop pricing approaches for goods and services that account for business objectives and financial considerations.',
  },
  {
    id: '04',
    title: 'Tailor-Made Business Systems & ERP Solutions',
    description: 'Tailored business systems and ERP solutions to help enterprises manage and coordinate their operations.',
  },
  {
    id: '05',
    title: 'Technology & IT Solutions',
    description: 'Technology and IT solutions aligned with the operational needs and goals of your business.',
  },
] as const
