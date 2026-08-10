from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CartItemViewSet,
    CartView,
    CheckoutView,
    OrderViewSet,
    PayOrderView,
    SellerOrderItemViewSet,
)

router = DefaultRouter()
router.register("orders", OrderViewSet, basename="order")
router.register("cart/items", CartItemViewSet, basename="cart-item")
router.register("seller/order-items", SellerOrderItemViewSet, basename="seller-order-item")

urlpatterns = [
    path("cart/", CartView.as_view(), name="cart"),
    path("orders/checkout/", CheckoutView.as_view(), name="checkout"),
    path("orders/<int:order_id>/pay/", PayOrderView.as_view(), name="order-pay"),
    path("", include(router.urls)),
]
