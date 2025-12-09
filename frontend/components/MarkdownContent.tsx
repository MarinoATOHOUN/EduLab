import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MarkdownContentProps {
    content: string;
    className?: string;
}

/**
 * Composant pour afficher du contenu Markdown avec support des formules mathématiques et chimiques
 * Utilise LaTeX pour le rendu des formules (syntaxe: $formule$ pour inline, $$formule$$ pour block)
 * 
 * Exemples d'utilisation:
 * - Formule inline: $E = mc^2$
 * - Formule block: $$\int_{a}^{b} x^2 dx$$
 * - Formule chimique: $H_2O$, $CO_2$
 */
const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, className = '' }) => {
    return (
        <div className={`markdown-content ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    p: ({ node, ...props }) => <p className="mb-2 leading-relaxed" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-2" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                    h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-3 mt-4" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-2 mt-3" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-base font-bold mb-2 mt-2" {...props} />,
                    code: ({ node, inline, ...props }: any) =>
                        inline ? (
                            <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                        ) : (
                            <code className="block bg-gray-200 dark:bg-gray-700 p-3 rounded my-2 text-sm overflow-x-auto font-mono" {...props} />
                        ),
                    strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                    em: ({ node, ...props }) => <em className="italic" {...props} />,
                    blockquote: ({ node, ...props }) => (
                        <blockquote className="border-l-4 border-edu-secondary pl-4 my-2 italic text-gray-700 dark:text-gray-300" {...props} />
                    ),
                    a: ({ node, ...props }) => (
                        <a className="text-edu-secondary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownContent;
