import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Search, Map, Users, Languages, ThermometerSun, Mountain, Music, Globe, X, Info, Compass } from 'lucide-react';

// Types de données pour l'Atlas
interface Country {
  id: string;
  name: string;
  capital: string;
  region: 'Afrique de l\'Ouest' | 'Afrique du Nord' | 'Afrique de l\'Est' | 'Afrique Centrale' | 'Afrique Australe';
  population: string;
  languages: string[];
  currency: string;
  climate: string;
  geography: string;
  funFact: string;
  flagEmoji: string;
  color: string; // Classe Tailwind pour le gradient
  image: string; // URL image (mock)
}

// Données complètes des 54 pays d'Afrique
const COUNTRIES: Country[] = [
  // --- AFRIQUE DU NORD ---
  {
    id: 'dz',
    name: 'Algérie',
    capital: 'Alger',
    region: 'Afrique du Nord',
    population: '45 millions',
    languages: ['Arabe', 'Tamazight', 'Français'],
    currency: 'Dinar algérien',
    climate: 'Méditerranéen / Désertique',
    geography: 'Plus grand pays d\'Afrique, dominé par le Sahara.',
    funFact: 'Le Sahara couvre plus de 80% de la superficie du pays.',
    flagEmoji: '🇩🇿',
    color: 'from-green-600 to-white',
    image: 'https://picsum.photos/800/400?random=1'
  },
  {
    id: 'eg',
    name: 'Égypte',
    capital: 'Le Caire',
    region: 'Afrique du Nord',
    population: '104 millions',
    languages: ['Arabe'],
    currency: 'Livre égyptienne',
    climate: 'Désertique',
    geography: 'Traversée par le Nil, vital pour l\'agriculture.',
    funFact: 'Le calendrier de 365 jours a été inventé en Égypte antique.',
    flagEmoji: '🇪🇬',
    color: 'from-red-500 via-gray-200 to-black',
    image: 'https://picsum.photos/800/400?random=2'
  },
  {
    id: 'ly',
    name: 'Libye',
    capital: 'Tripoli',
    region: 'Afrique du Nord',
    population: '7 millions',
    languages: ['Arabe'],
    currency: 'Dinar libyen',
    climate: 'Méditerranéen / Désertique',
    geography: 'Possède la plus longue côte méditerranéenne d\'Afrique.',
    funFact: 'Le site archéologique de Leptis Magna est l\'un des mieux conservés de l\'Empire romain.',
    flagEmoji: '🇱🇾',
    color: 'from-green-500 to-black',
    image: 'https://picsum.photos/800/400?random=3'
  },
  {
    id: 'ma',
    name: 'Maroc',
    capital: 'Rabat',
    region: 'Afrique du Nord',
    population: '37 millions',
    languages: ['Arabe', 'Amazigh', 'Français'],
    currency: 'Dirham marocain',
    climate: 'Méditerranéen / Océanique',
    geography: 'Traversé par les montagnes de l\'Atlas.',
    funFact: 'Abrite la plus ancienne université du monde encore en activité (Al Quaraouiyine).',
    flagEmoji: '🇲🇦',
    color: 'from-red-600 to-red-400',
    image: 'https://picsum.photos/800/400?random=4'
  },
  {
    id: 'mr',
    name: 'Mauritanie',
    capital: 'Nouakchott',
    region: 'Afrique du Nord',
    population: '4.6 millions',
    languages: ['Arabe'],
    currency: 'Ouguiya',
    climate: 'Désertique',
    geography: 'Point de rencontre entre le Maghreb et l\'Afrique subsaharienne.',
    funFact: 'Le train de la mine de Zouerate est l\'un des plus longs du monde (2,5 km).',
    flagEmoji: '🇲🇷',
    color: 'from-green-600 to-yellow-400',
    image: 'https://picsum.photos/800/400?random=5'
  },
  {
    id: 'sd',
    name: 'Soudan',
    capital: 'Khartoum',
    region: 'Afrique du Nord',
    population: '45 millions',
    languages: ['Arabe', 'Anglais'],
    currency: 'Livre soudanaise',
    climate: 'Tropical / Désertique',
    geography: 'Confluence du Nil Bleu et du Nil Blanc.',
    funFact: 'Le Soudan compte plus de pyramides que l\'Égypte (environ 200).',
    flagEmoji: '🇸🇩',
    color: 'from-red-500 via-white to-black',
    image: 'https://picsum.photos/800/400?random=6'
  },
  {
    id: 'tn',
    name: 'Tunisie',
    capital: 'Tunis',
    region: 'Afrique du Nord',
    population: '12 millions',
    languages: ['Arabe'],
    currency: 'Dinar tunisien',
    climate: 'Méditerranéen',
    geography: 'Pointe nord de l\'Afrique, proche de l\'Italie.',
    funFact: 'Le site de Carthage était une puissance majeure de l\'antiquité.',
    flagEmoji: '🇹🇳',
    color: 'from-red-600 to-white',
    image: 'https://picsum.photos/800/400?random=7'
  },

  // --- AFRIQUE DE L'OUEST ---
  {
    id: 'bj',
    name: 'Bénin',
    capital: 'Porto-Novo',
    region: 'Afrique de l\'Ouest',
    population: '13 millions',
    languages: ['Français', 'Fon', 'Yoruba'],
    currency: 'Franc CFA',
    climate: 'Tropical',
    geography: 'Pays côtier s\'étendant vers le nord.',
    funFact: 'Berceau de la culture Vaudou.',
    flagEmoji: '🇧🇯',
    color: 'from-green-500 via-yellow-400 to-red-500',
    image: 'https://picsum.photos/800/400?random=8'
  },
  {
    id: 'bf',
    name: 'Burkina Faso',
    capital: 'Ouagadougou',
    region: 'Afrique de l\'Ouest',
    population: '22 millions',
    languages: ['Français', 'Mooré', 'Dioula'],
    currency: 'Franc CFA',
    climate: 'Sahélien',
    geography: 'Pays enclavé de savanes.',
    funFact: 'Son nom signifie "Pays des hommes intègres".',
    flagEmoji: '🇧🇫',
    color: 'from-red-500 to-green-500',
    image: 'https://picsum.photos/800/400?random=9'
  },
  {
    id: 'cv',
    name: 'Cap-Vert',
    capital: 'Praia',
    region: 'Afrique de l\'Ouest',
    population: '0.6 million',
    languages: ['Portugais', 'Créole'],
    currency: 'Escudo cap-verdien',
    climate: 'Sec / Tempéré',
    geography: 'Archipel volcanique de 10 îles.',
    funFact: 'L\'île de Fogo abrite un volcan actif qui produit du vin dans sa caldeira.',
    flagEmoji: '🇨🇻',
    color: 'from-blue-600 to-white',
    image: 'https://picsum.photos/800/400?random=10'
  },
  {
    id: 'ci',
    name: 'Côte d\'Ivoire',
    capital: 'Yamoussoukro',
    region: 'Afrique de l\'Ouest',
    population: '26 millions',
    languages: ['Français', 'Baoulé', 'Dioula'],
    currency: 'Franc CFA',
    climate: 'Tropical humide',
    geography: 'Forêts denses et lagunes côtières.',
    funFact: 'Premier producteur mondial de cacao.',
    flagEmoji: '🇨🇮',
    color: 'from-orange-500 via-white to-green-500',
    image: 'https://picsum.photos/800/400?random=11'
  },
  {
    id: 'gm',
    name: 'Gambie',
    capital: 'Banjul',
    region: 'Afrique de l\'Ouest',
    population: '2.5 millions',
    languages: ['Anglais', 'Mandingue'],
    currency: 'Dalasi',
    climate: 'Tropical',
    geography: 'Plus petit pays d\'Afrique continentale, longeant le fleuve Gambie.',
    funFact: 'Le pays est presque entièrement entouré par le Sénégal.',
    flagEmoji: '🇬🇲',
    color: 'from-red-500 via-blue-500 to-green-500',
    image: 'https://picsum.photos/800/400?random=12'
  },
  {
    id: 'gh',
    name: 'Ghana',
    capital: 'Accra',
    region: 'Afrique de l\'Ouest',
    population: '32 millions',
    languages: ['Anglais', 'Twi', 'Fanti'],
    currency: 'Cedi',
    climate: 'Tropical',
    geography: 'Abrite le lac Volta, le plus grand lac artificiel du monde.',
    funFact: 'Le nom Ghana signifie "Roi Guerrier".',
    flagEmoji: '🇬🇭',
    color: 'from-red-500 via-yellow-400 to-green-600',
    image: 'https://picsum.photos/800/400?random=13'
  },
  {
    id: 'gn',
    name: 'Guinée',
    capital: 'Conakry',
    region: 'Afrique de l\'Ouest',
    population: '13 millions',
    languages: ['Français', 'Peul', 'Malinké'],
    currency: 'Franc guinéen',
    climate: 'Tropical',
    geography: 'Surnommée le "Château d\'eau de l\'Afrique" (source de nombreux fleuves).',
    funFact: 'Possède les plus grandes réserves de bauxite au monde.',
    flagEmoji: '🇬🇳',
    color: 'from-red-500 via-yellow-400 to-green-500',
    image: 'https://picsum.photos/800/400?random=14'
  },
  {
    id: 'gw',
    name: 'Guinée-Bissau',
    capital: 'Bissau',
    region: 'Afrique de l\'Ouest',
    population: '2 millions',
    languages: ['Portugais', 'Créole'],
    currency: 'Franc CFA',
    climate: 'Tropical',
    geography: 'Connu pour l\'archipel des Bijagos.',
    funFact: 'Les îles Bijagos sont une réserve de biosphère de l\'UNESCO.',
    flagEmoji: '🇬🇼',
    color: 'from-red-500 via-yellow-400 to-green-500',
    image: 'https://picsum.photos/800/400?random=15'
  },
  {
    id: 'lr',
    name: 'Liberia',
    capital: 'Monrovia',
    region: 'Afrique de l\'Ouest',
    population: '5 millions',
    languages: ['Anglais'],
    currency: 'Dollar libérien',
    climate: 'Tropical humide',
    geography: 'Côte poivrière et forêts denses.',
    funFact: 'Première république indépendante d\'Afrique (1847).',
    flagEmoji: '🇱🇷',
    color: 'from-red-600 via-white to-blue-600',
    image: 'https://picsum.photos/800/400?random=16'
  },
  {
    id: 'ml',
    name: 'Mali',
    capital: 'Bamako',
    region: 'Afrique de l\'Ouest',
    population: '21 millions',
    languages: ['Français', 'Bambara'],
    currency: 'Franc CFA',
    climate: 'Sahélien / Désertique',
    geography: 'Traversé par le fleuve Niger.',
    funFact: 'Tombouctou était un centre mondial du savoir au XVe siècle.',
    flagEmoji: '🇲🇱',
    color: 'from-green-500 via-yellow-400 to-red-500',
    image: 'https://picsum.photos/800/400?random=17'
  },
  {
    id: 'ne',
    name: 'Niger',
    capital: 'Niamey',
    region: 'Afrique de l\'Ouest',
    population: '25 millions',
    languages: ['Français', 'Haoussa', 'Zarma'],
    currency: 'Franc CFA',
    climate: 'Désertique / Sahélien',
    geography: 'Pays sans littoral, recouvert à 80% par le Sahara.',
    funFact: 'Abrite des fossiles de dinosaures dans le désert du Ténéré.',
    flagEmoji: '🇳🇪',
    color: 'from-orange-400 via-white to-green-500',
    image: 'https://picsum.photos/800/400?random=18'
  },
  {
    id: 'ng',
    name: 'Nigeria',
    capital: 'Abuja',
    region: 'Afrique de l\'Ouest',
    population: '213 millions',
    languages: ['Anglais', 'Haoussa', 'Yoruba', 'Igbo'],
    currency: 'Naira',
    climate: 'Tropical',
    geography: 'Pays le plus peuplé d\'Afrique.',
    funFact: 'Nollywood est la deuxième industrie cinématographique au monde en volume.',
    flagEmoji: '🇳🇬',
    color: 'from-green-600 via-white to-green-600',
    image: 'https://picsum.photos/800/400?random=19'
  },
  {
    id: 'sn',
    name: 'Sénégal',
    capital: 'Dakar',
    region: 'Afrique de l\'Ouest',
    population: '17 millions',
    languages: ['Français', 'Wolof', 'Pulaar'],
    currency: 'Franc CFA',
    climate: 'Tropical / Sahélien',
    geography: 'Point le plus occidental de l\'Afrique continentale.',
    funFact: 'Le Lac Rose a une salinité supérieure à celle de la Mer Morte.',
    flagEmoji: '🇸🇳',
    color: 'from-green-500 via-yellow-400 to-red-500',
    image: 'https://picsum.photos/800/400?random=20'
  },
  {
    id: 'sl',
    name: 'Sierra Leone',
    capital: 'Freetown',
    region: 'Afrique de l\'Ouest',
    population: '8 millions',
    languages: ['Anglais', 'Krio'],
    currency: 'Leone',
    climate: 'Tropical humide',
    geography: 'Montagnes, mangroves et plages.',
    funFact: 'Freetown possède l\'un des plus grands ports naturels au monde.',
    flagEmoji: '🇸🇱',
    color: 'from-green-500 via-white to-blue-500',
    image: 'https://picsum.photos/800/400?random=21'
  },
  {
    id: 'tg',
    name: 'Togo',
    capital: 'Lomé',
    region: 'Afrique de l\'Ouest',
    population: '8.6 millions',
    languages: ['Français', 'Ewe', 'Kabyé'],
    currency: 'Franc CFA',
    climate: 'Tropical',
    geography: 'Étroit corridor s\'étendant de l\'océan vers le nord.',
    funFact: 'Lomé est la seule capitale au monde située à une frontière internationale immédiate.',
    flagEmoji: '🇹🇬',
    color: 'from-green-600 via-yellow-400 to-red-500',
    image: 'https://picsum.photos/800/400?random=22'
  },

  // --- AFRIQUE CENTRALE ---
  {
    id: 'ao',
    name: 'Angola',
    capital: 'Luanda',
    region: 'Afrique Centrale',
    population: '34 millions',
    languages: ['Portugais'],
    currency: 'Kwanza',
    climate: 'Tropical / Semi-aride',
    geography: 'Grand littoral et hauts plateaux.',
    funFact: 'Les chutes de Kalandula sont parmi les plus larges d\'Afrique.',
    flagEmoji: '🇦🇴',
    color: 'from-red-600 to-black',
    image: 'https://picsum.photos/800/400?random=23'
  },
  {
    id: 'cm',
    name: 'Cameroun',
    capital: 'Yaoundé',
    region: 'Afrique Centrale',
    population: '27 millions',
    languages: ['Français', 'Anglais'],
    currency: 'Franc CFA',
    climate: 'Varié (Afrique en miniature)',
    geography: 'Volcans, forêts, savanes et désert.',
    funFact: 'Le nom vient de "Rio dos Camarões" (Rivière des crevettes).',
    flagEmoji: '🇨🇲',
    color: 'from-green-600 via-red-500 to-yellow-500',
    image: 'https://picsum.photos/800/400?random=24'
  },
  {
    id: 'cf',
    name: 'Centrafrique',
    capital: 'Bangui',
    region: 'Afrique Centrale',
    population: '5 millions',
    languages: ['Français', 'Sango'],
    currency: 'Franc CFA',
    climate: 'Tropical',
    geography: 'Plateaux et forêts équatoriales.',
    funFact: 'Abrite une biodiversité forestière exceptionnelle pour les éléphants de forêt.',
    flagEmoji: '🇨🇫',
    color: 'from-blue-600 via-white to-green-500',
    image: 'https://picsum.photos/800/400?random=25'
  },
  {
    id: 'cg',
    name: 'Congo (Brazzaville)',
    capital: 'Brazzaville',
    region: 'Afrique Centrale',
    population: '5.7 millions',
    languages: ['Français', 'Lingala', 'Kituba'],
    currency: 'Franc CFA',
    climate: 'Équatorial',
    geography: 'Forêt du Bassin du Congo.',
    funFact: 'Brazzaville et Kinshasa sont les deux capitales les plus rapprochées au monde.',
    flagEmoji: '🇨🇬',
    color: 'from-green-600 via-yellow-400 to-red-500',
    image: 'https://picsum.photos/800/400?random=26'
  },
  {
    id: 'cd',
    name: 'RDC (Congo Kinshasa)',
    capital: 'Kinshasa',
    region: 'Afrique Centrale',
    population: '95 millions',
    languages: ['Français', 'Lingala', 'Swahili', 'Kikongo', 'Tshiluba'],
    currency: 'Franc congolais',
    climate: 'Équatorial',
    geography: 'Immense bassin forestier et fleuve Congo.',
    funFact: 'Deuxième plus grand pays d\'Afrique par la superficie.',
    flagEmoji: '🇨🇩',
    color: 'from-blue-400 via-red-500 to-yellow-400',
    image: 'https://picsum.photos/800/400?random=27'
  },
  {
    id: 'ga',
    name: 'Gabon',
    capital: 'Libreville',
    region: 'Afrique Centrale',
    population: '2.3 millions',
    languages: ['Français'],
    currency: 'Franc CFA',
    climate: 'Équatorial',
    geography: 'Couvert à 85% par la forêt tropicale.',
    funFact: 'Abrite le réacteur nucléaire naturel d\'Oklo, vieux de 2 milliards d\'années.',
    flagEmoji: '🇬🇦',
    color: 'from-green-600 via-yellow-400 to-blue-600',
    image: 'https://picsum.photos/800/400?random=28'
  },
  {
    id: 'gq',
    name: 'Guinée équatoriale',
    capital: 'Malabo',
    region: 'Afrique Centrale',
    population: '1.5 million',
    languages: ['Espagnol', 'Français', 'Portugais'],
    currency: 'Franc CFA',
    climate: 'Tropical',
    geography: 'Composé d\'une partie continentale et d\'îles.',
    funFact: 'Seul pays d\'Afrique ayant l\'espagnol comme langue officielle.',
    flagEmoji: '🇬🇶',
    color: 'from-green-600 via-white to-red-600',
    image: 'https://picsum.photos/800/400?random=29'
  },
  {
    id: 'st',
    name: 'Sao Tomé-et-Principe',
    capital: 'Sao Tomé',
    region: 'Afrique Centrale',
    population: '0.2 million',
    languages: ['Portugais'],
    currency: 'Dobra',
    climate: 'Tropical',
    geography: 'Archipel volcanique.',
    funFact: 'Surnommées les "îles chocolat" pour leur cacao de qualité.',
    flagEmoji: '🇸🇹',
    color: 'from-green-600 via-yellow-400 to-green-600',
    image: 'https://picsum.photos/800/400?random=30'
  },
  {
    id: 'td',
    name: 'Tchad',
    capital: 'N\'Djaména',
    region: 'Afrique Centrale',
    population: '17 millions',
    languages: ['Français', 'Arabe'],
    currency: 'Franc CFA',
    climate: 'Désertique / Sahélien',
    geography: 'Enclavé, abrite le massif du Tibesti.',
    funFact: 'Le lac Tchad a rétréci de 90% depuis les années 1960.',
    flagEmoji: '🇹🇩',
    color: 'from-blue-600 via-yellow-400 to-red-600',
    image: 'https://picsum.photos/800/400?random=31'
  },

  // --- AFRIQUE DE L'EST ---
  {
    id: 'bi',
    name: 'Burundi',
    capital: 'Gitega',
    region: 'Afrique de l\'Est',
    population: '12 millions',
    languages: ['Kirundi', 'Français', 'Anglais'],
    currency: 'Franc burundais',
    climate: 'Tempéré',
    geography: 'Pays vallonné des Grands Lacs.',
    funFact: 'Le lac Tanganyika est le deuxième lac le plus profond du monde.',
    flagEmoji: '🇧🇮',
    color: 'from-red-600 via-white to-green-600',
    image: 'https://picsum.photos/800/400?random=32'
  },
  {
    id: 'km',
    name: 'Comores',
    capital: 'Moroni',
    region: 'Afrique de l\'Est',
    population: '0.9 million',
    languages: ['Comorien', 'Arabe', 'Français'],
    currency: 'Franc comorien',
    climate: 'Tropical maritime',
    geography: 'Archipel volcanique.',
    funFact: 'Premier producteur mondial d\'essence d\'ylang-ylang.',
    flagEmoji: '🇰🇲',
    color: 'from-yellow-400 via-white to-blue-600',
    image: 'https://picsum.photos/800/400?random=33'
  },
  {
    id: 'dj',
    name: 'Djibouti',
    capital: 'Djibouti',
    region: 'Afrique de l\'Est',
    population: '1 million',
    languages: ['Français', 'Arabe', 'Somali', 'Afar'],
    currency: 'Franc Djibouti',
    climate: 'Désertique chaud',
    geography: 'Situé sur la Corne de l\'Afrique.',
    funFact: 'Le lac Assal est le point le plus bas d\'Afrique (-155m).',
    flagEmoji: '🇩🇯',
    color: 'from-blue-400 via-white to-green-500',
    image: 'https://picsum.photos/800/400?random=34'
  },
  {
    id: 'er',
    name: 'Érythrée',
    capital: 'Asmara',
    region: 'Afrique de l\'Est',
    population: '3.6 millions',
    languages: ['Tigrinya', 'Arabe', 'Anglais'],
    currency: 'Nakfa',
    climate: 'Semi-aride',
    geography: 'Bordé par la Mer Rouge.',
    funFact: 'Asmara est connue pour son architecture Art déco italienne.',
    flagEmoji: '🇪🇷',
    color: 'from-green-600 via-red-500 to-blue-500',
    image: 'https://picsum.photos/800/400?random=35'
  },
  {
    id: 'et',
    name: 'Éthiopie',
    capital: 'Addis-Abeba',
    region: 'Afrique de l\'Est',
    population: '120 millions',
    languages: ['Amharique', 'Oromo', 'Tigrinya', 'Anglais'],
    currency: 'Birr',
    climate: 'Tempéré (Hauts plateaux)',
    geography: 'Toit de l\'Afrique, pays montagneux.',
    funFact: 'Seul pays d\'Afrique à ne jamais avoir été colonisé.',
    flagEmoji: '🇪🇹',
    color: 'from-green-600 via-yellow-400 to-red-600',
    image: 'https://picsum.photos/800/400?random=36'
  },
  {
    id: 'ke',
    name: 'Kenya',
    capital: 'Nairobi',
    region: 'Afrique de l\'Est',
    population: '54 millions',
    languages: ['Swahili', 'Anglais'],
    currency: 'Shilling kényan',
    climate: 'Varié',
    geography: 'Savanes, Vallée du Rift, Montagnes.',
    funFact: 'Berceau probable de l\'humanité (nombreux fossiles d\'hominidés).',
    flagEmoji: '🇰🇪',
    color: 'from-black via-red-600 to-green-600',
    image: 'https://picsum.photos/800/400?random=37'
  },
  {
    id: 'mg',
    name: 'Madagascar',
    capital: 'Antananarivo',
    region: 'Afrique de l\'Est',
    population: '28 millions',
    languages: ['Malgache', 'Français'],
    currency: 'Ariary',
    climate: 'Tropical',
    geography: 'Quatrième plus grande île du monde.',
    funFact: '80% de sa faune et de sa flore n\'existe nulle part ailleurs.',
    flagEmoji: '🇲🇬',
    color: 'from-white via-red-500 to-green-500',
    image: 'https://picsum.photos/800/400?random=38'
  },
  {
    id: 'mw',
    name: 'Malawi',
    capital: 'Lilongwe',
    region: 'Afrique de l\'Est',
    population: '19 millions',
    languages: ['Anglais', 'Chichewa'],
    currency: 'Kwacha malawien',
    climate: 'Subtropical',
    geography: 'Dominé par le lac Malawi.',
    funFact: 'Le lac Malawi abrite plus d\'espèces de poissons que n\'importe quel autre lac.',
    flagEmoji: '🇲🇼',
    color: 'from-black via-red-600 to-green-600',
    image: 'https://picsum.photos/800/400?random=39'
  },
  {
    id: 'mu',
    name: 'Maurice',
    capital: 'Port-Louis',
    region: 'Afrique de l\'Est',
    population: '1.3 million',
    languages: ['Anglais', 'Français', 'Créole'],
    currency: 'Roupie mauricienne',
    climate: 'Tropical',
    geography: 'Île volcanique entourée de récifs.',
    funFact: 'Le Dodo, aujourd\'hui éteint, vivait uniquement sur cette île.',
    flagEmoji: '🇲🇺',
    color: 'from-red-500 via-blue-500 to-yellow-400',
    image: 'https://picsum.photos/800/400?random=40'
  },
  {
    id: 'mz',
    name: 'Mozambique',
    capital: 'Maputo',
    region: 'Afrique de l\'Est',
    population: '32 millions',
    languages: ['Portugais'],
    currency: 'Metical',
    climate: 'Tropical',
    geography: 'Longue côte sur l\'océan Indien.',
    funFact: 'Seul pays dont le drapeau comporte une image de fusil d\'assaut moderne.',
    flagEmoji: '🇲🇿',
    color: 'from-green-600 via-black to-yellow-400',
    image: 'https://picsum.photos/800/400?random=41'
  },
  {
    id: 'rw',
    name: 'Rwanda',
    capital: 'Kigali',
    region: 'Afrique de l\'Est',
    population: '13 millions',
    languages: ['Kinyarwanda', 'Anglais', 'Français'],
    currency: 'Franc rwandais',
    climate: 'Tempéré',
    geography: 'Pays des mille collines.',
    funFact: 'Le Rwanda a le parlement avec le plus fort pourcentage de femmes au monde.',
    flagEmoji: '🇷🇼',
    color: 'from-blue-400 via-yellow-400 to-green-500',
    image: 'https://picsum.photos/800/400?random=42'
  },
  {
    id: 'sc',
    name: 'Seychelles',
    capital: 'Victoria',
    region: 'Afrique de l\'Est',
    population: '0.1 million',
    languages: ['Seychellois', 'Anglais', 'Français'],
    currency: 'Roupie seychelloise',
    climate: 'Tropical',
    geography: '115 îles granitiques et coralliennes.',
    funFact: 'Abrite la vallée de Mai, site UNESCO où poussent les Coco de Mer.',
    flagEmoji: '🇸🇨',
    color: 'from-blue-600 via-red-500 to-green-500',
    image: 'https://picsum.photos/800/400?random=43'
  },
  {
    id: 'so',
    name: 'Somalie',
    capital: 'Mogadiscio',
    region: 'Afrique de l\'Est',
    population: '17 millions',
    languages: ['Somali', 'Arabe'],
    currency: 'Shilling somalien',
    climate: 'Semi-aride',
    geography: 'Plus longue côte d\'Afrique continentale.',
    funFact: 'Connue comme la nation des poètes.',
    flagEmoji: '🇸🇴',
    color: 'from-blue-400 to-white',
    image: 'https://picsum.photos/800/400?random=44'
  },
  {
    id: 'ss',
    name: 'Soudan du Sud',
    capital: 'Djouba',
    region: 'Afrique de l\'Est',
    population: '11 millions',
    languages: ['Anglais'],
    currency: 'Livre sud-soudanaise',
    climate: 'Tropical',
    geography: 'Marais du Sudd, l\'une des plus grandes zones humides du monde.',
    funFact: 'Le plus jeune pays du monde (indépendant en 2011).',
    flagEmoji: '🇸🇸',
    color: 'from-black via-red-600 to-green-600',
    image: 'https://picsum.photos/800/400?random=45'
  },
  {
    id: 'tz',
    name: 'Tanzanie',
    capital: 'Dodoma',
    region: 'Afrique de l\'Est',
    population: '63 millions',
    languages: ['Swahili', 'Anglais'],
    currency: 'Shilling tanzanien',
    climate: 'Tropical',
    geography: 'Abrite le Kilimandjaro, point culminant de l\'Afrique.',
    funFact: 'Le parc du Serengeti accueille la plus grande migration de mammifères terrestres.',
    flagEmoji: '🇹🇿',
    color: 'from-green-500 via-black to-blue-500',
    image: 'https://picsum.photos/800/400?random=46'
  },
  {
    id: 'ug',
    name: 'Ouganda',
    capital: 'Kampala',
    region: 'Afrique de l\'Est',
    population: '47 millions',
    languages: ['Anglais', 'Swahili'],
    currency: 'Shilling ougandais',
    climate: 'Tropical',
    geography: 'Source du Nil, abrite la moitié des gorilles de montagne.',
    funFact: 'Surnommé la "Perle de l\'Afrique" par Winston Churchill.',
    flagEmoji: '🇺🇬',
    color: 'from-black via-yellow-400 to-red-600',
    image: 'https://picsum.photos/800/400?random=47'
  },
  {
    id: 'zm',
    name: 'Zambie',
    capital: 'Lusaka',
    region: 'Afrique de l\'Est',
    population: '19 millions',
    languages: ['Anglais'],
    currency: 'Kwacha zambien',
    climate: 'Tropical',
    geography: 'Hauts plateaux, Chutes Victoria.',
    funFact: 'Les chutes Victoria sont localement appelées "Mosi-oa-Tunya" (La fumée qui gronde).',
    flagEmoji: '🇿🇲',
    color: 'from-green-600 via-red-500 to-black',
    image: 'https://picsum.photos/800/400?random=48'
  },
  {
    id: 'zw',
    name: 'Zimbabwe',
    capital: 'Harare',
    region: 'Afrique de l\'Est',
    population: '15 millions',
    languages: ['Anglais', 'Shona', 'Ndebele'],
    currency: 'Dollar américain (multi-devises)',
    climate: 'Tropical',
    geography: 'Plateaux, Chutes Victoria.',
    funFact: 'Possède l\'un des taux d\'alphabétisation les plus élevés d\'Afrique.',
    flagEmoji: '🇿🇼',
    color: 'from-green-600 via-yellow-400 to-red-600',
    image: 'https://picsum.photos/800/400?random=49'
  },

  // --- AFRIQUE AUSTRALE ---
  {
    id: 'za',
    name: 'Afrique du Sud',
    capital: 'Pretoria',
    region: 'Afrique Australe',
    population: '60 millions',
    languages: ['Zoulou', 'Xhosa', 'Afrikaans', 'Anglais', '+7'],
    currency: 'Rand',
    climate: 'Tempéré / Méditerranéen',
    geography: 'Bordé par deux océans (Atlantique et Indien).',
    funFact: 'Seul pays à avoir accueilli la Coupe du monde de Football, Rugby et Cricket.',
    flagEmoji: '🇿🇦',
    color: 'from-yellow-500 via-green-500 to-blue-600',
    image: 'https://picsum.photos/800/400?random=50'
  },
  {
    id: 'bw',
    name: 'Botswana',
    capital: 'Gaborone',
    region: 'Afrique Australe',
    population: '2.3 millions',
    languages: ['Anglais', 'Tswana'],
    currency: 'Pula',
    climate: 'Semi-aride',
    geography: 'Désert du Kalahari et Delta de l\'Okavango.',
    funFact: 'Le delta de l\'Okavango est le plus grand delta intérieur du monde.',
    flagEmoji: '🇧🇼',
    color: 'from-blue-400 via-black to-blue-400',
    image: 'https://picsum.photos/800/400?random=51'
  },
  {
    id: 'sz',
    name: 'Eswatini',
    capital: 'Mbabane',
    region: 'Afrique Australe',
    population: '1.1 million',
    languages: ['Swati', 'Anglais'],
    currency: 'Lilangeni',
    climate: 'Subtropical',
    geography: 'Petit pays montagneux enclavé.',
    funFact: 'L\'une des dernières monarchies absolues du monde.',
    flagEmoji: '🇸🇿',
    color: 'from-blue-600 via-yellow-400 to-red-600',
    image: 'https://picsum.photos/800/400?random=52'
  },
  {
    id: 'ls',
    name: 'Lesotho',
    capital: 'Maseru',
    region: 'Afrique Australe',
    population: '2.1 millions',
    languages: ['Sesotho', 'Anglais'],
    currency: 'Loti',
    climate: 'Tempéré',
    geography: 'Seul pays au monde entièrement au-dessus de 1000m d\'altitude.',
    funFact: 'Surnommé le "Royaume dans le ciel".',
    flagEmoji: '🇱🇸',
    color: 'from-blue-600 via-white to-green-600',
    image: 'https://picsum.photos/800/400?random=53'
  },
  {
    id: 'na',
    name: 'Namibie',
    capital: 'Windhoek',
    region: 'Afrique Australe',
    population: '2.5 millions',
    languages: ['Anglais'],
    currency: 'Dollar namibien',
    climate: 'Désertique',
    geography: 'Abrite le désert du Namib, le plus vieux du monde.',
    funFact: 'On y trouve les plus hautes dunes de sable du monde (Sossusvlei).',
    flagEmoji: '🇳🇦',
    color: 'from-blue-600 via-red-500 to-green-600',
    image: 'https://picsum.photos/800/400?random=54'
  }
];

const InteractiveAtlas: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('Tout');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  const regions = ['Tout', ...Array.from(new Set(COUNTRIES.map(c => c.region))).sort()];

  const filteredCountries = COUNTRIES.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.capital.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRegion = selectedRegion === 'Tout' || c.region === selectedRegion;
    return matchSearch && matchRegion;
  });

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-500 bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden relative border border-gray-200 dark:border-gray-700">
      
      {/* --- Header Toolbar --- */}
      <div className="p-4 md:p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex flex-col gap-4 shrink-0 z-20 shadow-sm">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
                <Link to="/tools" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-600 dark:text-gray-300">
                    <ChevronLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-edu-primary dark:text-white flex items-center gap-2">
                        <Globe className="text-indigo-500" />
                        Atlas Interactif
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">Explorez les {COUNTRIES.length} pays du continent.</p>
                </div>
            </div>
            
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Rechercher un pays..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 border-transparent focus:bg-white dark:focus:bg-gray-900 border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all dark:text-white"
                />
            </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {regions.map(region => (
                <button
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                        selectedRegion === region
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                >
                    {region}
                </button>
            ))}
        </div>
      </div>

      {/* --- Main Grid Content --- */}
      <div className="flex-grow overflow-y-auto p-4 md:p-8">
         {filteredCountries.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCountries.map(country => (
                    <div 
                        key={country.id}
                        onClick={() => setSelectedCountry(country)}
                        className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
                    >
                        {/* Header Gradient */}
                        <div className={`h-24 bg-gradient-to-r ${country.color} opacity-80 group-hover:opacity-100 transition-opacity relative`}>
                             <div className="absolute -bottom-6 left-6 text-5xl drop-shadow-md transform group-hover:scale-110 transition-transform duration-300">
                                {country.flagEmoji}
                             </div>
                        </div>
                        
                        <div className="pt-8 p-6">
                             <div className="mb-4">
                                 <h3 className="text-xl font-bold text-edu-primary dark:text-white group-hover:text-indigo-600 transition-colors truncate">{country.name}</h3>
                                 <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                     <Compass size={14} /> {country.region}
                                 </p>
                             </div>
                             
                             <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                 <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/30 p-2 rounded-lg">
                                     <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400"><Map size={14} /> Capitale</span>
                                     <span className="font-semibold truncate max-w-[100px] text-right">{country.capital}</span>
                                 </div>
                                 <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/30 p-2 rounded-lg">
                                     <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400"><Users size={14} /> Pop.</span>
                                     <span className="font-semibold">{country.population}</span>
                                 </div>
                             </div>
                        </div>

                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/40">
                                <Info size={20} />
                            </div>
                        </div>
                    </div>
                ))}
             </div>
         ) : (
             <div className="flex flex-col items-center justify-center h-full opacity-50">
                 <Globe size={64} className="mb-4 text-gray-400" />
                 <p className="text-xl font-medium text-gray-600 dark:text-gray-400">Aucun pays trouvé</p>
             </div>
         )}
      </div>

      {/* --- Detailed Modal --- */}
      {selectedCountry && (
          <div className="absolute inset-0 z-30 bg-white dark:bg-gray-900 animate-in slide-in-from-bottom-10 duration-300 flex flex-col overflow-hidden">
              
              {/* Modal Header Image */}
              <div className="relative h-48 md:h-64 shrink-0">
                  <img src={selectedCountry.image} alt={selectedCountry.name} className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${selectedCountry.color} opacity-60 mix-blend-multiply`}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  
                  <button 
                    onClick={() => setSelectedCountry(null)}
                    className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-md transition-colors z-50"
                  >
                      <X size={24} />
                  </button>

                  <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                      <div className="flex items-end gap-4">
                          <span className="text-6xl md:text-8xl shadow-xl">{selectedCountry.flagEmoji}</span>
                          <div className="mb-2">
                              <h2 className="text-3xl md:text-5xl font-bold text-white mb-1">{selectedCountry.name}</h2>
                              <p className="text-white/80 text-lg flex items-center gap-2">
                                  <Compass size={18} /> {selectedCountry.region}
                              </p>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Modal Content */}
              <div className="flex-grow overflow-y-auto p-6 md:p-8 bg-gray-50 dark:bg-gray-900">
                  <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
                      
                      {/* Left Column: Key Stats */}
                      <div className="md:col-span-1 space-y-4">
                          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">En Bref</h3>
                              <ul className="space-y-4">
                                  <li className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0">
                                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300"><Map size={16} className="text-indigo-500" /> Capitale</span>
                                      <span className="font-bold text-edu-primary dark:text-white">{selectedCountry.capital}</span>
                                  </li>
                                  <li className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0">
                                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300"><Users size={16} className="text-green-500" /> Habitants</span>
                                      <span className="font-bold text-edu-primary dark:text-white">{selectedCountry.population}</span>
                                  </li>
                                  <li className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0">
                                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300"><Globe size={16} className="text-blue-500" /> Monnaie</span>
                                      <span className="font-bold text-edu-primary dark:text-white">{selectedCountry.currency}</span>
                                  </li>
                              </ul>
                          </div>

                          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                               <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Langues</h3>
                               <div className="flex flex-wrap gap-2">
                                   {selectedCountry.languages.map(lang => (
                                       <span key={lang} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium flex items-center gap-1">
                                           <Languages size={12} /> {lang}
                                       </span>
                                   ))}
                               </div>
                          </div>
                      </div>

                      {/* Right Column: Details */}
                      <div className="md:col-span-2 space-y-6">
                           
                           {/* Fun Fact Card */}
                           <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
                               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                               <div className="relative z-10">
                                   <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                                       <Music size={20} /> Le saviez-vous ?
                                   </h3>
                                   <p className="text-indigo-100 text-lg leading-relaxed">
                                       "{selectedCountry.funFact}"
                                   </p>
                               </div>
                           </div>

                           <div className="grid sm:grid-cols-2 gap-6">
                               <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                   <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 text-orange-500 rounded-xl flex items-center justify-center mb-4">
                                       <ThermometerSun size={24} />
                                   </div>
                                   <h3 className="text-lg font-bold text-edu-primary dark:text-white mb-2">Climat</h3>
                                   <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                       {selectedCountry.climate}
                                   </p>
                               </div>

                               <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                   <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 text-teal-500 rounded-xl flex items-center justify-center mb-4">
                                       <Mountain size={24} />
                                   </div>
                                   <h3 className="text-lg font-bold text-edu-primary dark:text-white mb-2">Géographie</h3>
                                   <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                       {selectedCountry.geography}
                                   </p>
                               </div>
                           </div>

                           <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-6 rounded-2xl">
                               <h3 className="text-blue-800 dark:text-blue-300 font-bold mb-2">En savoir plus</h3>
                               <p className="text-blue-600 dark:text-blue-200 text-sm mb-4">
                                   Vous souhaitez explorer plus en profondeur l'histoire ou l'économie du {selectedCountry.name} ?
                               </p>
                               <Link 
                                 to="/ai-tutor" 
                                 className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
                               >
                                   Demander au Tuteur IA
                               </Link>
                           </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default InteractiveAtlas;