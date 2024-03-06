from azure.storage.blob import BlobServiceClient
from os import environ
from datetime import datetime, timedelta
import logging

# Disable info logs for the azure-storage-blob library
(logging.getLogger("azure.core.pipeline.policies.http_logging_policy")
 .setLevel(logging.WARNING))
(logging.getLogger("azure.core.pipeline.transport.http_requests")
 .setLevel(logging.WARNING))


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


def delete(blob_name):
    blob_client = container_client.get_blob_client(blob_name)
    if blob_client.exists():
        blob_client.delete_blob()


def clear_blobs(session, hours=1):
    blob_list = container_client.list_blobs(name_starts_with=session)
    current_time = datetime.now()
    cutoff_time = current_time - timedelta(hours=hours)
    error = None
    num_deleted = 0

    for blob in blob_list:
        try:
            ts = blob.name.strip(session).split('.')[0].split('-')
            params = [int(ts[i]) for i in range(len(ts))]
            if cutoff_time.day >= params[0] and \
                    cutoff_time.hour >= params[1] and \
                    cutoff_time.minute >= params[2] and \
                    cutoff_time.second >= params[3]:
                num_deleted += 1
                delete(blob.name)
        except Exception as e:
            error = e
    if error:
        return error
    return 'Deleted {} blob(s)'.format(num_deleted)
