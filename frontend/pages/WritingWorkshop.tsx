import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Sparkles, Wand2, Save, Eraser, Lightbulb, Trophy, BookOpen, Rocket, Ghost, Palmtree, Pencil, RotateCcw, Check, MousePointer2 } from 'lucide-react';

// Thèmes visuels pour l'atelier
const THEMES = [
  { id: 'default', name: 'Classique', bg: 'from-orange-400 to-yellow-300', text: 'text-orange-900', icon: <BookOpen /> },
  { id: 'adventure', name: 'Aventure', bg: 'from-green-500 to-emerald-300', text: 'text-green-900', icon: <Palmtree /> },
  { id: 'fantasy', name: 'Magie', bg: 'from-purple-500 to-pink-400', text: 'text-purple-900', icon: <Ghost /> },
  { id: 'scifi', name: 'Espace', bg: 'from-indigo-600 to-blue-400', text: 'text-indigo-900', icon: <Rocket /> },
];

// Sujets d'inspiration
const PROMPTS = [
  "Un éléphant qui avait peur des souris découvre qu'il a un super-pouvoir...",
  "J'ai trouvé une porte secrète dans le baobab du village...",
  "Mon stylo s'est mis à écrire tout seul et il a raconté...",
  "Le jour où le soleil a décidé de faire la grasse matinée...",
  "Une tortue m'a donné une carte au trésor qui mène à...",
  "J'ai inventé une machine à transformer les légumes en bonbons...",
  "Mon meilleur ami est un robot qui vient du futur pour...",
];

// Mots encourageants pour la "Correction Magique"
const FEEDBACK = [
  "Wouah ! Quel vocabulaire incroyable !",
  "Ton histoire est passionnante, je veux la suite !",
  "Tu as beaucoup d'imagination !",
  "Superbe utilisation des adjectifs !",
  "C'est très drôle, j'adore !",
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
const NUMBERS = "0123456789".split('');

const WritingWorkshop: React.FC = () => {
  // Modes: 'story' (Histoires) or 'trace' (Apprendre à tracer)
  const [mode, setMode] = useState<'story' | 'trace'>('story');

  // Story Mode State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [theme, setTheme] = useState(THEMES[0]);
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [level, setLevel] = useState(1);

  // Trace Mode State
  const [selectedChar, setSelectedChar] = useState('A');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [traceScore, setTraceScore] = useState<{score: number, stars: number} | null>(null);

  // Mise à jour du compteur de mots et niveau (Story Mode)
  useEffect(() => {
    const words = content.trim().split(/\s+/).length;
    setWordCount(content.trim() === '' ? 0 : words);
    
    // Gamification simple : niveau augmente tous les 50 mots
    const newLevel = Math.floor(words / 50) + 1;
    if (newLevel !== level) setLevel(newLevel);
  }, [content, level]);

  // Initialisation du canvas (Trace Mode)
  useEffect(() => {
    if (mode === 'trace' && canvasRef.current) {
        clearTraceCanvas();
    }
  }, [mode, selectedChar]);

  // --- STORY MODE FUNCTIONS ---
  const handleGeneratePrompt = () => {
    const random = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    if (content.length < 10) {
      setContent(random + " ");
    } else {
      alert("Idée copiée : " + random);
    }
  };

  const handleMagicWand = () => {
    if (wordCount < 10) {
      setShowFeedback("Écris encore un peu pour que la magie opère ! ✨");
      setTimeout(() => setShowFeedback(null), 3000);
      return;
    }
    const randomFeedback = FEEDBACK[Math.floor(Math.random() * FEEDBACK.length)];
    setShowFeedback(randomFeedback);
    setTimeout(() => setShowFeedback(null), 4000);
  };

  const insertEmoji = (emoji: string) => {
    setContent(prev => prev + emoji);
  };

  // --- TRACE MODE FUNCTIONS ---
  const clearTraceCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set resolution
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setTraceScore(null);
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
      setIsDrawing(true);
      draw(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      let x, y;
      
      if ('touches' in e) {
          x = e.touches[0].clientX - rect.left;
          y = e.touches[0].clientY - rect.top;
      } else {
          x = (e as React.MouseEvent).clientX - rect.left;
          y = (e as React.MouseEvent).clientY - rect.top;
      }

      ctx.lineWidth = 20;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#4F46E5'; // Indigo color for drawing
      
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
  };

  const stopDrawing = () => {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx?.beginPath();
      }
  };

  const checkTracing = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // 1. Create a temporary canvas to draw the perfect letter
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      // Draw the expected character on temp canvas
      tempCtx.font = `bold ${canvas.height * 0.7}px sans-serif`;
      tempCtx.textAlign = 'center';
      tempCtx.textBaseline = 'middle';
      tempCtx.fillStyle = '#000000';
      tempCtx.fillText(selectedChar, canvas.width / 2, canvas.height / 2);

      // 2. Get image data from both
      const userImgData = canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height).data;
      const targetImgData = tempCtx.getImageData(0, 0, canvas.width, canvas.height).data;

      if (!userImgData || !targetImgData) return;

      let hits = 0; // User drew on target
      let misses = 0; // User drew outside target
      let totalTarget = 0; // Total pixels in target letter

      for (let i = 0; i < targetImgData.length; i += 4) {
          const targetAlpha = targetImgData[i + 3]; // Alpha channel of target
          const userAlpha = userImgData[i + 3]; // Alpha channel of user drawing

          // Is this pixel part of the letter?
          if (targetAlpha > 50) {
              totalTarget++;
              // Did the user draw here?
              if (userAlpha > 50) {
                  hits++;
              }
          } else {
              // This is background. Did user draw here?
              if (userAlpha > 50) {
                  misses++;
              }
          }
      }

      // 3. Calculate Score
      // Accuracy: How much of the letter is covered?
      const coverage = totalTarget > 0 ? (hits / totalTarget) : 0;
      // Precision: How much did they draw outside?
      // Penalty factor can be adjusted
      const penalty = misses > (totalTarget * 0.5) ? 0.5 : (misses / totalTarget); 
      
      let finalScore = (coverage * 100) - (penalty * 20);
      finalScore = Math.max(0, Math.min(100, finalScore));

      let stars = 0;
      if (finalScore > 80) stars = 3;
      else if (finalScore > 50) stars = 2;
      else if (finalScore > 20) stars = 1;

      setTraceScore({ score: Math.round(finalScore), stars });
  };

  return (
    <div className={`min-h-[calc(100vh-140px)] bg-gradient-to-br ${theme.bg} p-2 md:p-6 animate-in fade-in duration-500 transition-colors`}>
      
      <div className="max-w-6xl mx-auto bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border-4 border-white dark:border-gray-700 flex flex-col h-[85vh]">
        
        {/* --- HEADER --- */}
        <div className="p-4 border-b-2 border-gray-100 dark:border-gray-700 flex flex-wrap justify-between items-center gap-4 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <Link to="/tools" className={`p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:scale-110 transition-transform ${theme.text}`}>
              <ChevronLeft size={24} />
            </Link>
            
            {/* Mode Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                 <button 
                   onClick={() => setMode('story')}
                   className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${mode === 'story' ? 'bg-white dark:bg-gray-600 shadow-sm text-edu-primary dark:text-white' : 'text-gray-500'}`}
                 >
                    <BookOpen size={16} /> <span className="hidden sm:inline">Histoires</span>
                 </button>
                 <button 
                   onClick={() => setMode('trace')}
                   className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${mode === 'trace' ? 'bg-white dark:bg-gray-600 shadow-sm text-edu-primary dark:text-white' : 'text-gray-500'}`}
                 >
                    <Pencil size={16} /> <span className="hidden sm:inline">Tracer</span>
                 </button>
             </div>
          </div>

          {mode === 'story' ? (
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                 <Trophy size={16} className="text-yellow-500" />
                 <span>Niveau {level}</span>
                 <span>•</span>
                 <span>{wordCount} mots</span>
              </div>
          ) : (
             <div className="text-sm font-medium text-gray-500">
                 Apprends à écrire en t'amusant !
             </div>
          )}

          {/* Theme Selector (Story Mode Only) */}
          {mode === 'story' && (
            <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 p-1.5 rounded-xl hidden sm:flex">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t)}
                  className={`p-1.5 rounded-lg transition-all ${theme.id === t.id ? 'bg-white dark:bg-gray-600 shadow-md scale-110' : 'hover:bg-white/50 dark:hover:bg-gray-600'}`}
                  title={t.name}
                >
                  <div className={`text-lg ${t.id === theme.id ? t.text : 'text-gray-400'}`}>{t.icon}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- CONTENT AREA --- */}
        {mode === 'story' ? (
            <>
                {/* STORY TOOLBAR */}
                <div className="bg-indigo-50 dark:bg-gray-800 p-3 flex flex-wrap items-center gap-3 border-b border-gray-200 dark:border-gray-700">
                    <button 
                        onClick={handleGeneratePrompt}
                        className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-4 py-2 rounded-xl font-bold shadow-sm transition-transform hover:scale-105 active:scale-95 text-xs sm:text-sm"
                    >
                        <Lightbulb size={18} />
                        Idée
                    </button>

                    <div className="flex gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-hide flex-grow sm:flex-grow-0">
                        {['😀','😂','😍','😎','🤔','🦁','🐘','🌍','🌞','⭐','🔥','💧'].map(emoji => (
                            <button key={emoji} onClick={() => insertEmoji(emoji)} className="text-xl hover:scale-125 transition-transform p-1">
                            {emoji}
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex-grow hidden sm:block"></div>

                    <button 
                        onClick={() => setContent('')}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors ml-auto sm:ml-0"
                        title="Effacer tout"
                    >
                        <Eraser size={20} />
                    </button>
                </div>

                {/* STORY EDITOR */}
                <div className="flex-grow flex flex-col relative bg-white dark:bg-gray-900 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] overflow-y-auto">
                    <input 
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Le titre de mon histoire..."
                        className="w-full p-4 sm:p-6 text-2xl sm:text-3xl font-bold bg-transparent border-b border-dashed border-gray-200 dark:border-gray-700 outline-none text-center placeholder-gray-300 dark:text-white dark:placeholder-gray-600 shrink-0"
                    />

                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Il était une fois..."
                        className="flex-grow w-full p-4 sm:p-8 text-lg sm:text-xl leading-loose outline-none resize-none bg-transparent dark:text-blue-100 placeholder-gray-300 dark:placeholder-gray-700 font-medium"
                        style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}
                    ></textarea>

                    {showFeedback && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-2xl border-4 border-yellow-400 text-center animate-in zoom-in duration-300 z-20 max-w-xs mx-4">
                            <div className="text-5xl mb-4">✨</div>
                            <h3 className="text-xl font-bold text-edu-primary dark:text-white mb-2">Magique !</h3>
                            <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">{showFeedback}</p>
                        </div>
                    )}
                </div>

                {/* STORY FOOTER */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
                    <div className="hidden md:flex items-center gap-2">
                        <div className="w-full md:w-32 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                            className={`h-full transition-all duration-1000 ${level % 2 === 0 ? 'bg-green-400' : 'bg-blue-400'}`} 
                            style={{ width: `${Math.min((wordCount % 50) * 2, 100)}%` }}
                            ></div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Prochain niveau</span>
                    </div>

                    <div className="flex gap-2 sm:gap-4 w-full md:w-auto justify-end">
                        <button 
                            onClick={handleMagicWand}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-2xl font-bold shadow-lg shadow-purple-200 dark:shadow-none transition-all hover:-translate-y-1 text-sm sm:text-base"
                        >
                            <Wand2 size={18} className="animate-pulse" />
                            <span className="hidden sm:inline">Baguette Magique</span>
                            <span className="sm:hidden">Magie</span>
                        </button>

                        <button 
                            onClick={() => alert(`Histoire "${title || 'Sans titre'}" sauvegardée dans ton cartable numérique !`)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-2xl font-bold shadow-lg shadow-green-200 dark:shadow-none transition-all hover:-translate-y-1 text-sm sm:text-base"
                        >
                            <Save size={18} />
                            <span>Sauvegarder</span>
                        </button>
                    </div>
                </div>
            </>
        ) : (
            // --- TRACE MODE LAYOUT ---
            <div className="flex-grow flex overflow-hidden">
                {/* Sidebar Char Selector */}
                <div className="w-16 sm:w-20 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto shrink-0 flex flex-col items-center py-4 gap-2">
                    <span className="text-xs font-bold text-gray-400 mb-1">LETTRES</span>
                    {ALPHABET.map(char => (
                        <button
                            key={char}
                            onClick={() => setSelectedChar(char)}
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl font-bold transition-all ${
                                selectedChar === char 
                                ? 'bg-edu-accent text-edu-primary shadow-md scale-110' 
                                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-white/50'
                            }`}
                        >
                            {char}
                        </button>
                    ))}
                    <div className="w-8 h-px bg-gray-300 dark:bg-gray-600 my-2"></div>
                    <span className="text-xs font-bold text-gray-400 mb-1">CHIFFRES</span>
                    {NUMBERS.map(char => (
                        <button
                            key={char}
                            onClick={() => setSelectedChar(char)}
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl font-bold transition-all ${
                                selectedChar === char 
                                ? 'bg-edu-accent text-edu-primary shadow-md scale-110' 
                                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-white/50'
                            }`}
                        >
                            {char}
                        </button>
                    ))}
                </div>

                {/* Drawing Area */}
                <div className="flex-grow flex flex-col relative bg-gray-50 dark:bg-gray-900">
                    <div className="flex-grow relative overflow-hidden flex items-center justify-center touch-none">
                        {/* Background Letter Guide (HTML/CSS for visual guide) */}
                        <div 
                           className="absolute inset-0 flex items-center justify-center pointer-events-none select-none text-gray-200 dark:text-gray-700 font-sans font-bold"
                           style={{ fontSize: 'min(60vh, 60vw)' }}
                        >
                           {selectedChar}
                        </div>
                        
                        {/* Interactive Canvas */}
                        <canvas
                           ref={canvasRef}
                           onMouseDown={startDrawing}
                           onMouseMove={draw}
                           onMouseUp={stopDrawing}
                           onMouseLeave={stopDrawing}
                           onTouchStart={startDrawing}
                           onTouchMove={draw}
                           onTouchEnd={stopDrawing}
                           className="absolute inset-0 w-full h-full cursor-crosshair z-10"
                        />
                        
                        {/* Guide Overlay for User (Helper) */}
                        <div className="absolute top-4 left-4 bg-white/80 dark:bg-gray-800/80 p-3 rounded-xl shadow-sm pointer-events-none z-0">
                           <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                              <MousePointer2 size={16} className="text-edu-secondary animate-bounce" />
                              <span>Trace par-dessus le modèle gris</span>
                           </div>
                        </div>

                        {/* Result Overlay */}
                        {traceScore && (
                           <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
                               <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl text-center transform animate-in zoom-in duration-300 max-w-sm mx-4">
                                   <div className="flex justify-center gap-2 mb-4">
                                       {[1, 2, 3].map(s => (
                                           <Sparkles 
                                             key={s} 
                                             size={40} 
                                             className={`${s <= traceScore.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
                                           />
                                       ))}
                                   </div>
                                   <h3 className="text-2xl font-bold text-edu-primary dark:text-white mb-2">
                                       {traceScore.stars === 3 ? 'Excellent !' : traceScore.stars === 2 ? 'Bravo !' : 'Continue !'}
                                   </h3>
                                   <p className="text-gray-600 dark:text-gray-300 mb-6">
                                       Score de précision : <span className="font-bold text-edu-secondary">{traceScore.score}%</span>
                                   </p>
                                   <button 
                                      onClick={clearTraceCanvas}
                                      className="bg-edu-accent text-edu-primary px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2 w-full"
                                   >
                                      <RotateCcw size={18} /> Réessayer
                                   </button>
                               </div>
                           </div>
                        )}
                    </div>

                    {/* Controls Footer */}
                    <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center z-20">
                        <button 
                           onClick={clearTraceCanvas}
                           className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-red-100 hover:text-red-500 transition-colors"
                           title="Effacer"
                        >
                           <RotateCcw size={24} />
                        </button>

                        <button 
                           onClick={checkTracing}
                           className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-200 dark:shadow-none transition-all hover:-translate-y-1"
                        >
                           <Check size={24} />
                           <span>Vérifier</span>
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default WritingWorkshop;