from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LinkViewSet

router = DefaultRouter()
router.register(r'links', LinkViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
