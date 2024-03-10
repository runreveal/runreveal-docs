---
description: Quickly ingest your GCP logs
---

# Google Cloud Platform logs

Create a project and pub/sub

Within Google Cloud, create a new project. Give your project a descriptive name like "RunReveal". Your organization and Location will be your organization's. **Make note of the project ID.**

<figure><img src="../../.gitbook/assets/image (12).png" alt=""><figcaption></figcaption></figure>

Within that project navigate to pub/sub and under Topics click Create topic. Give your topic a descriptive name like "RunReveal" and click Create. **Make note of your topic ID.**

On your new pub sub, click "Create Subscription"

<figure><img src="../../.gitbook/assets/image (6) (1).png" alt=""><figcaption></figcaption></figure>

Give the Subscription ID a name like "RunReveal" and select Push as the Delivery Type.

Create a GCP source within the UI, click "Create Source" after giving it a name.

<figure><img src="../../.gitbook/assets/image (16).png" alt=""><figcaption></figcaption></figure>

Once you create the source your GCP source will have a Webhook URL.

<figure><img src="../../.gitbook/assets/image (17).png" alt=""><figcaption></figcaption></figure>

Paste this Webhook URL into the GCP logs Delivery Endpoint URL and Click Save.

## Create a sink

<figure><img src="../../.gitbook/assets/image (3) (3) (1).png" alt=""><figcaption></figcaption></figure>

1. Search for Logs Explorer.
2. Click on Logs Explorer and then navigate to Log Router.
3. Click Create Sink. Give your sink a descriptive name like "RunReveal"
4. Select the sink service as Cloud Pub/Sub topic
5.  Fill in the PROJECT\_ID and TOPIC\_ID and click Next



    <figure><img src="../../.gitbook/assets/image (6).png" alt=""><figcaption></figcaption></figure>
6. Select "Include logs ingested by this organization and all child resources"
7. Click Next, followed by Create Sink

## Verify it's working

You should start to see logs flowing to your GCP log source.

You can validate that your gcp log source is receiving logs by searching for them using the runreveal logs repl.

```
$ runreveal logs
rr> select * from runreveal_logs where sourceType='gcplogs' limit 1;
```

