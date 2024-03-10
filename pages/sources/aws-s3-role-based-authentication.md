# Role Based Authentication

All S3 sources support reading via an IAM Role in your AWS account. This is so you don't need to worry about fiddling with a bucket policy each time you onboard a new log source.

## Creating the role

When creating the role, you'll need to provide us with S3 and KMS permissions necessary to read objects from the bucket, and decrypt them.

When you create a source that supports AWS Role based access to the objects, you'll be prompted to provide a role ARN. Your role needs to have `s3:GetObject`, `s3:ListBucket`, and access to the `Resources` that are contained in your bucket.

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "s3:GetObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::<YOUR_BUCKET>",
                "arn:aws:s3:::<YOUR_BUCKET>/*"
            ],
            "Effect": "Allow"
        },
        {
            "Action": [
                "kms:Decrypt"
            ],
            "Resource": [
                "arn:aws:kms:us-west-2:EXAMPLE_AWS_ACCOUNT:key/1234abcd-12ab-34cd-56ef-1234567890ab"
            ],
            "Effect": "Allow"
        }
    ]
}
```

Note, if your bucket objects are encrypted with an AWS managed AWS key, you don't need the KMS policy. If it's encrypted with a KMS key you created that lives in your account, you'll need to include the KMS policy as well.

## Secure Access Using External ID

The external ID configuration helps prevent the confused deputy problem. The trusted entities configuration necessary for RunReveal to access your account looks like this. Make sure you fill in the external ID with whatever you set up on your source.

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::253602268883:root"
            },
            "Action": "sts:AssumeRole",
            "Condition": {
                "StringEquals": {
                    "sts:ExternalId": "<EXTERNAL_ID>"
                }
            }
        }
    ]
}
```

## Verify it works

When configuring a source from S3, click on "Verify Settings" to validate your role is configured correctly. If the button turns green it works! If the button turns red, and prints out an error message, the source won't work when you save it.

<figure><img src="../.gitbook/assets/verify.png" alt=""><figcaption></figcaption></figure>



##
