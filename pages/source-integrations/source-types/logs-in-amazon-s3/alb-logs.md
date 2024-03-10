# ALB logs

We support ALB logs by consuming the S3 SNS notification delivery log.

First, run this command, passing in the name of the bucket containing your ALB logs:

```
$ runreveal sources alb add -b YOUR_BUCKET_NAME
```

Then, follow this guide to configure the SNS notifications and IAM permissions for your S3 bucket containing your ALB logs: [.](./ "mention")
