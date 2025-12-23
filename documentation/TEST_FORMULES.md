# Test des formules mathématiques et chimiques

## Tests à effectuer

### 1. Test dans le Chat AI Tutor

#### Test 1 : Formule mathématique simple
**Question :**
```
Peux-tu m'expliquer la formule du théorème de Pythagore ?
```

**Réponse attendue contenant :**
```
$a^2 + b^2 = c^2$
```

#### Test 2 : Formule chimique
**Question :**
```
Quelle est la formule chimique de l'eau ?
```

**Réponse attendue contenant :**
```
$H_2O$
```

#### Test 3 : Formule complexe
**Question :**
```
Explique-moi l'intégrale d'une fonction polynomiale
```

**Réponse attendue contenant :**
```
$$\int x^n dx = \frac{x^{n+1}}{n+1} + C$$
```

### 2. Test dans le Forum (Questions/Réponses)

#### Test avec une question contenant des formules

**Créer une nouvelle question avec ce contenu :**

Titre: "Aide sur les intégrales"

Contenu:
```
Comment calculer cette intégrale ?

$$\int_{0}^{1} x^2 dx$$

J'ai essayé mais je trouve $\frac{1}{2}$ alors que la réponse devrait être $\frac{1}{3}$.
```

Tags: `mathématiques`, `intégrales`, `calcul`

#### Test avec une réponse contenant des formules

**Répondre à la question avec :**
```
Tu as raison, la réponse est $\frac{1}{3}$ !

Voici la méthode :

$$\int x^2 dx = \frac{x^3}{3} + C$$

Avec les bornes $[0, 1]$ :

$$\left[\frac{x^3}{3}\right]_0^1 = \frac{1^3}{3} - \frac{0^3}{3} = \frac{1}{3}$$

L'erreur courante est d'oublier de diviser par $(n+1)$ dans la formule générale.
```

### 3. Test avec formules chimiques

#### Question chimie

Titre: "Équation de combustion du méthane"

Contenu:
```
Quelqu'un peut m'aider à équilibrer cette équation ?

$$CH_4 + O_2 \rightarrow CO_2 + H_2O$$

Je ne comprends pas comment trouver les coefficients.
```

#### Réponse chimie
```
Voici l'équation équilibrée :

$$CH_4 + 2O_2 \rightarrow CO_2 + 2H_2O$$

Explications :
- Le carbone : 1 atome de $C$ dans $CH_4$ = 1 atome de $C$ dans $CO_2$ ✓
- L'hydrogène : 4 atomes de $H$ dans $CH_4$ = 4 atomes de $H$ dans $2H_2O$ ✓ 
- L'oxygène : $2 \times 2 = 4$ atomes dans $2O_2$ = $2 + 2 = 4$ atomes dans $CO_2 + 2H_2O$ ✓

Voilà ! L'équation est équilibrée.
```

## Vérification visuelle

Pour chaque test, vérifier que :
1. ✅ Les formules inline `$...$` s'affichent correctement dans le texte
2. ✅ Les formules en bloc `$$...$$` sont centrées et bien formatées
3. ✅ Les indices (subscripts) comme dans $H_2O$ s'affichent correctement
4. ✅ Les exposants (superscripts) comme dans $x^2$ s'affichent correctement
5. ✅ Les symboles spéciaux ($\int$, $\sum$, $\pi$, etc.) sont rendus correctement
6. ✅ Le mode sombre fonctionne correctement avec les formules
7. ✅ Les formules ne cassent pas la mise en page

## Résultats attendus

### Avant l'implémentation ❌
- Les formules s'affichent en texte brut : `$E = mc^2$`
- Les caractères spéciaux LaTeX sont visibles : `\int_{0}^{1} x^2 dx`

### Après l'implémentation ✅
- Les formules sont correctement rendues avec une belle typographie mathématique
- Les symboles LaTeX sont transformés en symboles mathématiques professionnels
- L'affichage est identique à celui d'un livre de mathématiques

## Exemples de formules à tester

### Mathématiques
```
- $E = mc^2$ (Einstein)
- $a^2 + b^2 = c^2$ (Pythagore)
- $\pi r^2$ (Aire d'un cercle)
- $\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$ (Formule quadratique)
- $\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}$ (Série de Riemann)
- $\int_{a}^{b} f(x) dx$ (Intégrale définie)
- $\lim_{x \to 0} \frac{\sin(x)}{x} = 1$ (Limite)
- $e^{i\pi} + 1 = 0$ (Formule d'Euler)
```

### Chimie
```
- $H_2O$ (eau)
- $CO_2$ (dioxyde de carbone)
- $C_6H_{12}O_6$ (glucose)
- $NaCl$ (sel)
- $H_2SO_4$ (acide sulfurique)
- $Ca(OH)_2$ (hydroxyde de calcium)
- $2H_2 + O_2 \rightarrow 2H_2O$ (Réaction)
```

## Bugs potentiels à surveiller

1. **Formule non fermée** : Si un `$` de fermeture manque, tout le texte suivant pourrait être interprété comme une formule
2. **Conflits avec Markdown** : Les `_` et `^` pourraient être interprétés comme du Markdown italique/exposant
3. **Performance** : Avec beaucoup de formules, la page pourrait ralentir
4. **Mode sombre** : Les formules doivent rester lisibles en mode sombre

---

**Date de test :** 30 Novembre 2025
