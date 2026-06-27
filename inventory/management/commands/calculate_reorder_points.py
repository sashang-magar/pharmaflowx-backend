from django.core.management.base import BaseCommand
from inventory.models import Inventory
from inventory.services import calculate_reorder_point


class Command(BaseCommand):
    help = 'Recalculates reorder threshold for all inventory items'

    def handle(self, *args, **kwargs):
        inventories = Inventory.objects.select_related(
            'batch__medicine', 'distributor'
        )
        updated = 0

        for inventory in inventories:
            threshold = calculate_reorder_point(inventory)
            inventory.reorder_threshold = threshold
            inventory.save(update_fields=['reorder_threshold'])
            updated += 1
            self.stdout.write(
                f"  {inventory.batch.medicine.brand_name} "
                f"| Distributor: {inventory.distributor.user.organization} "
                f"| New threshold: {threshold}"
            )

        self.stdout.write(
            self.style.SUCCESS(f'\nDone. Updated {updated} inventory items.')
        )