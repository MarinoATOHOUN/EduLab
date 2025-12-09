from rest_framework import serializers
from apps.core.utils import HashIdService

class HashIdField(serializers.Field):
    """
    Serializer field that converts Integer ID to Hashid string and vice-versa.
    """
    def __init__(self, **kwargs):
        self.source_field = kwargs.pop('source_field', None)
        super().__init__(**kwargs)

    def to_representation(self, value):
        if hasattr(value, 'pk'):
            return HashIdService.encode(value.pk)
        return HashIdService.encode(value)

    def to_internal_value(self, data):
        decoded = HashIdService.decode(data)
        if decoded is None:
            raise serializers.ValidationError("Invalid ID format")
        return decoded

from .models import ImpactStat, LearningTool, Testimonial, SocialLink

class ImpactStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImpactStat
        fields = ['id', 'title', 'value', 'icon', 'description', 'order']

class LearningToolSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningTool
        fields = '__all__'

class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = '__all__'

class SocialLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialLink
        fields = '__all__'
