import logging
from rest_framework import serializers
from .models import Link

logger = logging.getLogger(__name__)

class LinkSerializer(serializers.ModelSerializer):
    # 기본값을 'ALL'로 처리하기 위한 validation 추가
    category = serializers.CharField(default="ALL")

    class Meta:
        model = Link
        fields = '__all__'

    def validate_category(self, value):
        logger.debug(f"Validating category: {value}")  # 검증 중 값 로깅
        return value.strip() or "ALL"  # 빈 값이면 "ALL" 반환