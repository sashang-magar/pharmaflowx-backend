from django.utils import timezone
from rest_framework.exceptions import ValidationError
from .models import Order, OrderItem


def place_order(pharmacy_profile, distributor_profile, items_data, payment_method):
    """
    items_data = [
        {
            'inventory': <Inventory instance>,
            'quantity': int,
            'unit_price': Decimal
        }
    ]
    Step 1 — validate all items first, touch nothing
    Step 2 — create order
    Step 3 — create items + increase reserved_quantity
    """

    # Step 1 — validate everything before touching DB
    for item in items_data:
        inventory = item['inventory']
        requested = item['quantity']
        available = inventory.quantity - inventory.reserved_quantity

        if inventory.distributor != distributor_profile:
            raise ValidationError(
                f"Inventory {inventory.id} does not belong to this distributor."
            )
        if requested <= 0:
            raise ValidationError("Quantity must be greater than zero.")

        if requested > available:
            raise ValidationError(
                f"Not enough stock for {inventory.batch.medicine.brand_name} "
                f"(Batch: {inventory.batch.batch_number}). "
                f"Available: {available}, Requested: {requested}."
            )

    # Step 2 — create order
    order = Order.objects.create(
        pharmacy=pharmacy_profile,
        distributor=distributor_profile,
        payment_method=payment_method,
        status=Order.STATUS.PENDING,
        payment_status=Order.PAYMENT_STATUS.PENDING
    )

    # Step 3 — create items + reserve stock
    for item in items_data:
        inventory = item['inventory']
        qty = item['quantity']
        unit_price = item['unit_price']

        OrderItem.objects.create(
            order=order,
            inventory=inventory,
            batch=inventory.batch,           # explicit batch FK
            quantity=qty,
            unit_price=unit_price,
            total_price=qty * unit_price     # stored total
        )
        # increase reserved — stock held but not yet deducted
        inventory.reserved_quantity += qty
        inventory.save(update_fields=['reserved_quantity', 'last_updated'])

    return order


def deliver_order(order):
    """
    Marks order DELIVERED.
    Deducts quantity + releases reserved per item.
    """
    if order.status == Order.STATUS.DELIVERED:
        raise ValidationError("Order is already delivered.")

    if order.status == Order.STATUS.CANCELLED:
        raise ValidationError("Cannot deliver a cancelled order.")

    for item in order.items.select_related('inventory'):
        inventory = item.inventory
        inventory.quantity -= item.quantity
        inventory.reserved_quantity -= item.quantity
        inventory.save(update_fields=['quantity', 'reserved_quantity', 'last_updated'])

    order.status = Order.STATUS.DELIVERED
    order.delivered_at = timezone.now()
    order.save(update_fields=['status', 'delivered_at', 'updated_at'])
    return order


def cancel_order(order):
    """
    Cancels PENDING or CONFIRMED order.
    Releases reserved_quantity back.
    """
    if order.status not in [Order.STATUS.PENDING, Order.STATUS.CONFIRMED]:
        raise ValidationError(
            f"Cannot cancel order with status '{order.status}'. "
            "Only PENDING or CONFIRMED orders can be cancelled."
        )

    for item in order.items.select_related('inventory'):
        inventory = item.inventory
        inventory.reserved_quantity -= item.quantity
        inventory.save(update_fields=['reserved_quantity', 'last_updated'])

    order.status = Order.STATUS.CANCELLED
    order.save(update_fields=['status', 'updated_at'])
    return order