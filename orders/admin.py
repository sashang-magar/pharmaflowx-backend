from django.contrib import admin
from .models import Order, OrderItem, Review


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['batch', 'unit_price', 'total_price']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'pharmacy', 'distributor', 'status',
        'payment_method', 'payment_status',
        'ordered_at', 'delivered_at'
    ]
    list_filter = ['status', 'payment_method', 'payment_status']
    search_fields = [
        'pharmacy__user__organization',
        'distributor__user__organization'
    ]
    readonly_fields = ['ordered_at', 'delivered_at', 'created_at', 'updated_at']
    inlines = [OrderItemInline]
    ordering = ['-created_at']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['order', 'reviewer', 'rating', 'created_at']
    list_filter = ['rating']
    search_fields = ['reviewer__user__organization']
    readonly_fields = ['created_at']