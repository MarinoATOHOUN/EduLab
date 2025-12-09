from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.users.models import UserProfile, UserCountry, UserUniversity
from apps.mentors.models import (
    MentorProfile, MentorBio, MentorSpecialty, MentorAvailability
)
from apps.forum.models import Question, QuestionTitle, QuestionContent, QuestionTag
from faker import Faker
import random

User = get_user_model()
fake = Faker(['fr_FR'])

class Command(BaseCommand):
    help = 'Créer des données de test'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--users',
            type=int,
            default=20,
            help='Nombre d\'utilisateurs à créer'
        )
    
    def handle(self, *args, **options):
        num_users = options['users']
        
        self.stdout.write(f'Création de {num_users} utilisateurs de test...')
        
        countries = ['Bénin', 'Sénégal', 'Côte d\'Ivoire', 'Togo', 'Burkina Faso', 'Mali']
        universities = [
            'Université d\'Abomey-Calavi',
            'Université Cheikh Anta Diop',
            'Université Félix Houphouët-Boigny',
            'Université de Lomé'
        ]
        
        # Créer des étudiants
        students = []
        for i in range(num_users):
            email = fake.email()
            user = User.objects.create_user(
                email=email,
                password='password123',
                role='STUDENT'
            )
            
            profile = UserProfile.objects.create(
                user=user,
                name=fake.name()
            )
            
            UserCountry.objects.create(
                profile=profile,
                country=random.choice(countries)
            )
            
            UserUniversity.objects.create(
                profile=profile,
                university=random.choice(universities)
            )
            
            students.append(user)
        
        self.stdout.write(self.style.SUCCESS(f'{num_users} étudiants créés'))
        
        # Créer des mentors
        specialties_list = [
            'Mathématiques', 'Physique', 'Chimie', 'Informatique',
            'Économie', 'Gestion', 'Droit', 'Marketing', 'Finance'
        ]
        
        num_mentors = num_users // 4
        mentors = []
        
        for i in range(num_mentors):
            email = f'mentor{i}@edulab.test'
            user = User.objects.create_user(
                email=email,
                password='password123',
                role='MENTOR'
            )
            
            profile = UserProfile.objects.create(
                user=user,
                name=fake.name()
            )
            
            UserCountry.objects.create(
                profile=profile,
                country=random.choice(countries)
            )
            
            mentor_profile = MentorProfile.objects.create(
                user=user,
                rating=round(random.uniform(3.5, 5.0), 1),
                reviews_count=random.randint(5, 50),
                is_verified=True
            )
            
            MentorBio.objects.create(
                mentor_profile=mentor_profile,
                bio=fake.text(max_nb_chars=200)
            )
            
            # Spécialités
            for specialty in random.sample(specialties_list, k=random.randint(2, 4)):
                MentorSpecialty.objects.create(
                    mentor_profile=mentor_profile,
                    specialty=specialty
                )
            
            # Disponibilités
            days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
            for day in random.sample(days, k=3):
                MentorAvailability.objects.create(
                    mentor_profile=mentor_profile,
                    day_of_week=day,
                    start_time='14:00:00',
                    end_time='17:00:00'
                )
            
            mentors.append(user)
        
        self.stdout.write(self.style.SUCCESS(f'{num_mentors} mentors créés'))
        
        # Créer des questions
        num_questions = num_users * 2
        tags_list = ['aide', 'urgent', 'exercice', 'cours', 'examen', 'projet']
        
        for i in range(num_questions):
            author = random.choice(students)
            profile = author.profiles.filter(is_current=True).first()
            
            question = Question.objects.create(
                author=author,
                profile=profile,
                votes=random.randint(0, 50)
            )
            
            QuestionTitle.objects.create(
                question=question,
                title=fake.sentence()
            )
            
            QuestionContent.objects.create(
                question=question,
                content=fake.text(max_nb_chars=500)
            )
            
            for tag in random.sample(tags_list, k=random.randint(1, 3)):
                QuestionTag.objects.create(
                    question=question,
                    tag=tag
                )
        
        self.stdout.write(self.style.SUCCESS(f'{num_questions} questions créées'))
        
        self.stdout.write(self.style.SUCCESS('Données de test créées avec succès!'))
        self.stdout.write('\\nComptes de test:')
        self.stdout.write(f'  Étudiant: student@test.com / password123')
        self.stdout.write(f'  Mentor: mentor0@edulab.test / password123')