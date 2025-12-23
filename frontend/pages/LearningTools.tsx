import React, { useState, useEffect } from 'react';
import { Search, Calculator, FlaskConical, PenTool, Palette, ArrowRight, Microscope, Music, Globe, Code, Filter, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { toolsService, LearningTool } from '../services/tools';

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'Calculator': return <Calculator size={32} />;
    case 'FlaskConical': return <FlaskConical size={32} />;
    case 'PenTool': return <PenTool size={32} />;
    case 'Palette': return <Palette size={32} />;
    case 'Code': return <Code size={32} />;
    case 'Microscope': return <Microscope size={32} />;
    case 'Globe': return <Globe size={32} />;
    case 'Music': return <Music size={32} />;
    default: return <Code size={32} />;
  }
};

const LearningTools: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tout');
  const [selectedLevel, setSelectedLevel] = useState('Tout');
  const [tools, setTools] = useState<LearningTool[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const data = await toolsService.getTools();
        setTools(data);
      } catch (error) {
        console.error("Failed to fetch tools", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTools();
  }, []);

  const categories = ['Tout', 'Sciences', 'Langues', 'Créativité', 'Informatique'];
  const levels = ['Tout', 'Primaire', 'Collège', 'Lycée', 'Tous niveaux'];



  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.title.toLowerCase().includes(searchTerm.toLowerCase()) || tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tout' || tool.category === selectedCategory;
    const matchesLevel = selectedLevel === 'Tout' || tool.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const handleToolLaunch = (toolId: string, toolTitle: string) => {
    if (toolId === 'code') {
      navigate('/tools/code-sandbox');
    } else if (toolId === 'geo') {
      navigate('/tools/atlas');
    } else if (toolId === 'write') {
      navigate('/tools/writing');
    } else if (toolId === 'art') {
      navigate('/tools/coloring');
    } else if (toolId === 'calc') {
      navigate('/tools/calculator');
    } else if (toolId === 'chem') {
      // Ouvrir le laboratoire chimique déployé sur Vercel
      window.open('https://virtual-labo-chimique.vercel.app/', '_blank');
    } else {
      alert(`Lancement de l'outil : ${toolTitle} (Version démo)`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 md:p-12 text-white overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full translate-y-1/3 -translate-x-1/3 blur-2xl"></div>

        <div className="relative z-10 max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">La Pratique avant tout</h1>
          <p className="text-indigo-100 text-lg md:text-xl mb-8">
            Hypee a conçu cette boîte à outils pour pallier le manque de matériel dans nos écoles.
            Expérimentez, codez et créez virtuellement pour acquérir les compétences techniques réelles.
          </p>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un outil (ex: chimie, calcul)..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-edu-accent shadow-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="space-y-4 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 items-center border-b border-gray-50 dark:border-gray-700 pb-4 mb-2">
          <div className="flex items-center gap-2 mr-2 text-gray-500 dark:text-gray-400 w-full sm:w-auto sm:min-w-[100px]">
            <Filter size={18} />
            <span className="text-sm font-medium">Matière :</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${selectedCategory === cat
                  ? 'bg-edu-secondary text-white shadow-md'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Level Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 mr-2 text-gray-500 dark:text-gray-400 w-full sm:w-auto sm:min-w-[100px]">
            <GraduationCap size={18} />
            <span className="text-sm font-medium">Niveau :</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {levels.map(lvl => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${selectedLevel === lvl
                  ? 'bg-edu-accent text-edu-primary shadow-md'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Tools Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-edu-primary"></div>
        </div>
      ) : filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map(tool => (
            <div key={tool.id} className={`group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full ${tool.status === 'dev' ? 'opacity-90' : ''}`}>
              {/* Color Bar Top */}
              <div className={`h-2 w-full bg-gradient-to-r ${tool.bg_gradient}`}></div>

              <div className="p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${tool.color} ${tool.text_color} group-hover:scale-110 transition-transform duration-300`}>
                    {getIcon(tool.icon)}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-[10px] font-bold uppercase tracking-wider rounded">
                      {tool.level}
                    </span>
                    {tool.status === 'dev' && (
                      <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 text-[10px] font-bold uppercase tracking-wider rounded border border-yellow-200 dark:border-yellow-800">
                        Bientôt
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-edu-primary dark:text-white mb-2 group-hover:text-edu-secondary transition-colors">
                  {tool.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed flex-grow">
                  {tool.description}
                </p>

                <button
                  disabled={tool.status === 'dev'}
                  onClick={() => handleToolLaunch(tool.tool_id, tool.title)}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group-hover:shadow-md
                          ${tool.status === 'dev'
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed border border-gray-200 dark:border-gray-600'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-edu-primary hover:text-white dark:hover:bg-edu-secondary'
                    }
                       `}
                >
                  {tool.status === 'dev' ? 'Arrive très prochainement' : "Lancer l'outil"}
                  {tool.status !== 'dev' && <ArrowRight size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-1">Aucun outil trouvé</h3>
          <p className="text-gray-500 dark:text-gray-400">Essayez de changer vos filtres de recherche.</p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('Tout'); setSelectedLevel('Tout'); }}
            className="mt-4 text-edu-secondary font-medium hover:underline"
          >
            Réinitialiser
          </button>
        </div>
      )}
    </div>
  );
};

export default LearningTools;