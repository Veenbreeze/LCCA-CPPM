from rest_framework.routers import DefaultRouter
from .views import RiskViewSet

router = DefaultRouter()
router.register(r'risks', RiskViewSet)

urlpatterns = router.urls