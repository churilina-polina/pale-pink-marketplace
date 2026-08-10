import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from catalog.tests.factories import ProductFactory, UserFactory

pytestmark = pytest.mark.django_db


def test_add_and_list_wishlist():
    product = ProductFactory()
    buyer = UserFactory()
    client = APIClient()
    client.force_authenticate(user=buyer)

    response = client.post(reverse("wishlist-list"), {"product_id": product.id})
    assert response.status_code == status.HTTP_201_CREATED

    response = client.get(reverse("wishlist-list"))
    assert len(response.data["results"]) == 1


def test_remove_from_wishlist_by_product():
    product = ProductFactory()
    buyer = UserFactory()
    client = APIClient()
    client.force_authenticate(user=buyer)
    client.post(reverse("wishlist-list"), {"product_id": product.id})

    response = client.delete(reverse("wishlist-remove-by-product", args=[product.id]))
    assert response.status_code == status.HTTP_204_NO_CONTENT

    response = client.get(reverse("wishlist-list"))
    assert len(response.data["results"]) == 0
