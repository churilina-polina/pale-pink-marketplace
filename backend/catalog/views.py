from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from .filters import ProductFilter
from .models import Product, Review, WishlistItem
from .permissions import IsProductOwner, IsSeller
from .serializers import ProductSerializer, ReviewSerializer, WishlistItemSerializer


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """Публичный каталог: доступен всем, показывает только активные товары."""

    serializer_class = ProductSerializer
    permission_classes = (permissions.AllowAny,)
    filterset_class = ProductFilter
    search_fields = ("title", "description", "color")
    ordering_fields = ("price", "created_at")

    def get_queryset(self):
        return Product.objects.filter(is_active=True).select_related("seller")


class SellerProductViewSet(viewsets.ModelViewSet):
    """CRUD для собственных товаров продавца."""

    serializer_class = ProductSerializer
    permission_classes = (permissions.IsAuthenticated, IsSeller, IsProductOwner)

    def get_queryset(self):
        return Product.objects.filter(seller=self.request.user)

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)


class ProductReviewsView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        return Review.objects.filter(product_id=self.kwargs["product_id"])

    def perform_create(self, serializer):
        product_id = self.kwargs["product_id"]
        if Review.objects.filter(product_id=product_id, user=self.request.user).exists():
            raise ValidationError("Вы уже оставили отзыв на этот товар")
        serializer.save(user=self.request.user, product_id=product_id)


class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistItemSerializer
    permission_classes = (permissions.IsAuthenticated,)
    http_method_names = ("get", "post", "delete")

    def get_queryset(self):
        return WishlistItem.objects.filter(user=self.request.user).select_related("product")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["delete"], url_path="by-product/(?P<product_id>[^/.]+)")
    def remove_by_product(self, request, product_id=None):
        item = get_object_or_404(WishlistItem, user=request.user, product_id=product_id)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
