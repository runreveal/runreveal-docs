---
description: Activate your logs from S3 in RunReveal
---

# S3 Log Sources

This guide describes how to setup your S3 buckets that have AWS logs for RunReveal to be able to process them. Here's how the process works when RunReveal reads logs from your bucket.

## Access to the objects via IAM

The two ways we can access your objects is via IAM role, and direct resource access via S3 and KMS policy configuration.

#### Choice 1. IAM Role Based Configuration

_This will be the easiest method for setup_, and it gives us one entry point to your AWS account for all future S3 buckets.

* [aws-s3-role-based-authentication.md](../../../sources/aws-s3-role-based-authentication.md "mention")

#### Choice 2. S3 bucket and KMS policy

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

After you've configured the S3 bucket, you'll need to configure KMS as well.

Check which KMS key is being used to encrypt the logs stored in the given bucket. Take note of which key it is, and go to the KMS UI. Add the following statement to that policy to allow RunReveal to decrypt the objects within your bucket.

To do this, in the KMS UI, select "Edit"

<figure><img src="../../../.gitbook/assets/image (8) (1).png" alt=""><figcaption></figcaption></figure>

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

## Event Notifications

Enable sending notifications to one of RunReveal's regional SNS queues by following along below. This is required for all sources you read from S3. You'll need to set up 1 event notification per source.

1. Find the bucket containing the logs you wish to send to RunReveal.
2. From the bucket overview, click the "Properties" tab, then scroll down to "Event Notifications"
3. Click "Create Event Notification"
4. Give the configuration a name (for your own identifying purposes, doesn't matter what it is).
5. Select "All object create events" in the events section (photo below)

<figure><img src="../../../.gitbook/assets/Screenshot 2023-06-15 at 1.14.07 PM.png" alt="" width="375"><figcaption><p>Select All object create events for the S3 Event Notifications</p></figcaption></figure>

6. Then input RunReveal's S3 regional SNS queue ARN (`arn:aws:sns:<s3-bucket-region>:253602268883:runreveal_<sourcetype>`) under the "Destinations" block at the bottom like so.  We've created a SNS queue in each region, 1 for each source type. If you run into issues, please contact us at `support@runreveal.com`.&#x20;

<table><thead><tr><th width="150">Source Type</th><th>SNS ARN</th></tr></thead><tbody><tr><td>Flow Logs</td><td>arn:aws:sns:&#x3C;REGION>:253602268883:runreveal_flow</td></tr><tr><td>Cloudtrail</td><td>arn:aws:sns:&#x3C;REGION>:253602268883:runreveal_cloudtrail</td></tr><tr><td>Github S3</td><td>arn:aws:sns:&#x3C;REGION>:253602268883:runreveal_github</td></tr><tr><td>GuardDuty</td><td>arn:aws:sns:&#x3C;REGION>:253602268883:runreveal_guardduty</td></tr><tr><td>VPC DNS</td><td>arn:aws:sns:&#x3C;REGION>:253602268883:runreveal_awsdns</td></tr><tr><td>ALB Logs</td><td>arn:aws:sns:&#x3C;REGION>:253602268883:runreveal_alb</td></tr></tbody></table>

<figure><img src="../../../.gitbook/assets/Screenshot 2023-06-20 at 3.00.12 PM.png" alt="" width="375"><figcaption><p>The SNS configuration for the bucket.</p></figcaption></figure>



