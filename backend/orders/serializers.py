from rest_framework import serializers

from catalog.models import Product
from catalog.serializers import ProductSerializer

from .models import Cart, CartItem, Order, OrderItem


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True), source="product", write_only=True
    )
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = ("id", "product", "product_id", "quantity", "subtotal")


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = ("id", "items", "total_price")


class OrderItemSerializer(serializers.ModelSerializer):
    seller_name = serializers.SerializerMethodField()
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = (
            "id",
            "order",
            "product",
            "seller",
            "seller_name",
            "title",
            "price",
            "quantity",
            "subtotal",
            "status",
        )
        read_only_fields = ("id", "order", "product", "seller", "title", "price", "quantity")

    def get_seller_name(self, obj):
        return obj.seller.shop_name or obj.seller.username


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "status",
            "shipping_address",
            "total_price",
            "items",
            "created_at",
        )
        read_only_fields = ("id", "status", "total_price", "created_at")


class CheckoutSerializer(serializers.Serializer):
    shipping_address = serializers.CharField(max_length=500)
