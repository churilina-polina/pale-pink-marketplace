from django.contrib import admin

from .models import Product, Review, WishlistItem


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("title", "seller", "category", "size", "price", "stock", "is_active")
    list_filter = ("category", "size", "is_active")
    search_fields = ("title", "description")


admin.site.register(Review)
admin.site.register(WishlistItem)
