import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from catalog.models import Product
from catalog.tests.factories import ProductFactory, SellerFactory, UserFactory

pytestmark = pytest.mark.django_db


def test_public_catalog_shows_only_active_products():
    ProductFactory(title="Активный", is_active=True)
    ProductFactory(title="Скрытый", is_active=False)

    client = APIClient()
    response = client.get(reverse("product-list"))

    assert response.status_code == status.HTTP_200_OK
    titles = [p["title"] for p in response.data["results"]]
    assert titles == ["Активный"]


def test_catalog_filter_by_category_and_price():
    ProductFactory(category=Product.Category.TOPS, price="1000.00")
    ProductFactory(category=Product.Category.SHOES, price="5000.00")

    client = APIClient()
    response = client.get(reverse("product-list"), {"category": "tops", "max_price": "2000"})

    assert len(response.data["results"]) == 1
    assert response.data["results"][0]["category"] == "tops"


def test_seller_can_create_product():
    seller = SellerFactory()
    client = APIClient()
    client.force_authenticate(user=seller)

    response = client.post(
        reverse("seller-product-list"),
        {
            "title": "Худи оверсайз",
            "category": "outerwear",
            "size": "L",
            "color": "чёрный",
            "price": "3500.00",
            "stock": 5,
        },
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert Product.objects.get().seller == seller


def test_buyer_cannot_create_product():
    buyer = UserFactory()
    client = APIClient()
    client.force_authenticate(user=buyer)

    response = client.post(
        reverse("seller-product-list"),
        {"title": "Товар", "category": "tops", "price": "100.00"},
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_seller_cannot_edit_foreign_product():
    other_product = ProductFactory()
    seller = SellerFactory()
    client = APIClient()
    client.force_authenticate(user=seller)

    response = client.patch(
        reverse("seller-product-detail", args=[other_product.id]), {"title": "Взлом"}
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND
