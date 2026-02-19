from storages.backends.azure_storage import AzureStorage
from django.conf import settings

class StaticAzureStorage(AzureStorage):
    account_name = settings.AZURE_ACCOUNT_NAME
    account_key = settings.AZURE_ACCOUNT_KEY
    azure_container = settings.AZURE_STATIC_CONTAINER
    expiration_secs = None
