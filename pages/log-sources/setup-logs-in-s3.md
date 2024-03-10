---
description: Activate your CloudTrail, ALB or ELB logs in RunReveal
---

# 🚅 Setup Logs in S3

This guide describes how to setup your S3 buckets that have AWS logs for RunReveal to be able to process them.

First, ensure you're sending CloudTrail / ALB / ELB logs to an S3 bucket of your choice, for which you have permissions to modify the IAM policy.

Attach the following IAM policy to the bucket, ensuring to replace `<YOUR-BUCKET-NAME>` with the name of the bucket the policy's being attached to.

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
        "arn:aws:s3:::<YOUR-BUCKET-NAME>/*",
        "arn:aws:s3:::<YOUR-BUCKET-NAME>"
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

<figure><img src="../.gitbook/assets/Screenshot 2023-06-15 at 1.14.07 PM.png" alt="" width="375"><figcaption></figcaption></figure>

6. Then input RunReveal's S3 regional SNS queue ARN (`arn:aws:sns:<s3-bucket-region>:253602268883:RunReveal`) under the "Destinations" block at the bottom like so.

<figure><img src="../.gitbook/assets/Screenshot 2023-06-20 at 3.00.12 PM.png" alt="" width="375"><figcaption></figcaption></figure>

Next, to associate the given bucket with the log type stored in this bucket, follow the guide given for that log type (found in the navigation pane to the left).  Right now, the supported logs are ALB, ELB or CloudTrail logs, with more to come soon. After about 5-15 minutes, you should start seeing logs in your RunReveal workspace.  Verify with: `runreveal logs ... TODO`
