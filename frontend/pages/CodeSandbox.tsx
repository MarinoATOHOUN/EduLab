import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Play, RefreshCw, Terminal, Code2, Trash2, Settings, Save, BookOpen } from 'lucide-react';

type Language = 'javascript' | 'python';

interface CodeExample {
  label: string;
  code: string;
}

const CodeSandbox: React.FC = () => {
  const [language, setLanguage] = useState<Language>('javascript');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const CODE_EXAMPLES: Record<Language, CodeExample[]> = {
    javascript: [
      {
        label: "Introduction",
        code: `// Bienvenue dans le Bac à Sable JS !
const nom = "EduLab";
const annee = 2025;

console.log("Bonjour " + nom);
console.log("Nous sommes en " + annee);`
      },
      {
        label: "Boucle For",
        code: `// Exemple de boucle For
console.log("Début du compte à rebours...");

for(let i = 5; i > 0; i--) {
  console.log(i + "...");
}

console.log("Décollage ! 🚀");`
      },
      {
        label: "Calculatrice Simple",
        code: `// Calculatrice simple
const a = 15;
const b = 5;
const operation = "addition"; // essayez: multiplication, division, soustraction

let resultat;

if (operation === "addition") {
  resultat = a + b;
} else if (operation === "multiplication") {
  resultat = a * b;
} else if (operation === "division") {
  resultat = a / b;
} else {
  resultat = a - b;
}

console.log("Opération : " + operation);
console.log("Résultat : " + resultat);`
      },
      {
        label: "Tableaux (Arrays)",
        code: `// Manipulation de tableaux
const matieres = ["Maths", "Physique", "SVT", "Informatique"];

console.log("Ma liste de matières :");

// Parcourir le tableau
matieres.forEach((m, index) => {
  console.log((index + 1) + ". " + m);
});

console.log("Total : " + matieres.length + " matières.");`
      }
    ],
    python: [
      {
        label: "Introduction",
        code: `# Bienvenue dans le Bac à Sable Python !
nom = "EduLab"
score = 100

print("Bonjour " + nom)
print("Votre score est : " + str(score))`
      },
      {
        label: "Conditions (If/Else)",
        code: `# Vérification de la note
note = 16

print("Note de l'élève : " + str(note))

if note >= 18:
    print("Mention : Excellent")
elif note >= 14:
    print("Mention : Bien")
elif note >= 10:
    print("Mention : Passable")
else:
    print("Résultat : Insuffisant")`
      },
      {
        label: "Calculatrice Simple",
        code: `# Calculatrice basique
a = 50
b = 10

somme = a + b
produit = a * b
division = a / b

print("Nombres : " + str(a) + " et " + str(b))
print("Somme : " + str(somme))
print("Produit : " + str(produit))
print("Division : " + str(division))`
      },
      {
        label: "Boucle While",
        code: `# Boucle While
compteur = 1

print("Début de la boucle...")

while compteur <= 5:
    print("Passage numéro : " + str(compteur))
    compteur = compteur + 1

print("Fin de la boucle !")`
      }
    ]
  };

  useEffect(() => {
    // Load the first example (Introduction) when language changes
    setCode(CODE_EXAMPLES[language][0].code);
    setOutput(['Prêt à exécuter le code...']);
  }, [language]);

  const handleLoadExample = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLabel = e.target.value;
    const example = CODE_EXAMPLES[language].find(ex => ex.label === selectedLabel);
    if (example) {
      // Confirmation could be added here if user modified code
      setCode(example.code);
      setOutput(['Exemple chargé : ' + selectedLabel]);
    }
  };

  const runJavaScript = () => {
    const logs: string[] = [];

    const originalLog = console.log;
    console.log = (...args) => {
      logs.push(args.map(arg => String(arg)).join(' '));
    };

    try {
      // eslint-disable-next-line no-new-func
      new Function(code)();
    } catch (error: any) {
      logs.push(`Erreur : ${error.message}`);
    } finally {
      console.log = originalLog;
      setOutput(logs.length > 0 ? logs : ['Code exécuté avec succès (aucune sortie).']);
    }
  };

  const runPythonMock = () => {
    const logs: string[] = [];
    const variables: Record<string, any> = {};

    try {
      const lines = code.split('\n');
      let skipBlock = false; // Basic logical block skipping for if/else simulation

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith('#')) continue;

        // Very basic indentation check (simulation)
        const isIndented = line.startsWith('    ') || line.startsWith('\t');

        if (skipBlock && isIndented) continue;
        if (!isIndented) skipBlock = false;

        // Gestion IF/ELIF/ELSE très simplifiée (ne gère pas l'imbrication complexe)
        if (trimmed.startsWith('if ') && trimmed.endsWith(':')) {
          // Logique simplifiée : on évalue juste des comparaisons directes de nombres pour la démo
          const condition = trimmed.substring(3, trimmed.length - 1).trim();
          let isTrue = false;

          try {
            // Hacky eval for demo purposes using variables
            // Replace var names with values
            let evalCond = condition;
            Object.keys(variables).forEach(key => {
              const val = typeof variables[key] === 'string' ? `'${variables[key]}'` : variables[key];
              evalCond = evalCond.replace(new RegExp(`\\b${key}\\b`, 'g'), String(val));
            });
            // eslint-disable-next-line no-eval
            isTrue = eval(evalCond);
          } catch (e) { isTrue = false; }

          if (!isTrue) skipBlock = true;
          continue;
        }

        if (trimmed.startsWith('else:') || trimmed.startsWith('elif ')) {
          // Si on arrive ici et qu'on n'a pas skippé le bloc précédent (donc le if était vrai),
          // alors on doit skipper ce else/elif.
          // Si on skippait (le if était faux), alors on regarde ce bloc.
          skipBlock = !skipBlock;

          // Pour elif, il faudrait réévaluer, mais pour cette mock simple, on simplifie
          continue;
        }

        // While loop simulation (very limited)
        if (trimmed.startsWith('while ') && trimmed.endsWith(':')) {
          logs.push("[Info: Les boucles while sont simulées une seule fois dans cet aperçu]");
          continue;
        }

        if (trimmed.startsWith('print(') && trimmed.endsWith(')')) {
          let content = trimmed.slice(6, -1);
          const parts = content.split('+').map(p => p.trim());
          let result = '';

          parts.forEach(part => {
            if ((part.startsWith('"') && part.endsWith('"')) || (part.startsWith("'") && part.endsWith("'"))) {
              result += part.slice(1, -1);
            } else if (part.startsWith('str(') && part.endsWith(')')) {
              const varName = part.slice(4, -1).trim();
              if (varName.includes('+')) {
                const [v1, v2] = varName.split('+').map(v => v.trim());
                const val1 = variables[v1] !== undefined ? variables[v1] : parseInt(v1);
                const val2 = variables[v2] !== undefined ? variables[v2] : parseInt(v2);
                result += (val1 + val2);
              } else {
                result += variables[varName] !== undefined ? variables[varName] : `[Err: ${varName}]`;
              }
            } else {
              result += variables[part] !== undefined ? variables[part] : '';
            }
          });
          logs.push(result);
        }
        else if (trimmed.includes('=')) {
          const [varName, value] = trimmed.split('=').map(s => s.trim());
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            variables[varName] = value.slice(1, -1);
          } else if (!isNaN(Number(value))) {
            variables[varName] = Number(value);
          } else if (value.includes('+')) {
            // Simple addition assignment: compteur = compteur + 1
            const [v1, v2] = value.split('+').map(v => v.trim());
            const val1 = variables[v1] !== undefined ? variables[v1] : (isNaN(Number(v1)) ? 0 : Number(v1));
            const val2 = variables[v2] !== undefined ? variables[v2] : (isNaN(Number(v2)) ? 0 : Number(v2));
            variables[varName] = val1 + val2;
          }
        }
      }

      if (logs.length === 0) logs.push("Code exécuté (simulation Python simplifiée).");
    } catch (e) {
      logs.push("Erreur de syntaxe (Simulée)");
    }

    setOutput(logs);
  };

  const handleRun = () => {
    setIsRunning(true);
    setOutput([]);

    setTimeout(() => {
      if (language === 'javascript') {
        runJavaScript();
      } else {
        runPythonMock();
      }
      setIsRunning(false);
    }, 500);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-500 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">

      {/* Toolbar Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shrink-0 gap-4 sm:gap-0">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Link to="/tools" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-600 dark:text-gray-300">
            <ChevronLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg text-blue-600 dark:text-blue-400 hidden md:block">
              <Code2 size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">Bac à Sable Code</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden md:block">Environnement d'exécution sécurisé</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto">

          {/* Language Switcher */}
          <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1 flex-shrink-0">
            <button
              onClick={() => setLanguage('javascript')}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${language === 'javascript' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
            >
              JavaScript
            </button>
            <button
              onClick={() => setLanguage('python')}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${language === 'python' ? 'bg-white dark:bg-gray-600 text-yellow-600 dark:text-yellow-400 shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
            >
              Python
            </button>
          </div>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1 hidden sm:block"></div>

          {/* Examples Dropdown */}
          <div className="relative flex-grow sm:flex-grow-0">
            <BookOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <select
              onChange={handleLoadExample}
              value={CODE_EXAMPLES[language].find(ex => ex.code === code)?.label || ''}
              className="w-full sm:w-48 pl-9 pr-4 py-2 rounded-lg text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-edu-secondary appearance-none cursor-pointer"
            >
              <option value="" disabled>Choisir un exemple...</option>
              {CODE_EXAMPLES[language].map((ex, idx) => (
                <option key={idx} value={ex.label}>{ex.label}</option>
              ))}
            </select>
          </div>

          <button className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors hidden md:block">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden">

        {/* Editor Column */}
        <div className="md:w-1/2 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e1e]">
          <div className="bg-gray-100 dark:bg-[#252526] px-4 py-2 text-xs font-mono text-gray-500 dark:text-gray-400 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 shrink-0">
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${language === 'javascript' ? 'bg-yellow-400' : 'bg-blue-400'}`}></span>
              main.{language === 'javascript' ? 'js' : 'py'}
            </span>
            <button
              onClick={() => setCode(CODE_EXAMPLES[language][0].code)}
              className="flex items-center gap-1 hover:text-blue-500 transition-colors"
            >
              <RefreshCw size={12} /> Reset
            </button>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-grow w-full p-6 bg-transparent text-gray-800 dark:text-blue-100 font-mono text-sm outline-none resize-none leading-relaxed"
            spellCheck={false}
          ></textarea>
        </div>

        {/* Console Column */}
        <div className="md:w-1/2 flex flex-col bg-gray-50 dark:bg-[#0d1117] h-1/2 md:h-auto border-t md:border-t-0 border-gray-200 dark:border-gray-700">
          <div className="bg-gray-200 dark:bg-[#161b22] px-4 py-2 text-xs font-mono text-gray-500 dark:text-gray-400 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 shrink-0">
            <span className="flex items-center gap-2"><Terminal size={12} /> Terminal</span>
            <button onClick={() => setOutput([])} className="hover:text-red-500 transition-colors">
              <Trash2 size={12} />
            </button>
          </div>
          <div className="flex-grow p-6 font-mono text-sm overflow-y-auto space-y-2">
            {output.map((line, idx) => (
              <div key={idx} className="text-gray-700 dark:text-gray-300 border-b border-gray-200/50 dark:border-gray-700/50 pb-1 last:border-0 break-words">
                <span className="text-gray-400 mr-2 select-none opacity-50">$</span>
                {line}
              </div>
            ))}
            {output.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                <Terminal size={32} className="mb-2" />
                <p className="text-xs">En attente d'exécution...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0 flex justify-between items-center">
        <div className="text-xs text-gray-500 hidden sm:block">
          {language === 'python' ? (
            <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500">
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
              Mode simulation client-side
            </span>
          ) : (
            <span className="flex items-center gap-1 text-green-600 dark:text-green-500">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Moteur JS V8 (Browser)
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-green-500/30 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait w-full sm:w-auto justify-center"
          >
            {isRunning ? <RefreshCw size={20} className="animate-spin" /> : <Play size={20} className="fill-current" />}
            Exécuter le code
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeSandbox;