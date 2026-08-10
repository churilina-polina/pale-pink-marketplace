from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ProductReviewsView, ProductViewSet, SellerProductViewSet, WishlistViewSet

router = DefaultRouter()
router.register("products", ProductViewSet, basename="product")
router.register("seller/products", SellerProductViewSet, basename="seller-product")
router.register("wishlist", WishlistViewSet, basename="wishlist")

urlpatterns = [
    path("", include(router.urls)),
    path("products/<int:product_id>/reviews/", ProductReviewsView.as_view(), name="product-reviews"),
]
