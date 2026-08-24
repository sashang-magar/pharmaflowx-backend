from django.core.management.base import BaseCommand
from django.db import transaction
from accounts.models import (User, ManufacturerProfile, LabProfile,
                              DistributorProfile, PharmacyProfile, RegulatorProfile)
from medicines.models import Medicine, Batch
from labs.models import LabReport
from approvals.models import Approval
from inventory.models import Inventory
from orders.models import Order, OrderItem
from django.utils import timezone
from datetime import date, timedelta
import random


class Command(BaseCommand):
    help = 'Seeds demo data for PharmaFlowX'

    @transaction.atomic
    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding demo data...')

        # ── Users & Profiles ──────────────────────────────────
        def make_user(username, role, org):
            if User.objects.filter(username=username).exists():
                self.stdout.write(f'  Skipping {username} — already exists')
                return User.objects.get(username=username)
            user = User.objects.create_user(
                username=username,
                password='demo1234',
                email=f'{username}@pharmaflowx.com',
                phone=f'98{random.randint(10000000, 99999999)}',
                organization=org,
                role=role,
                address='Kathmandu, Nepal'
            )
            self.stdout.write(f'  Created user: {username}')
            return user

        mfg1 = make_user('nepal_pharma', 'MANUFACTURER', 'Nepal Pharma Ltd')
        mfg2 = make_user('himalaya_meds', 'MANUFACTURER', 'Himalaya Meds Pvt Ltd')
        lab1 = make_user('kathmandu_lab', 'LAB', 'Kathmandu Quality Lab')
        lab2 = make_user('patan_lab', 'LAB', 'Patan Testing Lab')
        reg1 = make_user('drug_regulator', 'REGULATOR', 'Department of Drug Administration')
        dist1 = make_user('valley_dist', 'DISTRIBUTOR', 'Valley Distributors')
        dist2 = make_user('pokhara_dist', 'DISTRIBUTOR', 'Pokhara Medical Supplies')
        pharma1 = make_user('sunrise_pharmacy', 'PHARMACY', 'Sunrise Pharmacy')
        pharma2 = make_user('green_pharmacy', 'PHARMACY', 'Green Cross Pharmacy')
        pharma3 = make_user('city_pharmacy', 'PHARMACY', 'City Care Pharmacy')

        # profiles auto-created by signal
        # update manufacturer profiles
        mfg1.manufacturer_profile.company_name = 'Nepal Pharma Ltd'
        mfg1.manufacturer_profile.license_number = 'MFG-NEP-2024-001'
        mfg1.manufacturer_profile.license_expiry_date = date(2027, 12, 31)
        mfg1.manufacturer_profile.save()

        mfg2.manufacturer_profile.company_name = 'Himalaya Meds Pvt Ltd'
        mfg2.manufacturer_profile.license_number = 'MFG-NEP-2024-002'
        mfg2.manufacturer_profile.license_expiry_date = date(2026, 6, 30)
        mfg2.manufacturer_profile.save()

        # lab profiles
        lab1.lab_profile.accreditation_number = 'LAB-ACC-2024-001'
        lab1.lab_profile.accreditation_expiry_date = date(2027, 3, 31)
        lab1.lab_profile.lab_type = 'PRIVATE'
        lab1.lab_profile.save()

        lab2.lab_profile.accreditation_number = 'LAB-ACC-2024-002'
        lab2.lab_profile.accreditation_expiry_date = date(2026, 9, 30)
        lab2.lab_profile.lab_type = 'GOVERNMENT'
        lab2.lab_profile.save()

        # distributor profiles
        dist1.distributor_profile.license_number = 'DIST-2024-001'
        dist1.distributor_profile.license_expiry_date = date(2027, 1, 31)
        dist1.distributor_profile.save()

        dist2.distributor_profile.license_number = 'DIST-2024-002'
        dist2.distributor_profile.license_expiry_date = date(2026, 8, 31)
        dist2.distributor_profile.save()

        # pharmacy profiles
        pharma1.pharmacy_profile.license_number = 'PHARM-2024-001'
        pharma1.pharmacy_profile.license_expiry_date = date(2027, 5, 31)
        pharma1.pharmacy_profile.pharmacy_type = 'RETAIL'
        pharma1.pharmacy_profile.save()

        # ── Medicines ─────────────────────────────────────────
        def make_medicine(manufacturer_profile, brand, generic, composition, strength, dosage, unit):
            m, created = Medicine.objects.get_or_create(
                brand_name=brand,
                defaults=dict(
                    manufacturer=manufacturer_profile,
                    generic_name=generic,
                    composition=composition,
                    strength=strength,
                    dosage_form=dosage,
                    unit_type=unit,
                )
            )
            if created:
                self.stdout.write(f'  Created medicine: {brand}')
            return m

        paracetamol = make_medicine(mfg1.manufacturer_profile,
            'Paracetamol 500', 'Paracetamol',
            'Paracetamol 500mg', '500mg', 'TABLET', 'STRIP')
        amoxicillin = make_medicine(mfg1.manufacturer_profile,
            'Amoxil 250', 'Amoxicillin',
            'Amoxicillin Trihydrate 250mg', '250mg', 'CAPSULE', 'STRIP')
        ibuprofen = make_medicine(mfg2.manufacturer_profile,
            'Ibufen 400', 'Ibuprofen',
            'Ibuprofen 400mg', '400mg', 'TABLET', 'STRIP')
        cough_syrup = make_medicine(mfg2.manufacturer_profile,
            'CoughClear 100ml', 'Dextromethorphan',
            'Dextromethorphan HBr 15mg/5ml', '15mg/5ml', 'SYRUP', 'BOTTLE')
        metformin = make_medicine(mfg1.manufacturer_profile,
            'Metfor 500', 'Metformin',
            'Metformin HCl 500mg', '500mg', 'TABLET', 'STRIP')

        # ── Batches ───────────────────────────────────────────
        def make_batch(medicine, manufacturer_profile, number, mfg_date, exp_date, qty, mrp, status):
            b, created = Batch.objects.get_or_create(
                batch_number=number,
                defaults=dict(
                    medicine=medicine,
                    manufacturer=manufacturer_profile,
                    manufacture_date=mfg_date,
                    expiry_date=exp_date,
                    initial_quantity=qty,
                    current_quantity=qty,
                    mrp=mrp,
                    status=status,
                )
            )
            if created:
                self.stdout.write(f'  Created batch: {number} [{status}]')
            return b

        today = date.today()

        # APPROVED batches — ready for inventory
        b1 = make_batch(paracetamol, mfg1.manufacturer_profile,
            'PCM-2026-001', date(2026, 1, 1), date(2028, 1, 1), 10000, 2.50, 'APPROVED')
        b2 = make_batch(amoxicillin, mfg1.manufacturer_profile,
            'AMX-2026-001', date(2026, 2, 1), date(2027, 2, 1), 5000, 8.00, 'APPROVED')
        b3 = make_batch(ibuprofen, mfg2.manufacturer_profile,
            'IBU-2026-001', date(2026, 1, 15), date(2027, 6, 15), 8000, 4.50, 'APPROVED')

        # LAB_TESTING batch — pending lab report
        b4 = make_batch(cough_syrup, mfg2.manufacturer_profile,
            'CGH-2026-001', date(2026, 3, 1), date(2028, 3, 1), 3000, 120.00, 'LAB_TESTING')

        # IN_PRODUCTION batch — just created
        b5 = make_batch(metformin, mfg1.manufacturer_profile,
            'MET-2026-001', date(2026, 4, 1), date(2028, 4, 1), 12000, 3.00, 'IN_PRODUCTION')

        # expiring soon batch (within 30 days) — for expiring soon alert
        b6 = make_batch(paracetamol, mfg1.manufacturer_profile,
            'PCM-2025-OLD', date(2025, 1, 1), today + timedelta(days=15), 2000, 2.50, 'APPROVED')

        # ── Lab Reports ───────────────────────────────────────
        lr1, created = LabReport.objects.get_or_create(
            batch=b1, lab=lab1.lab_profile,
            defaults=dict(
                result='PASS', remark='All parameters within acceptable limits.',
                tested_at=timezone.now() - timedelta(days=30),
                report_status='REVIEWED',
            )
        )
        if created:
            self.stdout.write('  Created lab report for PCM-2026-001')

        lr2, created = LabReport.objects.get_or_create(
            batch=b3, lab=lab2.lab_profile,
            defaults=dict(
                result='PASS', remark='Meets all pharmacopoeia standards.',
                tested_at=timezone.now() - timedelta(days=20),
                report_status='REVIEWED',
            )
        )
        if created:
            self.stdout.write('  Created lab report for IBU-2026-001')

        # submitted report waiting for regulator
        lr3, created = LabReport.objects.get_or_create(
            batch=b2, lab=lab1.lab_profile,
            defaults=dict(
                result='PASS', remark='Quality checks passed.',
                tested_at=timezone.now() - timedelta(days=5),
                report_status='SUBMITTED',
            )
        )
        if created:
            self.stdout.write('  Created pending lab report for AMX-2026-001')

        # ── Approvals ─────────────────────────────────────────
        ap1, created = Approval.objects.get_or_create(
            lab_report=lr1,
            defaults=dict(
                regulator=reg1.regulator_profile,
                status='APPROVED',
                remarks='Approved for distribution.',
                approved_at=timezone.now() - timedelta(days=25),
            )
        )
        if created:
            self.stdout.write('  Created approval for PCM-2026-001')

        ap2, created = Approval.objects.get_or_create(
            lab_report=lr2,
            defaults=dict(
                regulator=reg1.regulator_profile,
                status='APPROVED',
                remarks='Approved.',
                approved_at=timezone.now() - timedelta(days=15),
            )
        )
        if created:
            self.stdout.write('  Created approval for IBU-2026-001')

        # ── Inventory ─────────────────────────────────────────
        def make_inventory(distributor_profile, batch, qty, location, threshold=100):
            inv, created = Inventory.objects.get_or_create(
                distributor=distributor_profile,
                batch=batch,
                defaults=dict(
                    quantity=qty,
                    reserved_quantity=0,
                    location=location,
                    reorder_threshold=threshold,
                )
            )
            if created:
                self.stdout.write(f'  Created inventory: {batch.batch_number} @ {location}')
            return inv

        inv1 = make_inventory(dist1.distributor_profile, b1, 5000, 'Warehouse A, Kathmandu', 300)
        inv2 = make_inventory(dist1.distributor_profile, b3, 3000, 'Warehouse A, Kathmandu', 200)
        inv3 = make_inventory(dist2.distributor_profile, b1, 2000, 'Store 1, Pokhara', 500)
        # low stock item — qty below threshold
        inv4 = make_inventory(dist1.distributor_profile, b6, 50, 'Warehouse B, Kathmandu', 200)

        # ── Orders ────────────────────────────────────────────
        if not Order.objects.filter(pharmacy=pharma1.pharmacy_profile).exists():
            order1 = Order.objects.create(
                pharmacy=pharma1.pharmacy_profile,
                distributor=dist1.distributor_profile,
                status='DELIVERED',
                payment_method='ONLINE',
                payment_status='PAID',
                ordered_at=timezone.now() - timedelta(days=10),
                delivered_at=timezone.now() - timedelta(days=7),
            )
            OrderItem.objects.create(
                order=order1, inventory=inv1, batch=b1,
                quantity=200, unit_price=2.50, total_price=500.00
            )
            self.stdout.write('  Created delivered order for Sunrise Pharmacy')

        if not Order.objects.filter(pharmacy=pharma2.pharmacy_profile).exists():
            order2 = Order.objects.create(
                pharmacy=pharma2.pharmacy_profile,
                distributor=dist1.distributor_profile,
                status='CONFIRMED',
                payment_method='CASH',
                payment_status='PENDING',
                ordered_at=timezone.now() - timedelta(days=2),
            )
            OrderItem.objects.create(
                order=order2, inventory=inv2, batch=b3,
                quantity=100, unit_price=4.50, total_price=450.00
            )
            self.stdout.write('  Created confirmed order for Green Cross Pharmacy')

        if not Order.objects.filter(pharmacy=pharma3.pharmacy_profile).exists():
            order3 = Order.objects.create(
                pharmacy=pharma3.pharmacy_profile,
                distributor=dist2.distributor_profile,
                status='PENDING',
                payment_method='CASH',
                payment_status='PENDING',
                ordered_at=timezone.now() - timedelta(days=1),
            )
            OrderItem.objects.create(
                order=order3, inventory=inv3, batch=b1,
                quantity=500, unit_price=2.50, total_price=1250.00
            )
            self.stdout.write('  Created pending order for City Care Pharmacy')

        self.stdout.write(self.style.SUCCESS('\n✅ Demo data seeded successfully!'))
        self.stdout.write('\nDemo credentials (password: demo1234):')
        self.stdout.write('  Manufacturer: nepal_pharma / himalaya_meds')
        self.stdout.write('  Lab:          kathmandu_lab / patan_lab')
        self.stdout.write('  Regulator:    drug_regulator')
        self.stdout.write('  Distributor:  valley_dist / pokhara_dist')
        self.stdout.write('  Pharmacy:     sunrise_pharmacy / green_pharmacy / city_pharmacy')