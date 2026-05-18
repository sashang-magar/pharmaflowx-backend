from django.apps import AppConfig


class ApprovalsConfig(AppConfig):
    name = 'approvals'

    def ready(self):
        import approvals.signals
