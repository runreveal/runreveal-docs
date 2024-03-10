# Detection as Code

RunReveal supports tracking your detections as source code files using the `runreveal` command-line interface.

Code-based detections are made up of 2 files: the detection SQL and the configuration for the schedule and alerting.  In this example, we'll create a detection for root account usage using the AWS Cloudtrail source.

1. Create a pair of files, a SQL file and the detection config as YAML or JSON.  In this example we've chosen to use YAML.

```
touch root_account_usage.sql root_account_usage.yaml
```

2. Add your detection to the SQL file.  If the SQL file returns any rows for the given window, then it will trigger your alert and send notifications according to your configuration.  Use the parameters `from` and `to` to contain the window of data you are querying.  These parameters will be set automatically by our detection engine when running the query to ensure all logs are checked. We have also included a user defined parameter called `userAgent` this must be supplied in the configuration file.

```sql
SELECT *
FROM cloudtrail_logs
WHERE ((userIdentity.type = 'Root') AND (userAgent != {userAgent:String}))
 AND (receivedAt >= {from:DateTime}) AND (receivedAt < {to:DateTime});
```

3. Edit the detection config file and add  the following.  Comments for the fields are provided in line.

```yaml
# Required: The name of the query for reference
name: root_account_usage

# Optional: A display name that is shown in the UI
displayName: AWS Root Account Was Used

# Required: The name of the file containing the sql query
file: root_account_usage.sql

# Optional: A description of the detection.
description: Monitor for usage of the AWS root account.

# Optional: Additional notes that can be attached to the detection.
notes: |-
  This is a notes field that can store info about this detection.
  It can be useful to store links to playbooks in your other systems.
  
# Optional: An array of strings to help group queries
categories:
  - aws
  
# Optional: A severity string to identify the importance of the detection results.
severity: low

# Optional: An array of mitre attack framework classifications. 
# This is useful when identifying attack patterns.
mitreAttacks:
  - initial-access
  
# Optional: An array of sources that this detection is used for.
# This can be useful to help identify which sources are lacking coverage.
sourceTypes:
  - cloudtrail
  
# Required: A cron string that identifies how often this detection will execute.
schedule: '*/15 * * * *'

# Optional (default: false): If true will disable this detection from running on its schedule
disabled: false

# Optional: Key/Value pairs that are replaced when the query executes. 
parameters:
  userAgent: AWS Internal

# Optional: An array of notification channel names that should receive an alert if this detection triggers
notificationNames:
  - email
  
# Optional: A notification template name to override the defualt channel template if this detection triggers.
notificationTemplate: aws_template
```

## Sync Your Detections

There are two ways to sync your detections with your RunReveal account. Using the RunReveal cli or by using the Github Action.

Regardless of which method you use, you will first need to create a valid API token.

To get started, first create a key with the `cibot` role in the workspace settings on the [account page](https://runreveal.com/dash/account). While on your account page also take note of your Workspace ID as this will be needed if you have more than one workspace.

{% hint style="info" %}
Currently, only workspace admins have the ability to create API tokens.  The "cibot" role restricts all privileges except the ones that are necessary for managing detections.  Those permissions cover [Reading, Writing, and Deleting detections](https://docs.runreveal.com/getting-started/how-to-guides/configuring-role-based-access-control).
{% endhint %}



<div>

<figure><img src="../../.gitbook/assets/Screenshot 2024-01-19 at 9.37.07 AM (3).png" alt="" width="554"><figcaption><p>Create a new API Token on the account page.</p></figcaption></figure>

 

<figure><img src="../../.gitbook/assets/Screenshot 2024-01-19 at 9.37.22 AM.png" alt="" width="356"><figcaption><p>In the dialog that appears, select the "cibot" role.</p></figcaption></figure>

</div>



### CLI

To sync your detections using the CLI you will need log in with `runreveal init`, or set environment variables to indicate your API token and workspace ID.

If you're authenticating using environment variables the API token is expected to use the  `RUNREVEAL_TOKEN` environment variable and the token's workspace ID must be set as `RUNREVEAL_WORKSPACE`.

Run the following command, passing in the directory that contains the detection you just created: `runreveal detections sync -d ./<directory>` .  You can also pass the `-t` flag for a dry run or test to see what will be created, updated or deleted.

### Github Action

A Github Action is available to use in your Github workflows. You can find the source code for it at, [https://github.com/runreveal/detection-sync-action](https://github.com/runreveal/detection-sync-action).

To use the action you will need to store your generated API token and workspace ID in your Github account to be used as variables in the action. It is recommended to store your API token as a secret so that it remains hidden.

<div>

<figure><img src="../../.gitbook/assets/Screenshot 2024-02-13 at 10.38.16 AM.png" alt=""><figcaption></figcaption></figure>

 

<figure><img src="../../.gitbook/assets/Screenshot 2024-02-13 at 10.38.06 AM.png" alt=""><figcaption></figcaption></figure>

</div>

In your Github workflow file you can use the following example to sync your detections.

```yaml
- name: sync-runreveal-detections
  uses: runreveal/detection-sync-action@v1
  with:
    # The directory containing the detections you want to sync.
    # Should be absolute path or relative to your current directory.
    # Defaults to your current directory
    directory: ./detections

    # A RunReveal API token generated with detection edit permissions
    # For best results generate your token with the `cibot` role. 
    token: ${{ secrets.RUNREVEAL_TOKEN }}

    # The RunReveal workspace ID to sync the detections with.
    # This workspace should match the workspace the token was generated under.
    workspace: ${{ vars.RUNREVEAL_WORKSPACE }}
```

Update the token and workspace inputs with the name that you used when creating your secrets/variables. Also make sure the directory listed matches where your detections are located.

When your workflow runs it will sync the files in the directory with your RunReveal account.

{% hint style="info" %}
As of now, you can only sync one directory per workspace. Any detections not listed in your directory will be automatically removed from your account.
{% endhint %}

{% hint style="info" %}
Detections will currently report as being updated even if there's no changes.  We're working on reporting exactly what's changing in each detection, so you can see which ones aren't being changed with every sync also.
{% endhint %}

