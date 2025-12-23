# 🎯 Fonctionnement du Debounce dans le Tracking

## Problème Initial

Quand un utilisateur tape une recherche, chaque lettre déclenche une mise à jour :
- Tape "p" → Recherche "p" (1 résultat)
- Tape "y" → Recherche "py" (5 résultats)
- Tape "t" → Recherche "pyt" (8 résultats)
- Tape "h" → Recherche "pyth" (12 résultats)
- Tape "o" → Recherche "pytho" (15 résultats)
- Tape "n" → Recherche "python" (20 résultats)

**Sans debounce**, on enverrait 6 requêtes au backend pour tracker chaque étape, ce qui est inefficace et pollue les analytics.

## Solution : Debounce à Deux Niveaux

### Niveau 1 : Fetch des Résultats (300ms)
```tsx
useEffect(() => {
  const timer = setTimeout(() => {
    fetchQuestions(); // Appel API pour récupérer les résultats
  }, 300);
  return () => clearTimeout(timer);
}, [searchTerm, filter, currentPage]);
```

**Comportement** :
- L'utilisateur tape "python"
- Après chaque lettre, un timer de 300ms démarre
- Si l'utilisateur tape une autre lettre avant 300ms, le timer est annulé et redémarre
- Quand l'utilisateur s'arrête 300ms, la recherche est lancée
- **Résultat** : Les résultats s'affichent rapidement (300ms après la dernière frappe)

### Niveau 2 : Tracking Analytics (800ms)
```tsx
useEffect(() => {
  if (searchTerm.trim().length >= 2) {
    const trackTimer = setTimeout(() => {
      trackSearch(searchTerm, filters, resultsCount);
    }, 800);
    return () => clearTimeout(trackTimer);
  }
}, [searchTerm, filter, currentPage, totalCount]);
```

**Comportement** :
- L'utilisateur tape "python"
- Après chaque lettre, un timer de 800ms démarre
- Si l'utilisateur tape une autre lettre avant 800ms, le timer est annulé et redémarre
- Quand l'utilisateur s'arrête 800ms, le tracking est envoyé
- **Résultat** : Seule la recherche finale "python" est trackée

## Pourquoi 800ms pour le Tracking ?

1. **L'utilisateur a vraiment fini** : 800ms est suffisamment long pour être sûr que l'utilisateur a terminé sa frappe
2. **Évite les recherches intermédiaires** : "py", "pyt", "pyth" ne sont pas trackées
3. **Données plus pertinentes** : On ne track que les recherches "intentionnelles"
4. **Réduit la charge backend** : Moins d'appels API

## Exemple Concret

### Scénario 1 : Recherche Rapide
```
0ms    : User tape "p"
100ms  : User tape "y"
200ms  : User tape "t"
300ms  : User tape "h"
400ms  : User tape "o"
500ms  : User tape "n"
600ms  : [rien]
700ms  : [rien]
800ms  : ✅ Fetch API lancé (300ms après dernière frappe)
1300ms : ✅ Tracking envoyé (800ms après dernière frappe)
```

### Scénario 2 : Recherche avec Pause
```
0ms    : User tape "p"
100ms  : User tape "y"
200ms  : User tape "t"
500ms  : ✅ Fetch API lancé pour "pyt"
1000ms : ✅ Tracking envoyé pour "pyt"
1200ms : User tape "h"
1300ms : User tape "o"
1400ms : User tape "n"
1700ms : ✅ Fetch API lancé pour "python"
2200ms : ✅ Tracking envoyé pour "python"
```
**Résultat** : 2 recherches trackées ("pyt" et "python")

### Scénario 3 : Recherche Très Rapide
```
0ms   : User tape "python" (très vite, en 200ms)
500ms : ✅ Fetch API lancé
1000ms: ✅ Tracking envoyé
```
**Résultat** : 1 seule recherche trackée ("python")

## Règles de Validation

### Minimum 2 Caractères
```tsx
if (searchTerm.trim().length >= 2) {
  // Track search
}
```

**Pourquoi ?**
- "p" seul n'est pas une recherche intentionnelle
- Réduit le bruit dans les analytics
- Évite de tracker des frappes accidentelles

### Trim des Espaces
```tsx
searchTerm.trim()
```

**Pourquoi ?**
- "  python  " devient "python"
- Évite les doublons dans les stats
- Normalise les données

## Avantages de cette Approche

✅ **UX Rapide** : Les résultats s'affichent en 300ms
✅ **Analytics Propres** : Seules les recherches finales sont trackées
✅ **Performance** : Moins d'appels API
✅ **Données Pertinentes** : On track ce que l'utilisateur cherche vraiment
✅ **Flexible** : Facile d'ajuster les timings si nécessaire

## Configuration par Page

| Page | Fetch Debounce | Track Debounce | Minimum Chars |
|------|----------------|----------------|---------------|
| Questions | 300ms | 800ms | 2 |
| Mentors | - (filtrage local) | 800ms | 2 |
| Opportunities | - (clic) | Immédiat | - |

## Monitoring

Pour vérifier que le debounce fonctionne bien :

```tsx
useEffect(() => {
  if (searchTerm.trim().length >= 2) {
    const trackTimer = setTimeout(() => {
      console.log('🔍 Tracking search:', searchTerm);
      trackSearch(searchTerm, filters, resultsCount);
    }, 800);
    return () => {
      console.log('⏱️ Debounce cancelled for:', searchTerm);
      clearTimeout(trackTimer);
    };
  }
}, [searchTerm]);
```

Dans la console, vous verrez :
```
⏱️ Debounce cancelled for: p
⏱️ Debounce cancelled for: py
⏱️ Debounce cancelled for: pyt
⏱️ Debounce cancelled for: pyth
⏱️ Debounce cancelled for: pytho
🔍 Tracking search: python
```

## Résumé

Le système fonctionne exactement comme demandé :
1. ✅ Chaque lettre tapée met à jour l'UI (résultats en temps réel)
2. ✅ Les lettres sont "sauvegardées" dans l'état React (`searchTerm`)
3. ✅ Quand l'utilisateur s'arrête de taper (800ms), la recherche finale est envoyée au backend
4. ✅ Seules les recherches intentionnelles (≥2 caractères) sont trackées

---

**Le debounce est votre ami ! 🚀**

*Développé avec ❤️ par Marino ATOHOUN pour Hypee*
