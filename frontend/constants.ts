import { Question, Mentor, Opportunity, OpportunityType, User, UserRole, Badge, Conversation, Notification } from './types';

export const APP_NAME = "EduLab Africa";


export const MOCK_USER: User = {
  id: 'u1',
  name: 'Amara Diop',
  avatar: 'https://picsum.photos/200',
  role: UserRole.STUDENT,
  points: 1250,
  badges: ['b1', 'b2'],
  university: 'Université Cheikh Anta Diop',
  country: 'Sénégal',
  isOnline: true
};

export const BADGES: Badge[] = [
  { id: 'b1', name: 'Premier Pas', description: 'Première question posée', icon: '👣', color: 'bg-blue-100 text-blue-600' },
  { id: 'b2', name: 'Savant', description: '10 meilleures réponses', icon: '🦉', color: 'bg-yellow-100 text-yellow-600' },
  { id: 'b3', name: 'Mentor Star', description: 'Note moyenne de 5.0', icon: '⭐', color: 'bg-purple-100 text-purple-600' },
  { id: 'b4', name: 'Globe Trotter', description: 'Aidé des étudiants de 5 pays', icon: '🌍', color: 'bg-green-100 text-green-600' },
  { id: 'b5', name: 'Curieux', description: 'Avoir visité 50 questions', icon: '🔍', color: 'bg-indigo-100 text-indigo-600' },
  { id: 'b6', name: 'Tech Guru', description: 'Répondre à 20 questions Tech', icon: '💻', color: 'bg-pink-100 text-pink-600' },
  { id: 'b7', name: 'Philanthrope', description: 'Donner 5 sessions de mentorat', icon: '🤝', color: 'bg-orange-100 text-orange-600' },
  { id: 'b8', name: 'Légende', description: 'Atteindre 5000 points', icon: '👑', color: 'bg-red-100 text-red-600' },
];

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 'q1',
    author: { ...MOCK_USER, name: 'Kwame Mensah', country: 'Ghana' },
    title: "Comment résoudre les équations différentielles du second ordre ?",
    content: "Je bloque sur la méthode de variation de la constante pour les équations non homogènes. Quelqu'un peut expliquer simplement ?",
    tags: ['Mathématiques', 'Analyse', 'Université'],
    votes: 15,
    answers: 4,
    createdAt: 'Il y a 2 heures',
    isSolved: false
  },
  {
    id: 'q2',
    author: { ...MOCK_USER, name: 'Fatima Benali', country: 'Maroc' },
    title: "Meilleures ressources pour apprendre React en 2024 ?",
    content: "Je cherche des tutoriels adaptés aux débutants francophones pour le développement web moderne.",
    tags: ['Informatique', 'Web', 'React'],
    votes: 32,
    answers: 8,
    createdAt: 'Il y a 5 heures',
    isSolved: true
  },
  {
    id: 'q3',
    author: { ...MOCK_USER, name: 'Jean-Paul K.', country: 'Cameroun' },
    title: "Différence entre mitose et méiose ?",
    content: "J'ai un examen de biologie demain et je confonds toujours les phases.",
    tags: ['Biologie', 'Lycée', 'SVT'],
    votes: 8,
    answers: 2,
    createdAt: 'Il y a 1 jour',
    isSolved: false
  }
];

export const MOCK_MENTORS: Mentor[] = [
  {
    id: 'm1',
    user: {
      id: 'u2',
      name: 'Dr. Ngozi Okonjo',
      avatar: 'https://picsum.photos/201',
      role: UserRole.MENTOR,
      points: 5000,
      badges: ['b3', 'b4'],
      university: 'University of Lagos',
      country: 'Nigeria',
      isOnline: true
    },
    specialties: ['Économie', 'Gestion', 'Leadership'],
    bio: "Docteur en économie avec plus de 15 ans d'expérience académique et professionnelle. J'ai travaillé avec plusieurs institutions financières internationales et je suis passionnée par l'enseignement de la macroéconomie aux futurs leaders africains. Mon approche pédagogique est basée sur des cas pratiques réels du continent.",
    rating: 4.9,
    reviews: 120,
    availability: 'Dispo. soirs et weekends',
    socials: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com"
    }
  },
  {
    id: 'm2',
    user: {
      id: 'u3',
      name: 'Prof. Youssef El-Mansouri',
      avatar: 'https://picsum.photos/202',
      role: UserRole.MENTOR,
      points: 3400,
      badges: ['b3'],
      university: 'Université Mohammed V',
      country: 'Maroc',
      isOnline: false
    },
    specialties: ['Physique', 'Ingénierie', 'Maths'],
    bio: "Professeur titulaire en physique quantique et ingénierie des matériaux. J'aime simplifier les concepts complexes pour les rendre accessibles. J'accompagne particulièrement les étudiants en préparation de concours pour les grandes écoles d'ingénieurs.",
    rating: 4.7,
    reviews: 45,
    availability: 'Dispo. Lundi-Mercredi',
    socials: {
      linkedin: "https://linkedin.com",
      website: "https://example.com"
    }
  },
  {
    id: 'm3',
    user: {
      id: 'u5',
      name: 'Dr. Aissatou Diallo',
      avatar: 'https://picsum.photos/203',
      role: UserRole.MENTOR,
      points: 2800,
      badges: ['b1', 'b6'],
      university: 'Université Gaston Berger',
      country: 'Sénégal',
      isOnline: true
    },
    specialties: ['Informatique', 'IA', 'Big Data'],
    bio: "Expert en Intelligence Artificielle appliquée au développement durable. Je cherche à encadrer des étudiants passionnés par la tech et les données.",
    rating: 4.8,
    reviews: 89,
    availability: 'Dispo. Jeudi-Vendredi',
    socials: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com"
    }
  },
  {
    id: 'm4',
    user: {
      id: 'u6',
      name: 'Prof. John Kariuki',
      avatar: 'https://picsum.photos/204',
      role: UserRole.MENTOR,
      points: 4100,
      badges: ['b4', 'b7'],
      university: 'University of Nairobi',
      country: 'Kenya',
      isOnline: false
    },
    specialties: ['Agriculture', 'Biologie', 'Environnement'],
    bio: "Spécialiste en agronomie tropicale et durabilité environnementale. J'aide les étudiants à comprendre les défis écologiques modernes.",
    rating: 4.6,
    reviews: 67,
    availability: 'Dispo. Weekends',
    socials: {
      linkedin: "https://linkedin.com"
    }
  },
  {
    id: 'm5',
    user: {
      id: 'u7',
      name: 'Sarah Mbeki',
      avatar: 'https://picsum.photos/206',
      role: UserRole.MENTOR,
      points: 1900,
      badges: ['b1'],
      university: 'University of Cape Town',
      country: 'Afrique du Sud',
      isOnline: true
    },
    specialties: ['Droit', 'Relations Internationales'],
    bio: "Avocate et doctorante en droit international. Je guide les étudiants dans la rédaction de mémoires et la compréhension du droit comparé.",
    rating: 4.5,
    reviews: 34,
    availability: 'Dispo. Soirées',
    socials: {
      twitter: "https://twitter.com",
      website: "https://example.com"
    }
  }
];

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'o1',
    title: "Bourse d'Excellence Africaine 2025",
    provider: "Union Africaine",
    type: OpportunityType.SCHOLARSHIP,
    deadline: "30 Juin 2025",
    description: "Couverture complète des frais de scolarité pour les étudiants en Master STEM.",
    location: "Toute l'Afrique",
    image: "https://picsum.photos/600/400?random=1"
  },
  {
    id: 'o2',
    title: "Hackathon Panafricain AI",
    provider: "Google & TechHub Kenya",
    type: OpportunityType.CONTEST,
    deadline: "15 Mai 2025",
    description: "Développez des solutions IA pour l'agriculture. 10 000$ à gagner.",
    location: "Nairobi, Kenya (Hybride)",
    image: "https://picsum.photos/600/400?random=2"
  },
  {
    id: 'o3',
    title: "Stage Data Analyst",
    provider: "MTN Group",
    type: OpportunityType.INTERNSHIP,
    deadline: "1 Avril 2025",
    description: "Rejoignez l'équipe data à Johannesburg pour 6 mois.",
    location: "Afrique du Sud",
    image: "https://picsum.photos/600/400?random=3"
  }
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    partner: MOCK_MENTORS[0].user, // Dr. Ngozi
    unreadCount: 2,
    isOnline: true,
    lastMessageTime: '10:30',
    messages: [
      { id: 'm1', senderId: 'u1', content: "Bonjour Docteur, j'aurais une question sur le cours de macroéconomie.", timestamp: '10:00', isRead: true },
      { id: 'm2', senderId: 'u2', content: "Bonjour Amara ! Bien sûr, je t'écoute.", timestamp: '10:15', isRead: true },
      { id: 'm3', senderId: 'u2', content: "Est-ce concernant l'inflation ou le chômage ?", timestamp: '10:30', isRead: false }
    ]
  },
  {
    id: 'c2',
    partner: { ...MOCK_USER, id: 'u4', name: 'Fatima Benali', country: 'Maroc', avatar: 'https://picsum.photos/205' },
    unreadCount: 0,
    isOnline: false,
    lastMessageTime: 'Hier',
    messages: [
      { id: 'm1', senderId: 'u4', content: "Merci pour ton aide sur React !", timestamp: 'Hier', isRead: true },
      { id: 'm2', senderId: 'u1', content: "Avec plaisir ! N'hésite pas si tu as d'autres questions.", timestamp: 'Hier', isRead: true }
    ]
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    userId: 'u1',
    title: 'Bienvenue !',
    message: 'Bienvenue sur EduLab Africa. Complétez votre profil pour accéder à toutes les fonctionnalités.',
    type: 'SYSTEM',
    createdAt: 'Il y a 2 jours',
    isRead: true
  },
  {
    id: 'n2',
    userId: 'u1',
    title: 'Nouvelle réponse',
    message: 'Dr. Ngozi Okonjo a répondu à votre question sur la macroéconomie.',
    type: 'REPLY',
    createdAt: 'Il y a 1 heure',
    isRead: false,
    link: '/questions'
  },
  {
    id: 'n3',
    userId: 'u1',
    title: 'Badge débloqué',
    message: 'Félicitations ! Vous avez obtenu le badge "Premier Pas" pour votre première question.',
    type: 'ACHIEVEMENT',
    createdAt: 'Il y a 30 minutes',
    isRead: false,
    link: '/profile'
  },
  {
    id: 'n4',
    userId: 'u1',
    title: 'Rappel de mentorat',
    message: 'N\'oubliez pas votre session avec Prof. Youssef demain à 14h.',
    type: 'MENTORSHIP',
    createdAt: 'Il y a 5 minutes',
    isRead: false,
    link: '/mentors'
  }
];