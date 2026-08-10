# Pale & Pink — маркетплейс одежды

![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.0-092E20?logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/DRF-3.15-red)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)

Мини-маркетплейс одежды (аналог Wildberries в миниатюре): несколько независимых продавцов, каталог с фильтрами, корзина, оформление заказа с имитацией оплаты, отзывы, избранное и личный кабинет продавца. Светлый розовый интерфейс.

## Роли

- **Покупатель** — просматривает каталог, добавляет в корзину/избранное, оформляет заказы, оставляет отзывы.
- **Продавец** — управляет своими товарами (CRUD) и отслеживает продажи, меняя статус доставки.

## Стек

**Backend:** Python 3.12, Django 5, Django REST Framework, JWT-авторизация (`djangorestframework-simplejwt`), PostgreSQL, `django-filter`, `drf-spectacular` (Swagger), pytest.

**Frontend:** React 18, React Router, Axios, чистый CSS с дизайн-токенами (светло-розовая палитра).

**Инфраструктура:** Docker + docker-compose (backend, frontend/nginx, PostgreSQL), CI на GitHub Actions.

## Возможности

- Регистрация с выбором роли (покупатель/продавец), JWT-логин
- Каталог с фильтрами по категории, размеру, цене, поиском и сортировкой
- Карточка товара: фото, рейтинг, отзывы, добавление в корзину и избранное
- Корзина с изменением количества, оформление заказа с адресом доставки
- Имитация оплаты — заказ переходит из статуса «Оформлен» в «Оплачен»
- Личный кабинет продавца: CRUD своих товаров, список продаж с обновлением статуса (в обработке → отправлен → доставлен)
- Отзывы и рейтинг товара (один отзыв на пользователя), избранное (вишлист)
- Приватность: продавец видит и редактирует только свои товары и свои продажи

## Запуск через Docker

```bash
git clone <repo-url>
cd marketplace
docker compose up --build
```

- Фронтенд: `http://localhost:5174`
- API: `http://localhost:8001`, документация — `http://localhost:8001/docs/`

## Локальный запуск без Docker

**Backend:**

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py seed_demo_data   # наполняет каталог демо-товарами и продавцами
python manage.py runserver 8001
```

Демо-аккаунты после сидинга (пароль `DemoPass123`): продавцы `cozy_studio`, `urban_thread`, `pale_pink`, покупатель `demo_buyer`.

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

## Тесты

```bash
cd backend
pytest
```

## Структура проекта

```
marketplace/
├── backend/
│   ├── config/         # settings, urls
│   ├── users/           # кастомная модель User с ролью buyer/seller
│   ├── catalog/         # товары, отзывы, избранное
│   │   └── management/commands/seed_demo_data.py
│   ├── orders/          # корзина, заказы, продажи продавца
│   └── */tests/
├── frontend/
│   └── src/
│       ├── pages/       # Catalog, ProductDetail, Cart, Checkout, Orders,
│       │                # Wishlist, SellerDashboard, SellerProductForm, SellerSales
│       └── components/
└── docker-compose.yml
```
