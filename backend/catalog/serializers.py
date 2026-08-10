from rest_framework import serializers

from .models import Product, Review, WishlistItem


class ProductSerializer(serializers.ModelSerializer):
    seller_name = serializers.SerializerMethodField()
    average_rating = serializers.ReadOnlyField()
    reviews_count = serializers.ReadOnlyField()
    is_wishlisted = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id",
            "seller",
            "seller_name",
            "title",
            "description",
            "category",
            "size",
            "color",
            "price",
            "stock",
            "image_url",
            "is_active",
            "average_rating",
            "reviews_count",
            "is_wishlisted",
            "created_at",
        )
        read_only_fields = ("id", "seller", "created_at")

    def get_seller_name(self, obj):
        return obj.seller.shop_name or obj.seller.username

    def get_is_wishlisted(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.wishlisted_by.filter(user=request.user).exists()


class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source="user.username")

    class Meta:
        model = Review
        fields = ("id", "product", "user", "username", "rating", "text", "created_at")
        read_only_fields = ("id", "product", "user", "created_at")


class WishlistItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source="product", write_only=True
    )

    class Meta:
        model = WishlistItem
        fields = ("id", "product", "product_id", "created_at")
        read_only_fields = ("id", "created_at")
