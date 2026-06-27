from django.utils import timezone
from datetime import timedelta
from .models import Inventory


def calculate_reorder_point(inventory):
    """
    Formula: (avg_daily_consumption × lead_time_days) + safety_stock

    avg_daily_consumption = total units ordered for this medicine
                            in last 30 days / 30
    lead_time_days = 7  (days to receive new stock from manufacturer)
    safety_stock   = 50 (buffer stock — adjustable)
    """
    lead_time_days = 7
    safety_stock = 50
    days = 30

    # look back 30 days
    since = timezone.now() - timedelta(days=days)

    # sum all ordered quantities for this batch's medicine
    # going through OrderItem → inventory → batch → medicine
    from orders.models import OrderItem
    total_ordered = OrderItem.objects.filter(
        inventory__batch__medicine=inventory.batch.medicine,
        inventory__distributor=inventory.distributor,
        order__ordered_at__gte=since,
    ).aggregate(
        total=__import__('django.db.models', fromlist=['Sum']).Sum('quantity')
    )['total'] or 0

    avg_daily = total_ordered / days
    reorder_point = (avg_daily * lead_time_days) + safety_stock

    return round(reorder_point)