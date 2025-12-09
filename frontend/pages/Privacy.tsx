import React from 'react';
import { Shield, Lock, Eye, Database, Server, Brain, MessageCircle, BarChart3, Wrench, Award, Globe, Clock, Trash2 } from 'lucide-react';

const Privacy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400 mb-4">
          <Shield size={32} />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-edu-primary dark:text-white mb-4">Politique de Confidentialité</h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Dernière mise à jour : 9 Décembre 2025. Votre vie privée est primordiale. Nous nous engageons à protéger vos données personnelles conformément aux normes internationales (RGPD).
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {[
          { icon: <Database size={24} />, title: "Collecte Minimale", text: "Nous ne collectons que ce qui est nécessaire pour votre expérience académique." },
          { icon: <Lock size={24} />, title: "Sécurité Maximale", text: "Vos données et messages sont chiffrés et stockés sur des serveurs sécurisés." },
          { icon: <Eye size={24} />, title: "Transparence", text: "Vous gardez le contrôle total sur vos informations personnelles." }
        ].map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <div className="inline-flex p-3 bg-gray-50 dark:bg-gray-700 rounded-full text-edu-primary dark:text-white mb-3">
              {item.icon}
            </div>
            <h3 className="font-bold text-lg mb-2 text-edu-primary dark:text-white">{item.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-8 space-y-8">

          <section>
            <h2 className="text-lg font-bold text-edu-primary dark:text-white mb-3 flex items-center gap-2">
              <Database size={20} className="text-edu-secondary" />
              1. Données collectées
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Nous collectons les informations suivantes selon votre utilisation de la plateforme :</p>

            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                <h4 className="font-bold text-blue-800 dark:text-blue-400 mb-2 text-sm">Données d'identité</h4>
                <ul className="list-disc pl-5 text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>Nom complet, adresse email</li>
                  <li>Pays de résidence, université/établissement, niveau d'étude</li>
                  <li>Photo de profil (optionnel)</li>
                  <li>Pour les mentors : CV, domaines d'expertise, disponibilités</li>
                </ul>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-800/30">
                <h4 className="font-bold text-purple-800 dark:text-purple-400 mb-2 text-sm">Données d'activité</h4>
                <ul className="list-disc pl-5 text-sm text-purple-700 dark:text-purple-300 space-y-1">
                  <li>Questions posées et réponses sur le forum</li>
                  <li>Sessions de mentorat réservées et évaluations</li>
                  <li>Conversations avec le Tuteur IA (historique local)</li>
                  <li>Utilisation des outils : code dans le bac à sable, calculs effectués</li>
                  <li>Progression de gamification : points XP, badges débloqués, niveau</li>
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-600">
                <h4 className="font-bold text-gray-800 dark:text-gray-300 mb-2 text-sm">Données techniques & Analytics</h4>
                <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>Adresse IP, type de navigateur, système d'exploitation</li>
                  <li>Recherches effectuées sur la plateforme (questions, mentors, opportunités)</li>
                  <li>Clics et interactions pour améliorer l'expérience utilisateur</li>
                  <li>Données anonymisées pour les statistiques d'impact</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-edu-primary dark:text-white mb-3 flex items-center gap-2">
              <Wrench size={20} className="text-edu-secondary" />
              2. Utilisation des données
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              Vos données sont utilisées exclusivement pour :
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: <MessageCircle size={16} />, text: "Vous connecter aux mentors les plus pertinents selon votre profil" },
                { icon: <Award size={16} />, text: "Gérer votre progression (XP, badges, classement)" },
                { icon: <Brain size={16} />, text: "Personnaliser les suggestions du Tuteur IA" },
                { icon: <Globe size={16} />, text: "Afficher les opportunités adaptées à votre pays et niveau" },
                { icon: <BarChart3 size={16} />, text: "Améliorer nos services via des statistiques anonymisées" },
                { icon: <Server size={16} />, text: "Assurer la sécurité et prévenir les abus" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <div className="text-edu-secondary mt-0.5">{item.icon}</div>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-edu-primary dark:text-white mb-3 flex items-center gap-2">
              <Brain size={20} className="text-edu-secondary" />
              3. Tuteur IA et Services Tiers
            </h2>
            <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-800/30 mb-4">
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Lorsque vous utilisez le <strong>Tuteur IA</strong>, le contenu de votre question est traité par notre fournisseur de technologie (Google Gemini API). Ces données :
              </p>
              <ul className="list-disc pl-5 text-sm text-purple-700 dark:text-purple-300 mt-2 space-y-1">
                <li>Sont utilisées uniquement pour générer la réponse</li>
                <li>Ne sont pas utilisées pour entraîner des modèles publics avec vos données personnelles identifiables</li>
                <li>L'historique de vos conversations IA est stocké localement dans votre navigateur</li>
              </ul>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              <strong>Nous ne vendons jamais vos données à des tiers publicitaires.</strong> Les seuls services tiers utilisés sont des fournisseurs de technologie pour le fonctionnement de la plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-edu-primary dark:text-white mb-3 flex items-center gap-2">
              <Lock size={20} className="text-edu-secondary" />
              4. Messagerie Chiffrée
            </h2>
            <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-800/30">
              <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed">
                La messagerie privée d'EduLab utilise un <strong>chiffrement de bout en bout</strong>. Cela signifie que :
              </p>
              <ul className="list-disc pl-5 text-sm text-green-700 dark:text-green-300 mt-2 space-y-1">
                <li>Vos messages sont chiffrés avant d'être envoyés</li>
                <li>Seul vous et votre correspondant pouvez lire le contenu</li>
                <li>EduLab ne peut pas accéder au contenu de vos conversations chiffrées</li>
                <li>Les pièces jointes sont également protégées</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-edu-primary dark:text-white mb-3 flex items-center gap-2">
              <BarChart3 size={20} className="text-edu-secondary" />
              5. Analytics et Tracking
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              Pour améliorer votre expérience, nous collectons des données d'utilisation anonymisées :
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>Recherches effectuées (termes, filtres, nombre de résultats)</li>
              <li>Pages visitées et temps passé sur chaque section</li>
              <li>Interactions avec les fonctionnalités (clics, téléchargements)</li>
            </ul>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 italic">
              Ces données nous permettent d'identifier les améliorations prioritaires et de mesurer l'impact de la plateforme sur l'éducation en Afrique.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-edu-primary dark:text-white mb-3 flex items-center gap-2">
              <Clock size={20} className="text-edu-secondary" />
              6. Conservation des données
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              Nous conservons vos données aussi longtemps que votre compte est actif :
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li><strong>Données de compte :</strong> Jusqu'à la suppression de votre compte</li>
              <li><strong>Questions et réponses du forum :</strong> Conservées pour aider la communauté (anonymisées si compte supprimé)</li>
              <li><strong>Historique IA :</strong> Stocké localement, vous pouvez l'effacer à tout moment</li>
              <li><strong>Logs techniques :</strong> 90 jours maximum</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-edu-primary dark:text-white mb-3 flex items-center gap-2">
              <Eye size={20} className="text-edu-secondary" />
              7. Vos droits
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Conformément aux lois sur la protection des données (RGPD et lois locales), vous avez le droit de :
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              {[
                { title: "Accès", desc: "Obtenir une copie de toutes vos données personnelles" },
                { title: "Rectification", desc: "Corriger des informations inexactes dans votre profil" },
                { title: "Suppression", desc: "Demander la suppression complète de votre compte (\"Droit à l'oubli\")" },
                { title: "Portabilité", desc: "Recevoir vos données dans un format structuré" },
                { title: "Opposition", desc: "Refuser certains traitements de vos données" },
                { title: "Limitation", desc: "Restreindre temporairement le traitement de vos données" }
              ].map((right, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                  <h4 className="font-bold text-edu-primary dark:text-white text-sm">{right.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{right.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-edu-primary dark:text-white mb-3 flex items-center gap-2">
              <Trash2 size={20} className="text-edu-secondary" />
              8. Suppression de compte
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Vous pouvez demander la suppression de votre compte à tout moment depuis les paramètres ou en contactant notre équipe. Lors de la suppression :
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-300 space-y-1 mt-2">
              <li>Vos données personnelles seront effacées sous 30 jours</li>
              <li>Vos questions/réponses sur le forum seront anonymisées (auteur : "Utilisateur supprimé")</li>
              <li>Vos badges et points seront définitivement perdus</li>
              <li>Vos conversations chiffrées resteront accessibles à vos correspondants mais sans votre identité</li>
            </ul>
          </section>

          <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-xl mt-6">
            <h3 className="font-bold text-edu-primary dark:text-white mb-2 flex items-center gap-2">
              <Shield size={18} className="text-green-600" />
              Contact DPO (Délégué à la Protection des Données)
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Pour exercer vos droits ou pour toute question relative à vos données personnelles, contactez notre équipe dédiée :<br />
              <a href="mailto:privacy@edulab.africa" className="text-edu-secondary font-medium hover:underline mt-1 inline-block">privacy@edulab.africa</a>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              Réponse garantie sous 72 heures ouvrées. EduLab Africa est opéré par <strong>Hypee</strong> (Bénin).
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Privacy;