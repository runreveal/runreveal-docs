---
description: You need to know when your alerts fire!
---

# #⃣ Slack

To get started setting up your alerts you'll need to create a slack webhook app, and provide us with the webhook url to start receiving your alerts. Don't worry, this will only take a minute or two.

## Create Slack Application

Follow the steps on slack's website to create a new webhook application while logged into your slack account.

1. Click [https://api.slack.com/apps/new](https://api.slack.com/apps/new)
2. Click "Create New App" and "From Scratch"
3. Fill in a name like "RunReveal" and select the desired slack workspace
4. Under "Add features and functionality" select "Incoming Webhooks".
5. If necessary, select "Activate Incoming Webhooks"
6. Click "Add Webhook to workspaces" and select the channel you want.
7. Copy the webhook!

## Provide us with your webhook URL

Using the runreveal CLI, provide us with your webhook URL.

```
runreveal notifications slack add --name 'slack' https://hooks.slack.com/services/ABCDEFG/HIJKLMNO/RaNd0m1dV47u3
{
     "ID": "2O2EB1YeDafT25RfqO1oZzvV3zk",
     "WorkspaceID": "2KUOdhvRReF5RZfQX8ILneT4fdf",
     "Name": "Slack Alerts Channel",
     "DestType": "slack"
 }
```

## Managing slack notifications

The `slack` subcommand supports listing and removing existing slack webhooks.

```
runreveal notifications slack del 2O2EB1YeDafT25RfqO1oZzvV3zk
```
