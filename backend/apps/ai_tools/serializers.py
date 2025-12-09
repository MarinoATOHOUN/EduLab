# ============================================
# apps/ai_tools/serializers.py
# ============================================
from rest_framework import serializers

class AITutorRequestSerializer(serializers.Serializer):
    question = serializers.CharField()
    subject = serializers.CharField(max_length=100, required=False)
    level = serializers.CharField(max_length=50, required=False)
    style = serializers.CharField(max_length=100, required=False)
    conversation_history = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        default=list
    )

class AITutorResponseSerializer(serializers.Serializer):
    answer = serializers.CharField()
    session_id = serializers.IntegerField()
    tokens_used = serializers.IntegerField(required=False)

