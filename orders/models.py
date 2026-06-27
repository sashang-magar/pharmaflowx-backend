from django.db import models
from accounts.models import PharmacyProfile, DistributorProfile
from medicines.models import Batch
from inventory.models import Inventory


class Order(models.Model):
    class STATUS(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        SHIPPED = 'SHIPPED', 'Shipped'
        DELIVERED = 'DELIVERED', 'Delivered'
        CANCELLED = 'CANCELLED', 'Cancelled'

    class PAYMENT_METHOD(models.TextChoices):
        ONLINE = 'ONLINE', 'Online'
        CASH = 'CASH', 'Cash on Delivery'

    class PAYMENT_STATUS(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        PAID = 'PAID', 'Paid'
        FAILED = 'FAILED', 'Failed'

    pharmacy = models.ForeignKey(
        PharmacyProfile,
        on_delete=models.CASCADE,
        related_name='orders'
    )
    distributor = models.ForeignKey(
        DistributorProfile,
        on_delete=models.CASCADE,
        related_name='orders'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS.choices,
        default=STATUS.PENDING
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD.choices,
        default=PAYMENT_METHOD.CASH
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS.choices,
        default=PAYMENT_STATUS.PENDING
    )
    ordered_at = models.DateTimeField(auto_now_add=True)
    delivered_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} — {self.pharmacy.user.organization} → {self.status}"

    class Meta:
        ordering = ['-created_at']


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items'
    )
    inventory = models.ForeignKey(
        Inventory,
        on_delete=models.CASCADE,
        related_name='order_items'
    )
    batch = models.ForeignKey(         
        Batch,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='order_items'
    )
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2,null=True, blank=True)  

    def __str__(self):
        return f"{self.batch.batch_number} x {self.quantity} = {self.total_price}"

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['order', 'inventory'],
                name='unique_order_inventory'
            )
        ]


class Review(models.Model):
    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name='review'
    )
    reviewer = models.ForeignKey(
        PharmacyProfile,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    rating = models.DecimalField(max_digits=3, decimal_places=1)
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review Order#{self.order.id} — {self.rating}/5"