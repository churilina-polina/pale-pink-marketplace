import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()

pytestmark = pytest.mark.django_db


def test_register_buyer():
    client = APIClient()
    response = client.post(
        reverse("register"),
        {
            "username": "buyer1",
            "email": "buyer1@example.com",
            "password": "StrongPass123",
            "role": "buyer",
        },
    )
    assert response.status_code == status.HTTP_201_CREATED
    assert User.objects.get(username="buyer1").role == "buyer"


def test_register_seller_requires_shop_name():
    client = APIClient()
    response = client.post(
        reverse("register"),
        {
            "username": "seller1",
            "email": "seller1@example.com",
            "password": "StrongPass123",
            "role": "seller",
        },
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_register_seller_with_shop_name():
    client = APIClient()
    response = client.post(
        reverse("register"),
        {
            "username": "seller1",
            "email": "seller1@example.com",
            "password": "StrongPass123",
            "role": "seller",
            "shop_name": "Polina's Closet",
        },
    )
    assert response.status_code == status.HTTP_201_CREATED


def test_login_and_me():
    User.objects.create_user(username="buyer1", password="StrongPass123")
    client = APIClient()
    login = client.post(
        reverse("token_obtain_pair"), {"username": "buyer1", "password": "StrongPass123"}
    )
    token = login.data["access"]

    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    response = client.get(reverse("me"))
    assert response.status_code == status.HTTP_200_OK
    assert response.data["username"] == "buyer1"
