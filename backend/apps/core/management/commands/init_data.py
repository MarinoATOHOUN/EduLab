from django.core.management.base import BaseCommand
from apps.core.models import ImpactStat, LearningTool, Testimonial, SocialLink
from apps.opportunities.models import Opportunity
from apps.gamification.models import Badge

class Command(BaseCommand):
    help = 'Initialize essential database data for the application startup'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting data initialization...'))

        self.init_social_links()
        self.init_impact_stats()
        self.init_learning_tools()
        self.init_testimonials()
        self.init_opportunities()
        self.init_badges()

        self.stdout.write(self.style.SUCCESS('Data initialization completed successfully.'))

    def init_social_links(self):
        links = [
            {
                'platform': 'facebook',
                'defaults': {
                    'name': 'Facebook',
                    'url': 'https://facebook.com/edulabafrica',
                    'icon': 'Facebook',
                    'order': 1
                }
            },
            {
                'platform': 'twitter',
                'defaults': {
                    'name': 'Twitter',
                    'url': 'https://twitter.com/edulabafrica',
                    'icon': 'Twitter',
                    'order': 2
                }
            },
            {
                'platform': 'linkedin',
                'defaults': {
                    'name': 'LinkedIn',
                    'url': 'https://linkedin.com/company/edulabafrica',
                    'icon': 'Linkedin',
                    'order': 3
                }
            },
            {
                'platform': 'instagram',
                'defaults': {
                    'name': 'Instagram',
                    'url': 'https://instagram.com/edulabafrica',
                    'icon': 'Instagram',
                    'order': 4
                }
            },
            {
                'platform': 'youtube',
                'defaults': {
                    'name': 'YouTube',
                    'url': 'https://youtube.com/c/edulabafrica',
                    'icon': 'Youtube',
                    'order': 5
                }
            }
        ]

        count = 0
        for item in links:
            obj, created = SocialLink.objects.get_or_create(
                platform=item['platform'],
                defaults=item['defaults']
            )
            if created:
                count += 1
        
        if count > 0:
            self.stdout.write(self.style.SUCCESS(f'Created {count} new social links.'))
        else:
            self.stdout.write('Social links up to date.')

    def init_impact_stats(self):
        stats = [
            {
                'title': 'Étudiants formés',
                'defaults': {
                    'value': '5000+',
                    'icon': 'Users',
                    'description': 'Étudiants accompagnés à travers l\'Afrique',
                    'order': 1
                }
            },
            {
                'title': 'Taux de réussite',
                'defaults': {
                    'value': '98%',
                    'icon': 'CheckCircle',
                    'description': 'Réussite aux examens nationaux',
                    'order': 2
                }
            },
            {
                'title': 'Mentors Experts',
                'defaults': {
                    'value': '200+',
                    'icon': 'Award',
                    'description': 'Professionnels engagés',
                    'order': 3
                }
            },
            {
                'title': 'Outils Pratiques',
                'defaults': {
                    'value': '50+',
                    'icon': 'Wrench',
                    'description': 'Simulateurs et laboratoires virtuels',
                    'order': 4
                }
            }
        ]

        count = 0
        for item in stats:
            obj, created = ImpactStat.objects.get_or_create(
                title=item['title'],
                defaults=item['defaults']
            )
            if created:
                count += 1
        
        if count > 0:
            self.stdout.write(self.style.SUCCESS(f'Created {count} new impact stats.'))
        else:
            self.stdout.write('Impact stats up to date.')

    def init_learning_tools(self):
        tools = [
            {
                'tool_id': 'code',
                'defaults': {
                    'title': 'Code Sandbox',
                    'description': 'Environnement de développement intégré pour apprendre HTML, CSS et JS en temps réel.',
                    'icon': 'Code',
                    'category': 'Informatique',
                    'level': 'Tous niveaux',
                    'link': '/tools/code-sandbox',
                    'color': 'bg-blue-100',
                    'text_color': 'text-blue-600',
                    'bg_gradient': 'from-blue-500 to-cyan-400',
                    'order': 1
                }
            },
            {
                'tool_id': 'geo',
                'defaults': {
                    'title': 'Atlas Interactif',
                    'description': 'Exploration géographique 3D avec données économiques et climatiques en temps réel.',
                    'icon': 'Globe',
                    'category': 'Sciences',
                    'level': 'Collège',
                    'link': '/tools/atlas',
                    'color': 'bg-green-100',
                    'text_color': 'text-green-600',
                    'bg_gradient': 'from-green-500 to-emerald-400',
                    'order': 2
                }
            },
            {
                'tool_id': 'calc',
                'defaults': {
                    'title': 'Calculatrice Scientifique',
                    'description': 'Outil avancé pour les mathématiques, la physique et l\'ingénierie avec graphiques.',
                    'icon': 'Calculator',
                    'category': 'Sciences',
                    'level': 'Lycée',
                    'link': '/tools/calculator',
                    'color': 'bg-purple-100',
                    'text_color': 'text-purple-600',
                    'bg_gradient': 'from-purple-500 to-indigo-400',
                    'order': 3
                }
            },
            {
                'tool_id': 'write',
                'defaults': {
                    'title': 'Atelier d\'Écriture',
                    'description': 'Assistant intelligent pour améliorer vos rédactions et votre style littéraire.',
                    'icon': 'PenTool',
                    'category': 'Langues',
                    'level': 'Primaire',
                    'link': '/tools/writing',
                    'color': 'bg-orange-100',
                    'text_color': 'text-orange-600',
                    'bg_gradient': 'from-orange-500 to-amber-400',
                    'order': 4
                }
            },
            {
                'tool_id': 'art',
                'defaults': {
                    'title': 'Atelier Créatif',
                    'description': 'Espace de dessin et de coloriage numérique pour développer la créativité.',
                    'icon': 'Palette',
                    'category': 'Créativité',
                    'level': 'Primaire',
                    'link': '/tools/coloring',
                    'color': 'bg-pink-100',
                    'text_color': 'text-pink-600',
                    'bg_gradient': 'from-pink-500 to-rose-400',
                    'order': 5
                }
            }
        ]

        count = 0
        for item in tools:
            obj, created = LearningTool.objects.get_or_create(
                tool_id=item['tool_id'],
                defaults=item['defaults']
            )
            if created:
                count += 1
        
        if count > 0:
            self.stdout.write(self.style.SUCCESS(f'Created {count} new learning tools.'))
        else:
            self.stdout.write('Learning tools up to date.')

    def init_testimonials(self):
        testimonials = [
            {
                'name': 'Awa Ndiaye',
                'defaults': {
                    'role': 'Étudiante en Médecine',
                    'country': 'Sénégal',
                    'text': 'EduLab m\'a permis de visualiser l\'anatomie en 3D, ce qui était impossible avec mes livres seulement. Une révolution !',
                    'order': 1
                }
            },
            {
                'name': 'Kofi Mensah',
                'defaults': {
                    'role': 'Lycéen',
                    'country': 'Ghana',
                    'text': 'Grâce au tuteur IA, j\'ai enfin compris les intégrales. C\'est comme avoir un prof particulier disponible 24h/24.',
                    'order': 2
                }
            },
            {
                'name': 'Sarah Benali',
                'defaults': {
                    'role': 'Développeuse Web',
                    'country': 'Maroc',
                    'text': 'Le Code Sandbox est incroyable pour tester des idées rapidement sans rien installer. J\'ai appris React grâce à ça.',
                    'order': 3
                }
            }
        ]

        count = 0
        for item in testimonials:
            obj, created = Testimonial.objects.get_or_create(
                name=item['name'],
                defaults=item['defaults']
            )
            if created:
                count += 1
        
        if count > 0:
            self.stdout.write(self.style.SUCCESS(f'Created {count} new testimonials.'))
        else:
            self.stdout.write('Testimonials up to date.')

    def init_opportunities(self):
        # For opportunities, we'll just check if the table is empty to avoid duplicates of the sample
        # as they don't have unique keys like tool_id
        if Opportunity.objects.exists():
            self.stdout.write('Opportunities already exist. Skipping.')
            return

        from django.utils import timezone
        from datetime import timedelta

        # Create one sample opportunity
        opp = Opportunity.objects.create(
            type='SCHOLARSHIP',
            deadline=timezone.now().date() + timedelta(days=30),
            external_link='https://au.int/en/scholarship',
            is_featured=True
        )
        
        # Add related data
        opp.titles.create(title="Bourse d'Excellence Africaine 2025")
        opp.providers.create(provider="Union Africaine")
        opp.descriptions.create(description="Une opportunité unique pour les étudiants africains brillants de poursuivre leurs études supérieures avec une couverture financière complète.")
        opp.locations.create(location="Addis Ababa, Éthiopie")
        
        self.stdout.write(self.style.SUCCESS('Created 1 sample opportunity.'))

    def init_badges(self):
        badges = [
            {'code': 'b1', 'name': 'Premier Pas', 'description': 'Première question posée', 'icon': '👣', 'color': 'bg-blue-100 text-blue-600'},
            {'code': 'b2', 'name': 'Savant', 'description': '10 meilleures réponses', 'icon': '🦉', 'color': 'bg-yellow-100 text-yellow-600'},
            {'code': 'b3', 'name': 'Mentor Star', 'description': 'Note moyenne de 5.0', 'icon': '⭐', 'color': 'bg-purple-100 text-purple-600'},
            {'code': 'b4', 'name': 'Globe Trotter', 'description': 'Aidé des étudiants de 5 pays', 'icon': '🌍', 'color': 'bg-green-100 text-green-600'},
            {'code': 'b5', 'name': 'Curieux', 'description': 'Avoir visité 50 questions', 'icon': '🔍', 'color': 'bg-indigo-100 text-indigo-600'},
            {'code': 'b6', 'name': 'Tech Guru', 'description': 'Répondre à 20 questions Tech', 'icon': '💻', 'color': 'bg-pink-100 text-pink-600'},
            {'code': 'b7', 'name': 'Philanthrope', 'description': 'Donner 5 sessions de mentorat', 'icon': '🤝', 'color': 'bg-orange-100 text-orange-600'},
            {'code': 'b8', 'name': 'Légende', 'description': 'Atteindre 5000 points', 'icon': '👑', 'color': 'bg-red-100 text-red-600'},
        ]

        count = 0
        for b in badges:
            badge, created = Badge.objects.get_or_create(code=b['code'])
            if created:
                badge.names.create(name=b['name'])
                badge.descriptions.create(description=b['description'])
                badge.icons.create(icon=b['icon'])
                badge.colors.create(color=b['color'])
                count += 1
        
        if count > 0:
            self.stdout.write(self.style.SUCCESS(f'Created {count} new badges.'))
        else:
            self.stdout.write('Badges up to date.')
