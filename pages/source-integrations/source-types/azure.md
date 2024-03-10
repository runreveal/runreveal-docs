# Azure

Azure sources allow you to ingest different types of Azure logs. Currently we support Azure Activity Logs and Entra Logs.

The current process for exporting your Azure logs to RunReveal involves 3 steps.

1. Azure Activity Logs/Entra Logs export to an Azure event hub
2. An Azure function supplied by RunReveal, is triggered when new events are sent to the event hub.
3. The Azure function forwards the events to your RunReveal source.

## EventHub Creation

The first step in setting up either Entra or Azure Activity logs is to create an event hub for each one.

An event hub needs an event hub namespace, if you don't already have one that you want to use, you will need to create that first.

<figure><img src="../../.gitbook/assets/create-event-hub-namespace.png" alt=""><figcaption></figcaption></figure>

Follow the steps in Azure to create a namespace in your resource group giving it a name. This name will be needed when setting up your Azure function.

After creating the namespace, create a new event hub inside it. You will need to create a separate event hub for Entra and Activity logs. Save the name you give to both as they will also be needed later.&#x20;

<figure><img src="../../.gitbook/assets/create-event-hub.png" alt=""><figcaption></figcaption></figure>

At this point you can now setup Azure to export logs to your event hubs, but you can also setup different access policies or consumer groups for your event hubs as required by your organization.

## Export Logs to Event Hub

With the event hub in place you can now setup Entra and Activity Logs to export to it. Pick and choose which type of log you want imported to RunReveal. Microsoft Entra logs allow you to track changes to your domain settings and certain signin events from users. While Azure Activity Logs allow you to track changes to your Azure environment as a whole.

### Azure Activity Logs

On the Activity Log resource page, click on the "Export Activity Logs" button.

<figure><img src="../../.gitbook/assets/Screenshot 2023-09-11 at 8.46.04 AM.png" alt=""><figcaption></figcaption></figure>

On the diagnostic settings page, add a new diagnostic setting. Give the diagnostic setting a name, choose the categories you wish to include in your events, and select "Stream to an event hub" filling in the details with the event hub that was created.

<figure><img src="../../.gitbook/assets/Screenshot 2023-09-11 at 4.45.44 PM.png" alt=""><figcaption></figcaption></figure>

### Microsoft Entra Logs

From your Entra admin portal navigate to the Users->Sign-in logs screen and click on "Export Data Settings"

<figure><img src="../../.gitbook/assets/entra-export.png" alt=""><figcaption></figcaption></figure>

On the diagnostic settings page, add a new diagnostic setting. Give the diagnostic setting a name, choose the categories you wish to include in your events, and select "Stream to an event hub" filling in the details with the event hub that was created.

<figure><img src="../../.gitbook/assets/diag-settings.png" alt="" width="563"><figcaption></figcaption></figure>

## RunReveal Source

In order for your RunReveal workspace to accept either type of log you will first need to create the source. The two sources we have are "Azure Activity Logs" and "Azure Entra Logs". They both have the exact same setup, depending on your needs you can create either one.

From the create page you can give your source a name to identify it, select any detections or analytics that you may want imported into your account, and set up a health check to be notified when logs are not being received.&#x20;

<figure><img src="../../.gitbook/assets/entra-setup.png" alt=""><figcaption></figcaption></figure>

Once you have created them, make note of the Webhook URL that was generated. This will be used when setting up your Azure function.

<figure><img src="../../.gitbook/assets/Screenshot 2024-01-11 at 3.18.16 PM.png" alt=""><figcaption></figcaption></figure>

## Connect Everything Together

The final step is to create an Azure function that will trigger when new messages are sent to the event hub, and forward them to your RunReveal source. Luckily we have an easy to use template to help with that. Navigate to our [GitHub repo](https://github.com/runreveal/azure-functions-runreveal) to view the source code of the Azure Function getting deployed. Click on the below button to automatically load the template into Azure.

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Frunreveal%2Fazure-functions-runreveal%2Fmain%2Fdeploy%2FazureDeploy.json/createUIDefinitionUri/https%3A%2F%2Fraw.githubusercontent.com%2Frunreveal%2Fazure-functions-runreveal%2Fmain%2Fdeploy%2FazureDeploy.portal.json)

To get started fill in the Subscription, resource group, and function name. Select the event hub namespace where the logs are sent and the access policy that will be used to read events. The GitHub repo and branch are used to download the function source code. Keep these default unless you plan to fork the repo to your own GitHub account.

If you plan to import Activity Logs, check the "Enable Activity Log Event Hub Functions" box to bring up the options for Activity Logs. Fill in the RunReveal webhook URL that was obtained earlier when creating your source. Then select the event hub and consumer group that are being used to store the activity logs.

If you plan to Import Entra Logs, check the "Enable Entra Log Event Hub Functions" box to bring up the options for Entra Logs. Fill in the RunReveal webhook URL that was obtained earlier when creating your source. Then select the event hub and consumer group that are being used to store the Entra logs.

{% hint style="info" %}
When filling in the webhooks for Azure Activity Logs and Entra Logs, make sure to use the correct URL for that source. Mixing up the URLs or creating the wrong type of source will cause most if not all of your logs to fail to import.
{% endhint %}

Add any required tags to your setup, then review the settings. Once created Azure will begin the deployment of the function. This may take a few minutes, but when complete logs should begin flowing to RunReveal.

{% hint style="info" %}
Azure may take some time before they start to forward events to your Azure function. If a few hours have gone by and you have not seen any logs appear in your RunReveal account reach out to us to for some help.
{% endhint %}
