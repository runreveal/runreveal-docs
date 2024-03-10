# 🏗 Cloudtrail logs without bucket

We can provide you with a variety of AWS related detections and investigation tools out of the box. The CloudTrail SIEM can:

1. Ingest and index logs for search.
2. Understand how your AWS environment is being used.&#x20;
3. Generate least privilege AWS access policies.

## Setup with our RunReveal hosted bucket

We consume your CloudTrail logs by receiving them in our S3 bucket.

First, let us know we'll be receiving your CloudTrail logs by telling us which AWS accounts you'll be sending CloudTrail logs from using the following command:

```
$ runreveal sources cloudtrail add -a 012345678901,012345678902
```

Next, there's only 1 step in the AWS Console, and then you're setup! 🎉 Incredible right?  Imagine what you could do with all the additional time you have now.  Maybe start a new hobby?

The following change can also be made with Terraform, Pulumi, or other configuration management tools.

<figure><img src="../../.gitbook/assets/image (7).png" alt=""><figcaption></figcaption></figure>

{% hint style="info" %}
* Give your trail a name. `runreveal` as a name works great!
* Select `Use Existing S3 Bucket` and set `runreveal` as the trail log bucket name.
* Disable SSE-KMS encryption. This is \*required\* for the simple setup.  Encryption is something we can support at the enterprise tier.
{% endhint %}

## Self Hosted Bucket

We also support BYOB!  Follow this guide before returning here to finish: [logs-in-amazon-s3.md](logs-in-amazon-s3.md "mention")

After you've setup your S3 bucket according to the guide, then run the following to associate a cloudtrail source with the bucket:

```
$ runreveal sources cloudtrail add -b YOUR_BUCKET_NAME
```
