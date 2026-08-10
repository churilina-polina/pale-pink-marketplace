from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from catalog.models import Product, Review

User = get_user_model()

SELLERS = [
    {"username": "cozy_studio", "shop_name": "Cozy Studio"},
    {"username": "urban_thread", "shop_name": "Urban Thread"},
    {"username": "pale_pink", "shop_name": "Pale & Pink"},
]

# (название, категория, размер, цвет, цена)
PRODUCTS = [
    ("Оверсайз худи", "outerwear", "L", "серый", "3490.00"),
    ("Базовая футболка", "tops", "M", "белый", "990.00"),
    ("Джинсы прямого кроя", "bottoms", "M", "синий", "2990.00"),
    ("Летнее платье", "dresses", "S", "розовый", "3290.00"),
    ("Кроссовки белые", "shoes", "ONE", "белый", "4990.00"),
    ("Кожаная куртка", "outerwear", "M", "чёрный", "8990.00"),
    ("Вязаный свитер", "tops", "L", "бежевый", "2490.00"),
    ("Юбка миди", "bottoms", "S", "чёрный", "1990.00"),
    ("Сарафан льняной", "dresses", "M", "бежевый", "2790.00"),
    ("Сандалии кожаные", "shoes", "ONE", "коричневый", "3490.00"),
    ("Шёлковый шарф", "accessories", "ONE", "розовый", "1290.00"),
    ("Кожаный ремень", "accessories", "ONE", "чёрный", "1490.00"),
]


class Command(BaseCommand):
    help = "Наполняет базу демо-продавцами, товарами и отзывами для демонстрации маркетплейса"

    def handle(self, *args, **options):
        sellers = []
        for data in SELLERS:
            user, created = User.objects.get_or_create(
                username=data["username"],
                defaults={
                    "email": f"{data['username']}@example.com",
                    "role": User.Role.SELLER,
                    "shop_name": data["shop_name"],
                },
            )
            if created:
                user.set_password("DemoPass123")
                user.save()
            sellers.append(user)

        buyer, created = User.objects.get_or_create(
            username="demo_buyer",
            defaults={"email": "demo_buyer@example.com", "role": User.Role.BUYER},
        )
        if created:
            buyer.set_password("DemoPass123")
            buyer.save()

        created_count = 0
        for i, (title, category, size, color, price) in enumerate(PRODUCTS):
            seller = sellers[i % len(sellers)]
            product, created = Product.objects.update_or_create(
                title=title,
                seller=seller,
                defaults={
                    "description": f"{title} от {seller.shop_name}. Качественные материалы, аккуратный пошив.",
                    "category": category,
                    "size": size,
                    "color": color,
                    "price": price,
                    "stock": 15,
                    "image_url": "",
                },
            )
            if created:
                created_count += 1
                Review.objects.get_or_create(
                    product=product,
                    user=buyer,
                    defaults={"rating": 5, "text": "Отличное качество, рекомендую!"},
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Готово: {len(sellers)} продавцов, {created_count} новых товаров (всего {len(PRODUCTS)}). "
                f"Демо-аккаунты: продавцы ({', '.join(s.username for s in sellers)}) и demo_buyer, пароль DemoPass123"
            )
        )
