# 📊 Système d'Analytics & Tracking des Recherches

## Vue d'ensemble

Le système d'analytics d'EduConnect Africa collecte et analyse toutes les recherches effectuées sur la plateforme pour comprendre les intérêts et comportements des utilisateurs.

## Architecture

### Modèles de Données

#### SearchLog
Enregistre chaque recherche individuelle avec :
- **Utilisateur** : Qui a effectué la recherche (null si anonyme)
- **Catégorie** : Type de contenu recherché (QUESTIONS, MENTORS, OPPORTUNITIES, etc.)
- **Requête** : Terme de recherche saisi
- **Filtres** : Filtres appliqués (JSON flexible)
- **Résultats** : Nombre de résultats retournés
- **Métadonnées** : Session ID, IP, User Agent, URL
- **Interaction** : Résultat cliqué et sa position

#### PopularSearch
Vue matérialisée des recherches les plus populaires :
- Catégorie
- Requête
- Nombre de fois recherchée
- Dernière recherche

### API Endpoints

#### 1. Enregistrer une recherche
```http
POST /api/analytics/search-log/
Content-Type: application/json

{
  "category": "QUESTIONS",
  "search_query": "python django",
  "filters_applied": {
    "status": "unsolved",
    "tags": ["python"]
  },
  "results_count": 15
}

Response: 201 Created
{
  "id": 123,
  "category": "QUESTIONS",
  "search_query": "python django",
  "filters_applied": {...},
  "results_count": 15,
  "created_at": "2024-12-04T23:00:00Z"
}
```

#### 2. Enregistrer un clic sur un résultat
```http
POST /api/analytics/result-click/
Content-Type: application/json

{
  "search_log_id": 123,
  "result_id": "456",
  "position": 2
}

Response: 200 OK
{
  "status": "success"
}
```

#### 3. Récupérer les recherches populaires
```http
GET /api/analytics/popular-searches/?category=QUESTIONS&limit=10

Response: 200 OK
[
  {
    "category": "QUESTIONS",
    "search_query": "python",
    "search_count": 245,
    "last_searched": "2024-12-04T22:30:00Z"
  },
  ...
]
```

#### 4. Récupérer les recherches tendances
```http
GET /api/analytics/trending-searches/?category=QUESTIONS&days=7&limit=10

Response: 200 OK
[
  {
    "search_query": "django rest framework",
    "count": 45
  },
  ...
]
```

## Utilisation Frontend

### Hook React : `useSearchTracking`

Le hook personnalisé facilite l'intégration du tracking dans les composants.

#### Exemple d'intégration dans Questions.tsx

```tsx
import { useSearchTracking } from '../hooks/useSearchTracking';

const Questions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'solved' | 'unsolved'>('all');
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // Initialiser le tracking pour la catégorie QUESTIONS
  const { trackSearch, trackClick } = useSearchTracking('QUESTIONS');

  const fetchQuestions = async () => {
    try {
      const data = await forumService.getQuestions({
        page: currentPage,
        search: searchTerm,
        filter: filter === 'all' ? undefined : filter
      });
      
      setQuestions(data.results);
      
      // Tracker la recherche
      await trackSearch(
        searchTerm,
        { filter, page: currentPage },
        data.count
      );
    } catch (error) {
      console.error("Failed to fetch questions", error);
    }
  };

  const handleQuestionClick = (questionId: string, position: number) => {
    // Tracker le clic sur le résultat
    trackClick(null, questionId, position);
    
    // Naviguer vers la question
    navigate(`/questions/${questionId}`);
  };

  return (
    // ... JSX
  );
};
```

### Service Direct

Si vous préférez utiliser le service directement :

```tsx
import { analyticsService } from '../services/analytics';

// Enregistrer une recherche
const logId = await analyticsService.logSearch({
  category: 'MENTORS',
  search_query: 'python expert',
  filters_applied: { specialties: ['python', 'django'] },
  results_count: 8
});

// Enregistrer un clic
await analyticsService.logResultClick({
  search_log_id: logId.id,
  result_id: 'mentor-123',
  position: 0
});

// Récupérer les recherches populaires
const popular = await analyticsService.getPopularSearches('QUESTIONS', 10);

// Récupérer les tendances
const trending = await analyticsService.getTrendingSearches('MENTORS', 7, 10);
```

## Catégories de Recherche

| Catégorie | Description | Pages concernées |
|-----------|-------------|------------------|
| `QUESTIONS` | Questions du forum | `/questions` |
| `MENTORS` | Recherche de mentors | `/mentors` |
| `OPPORTUNITIES` | Bourses, stages, concours | `/opportunities` |
| `TOOLS` | Outils pédagogiques | `/tools` |
| `USERS` | Recherche d'utilisateurs | Divers |
| `GENERAL` | Recherche globale | Barre de recherche générale |

## Analyses Disponibles

### 1. Recherches Populaires
- Top 10/20/50 des recherches les plus fréquentes
- Par catégorie ou globalement
- Mise à jour en temps réel

### 2. Tendances
- Recherches en hausse sur les 7/14/30 derniers jours
- Détection de nouveaux sujets d'intérêt
- Comparaison temporelle

### 3. Taux de Clic (CTR)
- Pourcentage de recherches suivies d'un clic
- Position moyenne des clics
- Résultats les plus cliqués

### 4. Recherches Sans Résultats
- Identifier les lacunes de contenu
- Opportunités d'amélioration
- Suggestions de nouveaux contenus

## Exemples de Requêtes SQL Utiles

### Top 10 des recherches cette semaine
```sql
SELECT search_query, COUNT(*) as count
FROM search_logs
WHERE created_at >= NOW() - INTERVAL '7 days'
  AND category = 'QUESTIONS'
GROUP BY search_query
ORDER BY count DESC
LIMIT 10;
```

### Recherches sans résultats
```sql
SELECT search_query, COUNT(*) as count
FROM search_logs
WHERE results_count = 0
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY search_query
ORDER BY count DESC
LIMIT 20;
```

### Taux de clic par catégorie
```sql
SELECT 
  category,
  COUNT(*) as total_searches,
  COUNT(clicked_result_id) as clicks,
  ROUND(100.0 * COUNT(clicked_result_id) / COUNT(*), 2) as ctr_percentage
FROM search_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY category
ORDER BY ctr_percentage DESC;
```

## Intégration Recommandée

### Pages à Tracker

1. **Questions** (`/questions`)
   - Recherche par mots-clés
   - Filtres : solved/unsolved, tags
   
2. **Mentors** (`/mentors`)
   - Recherche par nom, spécialités
   - Filtres : rating, disponibilité

3. **Opportunités** (`/opportunities`)
   - Recherche par titre, provider
   - Filtres : type, deadline, location

4. **Outils** (`/tools`)
   - Recherche par nom d'outil
   - Filtres : catégorie

### Bonnes Pratiques

1. **Debounce** : Attendre 300-500ms après la dernière frappe avant de tracker
2. **Minimum de caractères** : Ne tracker que si ≥ 2 caractères
3. **Anonymisation** : Respecter la vie privée (pas de données sensibles)
4. **Performance** : Tracker en arrière-plan (async, non-bloquant)
5. **Erreurs** : Ne jamais bloquer l'UX si le tracking échoue

## Dashboard Admin

Dans l'admin Django (`/admin/analytics/`), vous pouvez :
- Consulter tous les logs de recherche
- Filtrer par catégorie, date, utilisateur
- Voir les recherches populaires
- Exporter les données pour analyse externe

## Prochaines Étapes

1. **Dashboard Analytics** : Interface dédiée pour visualiser les tendances
2. **Suggestions Intelligentes** : Autocomplétion basée sur les recherches populaires
3. **A/B Testing** : Tester différentes interfaces de recherche
4. **Machine Learning** : Recommandations personnalisées basées sur l'historique
5. **Alertes** : Notification quand un nouveau sujet devient tendance

---

**Développé avec ❤️ par Marino ATOHOUN pour Hypee**
