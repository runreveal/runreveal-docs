---
description: Activate your CloudTrail, ALB or ELB logs in RunReveal
---

# 🚅 Logs in Amazon S3

This guide describes how to setup your S3 buckets that have AWS logs for RunReveal to be able to process them.

First, ensure you're sending CloudTrail / ALB / ELB logs to an S3 bucket of your choice, for which you have permissions to modify the IAM policy.

Attach the following IAM policy to the bucket, ensuring to replace `YOUR_BUCKET_NAME` with the name of the bucket the policy's being attached to.

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Allow-RunReveal-Read",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::253602268883:root"
      },
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::YOUR_BUCKET_NAME/*",
        "arn:aws:s3:::YOUR_BUCKET_NAME"
      ]
    }
  ]
}
```

Then, enable sending notifications to one of RunReveal's regional SNS queues by following along below.

1. Find the bucket containing the logs you wish to send to RunReveal.
2. From the bucket overview, click the "Properties" tab, then scroll down to "Event Notifications"
3. Click "Create Event Notification"
4. Give the configuration a name (for your own identifying purposes, doesn't matter what it is).
5. Select "All object create events" in the events section (photo below)

<figure><img src="../../.gitbook/assets/Screenshot 2023-06-15 at 1.14.07 PM.png" alt="" width="375"><figcaption><p>Select All object create events for the S3 Event Notifications</p></figcaption></figure>

6. Then input RunReveal's S3 regional SNS queue ARN (`arn:aws:sns:<s3-bucket-region>:253602268883:RunReveal`) under the "Destinations" block at the bottom like so.  See the table below for the regions we currently have SNS topics created for.  Please reach out to support@runreveal.com if your region is not listed so we can create it.

<table><thead><tr><th width="203">Region</th><th>SNS ARN</th></tr></thead><tbody><tr><td>us-east-1</td><td>arn:aws:sns:us-east-1:253602268883:RunReveal</td></tr><tr><td>us-east-2</td><td>arn:aws:sns:us-east-2:253602268883:RunReveal</td></tr><tr><td>us-west-1</td><td>arn:aws:sns:us-west-1:253602268883:RunReveal</td></tr><tr><td>us-west-2</td><td>arn:aws:sns:us-west-2:253602268883:RunReveal</td></tr><tr><td>ap-southeast-2</td><td>arn:aws:sns:ap-southeast-2:253602268883:RunReveal</td></tr></tbody></table>

<figure><img src="../../.gitbook/assets/Screenshot 2023-06-20 at 3.00.12 PM.png" alt="" width="375"><figcaption><p>The SNS configuration for the bucket.</p></figcaption></figure>

7. If you've encrypted the logs under a KMS key, then follow the [#configuring-kms](logs-in-amazon-s3.md#configuring-kms "mention") guide below before continuing.
8. To associate the given bucket with the log type stored in this bucket, follow the guide given for that log type (found in the navigation pane to the left).  Right now, the supported logs are ALB, ELB or CloudTrail logs, with more to come soon. After about 5-15 minutes, you should start seeing logs in your RunReveal workspace.  Verify with: `runreveal logs ... TODO`

{% hint style="warning" %}
**If you created your S3 bucket using the UI, this will be set to "ACLs enabled" by default.** You must disable the ACLs to allow RunReveal to read your S3 logs.
{% endhint %}

<figure><img src="../../.gitbook/assets/Screenshot 2023-03-17 at 2.36.38 PM.png" alt=""><figcaption></figcaption></figure>

### Configuring KMS

Before you begin, ensure you know which KMS key is being used to encrypt the logs stored in the given bucket. Take note of which key it is, and go to the KMS UI. Add the following statement to that policy to allow RunReveal to decrypt the objects within your bucket.

To do this, in the KMS UI, select "Edit"

<figure><img src="../../.gitbook/assets/image (8) (1).png" alt=""><figcaption></figcaption></figure>

Add the following statement to your KMS policy.

```
{
            "Sid": "Enable RunReveal to decrypt objects in s3",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::253602268883:root"
            },
            "Action": "kms:*",
            "Resource": "*"
}
```
