import { RewardItem, SquadMember, ActiveChallenge, PointTransaction, QuizQuestion, TripRecord } from '../types';

export const INITIAL_POINTS = 2450;
export const INITIAL_XP = 980;

export const INITIAL_TRIPS: TripRecord[] = [
  {
    id: 'trip-101',
    startTime: Date.now() - 3600000 * 5,
    endTime: Date.now() - 3600000 * 4.6,
    dateStr: 'Today, 08:30 AM',
    distanceKm: 8.4,
    durationSec: 1440,
    avgSpeedKmH: 44,
    maxSpeedKmH: 58,
    score: 94,
    smoothBrakingPct: 96,
    phoneFocusPct: 100,
    co2SavedKg: 0.92,
    pointsEarned: 165,
    xpEarned: 330,
    origin: 'Koramangala 4th Block',
    destination: 'Indiranagar 100ft Rd'
  },
  {
    id: 'trip-102',
    startTime: Date.now() - 3600000 * 26,
    endTime: Date.now() - 3600000 * 25.4,
    dateStr: 'Yesterday, 06:15 PM',
    distanceKm: 12.2,
    durationSec: 2160,
    avgSpeedKmH: 38,
    maxSpeedKmH: 52,
    score: 91,
    smoothBrakingPct: 92,
    phoneFocusPct: 100,
    co2SavedKg: 1.34,
    pointsEarned: 220,
    xpEarned: 440,
    origin: 'Connaught Place Outer',
    destination: 'Saket District Centre'
  },
  {
    id: 'trip-103',
    startTime: Date.now() - 3600000 * 50,
    endTime: Date.now() - 3600000 * 49.5,
    dateStr: '2 days ago, 09:10 AM',
    distanceKm: 6.5,
    durationSec: 1100,
    avgSpeedKmH: 48,
    maxSpeedKmH: 59,
    score: 88,
    smoothBrakingPct: 89,
    phoneFocusPct: 95,
    co2SavedKg: 0.71,
    pointsEarned: 135,
    xpEarned: 270,
    origin: 'Bandra West Promenade',
    destination: 'BKC Financial Hub'
  }
];

export const SQUAD_MEMBERS: SquadMember[] = [
  {
    id: '1',
    name: 'Arjun K.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'Top Contributor',
    score: 94,
    trend: 'up',
    streakDays: 18,
    highlightBadge: 'Eco Master'
  },
  {
    id: '2',
    name: 'Priya S.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    status: 'Clean Streak: 12 days',
    score: 89,
    trend: 'up',
    streakDays: 12,
    highlightBadge: 'Zero Infraction'
  },
  {
    id: '3',
    name: 'You',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'Recent: Smooth Braking',
    score: 82,
    isCurrentUser: true,
    trend: 'up',
    streakDays: 7,
    highlightBadge: 'Diamond Bound'
  },
  {
    id: '4',
    name: 'Rohan M.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'Clean Commuter',
    score: 79,
    trend: 'same',
    streakDays: 5
  },
  {
    id: '5',
    name: 'Ananya D.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    status: 'Night Owl Safe',
    score: 76,
    trend: 'up',
    streakDays: 4
  }
];

export const ACTIVE_CHALLENGES: ActiveChallenge[] = [
  {
    id: 'c1',
    title: '300km Clean Driving',
    iconType: 'speed',
    currentValue: 225,
    targetValue: 300,
    unit: 'km',
    rewardXp: 500,
    rewardPoints: 250,
    description: 'Maintain speed limits and smooth acceleration over 300km.'
  },
  {
    id: 'c2',
    title: 'Midnight Vigilante',
    iconType: 'moon',
    currentValue: 1,
    targetValue: 1,
    unit: 'streak',
    rewardXp: 1200,
    rewardPoints: 600,
    description: '0 Infractions after 11 PM across last 5 night trips.'
  },
  {
    id: 'c3',
    title: 'Zero Tailgating Streak',
    iconType: 'shield',
    currentValue: 85,
    targetValue: 100,
    unit: 'km',
    rewardXp: 350,
    rewardPoints: 150,
    description: 'Keep a 2+ second safe buffer distance in dense urban traffic.'
  }
];

export const REWARDS: RewardItem[] = [
  {
    id: 'r1',
    title: 'Fuel Vouchers',
    subtitle: 'Valid at all HP & BP stations',
    cost: 500,
    badge: 'POPULAR',
    category: 'fuel',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=80',
    terms: 'Instant digital barcode redeemable across 14,000+ certified partner gas stations.',
    partner: 'Bharat Petroleum & HP Fleet',
    expiryDays: 45
  },
  {
    id: 'r2',
    title: 'Insurance Discount – 10%',
    subtitle: 'Annual premium renewal off',
    cost: 1500,
    badge: 'PREMIUM',
    category: 'insurance',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
    terms: 'Applied directly to your policy renewal certificate with partner underwriters (HDFC Ergo, ICICI Lombard).',
    partner: 'Underwriters Alliance Network',
    expiryDays: 90
  },
  {
    id: 'r3',
    title: 'Plant 5 Trees',
    subtitle: 'Verified reforestation project',
    cost: 1000,
    badge: 'IMPACT',
    category: 'trees',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
    terms: 'GPS geo-tagged sapling planted in urban green corridors with satellite growth verification.',
    partner: 'Grow-Trees & Urban Canopy Trust',
    expiryDays: 365
  },
  {
    id: 'r4',
    title: 'EV Rental Credits',
    subtitle: 'Get 2 hours of free riding for your perfect week',
    cost: 500,
    badge: 'GREEN',
    category: 'ev',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
    terms: '2 hours credit for shared electric scooters and micro-mobility hubs in smart city zones.',
    partner: 'Yulu & Ather Hubs',
    expiryDays: 30
  }
];

export const INITIAL_TRANSACTIONS: PointTransaction[] = [
  {
    id: 'tx-1',
    title: '300km Clean Driving Milestone',
    date: 'Today, 08:30 AM',
    amount: 250,
    type: 'earn',
    category: 'Challenge'
  },
  {
    id: 'tx-2',
    title: 'Smooth Highway Braking Score > 90',
    date: 'Yesterday, 06:15 PM',
    amount: 120,
    type: 'earn',
    category: 'Telematics'
  },
  {
    id: 'tx-3',
    title: 'Redeemed Fuel Voucher (HP)',
    date: 'Aug 11, 2026',
    amount: -500,
    type: 'redeem',
    category: 'Marketplace'
  },
  {
    id: 'tx-4',
    title: 'Urban Guardians Squad Top 5% Bonus',
    date: 'Aug 10, 2026',
    amount: 350,
    type: 'earn',
    category: 'League'
  }
];

export const ROAD_IQ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    level: 'LEVEL 0: INITIATION',
    question: 'When riding at 60 km/h, what is the minimum safe distance to maintain from the vehicle ahead?',
    options: [
      '1 Second',
      '2 Seconds',
      'Half a car length',
      'Just enough to see their tires'
    ],
    correctIndex: 1,
    explanation: 'Correct! The 2–second buffer is the professional standard to allow reaction time and stopping distance.'
  },
  {
    id: 'q2',
    level: 'LEVEL 1: CORNERING & TRACTION',
    question: 'What is the optimal braking technique when approaching an unexpected sharp curve?',
    options: [
      'Brake hard while turning inside the corner',
      'Trail-brake gently in a straight line before turn-in',
      'Accelerate through without touching brakes',
      'Lock rear brake to slide the tail'
    ],
    correctIndex: 1,
    explanation: 'Correct! Completing 90% of braking in a straight line before initiating the lean preserves maximum tire grip.'
  },
  {
    id: 'q3',
    level: 'LEVEL 2: SQUAD TELEMETRY',
    question: 'How does SafeDrive calculate your weekly Squad Contribution score?',
    options: [
      'Only by total speed clocked',
      'By weighting smooth deceleration, lane discipline, and zero nighttime phone distraction',
      'By highest horsepower logged',
      'By random weekly raffle'
    ],
    correctIndex: 1,
    explanation: 'Correct! SafeDrive weights smooth G-forces, speed limit adherence, and distraction-free miles.'
  }
];

export const ROAD_IQ_PILLARS = [
  {
    title: 'The 2–Second Buffer',
    subtitle: 'Maintain space to react. It’s not just safe, it’s professional.',
    badge: 'PRO TIP',
    hudTag: 'ROAD IQ MASTERY ONBOARDING',
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80',
    detail: 'At 60 km/h, your vehicle covers 16.7 meters every single second. A 2-second buffer provides 33.4 meters of clear decision corridor, eliminating 84% of rear-end collision risk.'
  },
  {
    title: 'Smooth G-Balance',
    subtitle: 'Harmonious acceleration and progressive braking protect your engine, tires, and passenger comfort.',
    badge: 'FLOW STATE',
    hudTag: 'TELEMETRIC DYNAMICS',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80',
    detail: 'Keeping longitudinal and lateral deceleration within 0.25G creates an optimal flow state, saving up to 18% in fuel consumption while ranking your squad in the top tier.'
  },
  {
    title: 'Zero Distraction Shield',
    subtitle: 'Locked eyes on the road. Silence notifications, amplify focus.',
    badge: 'ELITE STATUS',
    hudTag: 'COGNITIVE SAFETY',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80',
    detail: 'Glancing at a mobile screen for just 3 seconds at highway speed is equivalent to driving blindfolded across the length of an entire soccer pitch.'
  }
];

export const SURVEY_REPORT_DATA = {
  meta: {
    sampleSize: 48,
    demographics: '91.7% Students, 85.4% Aged 18–21, 85.4% Regular Two-Wheeler Riders',
    methodology: 'Direct field questionnaire across university transit corridors (Directional Gen-Z signal)',
    keyTakeaway: 'Friction & complacency, not ignorance or peer pressure, is the core cause of non-compliance.'
  },
  keyMetrics: [
    { label: 'Non-Compliant Helmet Use', value: '77.1%', change: 'At least sometimes', highlight: 'danger' },
    { label: 'Short Distance Complacency', value: '56.2%', change: '"Feels unnecessary"', highlight: 'warning' },
    { label: 'App Adoption Intent', value: '79.2%', change: '35.4% Firm Yes + 43.8% Maybe', highlight: 'success' },
    { label: 'Personal Safety Score Hook', value: '43.8%', change: 'Preferred over pod-only score', highlight: 'primary' }
  ],
  helmetUsage: [
    { category: 'Rarely', percentage: 37.5, count: 18, color: 'bg-rose-500' },
    { category: 'Sometimes', percentage: 25.0, count: 12, color: 'bg-amber-500' },
    { category: 'Always', percentage: 22.9, count: 11, color: 'bg-emerald-600' },
    { category: 'Never', percentage: 14.6, count: 7, color: 'bg-rose-700' }
  ],
  reasonsForSkippingHelmet: [
    { reason: 'Short distance, feels unnecessary', percentage: 56.2, rank: 1 },
    { reason: 'Messes up hair or aesthetic look', percentage: 14.6, rank: 2 },
    { reason: 'Uncomfortable or hot in traffic', percentage: 12.5, rank: 3 }
  ],
  complianceInfractions: [
    { title: 'Phone Usage (Calls/Texts/Maps)', never: 43.8, rarely: 35.4, sometimes: 20.8 },
    { title: 'Speed Limit Violations', never: 16.7, rarely: 43.8, sometimes: 20.8 }
  ],
  likertStatements: [
    {
      statement: 'Fines / police checks are the main reason I follow rules',
      topResponse: '45.8% Agree (4–5)',
      mean: 3.17,
      interpretation: 'Traditional enforcement is a secondary, transactional constraint.'
    },
    {
      statement: 'Accidents happen to other people, not really to me',
      topResponse: '47.9% Strongly Disagree (1)',
      mean: 2.10,
      interpretation: 'Riders understand mortality risk intellectually, yet disconnect in daily action.'
    },
    {
      statement: "I'd feel judged by friends if I were the cautious one",
      topResponse: '43.8% Strongly Disagree (1)',
      mean: 2.33,
      interpretation: 'Direct peer pressure to be reckless is weak; apathy is the true hurdle.'
    },
    {
      statement: "My close friends don't strictly follow rules either",
      topResponse: '31.2% Disagree (2)',
      mean: 2.77,
      interpretation: 'Passive peer tolerance enables habitual non-compliance.'
    }
  ],
  motivations: [
    { option: 'Seeing my own personal safety score', percentage: 43.8, lead: true },
    { option: 'Knowing my score affects a shared score with a close group', percentage: 22.9, lead: false },
    { option: 'Cash or discount regardless of score', percentage: 16.7, lead: false },
    { option: 'Neither motivates me', percentage: 16.7, lead: false }
  ],
  enforcementDrivers: [
    { driver: 'Fear of an actual accident', percentage: 72.9, type: 'primary' },
    { driver: 'A visible reward or discount', percentage: 37.5, type: 'incentive' },
    { driver: 'Fear of getting caught by police', percentage: 27.1, type: 'punitive' }
  ],
  openFeedback: [
    {
      quote: "People always start getting aware after they themselves face a consequence... people feel no one is stopping us from riding without helmets, so why should we — incentives might help.",
      author: "Student Commuter, 19",
      tag: "Incentive Thesis"
    },
    {
      quote: "What if people misuse the app to get a good score — like wearing a helmet once to prove it, then removing it? Isn't that a loophole?",
      author: "Engineering Undergrad, 21",
      tag: "Anti-Gaming Risk"
    },
    {
      quote: "Everyone's life is as precious as mine.",
      author: "Regular Rider, 20",
      tag: "Shared Empathy"
    }
  ],
  strategicImplications: [
    {
      pillar: 'Personal-First Telematics',
      desc: '44% prioritize their personal score over group scores. Lead with individual mastery & instant feedback; use Squads for retention and league status.'
    },
    {
      pillar: 'Eliminating the "Short Ride" Trap',
      desc: '56% skip safety on short hops. SafeDrive automated passive trip detection eliminates friction without manual app triggers.'
    },
    {
      pillar: 'Continuous Anti-Gaming Architecture',
      desc: 'Direct response to user feedback on loopholes: AI sensor fusion (accelerometer + gyro + vision AI) continuously verifies posture and helmet compliance.'
    },
    {
      pillar: 'Rewards Beat Fines (38% vs 27%)',
      desc: 'Visible vouchers & insurance credits provide recurring positive reinforcement where sporadic fines fail.'
    }
  ]
};

export const GRANT_TALKING_POINTS: Record<string, { title: string; bullets: string[] }> = {
  problem: {
    title: 'Problem: The Global Road Crisis',
    bullets: [
      'Developing economies represent 1% of global luxury/new vehicle fleets, yet suffer 11% of global road fatalities.',
      'The 18–25 youth demographic does not suffer from lack of driver education; they suffer from a lack of behavioral incentive.',
      'Traditional penalties (traffic fines) are viewed as passive friction or an occasional tax, completely failing to shift daily driving habits.'
    ]
  },
  survey: {
    title: 'Field Research & Empirical Validation (N=48)',
    bullets: [
      'Empirical confirmation: 77% of young riders admit to helmet non-compliance, driven by short-distance complacency (56%) rather than ignorance.',
      'Riders overwhelmingly prefer Personal Safety Scores (44%) over squad-only scores (23%), and tangible rewards (38%) beat fear of police fines (27%).',
      'Addressed real user feedback on score-gaming: SafeDrive implements continuous passive telematics rather than one-time snapshot checks.'
    ]
  },
  model: {
    title: 'The Kinetic Behavioral Model',
    bullets: [
      'Converting punitive fines into aspirational social status ("From Fines to Flexing").',
      'The 3 Pillars: Tangible Economic Incentives, Social Accountability & Squad Leagues, and Real-time Telematics Nudges.',
      'Instant telemetric feedback loops gamify driving into a precision sport of flow, mastery, and community prestige.'
    ]
  },
  solutions: {
    title: 'The Solutions Ecosystem',
    bullets: [
      'Safety Squads: Local neighborhood teams (e.g. Bandra Roads, Eco-Drivers) pooling clean miles to unlock collective municipal rewards.',
      'Impact Marketplace: Earned points convert directly into fuel vouchers, discounted insurance premiums, and municipal tree planting.',
      'Production-ready Telematics Engine: Zero-hardware mobile sensor processing with real-time G-force, buffer, and speed limit tracking.'
    ]
  },
  roadmap: {
    title: 'Grant Deployment & Impact Projections',
    bullets: [
      'Phase 1 ($500K Grant): 50,000 driver pilot across 3 major metro transport corridors.',
      'Phase 2: Commercial insurance underwriter integration reducing loss ratios by 24%.',
      'Projected 3-Year Impact: 38% reduction in urban traffic collisions and 1,200 metric tons of CO2 offset through eco-driving.'
    ]
  }
};
