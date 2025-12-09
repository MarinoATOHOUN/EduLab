import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, Sparkles, AlertTriangle, Bot, User, Trash2, RefreshCw, BookOpen, Lightbulb, GraduationCap, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { geminiService } from '../services/geminiService';


interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  { label: "Explique-moi le Théorème de Pythagore", subject: "Mathématiques" },
  { label: "Quelles sont les causes de la 1ère Guerre Mondiale ?", subject: "Histoire" },
  { label: "Comment fonctionne la photosynthèse ?", subject: "Biologie" },
  { label: "Différence entre 'a' et 'à' ?", subject: "Français" },
];

const AiTutor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  // Settings
  const [subject, setSubject] = useState('Général');
  const [level, setLevel] = useState('Universitaire');
  const [style, setStyle] = useState('Détaillé et Académique');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Charger l'historique au montage du composant
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const historyData = await geminiService.getHistory();
    setHistory(historyData);
  };

  const handleSend = async (e?: React.FormEvent, textOverride?: string) => {
    if (e) e.preventDefault();

    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    // 1. Add User Message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // 2. Appel API avec tous les paramètres incluant le style
      const responseText = await geminiService.askTutor(textToSend, subject, level, style);

      // 3. Add AI Response
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: "Désolé, j'ai rencontré une erreur de connexion. Veuillez réessayer.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setInput('');
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-4 animate-in fade-in duration-500">

      {/* --- LEFT SIDEBAR: SETTINGS --- */}
      <div className="w-full md:w-80 shrink-0 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex flex-col gap-6 overflow-y-auto">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-edu-accent p-2 rounded-lg text-edu-primary">
              <Brain size={24} />
            </div>
            <h2 className="font-bold text-lg text-edu-primary dark:text-white">Configuration</h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Personnalisez votre assistant pour des réponses adaptées.</p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Matière</label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:ring-2 focus:ring-edu-secondary dark:text-white appearance-none cursor-pointer"
                >
                  <option value="Mathématiques">Mathématiques</option>
                  <option value="Physique">Physique</option>
                  <option value="Informatique">Informatique</option>
                  <option value="Biologie">Biologie</option>
                  <option value="Histoire">Histoire</option>
                  <option value="Économie">Économie</option>
                  <option value="Anglais">Anglais</option>
                  <option value="Général">Général</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Niveau</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:ring-2 focus:ring-edu-secondary dark:text-white appearance-none cursor-pointer"
                >
                  <option value="Collège">Collège</option>
                  <option value="Lycée">Lycée</option>
                  <option value="Universitaire">Universitaire</option>
                  <option value="Débutant">Débutant</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Style d'explication</label>
              <div className="relative">
                <Lightbulb className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:ring-2 focus:ring-edu-secondary dark:text-white appearance-none cursor-pointer"
                >
                  <option value="Simple et Concis">Simple et Concis</option>
                  <option value="Détaillé et Académique">Détaillé et Académique</option>
                  <option value="Explique-moi comme si j'avais 5 ans">Enfant de 5 ans (ELI5)</option>
                  <option value="Pratique avec Exemples">Pratique avec Exemples</option>
                  <option value="Socratique (Pose des questions)">Socratique (Aide-moi à trouver)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {!geminiService.isConfigured() && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-100 dark:border-yellow-800 flex gap-2 items-start mt-auto">
            <AlertTriangle size={16} className="text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-700 dark:text-yellow-400">Mode démo activé (Pas de clé API détectée).</p>
          </div>
        )}

        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-red-100 dark:border-red-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
          >
            <Trash2 size={16} />
            Effacer la conversation
          </button>
        )}

        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-edu-secondary/30 text-edu-secondary hover:bg-edu-secondary/10 transition-colors text-sm font-medium mt-2"
        >
          <Clock size={16} />
          {showHistory ? 'Masquer' : 'Voir'} l'historique
        </button>

        {showHistory && (
          <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Conversations précédentes</h3>
            {history.length > 0 ? (
              history.map((session) => (
                <div
                  key={session.id}
                  onClick={() => {
                    // Charger la session dans le chat actuel
                    const sessionMessages: ChatMessage[] = [];
                    session.questions.forEach((q: any) => {
                      sessionMessages.push({
                        id: `${session.id}-q-${sessionMessages.length}`,
                        role: 'user',
                        content: q.question,
                        timestamp: new Date(q.created_at)
                      });
                      sessionMessages.push({
                        id: `${session.id}-a-${sessionMessages.length}`,
                        role: 'ai',
                        content: q.answer,
                        timestamp: new Date(q.created_at)
                      });
                    });
                    setMessages(sessionMessages);
                    setShowHistory(false);
                  }}
                  className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600"
                >
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {new Date(session.created_at).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 font-medium">
                    {session.first_question || 'Session sans titre'}
                  </p>
                  <p className="text-xs text-edu-secondary mt-1 font-semibold">
                    {session.total_questions} question{session.total_questions > 1 ? 's' : ''}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">Aucun historique</p>
            )}
          </div>
        )}
      </div>

      {/* --- MAIN CHAT AREA --- */}
      <div className="flex-grow flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden relative">

        {/* Chat History */}
        <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-80 p-8">
              <div className="w-20 h-20 bg-edu-secondary/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <Sparkles size={40} className="text-edu-secondary" />
              </div>
              <h1 className="text-2xl font-bold text-edu-primary dark:text-white mb-2">Comment puis-je t'aider ?</h1>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
                Je suis ton tuteur personnel disponible 24/7. Pose-moi n'importe quelle question sur tes cours.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setSubject(s.subject); handleSend(undefined, s.label); }}
                    className="text-left p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-edu-secondary hover:bg-edu-secondary/5 transition-all group"
                  >
                    <span className="text-xs font-bold text-edu-secondary block mb-1">{s.subject}</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-edu-primary dark:group-hover:text-white">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === 'user' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-edu-secondary text-white'
                  }`}>
                  {msg.role === 'user' ? <User size={18} className="text-gray-600 dark:text-gray-300" /> : <Bot size={18} />}
                </div>

                <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-sm ${msg.role === 'user'
                  ? 'bg-edu-primary text-white rounded-tr-none'
                  : 'bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-700'
                  }`}>
                  <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                    {msg.role === 'ai' ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          // Personnalisation des composants Markdown
                          p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-2" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                          h1: ({ node, ...props }) => <h1 className="text-lg font-bold mb-2" {...props} />,
                          h2: ({ node, ...props }) => <h2 className="text-base font-bold mb-2" {...props} />,
                          h3: ({ node, ...props }) => <h3 className="text-sm font-bold mb-1" {...props} />,
                          code: ({ node, inline, ...props }: any) =>
                            inline ? (
                              <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs" {...props} />
                            ) : (
                              <code className="block bg-gray-200 dark:bg-gray-700 p-2 rounded my-2 text-xs overflow-x-auto" {...props} />
                            ),
                          strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                          em: ({ node, ...props }) => <em className="italic" {...props} />,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    )}
                  </div>
                  <div className={`text-[10px] mt-2 text-right ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-edu-secondary text-white flex items-center justify-center shrink-0">
                <Bot size={18} />
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl rounded-tl-none p-4 border border-gray-100 dark:border-gray-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
          <form onSubmit={handleSend} className="relative flex items-center gap-2 max-w-4xl mx-auto">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Posez votre question ici..."
              className="w-full bg-gray-100 dark:bg-gray-900 rounded-2xl pl-4 pr-12 py-3 text-sm outline-none focus:ring-2 focus:ring-edu-secondary/50 border border-transparent focus:border-edu-secondary transition-all resize-none dark:text-white max-h-32 min-h-[50px]"
              style={{ minHeight: '50px' }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 bottom-2 p-2 bg-edu-secondary hover:bg-edu-primary text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoading ? <RefreshCw size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </form>
          <p className="text-center text-[10px] text-gray-400 mt-2">
            L'IA peut faire des erreurs. Vérifiez toujours les informations importantes.
          </p>
        </div>

      </div>
    </div>
  );
};

export default AiTutor;