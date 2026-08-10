from decimal import Decimal

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


def test_add_item_to_cart(buyer_client):
    client, _ = buyer_client
    product = ProductFactory(price="1500.00", stock=10)

    response = client.post(reverse("cart-item-list"), {"product_id": product.id, "quantity": 2})
    assert response.status_code == status.HTTP_201_CREATED

    cart = client.get(reverse("cart")).data
    assert cart["total_price"] == Decimal("3000.00")
    assert len(cart["items"]) == 1


def test_adding_same_product_twice_increments_quantity(buyer_client):
    client, _ = buyer_client
    product = ProductFactory(stock=10)

    client.post(reverse("cart-item-list"), {"product_id": product.id, "quantity": 1})
    client.post(reverse("cart-item-list"), {"product_id": product.id, "quantity": 2})

    cart = client.get(reverse("cart")).data
    assert len(cart["items"]) == 1
    assert cart["items"][0]["quantity"] == 3


def test_remove_cart_item(buyer_client):
    client, _ = buyer_client
    product = ProductFactory(stock=10)
    add = client.post(reverse("cart-item-list"), {"product_id": product.id, "quantity": 1})
    item_id = add.data["id"]

    response = client.delete(reverse("cart-item-detail", args=[item_id]))
    assert response.status_code == status.HTTP_204_NO_CONTENT

    cart = client.get(reverse("cart")).data
    assert len(cart["items"]) == 0
