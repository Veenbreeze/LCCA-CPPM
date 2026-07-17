from datetime import date

from django.core.management.base import BaseCommand
from django.db import transaction

from assets.models import Asset
from conditions.models import Condition
from projects.models import Project
from risk.models import Risk
from scenarios.models import Scenario


ASSETS = [
    dict(
        name="Boiler A-12",
        asset_type="Mechanical",
        location="Building B, Floor 3",
        installation_date=date(2015, 1, 15),
        condition_rating="3.5",
        remaining_useful_life=5,
        status="Operational",
        lifecycle_stage="renewal",
        criticality="3.0",
    ),
    dict(
        name="Electrical Panel 02",
        asset_type="Electrical",
        location="Building A, Basement",
        installation_date=date(2010, 6, 20),
        condition_rating="2.0",
        remaining_useful_life=2,
        status="Maintenance",
        lifecycle_stage="replacement",
        criticality="4.5",
    ),
    dict(
        name="HVAC Rooftop Unit 1",
        asset_type="Mechanical",
        location="Building C, Rooftop",
        installation_date=date(2018, 3, 10),
        condition_rating="4.0",
        remaining_useful_life=7,
        status="Operational",
        lifecycle_stage="renewal",
        criticality="2.5",
    ),
    dict(
        name="Fire Suppression System",
        asset_type="Safety",
        location="Building A, All Floors",
        installation_date=date(2012, 9, 1),
        condition_rating="2.5",
        remaining_useful_life=3,
        status="Operational",
        lifecycle_stage="refurbishment",
        criticality="5.0",
    ),
    dict(
        name="Server Rack SR-04",
        asset_type="IT",
        location="Data Center, Room 1",
        installation_date=date(2020, 11, 5),
        condition_rating="4.5",
        remaining_useful_life=6,
        status="Operational",
        lifecycle_stage="expansion",
        criticality="3.5",
    ),
    dict(
        name="Water Pump WP-7",
        asset_type="Mechanical",
        location="Pump House",
        installation_date=date(2008, 2, 14),
        condition_rating="1.5",
        remaining_useful_life=1,
        status="Maintenance",
        lifecycle_stage="replacement",
        criticality="4.0",
    ),
    dict(
        name="Elevator Bank E1",
        asset_type="Mechanical",
        location="Building B, Core",
        installation_date=date(2016, 7, 22),
        condition_rating="3.0",
        remaining_useful_life=4,
        status="Operational",
        lifecycle_stage="renewal",
        criticality="4.0",
    ),
    dict(
        name="Backup Generator G-2",
        asset_type="Electrical",
        location="Building D, Yard",
        installation_date=date(2019, 5, 30),
        condition_rating="3.8",
        remaining_useful_life=8,
        status="Operational",
        lifecycle_stage="renewal",
        criticality="3.0",
    ),
]

# Keyed by asset name -> list of (inspection_date, condition_score, notes)
CONDITIONS = {
    "Boiler A-12": [
        (date(2025, 4, 22), "3.6", "Normal wear and tear observed."),
        (date(2026, 4, 20), "3.5", "Minor corrosion on casing, no leaks."),
    ],
    "Electrical Panel 02": [
        (date(2025, 3, 5), "2.3", "Breaker tripping intermittently."),
        (date(2026, 3, 1), "2.0", "Panel showing signs of overheating."),
    ],
    "HVAC Rooftop Unit 1": [
        (date(2025, 6, 12), "4.2", "Operating within spec after filter change."),
        (date(2026, 6, 10), "4.0", "Slight refrigerant pressure drop noted."),
    ],
    "Fire Suppression System": [
        (date(2025, 9, 2), "2.8", "Two nozzles blocked, cleared during inspection."),
        (date(2026, 3, 15), "2.5", "Control panel firmware outdated."),
    ],
    "Server Rack SR-04": [
        (date(2026, 1, 10), "4.6", "All units nominal, cooling within range."),
    ],
    "Water Pump WP-7": [
        (date(2025, 8, 1), "1.8", "Bearing noise audible on startup."),
        (date(2026, 2, 20), "1.5", "Seal leak detected, scheduled for replacement."),
    ],
    "Elevator Bank E1": [
        (date(2025, 7, 30), "3.2", "Cab 2 door sensor delayed response."),
        (date(2026, 5, 5), "3.0", "Cable wear within acceptable tolerance."),
    ],
    "Backup Generator G-2": [
        (date(2026, 2, 1), "3.8", "Monthly load test passed."),
    ],
}

# Keyed by asset name -> (probability_of_failure, consequence_of_failure)
RISKS = {
    "Boiler A-12": ("2.5", "5.0"),
    "Electrical Panel 02": ("4.0", "6.0"),
    "HVAC Rooftop Unit 1": ("1.5", "3.0"),
    "Fire Suppression System": ("3.0", "7.0"),
    "Server Rack SR-04": ("1.2", "3.5"),
    "Water Pump WP-7": ("4.5", "8.0"),
    "Elevator Bank E1": ("2.0", "6.5"),
    "Backup Generator G-2": ("1.0", "4.0"),
}

PROJECTS = [
    dict(
        name="Electrical Panel 02 Replacement",
        asset_name="Electrical Panel 02",
        scope_description="Full panel replacement due to elevated failure risk.",
        budget="45000.00",
        start_date=date(2026, 5, 1),
        end_date=date(2026, 8, 15),
        status="Active",
        responsible_person="Amina Hassan",
    ),
    dict(
        name="Fire Suppression Refurbishment",
        asset_name="Fire Suppression System",
        scope_description="Refurbish suppression lines and upgrade control panel firmware.",
        budget="68000.00",
        start_date=date(2026, 6, 10),
        end_date=date(2027, 1, 20),
        status="Planning",
        responsible_person="David Mwangi",
    ),
    dict(
        name="Water Pump WP-7 Replacement",
        asset_name="Water Pump WP-7",
        scope_description="Replace aging pump unit and reseal housing at Pump House.",
        budget="32000.00",
        start_date=date(2026, 4, 15),
        end_date=date(2026, 7, 1),
        status="Active",
        responsible_person="Grace Kimaro",
    ),
    dict(
        name="Elevator Bank E1 Modernisation",
        asset_name="Elevator Bank E1",
        scope_description="Modernise controller, cabling and door sensors for both cabs.",
        budget="90000.00",
        start_date=date(2026, 3, 1),
        end_date=date(2026, 11, 30),
        status="Planning",
        responsible_person="Peter Mushi",
    ),
    dict(
        name="HVAC Rooftop Unit 1 Servicing",
        asset_name="HVAC Rooftop Unit 1",
        scope_description="Annual preventive maintenance service and filter replacement.",
        budget="8000.00",
        start_date=date(2026, 1, 10),
        end_date=date(2026, 1, 20),
        status="Completed",
        responsible_person="Amina Hassan",
    ),
]

# Keyed by asset name -> (repair_cost, replacement_cost, maintenance_cost, discount_rate)
SCENARIOS = {
    "Boiler A-12": ("4500.00", "22000.00", "900.00", "5.00"),
    "Electrical Panel 02": ("6000.00", "18000.00", "1200.00", "6.00"),
    "HVAC Rooftop Unit 1": ("3000.00", "15000.00", "700.00", "4.50"),
    "Fire Suppression System": ("12000.00", "40000.00", "2000.00", "5.50"),
    "Server Rack SR-04": ("2000.00", "12000.00", "500.00", "4.00"),
    "Water Pump WP-7": ("5000.00", "16000.00", "1500.00", "6.50"),
    "Elevator Bank E1": ("20000.00", "85000.00", "3000.00", "5.00"),
    "Backup Generator G-2": ("4000.00", "25000.00", "800.00", "4.50"),
}


class Command(BaseCommand):
    help = "Wipes and reseeds the database with realistic demo data for the mobile app."

    @transaction.atomic
    def handle(self, *args, **options):
        Scenario.objects.all().delete()
        Project.objects.all().delete()
        Risk.objects.all().delete()
        Condition.objects.all().delete()
        Asset.objects.all().delete()

        assets_by_name = {}
        for data in ASSETS:
            asset = Asset.objects.create(**data)
            assets_by_name[asset.name] = asset
        self.stdout.write(f"Created {len(assets_by_name)} assets.")

        condition_count = 0
        for asset_name, records in CONDITIONS.items():
            asset = assets_by_name[asset_name]
            for inspection_date, condition_score, notes in records:
                Condition.objects.create(
                    asset=asset,
                    inspection_date=inspection_date,
                    condition_score=condition_score,
                    notes=notes,
                )
                condition_count += 1
        self.stdout.write(f"Created {condition_count} condition records.")

        risk_count = 0
        for asset_name, (pof, cof) in RISKS.items():
            Risk.objects.create(
                asset=assets_by_name[asset_name],
                probability_of_failure=pof,
                consequence_of_failure=cof,
            )
            risk_count += 1
        self.stdout.write(f"Created {risk_count} risk records.")

        project_count = 0
        for data in PROJECTS:
            asset_name = data.pop("asset_name")
            Project.objects.create(asset=assets_by_name[asset_name], **data)
            project_count += 1
        self.stdout.write(f"Created {project_count} projects.")

        scenario_count = 0
        for asset_name, (repair, replacement, maintenance, rate) in SCENARIOS.items():
            Scenario.objects.create(
                asset=assets_by_name[asset_name],
                repair_cost=repair,
                replacement_cost=replacement,
                maintenance_cost=maintenance,
                discount_rate=rate,
            )
            scenario_count += 1
        self.stdout.write(f"Created {scenario_count} scenarios.")

        self.stdout.write(self.style.SUCCESS("Demo data seeded successfully."))
