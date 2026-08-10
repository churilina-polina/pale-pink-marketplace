from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        BUYER = "buyer", "Покупатель"
        SELLER = "seller", "Продавец"

    role = models.CharField(max_length=10, choices=Role.choices, default=Role.BUYER)
    shop_name = models.CharField(max_length=255, blank=True)

    @property
    def is_seller(self):
        return self.role == self.Role.SELLER
