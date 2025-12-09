import React from 'react';
import { FileText, AlertTriangle, Users, Brain, MessageCircle, Wrench, Award, Shield, BookOpen, Lock } from 'lucide-react';

const Terms: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 mb-4">
          <FileText size={32} />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-edu-primary dark:text-white mb-4">Conditions d'Utilisation</h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Dernière mise à jour : 9 Décembre 2025. Veuillez lire attentivement ces conditions avant d'utiliser EduLab Africa.
        </p>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: <Users size={20} />, title: "Forum & Mentorat", color: "blue" },
          { icon: <Brain size={20} />, title: "Tuteur IA", color: "purple" },
          { icon: <Wrench size={20} />, title: "Outils Pratiques", color: "green" },
          { icon: <Award size={20} />, title: "Gamification", color: "yellow" }
        ].map((item, idx) => (
          <div key={idx} className={`bg-${item.color}-50 dark:bg-${item.color}-900/20 p-4 rounded-xl text-center border border-${item.color}-100 dark:border-${item.color}-800/30`}>
            <div className={`inline-flex p-2 bg-white dark:bg-gray-800 rounded-lg text-${item.color}-600 dark:text-${item.color}-400 mb-2`}>
              {item.icon}
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.title}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-8 space-y-8">

          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-bold text-edu-primary dark:text-white mb-3 flex items-center gap-2">
              <span className="bg-edu-secondary/10 text-edu-secondary px-2 py-1 rounded text-sm">1</span>
              Acceptation des conditions
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
              En accédant à la plateforme <strong>EduLab Africa</strong>, en créant un compte ou en utilisant nos services, vous acceptez d'être lié par les présentes Conditions d'Utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services. Ces conditions s'appliquent à l'ensemble des fonctionnalités de la plateforme, notamment :
            </p>
            <ul className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-300 list-disc pl-5">
              <li><strong>Forum d'entraide :</strong> Questions et réponses entre étudiants</li>
              <li><strong>Mentorat :</strong> Réservation de sessions avec des mentors validés</li>
              <li><strong>Tuteur IA :</strong> Assistance intelligente propulsée par Gemini</li>
              <li><strong>Messagerie :</strong> Communications privées chiffrées</li>
              <li><strong>Outils d'apprentissage :</strong> Bac à sable de code, calculatrice scientifique, atlas interactif, ateliers d'écriture et de coloriage</li>
              <li><strong>Opportunités :</strong> Bourses, concours, stages et formations</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-bold text-edu-primary dark:text-white mb-3 flex items-center gap-2">
              <span className="bg-edu-secondary/10 text-edu-secondary px-2 py-1 rounded text-sm">2</span>
              Code de conduite et Intégrité académique
            </h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-800/30 mb-4">
              <h3 className="font-bold text-yellow-800 dark:text-yellow-500 mb-2 flex items-center gap-2">
                <AlertTriangle size={18} />
                Tolérance zéro pour la triche
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                EduLab est une plateforme d'entraide et d'apprentissage. Il est strictement interdit d'utiliser la plateforme (y compris le Tuteur IA) pour demander ou fournir des réponses complètes à des examens en cours, des devoirs notés ou des concours.
              </p>
            </div>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 list-disc pl-5">
              <li>Vous vous engagez à respecter les autres utilisateurs (étudiants et mentors). Tout propos haineux, discriminatoire ou harcelant entraînera un bannissement immédiat.</li>
              <li>Les mentors sont des bénévoles ou professionnels validés. Soyez courtois, ponctuel aux rendez-vous et respectueux de leur temps.</li>
              <li>Vous ne devez pas partager de fausses informations académiques ou d'opportunités frauduleuses.</li>
              <li>L'utilisation abusive des outils (bac à sable de code, calculatrice) à des fins malveillantes est interdite.</li>
              <li>La manipulation du système de gamification (badges, points) par des moyens frauduleux est prohibée.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-bold text-edu-primary dark:text-white mb-3 flex items-center gap-2">
              <span className="bg-edu-secondary/10 text-edu-secondary px-2 py-1 rounded text-sm">3</span>
              Comptes Utilisateurs et Rôles
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm mb-3">
              Pour accéder à certaines fonctionnalités, vous devez créer un compte. Vous êtes responsable de la confidentialité de vos identifiants et de toutes les activités effectuées sous votre compte.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
                <h4 className="font-bold text-edu-primary dark:text-white mb-1 text-sm flex items-center gap-2">
                  <BookOpen size={16} />
                  Étudiants
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Doivent fournir des informations exactes sur leur niveau d'étude, pays et établissement. Peuvent poser des questions, réserver des sessions de mentorat, utiliser le Tuteur IA et les outils d'apprentissage.</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
                <h4 className="font-bold text-edu-primary dark:text-white mb-1 text-sm flex items-center gap-2">
                  <Users size={16} />
                  Mentors
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Le statut de mentor est soumis à validation par l'équipe Hypee sous 48h. Les mentors doivent fournir un CV et définir leurs disponibilités. Nous nous réservons le droit de révoquer ce statut en cas de manquement.</p>
              </div>
            </div>
          </section>

          {/* Section 4 - Services & Outils */}
          <section>
            <h2 className="text-xl font-bold text-edu-primary dark:text-white mb-3 flex items-center gap-2">
              <span className="bg-edu-secondary/10 text-edu-secondary px-2 py-1 rounded text-sm">4</span>
              Services et Outils
            </h2>

            <div className="space-y-4">
              <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-800/30">
                <h4 className="font-bold text-purple-800 dark:text-purple-400 mb-2 flex items-center gap-2">
                  <Brain size={18} />
                  Tuteur IA (Intelligence Artificielle)
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Le Tuteur IA est propulsé par Google Gemini et offre une assistance éducative. L'IA est conçue pour expliquer les concepts et guider l'apprentissage, pas pour faire vos devoirs. Les réponses générées doivent être vérifiées et ne constituent pas des conseils professionnels.
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-800/30">
                <h4 className="font-bold text-green-800 dark:text-green-400 mb-2 flex items-center gap-2">
                  <Wrench size={18} />
                  Outils d'Apprentissage Pratiques
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  EduLab propose des outils interactifs : Bac à sable de code (Python, JavaScript, etc.), Calculatrice scientifique avancée, Atlas mondial interactif, Atelier d'écriture, et Atelier de coloriage. Ces outils sont fournis à des fins éducatives exclusivement.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                <h4 className="font-bold text-blue-800 dark:text-blue-400 mb-2 flex items-center gap-2">
                  <Lock size={18} />
                  Messagerie Chiffrée
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  La messagerie intégrée utilise un chiffrement de bout en bout pour protéger vos conversations privées. EduLab ne peut pas lire le contenu de vos messages chiffrés. Vous êtes responsable du contenu que vous partagez.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 - Gamification */}
          <section>
            <h2 className="text-xl font-bold text-edu-primary dark:text-white mb-3 flex items-center gap-2">
              <span className="bg-edu-secondary/10 text-edu-secondary px-2 py-1 rounded text-sm">5</span>
              Système de Gamification
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
              EduLab intègre un système de gamification pour encourager l'engagement et l'entraide :
            </p>
            <ul className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-300 list-disc pl-5">
              <li><strong>Points d'expérience (XP) :</strong> Gagnés en participant activement sur la plateforme</li>
              <li><strong>Badges :</strong> Récompenses débloquées selon votre progression</li>
              <li><strong>Niveaux :</strong> Évolution basée sur vos points accumulés</li>
              <li><strong>Classement :</strong> Tableau des meilleurs contributeurs de la communauté</li>
            </ul>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 italic">
              Ces éléments n'ont aucune valeur monétaire et ne peuvent être échangés ou transférés.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-bold text-edu-primary dark:text-white mb-3 flex items-center gap-2">
              <span className="bg-edu-secondary/10 text-edu-secondary px-2 py-1 rounded text-sm">6</span>
              Propriété Intellectuelle
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
              Le contenu généré par les utilisateurs (questions, réponses, code dans le bac à sable) reste la propriété de leurs auteurs, mais vous accordez à EduLab Africa une licence mondiale, non exclusive et gratuite pour diffuser ce contenu sur la plateforme afin d'aider d'autres étudiants. Le logo, le design, les outils et le code de la plateforme sont la propriété exclusive de <strong>Hypee (Bénin)</strong>.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl font-bold text-edu-primary dark:text-white mb-3 flex items-center gap-2">
              <span className="bg-edu-secondary/10 text-edu-secondary px-2 py-1 rounded text-sm">7</span>
              Limitation de responsabilité
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
              EduLab Africa s'efforce de fournir des informations exactes, mais ne peut garantir l'exactitude de toutes les réponses fournies par les utilisateurs ou l'IA. Nous ne sommes pas responsables :
            </p>
            <ul className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-300 list-disc pl-5">
              <li>Des décisions académiques ou professionnelles prises sur la base des informations trouvées sur la plateforme</li>
              <li>Des erreurs ou imprécisions dans les réponses du Tuteur IA</li>
              <li>De la qualité des sessions de mentorat (bien que nous validions les mentors)</li>
              <li>Des opportunités (bourses, stages) partagées par des tiers</li>
              <li>Des pertes de données dans le bac à sable de code (sauvegardez régulièrement)</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl font-bold text-edu-primary dark:text-white mb-3 flex items-center gap-2">
              <span className="bg-edu-secondary/10 text-edu-secondary px-2 py-1 rounded text-sm">8</span>
              Modifications des conditions
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
              Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications entreront en vigueur dès leur publication sur la plateforme. En continuant à utiliser EduLab après la publication des modifications, vous acceptez les nouvelles conditions.
            </p>
          </section>

          <div className="border-t border-gray-100 dark:border-gray-700 pt-8 mt-8">
            <div className="bg-edu-secondary/5 dark:bg-edu-secondary/10 p-6 rounded-xl">
              <h3 className="font-bold text-edu-primary dark:text-white mb-2 flex items-center gap-2">
                <Shield size={18} className="text-edu-secondary" />
                Contact Juridique
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Pour toute question concernant ces conditions ou pour signaler un abus, contactez notre équipe :<br />
                <a href="mailto:legal@edulab.africa" className="text-edu-secondary font-medium hover:underline mt-1 inline-block">legal@edulab.africa</a>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Terms;