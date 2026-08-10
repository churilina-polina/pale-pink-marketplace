import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from catalog.tests.factories import ProductFactory, SellerFactory, UserFactory

pytestmark = pytest.mark.django_db


def _place_paid_order(product, quantity=1):
    buyer = UserFactory()
    client = APIClient()
    client.force_authenticate(user=buyer)
    client.post(reverse("cart-item-list"), {"product_id": product.id, "quantity": quantity})
    order = client.post(reverse("checkout"), {"shipping_address": "Адрес"}).data
    client.post(reverse("order-pay", args=[order["id"]]))
    return order


def test_seller_sees_own_sales():
    seller = SellerFactory()
    product = ProductFactory(seller=seller, stock=10)
    _place_paid_order(product)

    client = APIClient()
    client.force_authenticate(user=seller)
    response = client.get(reverse("seller-order-item-list"))

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data["results"]) == 1


def test_seller_can_update_status_after_payment():
    seller = SellerFactory()
    product = ProductFactory(seller=seller, stock=10)
    _place_paid_order(product)

    client = APIClient()
    client.force_authenticate(user=seller)
    item_id = client.get(reverse("seller-order-item-list")).data["results"][0]["id"]

    response = client.patch(
        reverse("seller-order-item-detail", args=[item_id]), {"status": "shipped"}
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.data["status"] == "shipped"


def test_seller_cannot_see_other_sellers_items():
    seller_a = SellerFactory()
    seller_b = SellerFactory()
    product = ProductFactory(seller=seller_a, stock=10)
    _place_paid_order(product)

    client = APIClient()
    client.force_authenticate(user=seller_b)
    response = client.get(reverse("seller-order-item-list"))

    assert len(response.data["results"]) == 0
