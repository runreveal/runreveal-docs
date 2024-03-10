# CrowdStrike

CrowdStrike logs are ingested by utilizing the CrowdStrike streaming events service that they offer. Every 60 seconds we connect to your CrowsStrike event streams and ingest any events that are forwarded.

## Setup

Login to your CrowdStrike account and navigate to `API clients and keys` under the Support and resources section.

<figure><img src="../../.gitbook/assets/Screenshot 2023-10-04 at 4.14.48 PM.png" alt="" width="375"><figcaption></figcaption></figure>

Create a new OAuth2 API Client from this page. Give the client a name and optional description. RunReveal only requires Read access to Event Streams for ingestion to work.

<figure><img src="../../.gitbook/assets/Screenshot 2023-10-04 at 4.48.42 PM.png" alt="" width="375"><figcaption></figcaption></figure>

Save the Client ID, Client Secret, and Base URL that is displayed once created. You will need these when setting up your RunReveal source.

<figure><img src="../../.gitbook/assets/Screenshot 2023-10-04 at 5.01.40 PM.png" alt="" width="375"><figcaption></figcaption></figure>

In RunReveal, create a new CrowdStrike source. Give it a name and fill in the values from your API client.

Once added CrowdStrike events should start ingesting within a few minutes.
