import factory
from django.contrib.auth import get_user_model

from catalog.models import Product

User = get_user_model()


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    username = factory.Sequence(lambda n: f"user{n}")
    email = factory.Sequence(lambda n: f"user{n}@example.com")
    role = User.Role.BUYER

    @factory.post_generation
    def password(self, create, extracted, **kwargs):
        self.set_password(extracted or "StrongPass123")
        if create:
            self.save()


class SellerFactory(UserFactory):
    role = User.Role.SELLER
    shop_name = factory.Sequence(lambda n: f"Shop {n}")


class ProductFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Product

    seller = factory.SubFactory(SellerFactory)
    title = factory.Sequence(lambda n: f"Товар {n}")
    category = Product.Category.TOPS
    size = Product.Size.M
    price = "1999.00"
    stock = 10
