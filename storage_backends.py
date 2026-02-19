import os
from storages.backends.azure_storage import AzureStorage

class StaticAzureStorage(AzureStorage):
    account_name = os.environ.get("AZURE_ACCOUNT_NAME")
    account_key = os.environ.get("AZURE_ACCOUNT_KEY")
    azure_container = os.environ.get("AZURE_STATIC_CONTAINER", "static")
    expiration_secs = None
    azure_overwrite_files = True
