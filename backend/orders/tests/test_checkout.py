import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from catalog.tests.factories import ProductFactory, UserFactory

pytestmark = pytest.mark.django_db


@pytest.fixture
def buyer_client():
    buyer = UserFactory()
    client = APIClient()
    client.force_authenticate(user=buyer)
    return client, buyer


def test_checkout_creates_order_and_clears_cart(buyer_client):
    client, buyer = buyer_client
    product = ProductFactory(price="1000.00", stock=5)
    client.post(reverse("cart-item-list"), {"product_id": product.id, "quantity": 2})

    response = client.post(reverse("checkout"), {"shipping_address": "СПб, ул. Пушкина, 1"})

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["status"] == "created"
    assert response.data["total_price"] == "2000.00"

    product.refresh_from_db()
    assert product.stock == 3

    cart = client.get(reverse("cart")).data
    assert len(cart["items"]) == 0


def test_checkout_fails_on_empty_cart(buyer_client):
    client, _ = buyer_client
    response = client.post(reverse("checkout"), {"shipping_address": "Адрес"})
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_checkout_fails_when_not_enough_stock(buyer_client):
    client, _ = buyer_client
    product = ProductFactory(stock=1)
    client.post(reverse("cart-item-list"), {"product_id": product.id, "quantity": 5})

    response = client.post(reverse("checkout"), {"shipping_address": "Адрес"})
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_pay_order_changes_status(buyer_client):
    client, _ = buyer_client
    product = ProductFactory(stock=5)
    client.post(reverse("cart-item-list"), {"product_id": product.id, "quantity": 1})
    order = client.post(reverse("checkout"), {"shipping_address": "Адрес"}).data

    response = client.post(reverse("order-pay", args=[order["id"]]))
    assert response.status_code == status.HTTP_200_OK
    assert response.data["status"] == "paid"


def test_cannot_pay_order_twice(buyer_client):
    client, _ = buyer_client
    product = ProductFactory(stock=5)
    client.post(reverse("cart-item-list"), {"product_id": product.id, "quantity": 1})
    order = client.post(reverse("checkout"), {"shipping_address": "Адрес"}).data

    client.post(reverse("order-pay", args=[order["id"]]))
    response = client.post(reverse("order-pay", args=[order["id"]]))
    assert response.status_code == status.HTTP_400_BAD_REQUEST
