# ============================================
# apps/gamification/services.py
# ============================================
from django.conf import settings
from apps.gamification.models import Badge, UserBadge, BadgeCriteria

class BadgeService:
    """Service pour gérer l'attribution automatique des badges"""
    
    @staticmethod
    def check_and_award_badges(user):
        """Vérifier et attribuer les badges gagnés"""
        awarded_badges = []
        
        # Récupérer tous les badges actifs
        badges = Badge.objects.filter(is_active=True)
        
        for badge in badges:
            # Vérifier si l'utilisateur a déjà ce badge
            if UserBadge.objects.filter(
                user=user,
                badge=badge,
                is_active=True
            ).exists():
                continue
            
            # Vérifier les critères
            if BadgeService._check_badge_criteria(user, badge):
                user_badge = UserBadge.objects.create(
                    user=user,
                    badge=badge
                )
                awarded_badges.append(user_badge)
                
                # Créer notification
                from apps.notifications.services import NotificationService
                NotificationService.create_badge_notification(user_badge)
        
        return awarded_badges
    
    @staticmethod
    def _check_badge_criteria(user, badge):
        """Vérifier si l'utilisateur remplit les critères du badge"""
        criteria = badge.criteria.filter(is_active=True)
        
        for criterion in criteria:
            criteria_type = criterion.criteria_type
            criteria_value = criterion.criteria_value
            
            if criteria_type == 'POINTS_THRESHOLD':
                required_points = criteria_value.get('points', 0)
                if user.points >= required_points:
                    return True
            
            elif criteria_type == 'FIRST_ACTION':
                action = criteria_value.get('action')
                if action == 'first_question':
                    if user.questions.filter(is_active=True).exists():
                        return True
                elif action == 'first_answer':
                    if user.answers.filter(is_active=True).exists():
                        return True
                elif action == 'become_mentor':
                    if hasattr(user, 'mentor_profile') and user.mentor_profile.is_active:
                        return True
            
            elif criteria_type == 'ACTION_COUNT':
                action = criteria_value.get('action')
                count = criteria_value.get('count', 0)
                
                if action == 'questions_posted':
                    if user.questions.filter(is_active=True).count() >= count:
                        return True
                elif action == 'answers_posted':
                    if user.answers.filter(is_active=True).count() >= count:
                        return True
        
        return False
    
    @staticmethod
    def initialize_default_badges():
        """Créer les badges par défaut"""
        from apps.gamification.models import (
            BadgeName, BadgeDescription, BadgeIcon, BadgeColor
        )
        
        default_badges = [
            {
                'code': 'first_step',
                'name': 'Premier Pas',
                'description': 'Posez votre première question',
                'icon': '🌱',
                'color': 'green',
                'criteria': {'type': 'FIRST_ACTION', 'value': {'action': 'first_question'}}
            },
            {
                'code': 'curious',
                'name': 'Curieux',
                'description': 'Atteignez 100 points',
                'icon': '🔍',
                'color': 'blue',
                'criteria': {'type': 'POINTS_THRESHOLD', 'value': {'points': 100}}
            },
            {
                'code': 'engaged',
                'name': 'Engagé',
                'description': 'Atteignez 500 points',
                'icon': '⭐',
                'color': 'yellow',
                'criteria': {'type': 'POINTS_THRESHOLD', 'value': {'points': 500}}
            },
            {
                'code': 'expert',
                'name': 'Expert',
                'description': 'Atteignez 1000 points',
                'icon': '🏆',
                'color': 'gold',
                'criteria': {'type': 'POINTS_THRESHOLD', 'value': {'points': 1000}}
            },
            {
                'code': 'master',
                'name': 'Maître',
                'description': 'Atteignez 2500 points',
                'icon': '👑',
                'color': 'purple',
                'criteria': {'type': 'POINTS_THRESHOLD', 'value': {'points': 2500}}
            },
            {
                'code': 'legend',
                'name': 'Légende',
                'description': 'Atteignez 5000 points',
                'icon': '💎',
                'color': 'diamond',
                'criteria': {'type': 'POINTS_THRESHOLD', 'value': {'points': 5000}}
            },
        ]
        
        for badge_data in default_badges:
            badge, created = Badge.objects.get_or_create(
                code=badge_data['code']
            )
            
            if created:
                BadgeName.objects.create(badge=badge, name=badge_data['name'])
                BadgeDescription.objects.create(badge=badge, description=badge_data['description'])
                BadgeIcon.objects.create(badge=badge, icon=badge_data['icon'])
                BadgeColor.objects.create(badge=badge, color=badge_data['color'])
                
                BadgeCriteria.objects.create(
                    badge=badge,
                    criteria_type=badge_data['criteria']['type'],
                    criteria_value=badge_data['criteria']['value']
                )

