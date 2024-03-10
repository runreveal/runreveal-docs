# Query your Cloudtrail logs

The simplest way to make sense of your AWS logs. You should be able to do the same thing by the end of this guide.

```
$ runreveal logs
rr> select * from runreveal_logs LIMIT 1;\G
Row 0
 id                | 2R7gKpsECi0SrlY1MMxdVSvL3Lp                                                                                                                                   ~
 receivedAt        | 2023-06-12T21:47:52Z                                                                                                                                          ~
 workspaceID       | 2KUOdhvRReF5RZfQX8ILneT4fSd                                                                                                                                   ~
 sourceType        | cloudtrail                                                                                                                                                    ~
 sourceID          | 2MpzmLYtA8lgeglYLnHMiD4UaSs                                                                                                                                   ~
 eventID           | 2c887ffd-4078-40f1-8fcd-c36678cc75e4                                                                                                                          ~
 eventName         | ListClusters                                                                                                                                                  ~
 eventTime         | 2023-06-12T21:45:20Z                                                                                                                                          ~
 readOnly          | true                                                                                                                                                          ~
 srcIP             | 34.227.127.165                                                                                                                                                ~
 srcASOrganization | AMAZON-AES                                                                                                                                                    ~
 srcASNumber       | 14618                                                                                                                                                         ~
 srcASCountryCode  | US                                                                                                                                                            ~
 dstIP             |                                                                                                                                                               ~
 dstASOrganization |                                                                                                                                                               ~
 dstASNumber       | 0                                                                                                                                                             ~
 dstASCountryCode  |                                                                                                                                                               ~
 actor             | map[]                                                                                                                                                         ~
 tags              | map[]                                                                                                                                                         ~
 rawLog            | {"eventVersion":"1.08","userIdentity":{"type":"AssumedRole","principalId":"AROATWC67Q3J2JUK64Y2Y:Vanta-1686606320094","arn":"arn:aws:sts::253602268883:assume ~


Ran Query: select * from runreveal_logs LIMIT 1

Retrieved 1 rows in 134.143958ms
rr>  
```

## 1. Setup Cloudformation Role

You'll need a role to run the Cloudformation Stack. To set up the role within the IAM  product page, Create a role.

<figure><img src="../.gitbook/assets/image (4).png" alt=""><figcaption></figcaption></figure>

Search for and select "CloudFormation"  as the Trusted entity for the role. Click next.

When assigning permissions to your Cloudformation role, provide the role with AdministratorAccess level permissions.

<figure><img src="../.gitbook/assets/image (11).png" alt=""><figcaption></figcaption></figure>

Click "Next" and set the name as "CloudformationRole" confirm the creation of the role. When running the Cloudformation stack from above, select this role from the dropdown.

## 2. Run the stack

You can quickly setup your S3 bucket, Cloudtrail, and KMS by [clicking this link](https://us-east-2.console.aws.amazon.com/cloudformation/home?region=us-east-2#/stacks/create?templateURL=https://runreveal-public-assets.s3.us-east-2.amazonaws.com/runreveal-cloudformation.yml\&stackName=RunRevealSetup) to initialize what's needed to allow RunReveal to access your Cloudtrail logs.

_Note: If you get an error while running that stack related to AWS organizations, or only want to enable RunReveal on a single account,_[ _click this link instead_](https://us-east-2.console.aws.amazon.com/cloudformation/home?region=us-east-2#/stacks/create?templateURL=https://runreveal-public-assets.s3.us-east-2.amazonaws.com/runreveal-cloudformation-noorg.yml\&stackName=RunRevealSetupNoOrgs)_._

Click Next, Next, and select the role that was created in the previous screen when prompted. Once you click Submit, Cloudformation will create the infrastructure necessary to send logs to RunReveal.

Once the stack successfully runs, click "Resources" and copy paste the "Physical ID" of the CloudtrailBucket. This is the name of the S3 bucket that was created which will contain your company's Cloudtrail logs.

<figure><img src="../.gitbook/assets/Screenshot 2023-07-11 at 3.30.54 PM.png" alt=""><figcaption></figcaption></figure>

## 2. Configure RunReveal

RunReveal needs to know what your bucket name is. After following the [Quick start guide](https://docs.runreveal.com/getting-started/getting-started/quick-start), you should run the following command.

```
$ runreveal sources cloudtrail add -b "runrevealsetup-cloudtrailbucket-xxxx"
```

## 3. Query your logs

After this is completed, logs should be flowing to RunReveal. You can see how many total Cloudtrail events have made it to RunReveal, but it might take up to 15 minutes for Cloudtrail to deliver these logs.

```
$ runreveal logs                                    
rr> select count(*) from runreveal_logs;

+--------------+
|      count() |
+--------------+
| 1162552      |
+--------------+

Ran Query: select count(*) from runreveal_logs

Retrieved 1 rows in 1.868134417s

```

Success! You can now use the query interface to interact with your logs like you normally would interact with a SQL terminal. The dialect of SQL is Clickhouse so specifics [can be referenced here](https://clickhouse.com/docs/en/sql-reference)

```
:) runreveal logs
rr> show tables
+-----------------------+
| name                  |
+-----------------------+
| cloudtrail_logs       |
| event_trigger_history |
| runreveal_logs        |
| scheduled_query_runs  |
+-----------------------+

Ran Query: show tables

Retrieved 4 rows in 306.865458ms

```
