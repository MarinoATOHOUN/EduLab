import React, { useState, useEffect } from 'react';
import { X, Play, RefreshCw, Terminal, Code2, Trash2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type Language = 'javascript' | 'python';

const CodeSandboxModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [language, setLanguage] = useState<Language>('javascript');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const DEFAULT_CODE = {
    javascript: `// Bienvenue dans le Bac à Sable JS !
const nom = "EduLab";
const annee = 2025;

console.log("Bonjour " + nom);
console.log("Nous sommes en " + annee);

// Boucle simple
for(let i = 1; i <= 3; i++) {
  console.log("Compteur : " + i);
}`,
    python: `# Bienvenue dans le Bac à Sable Python !
nom = "EduLab"
score = 100

print("Bonjour " + nom)
print("Votre score est : " + str(score))

# Calcul simple
a = 5
b = 10
print("La somme de 5 + 10 est : " + str(a + b))`
  };

  useEffect(() => {
    if (isOpen) {
      setCode(DEFAULT_CODE[language]);
      setOutput(['Prêt à exécuter le code...']);
    }
  }, [isOpen, language]);

  if (!isOpen) return null;

  const runJavaScript = () => {
    const logs: string[] = [];

    // Surcharge de console.log pour capturer la sortie
    const originalLog = console.log;
    console.log = (...args) => {
      logs.push(args.map(arg => String(arg)).join(' '));
      // originalLog(...args); // Décommenter pour voir aussi dans la console du navigateur
    };

    try {
      // Exécution sécurisée via Function constructor
      // eslint-disable-next-line no-new-func
      new Function(code)();
    } catch (error: any) {
      logs.push(`Erreur : ${error.message}`);
    } finally {
      // Restauration de console.log
      console.log = originalLog;
      setOutput(logs.length > 0 ? logs : ['Code exécuté avec succès (aucune sortie).']);
    }
  };

  const runPythonMock = () => {
    // Simulation simple d'un interpréteur Python pour la démo
    // Note: Un vrai interpréteur nécessiterait Pyodide (WASM) qui est trop lourd pour cette démo.
    const logs: string[] = [];
    const variables: Record<string, any> = {};

    try {
      const lines = code.split('\n');

      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;

        // Gestion simple des print()
        if (trimmed.startsWith('print(') && trimmed.endsWith(')')) {
          let content = trimmed.slice(6, -1);

          // Gestion basique de la concaténation de chaînes (+)
          const parts = content.split('+').map(p => p.trim());
          let result = '';

          parts.forEach(part => {
            if ((part.startsWith('"') && part.endsWith('"')) || (part.startsWith("'") && part.endsWith("'"))) {
              // C'est une string littérale
              result += part.slice(1, -1);
            } else if (part.startsWith('str(') && part.endsWith(')')) {
              // Conversion str() d'une variable ou expression
              const varName = part.slice(4, -1).trim();
              // Check si c'est une expression math simple (a + b)
              if (varName.includes('+')) {
                const [v1, v2] = varName.split('+').map(v => v.trim());
                const val1 = variables[v1] !== undefined ? variables[v1] : parseInt(v1);
                const val2 = variables[v2] !== undefined ? variables[v2] : parseInt(v2);
                result += (val1 + val2);
              } else {
                result += variables[varName] !== undefined ? variables[varName] : `[Err: ${varName}]`;
              }
            } else {
              // C'est une variable directe
              result += variables[part] !== undefined ? variables[part] : '';
            }
          });
          logs.push(result);
        }
        // Gestion simple des assignations (a = 5, b = "text")
        else if (trimmed.includes('=')) {
          const [varName, value] = trimmed.split('=').map(s => s.trim());
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            variables[varName] = value.slice(1, -1);
          } else if (!isNaN(Number(value))) {
            variables[varName] = Number(value);
          }
        }
      });

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
    }, 500); // Petit délai pour l'effet "traitement"
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">

        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg text-blue-600 dark:text-blue-400">
              <Code2 size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Bac à Sable Code</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Expérimentez en JavaScript ou Python</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setLanguage('javascript')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${language === 'javascript' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
              >
                JavaScript
              </button>
              <button
                onClick={() => setLanguage('python')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${language === 'python' ? 'bg-white dark:bg-gray-600 text-yellow-600 dark:text-yellow-400 shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
              >
                Python
              </button>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-grow flex flex-col md:flex-row overflow-hidden">

          {/* Editor */}
          <div className="md:w-1/2 flex flex-col border-r border-gray-200 dark:border-gray-700">
            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 text-xs font-mono text-gray-500 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
              <span>éditeur.{language === 'javascript' ? 'js' : 'py'}</span>
              <button
                onClick={() => setCode(DEFAULT_CODE[language])}
                className="flex items-center gap-1 hover:text-blue-500"
                title="Réinitialiser"
              >
                <RefreshCw size={12} /> Reset
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-grow w-full p-4 bg-white dark:bg-[#1e1e1e] text-gray-800 dark:text-blue-100 font-mono text-sm outline-none resize-none leading-relaxed"
              spellCheck={false}
            ></textarea>
          </div>

          {/* Output */}
          <div className="md:w-1/2 flex flex-col bg-gray-50 dark:bg-[#0d1117]">
            <div className="bg-gray-200 dark:bg-gray-800 px-4 py-2 text-xs font-mono text-gray-500 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
              <span className="flex items-center gap-2"><Terminal size={12} /> Console</span>
              <button
                onClick={() => setOutput([])}
                className="hover:text-red-500"
                title="Effacer"
              >
                <Trash2 size={12} />
              </button>
            </div>
            <div className="flex-grow p-4 font-mono text-sm overflow-y-auto space-y-2">
              {output.map((line, idx) => (
                <div key={idx} className="text-gray-700 dark:text-gray-300 border-b border-gray-200/50 dark:border-gray-700/50 pb-1 last:border-0">
                  <span className="text-gray-400 mr-2 select-none">{'>'}</span>
                  {line}
                </div>
              ))}
              {output.length === 0 && (
                <div className="text-gray-400 italic opacity-50 text-center mt-10">
                  Cliquez sur "Exécuter" pour voir le résultat ici.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer Controls */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {language === 'python' && (
              <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500">
                <code className="bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">Mode simulation</code>
                Supporte print(), variables et maths simples.
              </span>
            )}
          </div>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-green-500/30 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
          >
            {isRunning ? <RefreshCw size={20} className="animate-spin" /> : <Play size={20} className="fill-current" />}
            Exécuter le code
          </button>
        </div>

      </div>
    </div>
  );
};

export default CodeSandboxModal;