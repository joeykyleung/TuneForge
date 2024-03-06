from azure.storage.blob import BlobServiceClient
from os import environ

# Initialize the BlobServiceClient using the connection string
connection_string = environ.get("AZURE_STORAGE_CONNECTION_STRING", '')
blob_service_client = BlobServiceClient.from_connection_string(
    connection_string)

# Get a reference to a container
container_name = environ.get('BLOB_CONTAINER_NAME', '')
container_client = blob_service_client.get_container_client(container_name)


def upload(local_path, blob_path):
    # Upload the file
    with open(local_path, "rb") as data:
        container_client.upload_blob(name=blob_path, data=data,
                                     overwrite=True)


def download(local_path, blob_name):
    with open(local_path, "wb") as download_file:
        download_file.write(container_client.get_blob_client(
            blob_name).download_blob().readall())
