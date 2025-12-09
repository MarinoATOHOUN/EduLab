from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.bookings.models import Booking
from apps.mentors.models import MentorProfile
from apps.users.models import User
from apps.notifications.services import NotificationService
import random

class Command(BaseCommand):
    help = 'Send automated notifications (reminders, recommendations, etc.)'

    def add_arguments(self, parser):
        parser.add_argument('--type', type=str, help='Type of notification to send: reminder, recommendation, reengagement')
        parser.add_argument('--user_email', type=str, help='Target user email for testing')

    def handle(self, *args, **options):
        notif_type = options.get('type')
        target_email = options.get('user_email')

        if notif_type == 'reminder' or not notif_type:
            self.send_reminders()
        
        if notif_type == 'recommendation' or not notif_type:
            self.send_recommendations(target_email)
            
        if notif_type == 'reengagement' or not notif_type:
            self.send_reengagement(target_email)

    def send_reminders(self):
        self.stdout.write("Checking for booking reminders...")
        now = timezone.now()
        
        # Bookings in 24h (+/- 1h margin)
        start_range = now + timedelta(hours=23)
        end_range = now + timedelta(hours=25)
        
        bookings_24h = Booking.objects.filter(
            status='CONFIRMED',
            date__range=[start_range.date(), end_range.date()]
            # Note: Time filtering would be more precise but keeping it simple for date match
        )

        count = 0
        for booking in bookings_24h:
            # Check if we haven't already sent a reminder (could be stored in a separate model, skipping for demo)
            NotificationService.create_booking_reminder(booking, 24)
            count += 1
            
        self.stdout.write(f"Sent {count} 24h reminders.")

    def send_recommendations(self, target_email=None):
        self.stdout.write("Sending mentor recommendations...")
        
        users = User.objects.filter(email=target_email) if target_email else User.objects.filter(role='STUDENT')
        mentors = list(MentorProfile.objects.filter(is_active=True))
        
        if not mentors:
            self.stdout.write("No mentors available for recommendation.")
            return

        count = 0
        for user in users:
            # Pick a random mentor
            mentor = random.choice(mentors)
            if mentor.user != user: # Don't recommend self
                NotificationService.create_mentor_recommendation(user, mentor)
                count += 1
                
        self.stdout.write(f"Sent {count} recommendations.")

    def send_reengagement(self, target_email=None):
        self.stdout.write("Sending re-engagement notifications...")
        
        users = User.objects.filter(email=target_email) if target_email else User.objects.filter(is_active=True)
        tools = [
            ('Calculatrice Scientifique', '/tools/calculator'),
            ('Atelier d\'Écriture', '/tools/writing'),
            ('Atlas Interactif', '/tools/atlas'),
            ('Atelier de Coloriage', '/tools/coloring')
        ]
        
        count = 0
        for user in users:
            tool_name, tool_link = random.choice(tools)
            NotificationService.create_tool_reengagement(user, tool_name, tool_link)
            count += 1
            
        self.stdout.write(f"Sent {count} re-engagement notifications.")
