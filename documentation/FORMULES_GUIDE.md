# 🧪 Guide d'utilisation des formules mathématiques et chimiques

## Vue d'ensemble

EduConnect supporte maintenant le rendu des formules mathématiques et chimiques grâce à **KaTeX** et **Markdown**. 

## Syntaxe LaTeX

### Formules mathématiques inline (dans le texte)

Pour afficher une formule dans le texte, utilisez `$formule$` :

**Exemples :**
- `$E = mc^2$` → $E = mc^2$
- `$a^2 + b^2 = c^2$` → $a^2 + b^2 = c^2$
- `$\pi r^2$` → $\pi r^2$

### Formules mathématiques en bloc (centrées)

Pour afficher une formule sur sa propre ligne, utilisez `$$formule$$` :

**Exemples :**
```
$$
\int_{a}^{b} x^2 dx = \frac{b^3 - a^3}{3}
$$
```

```
$$
\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}
$$
```

```
$$
\lim_{x \to \infty} \frac{\sin(x)}{x} = 0
$$
```

## Formules chimiques

Les formules chimiques utilisent également la syntaxe LaTeX :

**Exemples :**
- `$H_2O$` → $H_2O$ (eau)
- `$CO_2$` → $CO_2$ (dioxyde de carbone)
- `$C_6H_{12}O_6$` → $C_6H_{12}O_6$ (glucose)
- `$NaCl$` → $NaCl$ (chlorure de sodium)
- `$CaCO_3$` → $CaCO_3$ (carbonate de calcium)

### Équations chimiques

```
$$
2H_2 + O_2 \rightarrow 2H_2O
$$
```

```
$$
CH_4 + 2O_2 \rightarrow CO_2 + 2H_2O
$$
```

## Symboles mathématiques courants

| Symbole | LaTeX | Rendu |
|---------|-------|-------|
| Plus ou moins | `$\pm$` | ± |
| Multiplication | `$\times$` | × |
| Division | `$\div$` | ÷ |
| Fraction | `$\frac{a}{b}$` | a/b |
| Racine carrée | `$\sqrt{x}$` | √x |
| Racine n-ième | `$\sqrt[n]{x}$` | ⁿ√x |
| Puissance | `$x^n$` | xⁿ |
| Indice | `$x_n$` | xₙ |
| Infini | `$\infty$` | ∞ |
| Alpha | `$\alpha$` | α |
| Beta | `$\beta$` | β |
| Gamma | `$\gamma$` | γ |
| Delta | `$\Delta$` | Δ |
| Theta | `$\theta$` | θ |
| Lambda | `$\lambda$` | λ |
| Pi | `$\pi$` | π |
| Sigma | `$\sigma$` | σ |
| Somme | `$\sum$` | Σ |
| Produit | `$\prod$` | Π |
| Intégrale | `$\int$` | ∫ |
| Limite | `$\lim$` | lim |
| Dérivée | `$\frac{dy}{dx}$` | dy/dx |
| Dérivée partielle | `$\frac{\partial y}{\partial x}$` | ∂y/∂x |

## Exemples d'utilisation dans EduConnect

### Dans une question

**Titre :** Problème de calcul intégral

**Contenu :**
```
Comment calculer l'intégrale suivante ?

$$
\int_{0}^{1} x^2 dx
$$

J'ai essayé avec la méthode des rectangles mais je n'arrive pas au bon résultat.
```

### Dans une réponse

```
Pour calculer $\int_{0}^{1} x^2 dx$, tu peux utiliser la formule de l'intégrale de puissance :

$$
\int x^n dx = \frac{x^{n+1}}{n+1} + C
$$

Dans ton cas, $n = 2$, donc :

$$
\int x^2 dx = \frac{x^3}{3} + C
$$

Avec les bornes $[0, 1]$ :

$$
\left[\frac{x^3}{3}\right]_0^1 = \frac{1^3}{3} - \frac{0^3}{3} = \frac{1}{3}
$$
```

### Dans le chat AI Tutor

**Question :**
```
Peux-tu m'expliquer la formule d'Euler ?
```

**Réponse AI :**
```
La formule d'Euler est l'une des plus belles formules mathématiques :

$$
e^{i\pi} + 1 = 0
$$

Elle relie cinq constantes fondamentales : $e$ (nombre d'Euler), $i$ (unité imaginaire), $\pi$ (pi), $1$ et $0$.

Plus généralement, la formule d'Euler s'écrit :

$$
e^{ix} = \cos(x) + i\sin(x)
$$

où $x$ est un nombre réel.
```

## Support technique

Les formules mathématiques et chimiques sont supportées dans :
- ✅ **Questions du forum**
- ✅ **Réponses du forum**
- ✅ **Chat AI Tutor**
- ✅ **Tous les contenus utilisant Markdown**

## Ressources supplémentaires

- [Documentation KaTeX](https://katex.org/docs/supported.html) - Liste complète des fonctions supportées
- [LaTeX Math Symbols](https://www.caam.rice.edu/~heinken/latex/symbols.pdf) - PDF avec tous les symboles
- [Éditeur LaTeX en ligne](https://www.codecogs.com/latex/eqneditor.php) - Pour tester vos formules

## Notes importantes

⚠️ **Attention :** 
- Assurez-vous de toujours fermer vos balises `$` ou `$$`
- Les formules en bloc `$$` doivent être sur leur propre ligne
- Utilisez `\` pour échapper les caractères spéciaux si nécessaire
- En cas d'erreur de syntaxe, la formule s'affichera en texte brut

---

**Date de mise à jour :** 30 Novembre 2025  
**Version :** 1.0.0
