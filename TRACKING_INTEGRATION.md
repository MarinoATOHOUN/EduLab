# 📊 Intégration du Tracking - Résumé

## ✅ Pages Intégrées

Le système de tracking des recherches a été intégré dans les pages suivantes :

### 1. Questions (`/questions`)
**Catégorie** : `QUESTIONS`

**Ce qui est tracké** :
- Terme de recherche saisi
- Filtre appliqué : `all`, `solved`, `unsolved`
- Numéro de page
- Nombre de résultats retournés

**Implémentation** :
```tsx
const { trackSearch } = useSearchTracking('QUESTIONS');

// Fetch questions with debounce (300ms for quick UX)
useEffect(() => {
  const timer = setTimeout(() => {
    fetchQuestions();
  }, 300);
  return () => clearTimeout(timer);
}, [filter, searchTerm, currentPage]);

// Track search separately with longer debounce (800ms - user has stopped typing)
useEffect(() => {
  if (searchTerm.trim().length >= 2) {
    const trackTimer = setTimeout(() => {
      trackSearch(
        searchTerm,
        { 
          filter: filter !== 'all' ? filter : undefined,
          page: currentPage 
        },
        totalCount
      );
    }, 800);
    return () => clearTimeout(trackTimer);
  }
}, [searchTerm, filter, currentPage, totalCount]);
```

**Stratégie de Debounce** :
- **Fetch** : 300ms (UX rapide, résultats s'affichent vite)
- **Tracking** : 800ms (l'utilisateur a vraiment fini de taper)
- **Minimum** : 2 caractères pour éviter le bruit

**Pourquoi 2 niveaux ?**
- L'utilisateur voit les résultats rapidement (300ms)
- Mais on ne track que la recherche finale (800ms)
- Évite de polluer les analytics avec "p", "py", "pyt", etc.

---

### 2. Mentors (`/mentors`)
**Catégorie** : `MENTORS`

**Ce qui est tracké** :
- Terme de recherche (nom ou bio)
- Pays sélectionné
- Spécialité sélectionnée
- Tri appliqué (`rating`, `reviews`)
- Nombre de résultats filtrés

**Implémentation** :
```tsx
const { trackSearch } = useSearchTracking('MENTORS');

// Track search with debounce (only when user stops typing)
useEffect(() => {
  if (searchTerm.trim().length >= 2) {
    const timer = setTimeout(() => {
      trackSearch(
        searchTerm,
        {
          country: selectedCountry !== 'All' ? selectedCountry : undefined,
          specialty: selectedSpecialty !== 'All' ? selectedSpecialty : undefined,
          sortBy
        },
        filteredMentors.length
      );
    }, 800);
    return () => clearTimeout(timer);
  }
}, [searchTerm, selectedCountry, selectedSpecialty, sortBy, filteredMentors.length]);
```

**Debounce** : 800ms (filtrage local, pas de fetch API)

---

### 3. Opportunities (`/opportunities`)
**Catégorie** : `OPPORTUNITIES`

**Ce qui est tracké** :
- Type d'opportunité sélectionné (filtre)
- Nombre de résultats correspondants

**Implémentation** :
```tsx
const { trackSearch } = useSearchTracking('OPPORTUNITIES');

// Track filter changes
useEffect(() => {
  if (filter !== 'All') {
    trackSearch(
      filter,
      { type: filter },
      filteredOpportunities.length
    );
  }
}, [filter, filteredOpportunities.length]);
```

**Note** : Pas de debounce car c'est un clic sur un bouton, pas une saisie

---

## 📈 Données Collectées

Pour chaque recherche, le système enregistre :

| Champ | Description | Exemple |
|-------|-------------|---------|
| `user` | Utilisateur connecté (ou null) | `user_id: 123` |
| `category` | Type de recherche | `QUESTIONS` |
| `search_query` | Terme recherché | `"python django"` |
| `filters_applied` | Filtres JSON | `{"filter": "unsolved", "page": 2}` |
| `results_count` | Nombre de résultats | `15` |
| `session_id` | ID de session | Auto |
| `ip_address` | IP de l'utilisateur | Auto |
| `user_agent` | Navigateur | Auto |
| `page_url` | URL de la page | Auto |
| `created_at` | Timestamp | Auto |

---

## 🎯 Prochaines Étapes Suggérées

### Pages à Intégrer Ensuite

1. **Tools** (`/tools`)
   - Catégorie : `TOOLS`
   - Recherche d'outils pédagogiques

2. **Recherche Globale** (si existe)
   - Catégorie : `GENERAL`
   - Barre de recherche dans le header

3. **Users** (si page de recherche d'utilisateurs existe)
   - Catégorie : `USERS`

### Fonctionnalités Avancées

1. **Tracking des Clics**
   - Utiliser `trackClick()` quand un utilisateur clique sur un résultat
   - Exemple dans Questions :
   ```tsx
   const { trackClick } = useSearchTracking('QUESTIONS');
   
   <QuestionCard 
     onClick={() => trackClick(null, question.id, index)}
   />
   ```

2. **Suggestions Autocomplete**
   - Utiliser `analyticsService.getPopularSearches()` pour suggérer des recherches populaires
   - Afficher en dessous de la barre de recherche

3. **Dashboard Analytics**
   - Créer une page admin pour visualiser :
     - Top 10 des recherches
     - Tendances de la semaine
     - Recherches sans résultats
     - Taux de clic par catégorie

---

## 🔍 Exemples de Requêtes Utiles

### Recherches les plus populaires cette semaine
```sql
SELECT search_query, COUNT(*) as count
FROM search_logs
WHERE category = 'QUESTIONS'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY search_query
ORDER BY count DESC
LIMIT 10;
```

### Recherches sans résultats (lacunes de contenu)
```sql
SELECT search_query, COUNT(*) as count
FROM search_logs
WHERE results_count = 0
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY search_query
ORDER BY count DESC
LIMIT 20;
```

### Filtres les plus utilisés
```sql
SELECT 
  category,
  jsonb_object_keys(filters_applied) as filter_key,
  COUNT(*) as usage_count
FROM search_logs
WHERE filters_applied != '{}'::jsonb
GROUP BY category, filter_key
ORDER BY usage_count DESC;
```

---

## ✨ Bonnes Pratiques Appliquées

1. ✅ **Debounce** : Évite de tracker chaque frappe (300-500ms)
2. ✅ **Minimum 2 caractères** : Ne track que si `searchTerm.trim()` existe
3. ✅ **Non-bloquant** : Tracking async, n'affecte pas l'UX
4. ✅ **Gestion d'erreurs** : Le tracking échoue silencieusement si l'API est down
5. ✅ **Respect de la vie privée** : IP et User Agent pour analytics, pas de données sensibles
6. ✅ **Flexible** : Filtres en JSON permettent d'ajouter de nouveaux critères sans migration

---

## 📊 Métriques Disponibles

Avec ce système, vous pouvez maintenant répondre à :

- ❓ **Quels sujets intéressent le plus les étudiants ?**
- 🔍 **Quelles recherches ne donnent aucun résultat ?** (opportunités de contenu)
- 🌍 **Quels pays recherchent quels mentors ?**
- 📈 **Quelles sont les tendances émergentes ?**
- 🎯 **Les filtres sont-ils utilisés ?** Lesquels ?
- ⏰ **À quelles heures les utilisateurs recherchent-ils le plus ?**

---

**Système opérationnel et prêt à collecter des insights précieux ! 🚀**

*Développé avec ❤️ par Marino ATOHOUN pour Hypee*
