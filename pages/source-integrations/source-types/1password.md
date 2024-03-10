# 1Password

1Password logs allow you to view audit events in your 1Password organization, sign in attempts from users in your 1Password, and item usage attempts.&#x20;

RunReveal will backfill the last 7 days of logs when setting up your source, and will poll for new logs every 60 seconds.

## Setup

To setup your 1Password source you will need to create an API token in your 1Password organization.

1. First you will navigate to your integrations settings in 1Password.

<figure><img src="../../.gitbook/assets/Screenshot 2023-10-04 at 7.47.19 AM.png" alt="" width="120"><figcaption></figcaption></figure>

2. Next you need to setup an integration, scroll down to Events Reporting and select the option that says other.

<figure><img src="../../.gitbook/assets/Screenshot 2023-10-04 at 7.43.13 AM.png" alt=""><figcaption></figcaption></figure>

3. Give the integration a name and click `Add Integration`.

<figure><img src="../../.gitbook/assets/Screenshot 2023-10-04 at 7.46.23 AM.png" alt=""><figcaption></figcaption></figure>

4. Now setup the token that will be used by RunReveal to read your events. Give the token a name and select which event type you want RunReveal to ingest. You can select as many or few event types as you wish.

<figure><img src="../../.gitbook/assets/Screenshot 2023-10-04 at 7.46.42 AM.png" alt=""><figcaption></figcaption></figure>

5. Copy the token that is provided and save it for later.

<figure><img src="../../.gitbook/assets/Screenshot 2023-10-04 at 7.47.34 AM.png" alt="" width="563"><figcaption></figcaption></figure>

6. Navigate to RunReveal and create a new 1Password source.
7. Give the source a name and add in the token saved from step 5.
8. In the drop down select the type of account that you have. The account type determines where your 1Password data is stored and changes how it is accessed.

Your data should start importing within a minute.
