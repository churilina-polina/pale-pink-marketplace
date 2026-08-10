import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from catalog.tests.factories import ProductFactory, UserFactory

pytestmark = pytest.mark.django_db


def test_anyone_can_read_reviews():
    product = ProductFactory()
    client = APIClient()
    response = client.get(reverse("product-reviews", args=[product.id]))
    assert response.status_code == status.HTTP_200_OK


def test_authenticated_user_can_leave_review():
    product = ProductFactory()
    buyer = UserFactory()
    client = APIClient()
    client.force_authenticate(user=buyer)

    response = client.post(
        reverse("product-reviews", args=[product.id]), {"rating": 5, "text": "Отлично!"}
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert product.reviews.count() == 1


def test_user_cannot_review_same_product_twice():
    product = ProductFactory()
    buyer = UserFactory()
    client = APIClient()
    client.force_authenticate(user=buyer)

    client.post(reverse("product-reviews", args=[product.id]), {"rating": 4, "text": "Хорошо"})
    response = client.post(
        reverse("product-reviews", args=[product.id]), {"rating": 2, "text": "Передумал"}
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_anonymous_cannot_leave_review():
    product = ProductFactory()
    client = APIClient()
    response = client.post(reverse("product-reviews", args=[product.id]), {"rating": 5})
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
