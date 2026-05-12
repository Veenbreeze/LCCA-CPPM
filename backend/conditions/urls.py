from rest_framework.routers import DefaultRouter
from .views import ConditionViewSet

router = DefaultRouter()
router.register(r'conditions', ConditionViewSet)

urlpatterns = router.urls