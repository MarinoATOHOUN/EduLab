# Outils Externes - EduConnect

## Laboratoire Chimique Virtuel

Le Laboratoire Chimique est déployé séparément sur Vercel et accessible via un lien externe.

### Accès
- **URL** : https://virtual-labo-chimique.vercel.app/
- **Depuis EduConnect** : Outils → Laboratoire Chimique → S'ouvre dans un nouvel onglet

### Configuration

Le lien est configuré dans `frontend/pages/LearningTools.tsx` :

```typescript
else if (toolId === 'chem') {
  window.open('https://virtual-labo-chimique.vercel.app/', '_blank');
}
```

### Modification du lien

Pour changer l'URL du laboratoire :

1. Ouvrir `frontend/pages/LearningTools.tsx`
2. Chercher `toolId === 'chem'`
3. Modifier l'URL dans `window.open()`

### Base de données

L'outil est enregistré dans la table `learning_tools` avec :
- `tool_id` : `'chem'`
- `title` : `'Laboratoire Chimique'`
- `status` : `'available'`

## Autres outils externes

Pour ajouter d'autres outils externes, suivre le même pattern :

```typescript
else if (toolId === 'mon_outil') {
  window.open('https://mon-outil.com/', '_blank');
}
```

---
Développé par Marino ATOHOUN pour Hypee - EduConnect Africa
