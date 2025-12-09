# ============================================
# apps/opportunities/serializers.py
# ============================================
from rest_framework import serializers
from apps.opportunities.models import Opportunity

class OpportunitySerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    provider = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    type_label = serializers.CharField(source='get_type_display', read_only=True)
    
    class Meta:
        model = Opportunity
        fields = [
            'id', 'type', 'type_label', 'title', 'provider',
            'description', 'location', 'image', 'tags',
            'deadline', 'external_link', 'is_featured',
            'views_count', 'created_at'
        ]
    
    def get_title(self, obj):
        title = obj.titles.filter(is_current=True).first()
        return title.title if title else None
    
    def get_provider(self, obj):
        provider = obj.providers.filter(is_current=True).first()
        return provider.provider if provider else None
    
    def get_description(self, obj):
        desc = obj.descriptions.filter(is_current=True).first()
        return desc.description if desc else None
    
    def get_location(self, obj):
        loc = obj.locations.filter(is_current=True).first()
        return loc.location if loc else None
    
    def get_image(self, obj):
        img = obj.images.filter(is_current=True).order_by('-created_at').first()
        if img and img.image:
            return self.context['request'].build_absolute_uri(img.image.url)
        return None
    
    def get_tags(self, obj):
        return [t.tag for t in obj.tags.filter(is_active=True)]

