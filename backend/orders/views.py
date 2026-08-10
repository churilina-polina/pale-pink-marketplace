from django.db import transaction
from rest_framework import generics, permissions, status, viewsets
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Cart, CartItem, Order, OrderItem
from .serializers import (
    CartItemSerializer,
    CartSerializer,
    CheckoutSerializer,
    OrderItemSerializer,
    OrderSerializer,
)


class CartView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        return cart


class CartItemViewSet(viewsets.ModelViewSet):
    serializer_class = CartItemSerializer
    permission_classes = (permissions.IsAuthenticated,)
    http_method_names = ("post", "patch", "delete")

    def get_queryset(self):
        return CartItem.objects.filter(cart__user=self.request.user)

    def create(self, request, *args, **kwargs):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        product = request.data.get("product_id")
        if not product:
            raise ValidationError({"product_id": "Обязательное поле"})
        quantity = int(request.data.get("quantity", 1))

        item, created = CartItem.objects.get_or_create(
            cart=cart, product_id=product, defaults={"quantity": quantity}
        )
        if not created:
            item.quantity += quantity
            item.save()

        serializer = self.get_serializer(item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CheckoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @transaction.atomic
    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cart, _ = Cart.objects.get_or_create(user=request.user)
        items = list(cart.items.select_related("product", "product__seller"))
        if not items:
            raise ValidationError("Корзина пуста")

        for item in items:
            if item.product.stock < item.quantity:
                raise ValidationError(f"Недостаточно товара на складе: «{item.product.title}»")

        total_price = sum((item.subtotal for item in items), start=0)
        order = Order.objects.create(
            buyer=request.user,
            shipping_address=serializer.validated_data["shipping_address"],
            total_price=total_price,
        )

        for item in items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                seller=item.product.seller,
                title=item.product.title,
                price=item.product.price,
                quantity=item.quantity,
            )
            item.product.stock -= item.quantity
            item.product.save()

        cart.items.all().delete()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Order.objects.filter(buyer=self.request.user).prefetch_related("items")


class PayOrderView(APIView):
    """Имитация оплаты: помечает заказ оплаченным без реального платёжного шлюза."""

    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id, buyer=request.user)
        except Order.DoesNotExist:
            raise PermissionDenied("Заказ не найден")

        if order.status != Order.Status.CREATED:
            raise ValidationError("Заказ уже оплачен или отменён")

        order.status = Order.Status.PAID
        order.save()
        return Response(OrderSerializer(order).data)


class SellerOrderItemViewSet(viewsets.ModelViewSet):
    """Продавец видит только позиции своих товаров в чужих заказах и обновляет их статус."""

    serializer_class = OrderItemSerializer
    permission_classes = (permissions.IsAuthenticated,)
    http_method_names = ("get", "patch")

    def get_queryset(self):
        return OrderItem.objects.filter(seller=self.request.user).select_related("order")

    def partial_update(self, request, *args, **kwargs):
        item = self.get_object()
        if item.order.status != Order.Status.PAID:
            raise ValidationError("Нельзя менять статус до оплаты заказа")
        new_status = request.data.get("status")
        if new_status not in OrderItem.Status.values:
            raise ValidationError("Некорректный статус")
        item.status = new_status
        item.save()
        return Response(self.get_serializer(item).data)
