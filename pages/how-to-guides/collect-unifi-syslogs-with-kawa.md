---
description: Send your Unifi console logs to RunReveal using the Kawad service
---

# Collect Unifi syslogs with Kawa

[Kawa](https://github.com/runreveal/kawa) is an open source log collection agent that is easy-to-use, efficient, and performant.&#x20;

Utilizing Kawa you can collect and view all of your Unifi device syslogs. In this guide we will walk you through creating your Kawa source in RunReveal, setting up Kawa on a machine, and forwarding your Unifi syslogs to the Kawa service.

## Create Kawa Source

First you will need to setup your Kawa source in RunReveal. Log into your account and create a new source, giving it a memorable name.

<figure><img src="../.gitbook/assets/Screenshot 2023-09-26 at 2.59.07 PM.png" alt=""><figcaption></figcaption></figure>

Once created save the webhook url that is created this will be needed to forward Kawa logs to RunReveal.

## Setup Kawad

Next, download a Kawa release for the operating system and architecture of the host you'll be running the daemon on from the releases page ([https://github.com/runreveal/kawa/releases/latest](https://github.com/runreveal/kawa/releases/latest)  ). Extract the package to a directory of your choosing.

Setup your config file to use with Kawa, below is an example of what is needed to forward your syslogs to RunReveal. Replace `{{YOUR-KAWA-WEBHOOKURL}}` with the webhook URL that you saved when creating your RunReveal source. `rrtype` is a tag that can be used to help identify the different kawa logs in your RunReveal account. This is optional and can be omitted if necessary.

{% code title="config.json" fullWidth="false" %}
```json
{
  "sources": [
    {
      "type": "syslog",
      "addr": "0.0.0.0:5514",
      "contentType": "application/text; rrtype=unifi"
    }
  ],
  "destinations": [
    {
      "type": "runreveal",
      "webhookURL": "{{YOUR-KAWA-WEBHOOKURL}}",
    },
}
```
{% endcode %}

We can run Kawa pointing at the configuration like so (assuming the config is in the same directory as the binary).

```
./kawa run --config=./config.json
```

## Configure Unifi

With Kawa running, it's time to tell Unifi where to send logs. You will want to access your Unifi network console and access the advanced system settings.

<figure><img src="../.gitbook/assets/Screenshot 2023-09-26 at 2.05.20 PM.png" alt="" width="257"><figcaption></figcaption></figure>

<figure><img src="../.gitbook/assets/Screenshot 2023-09-26 at 2.12.14 PM.png" alt=""><figcaption></figcaption></figure>

Scrolling to the bottom you will find a Remote Logging Location section. Select the remote server and check syslog. From here you will enter the host that is running Kawa and the port that the syslog source is using (in our example above we used 5514).

<figure><img src="../.gitbook/assets/Screenshot 2023-09-26 at 2.13.17 PM.png" alt=""><figcaption></figcaption></figure>

Apply your changes and Unifi will begin forwarding your device syslogs to Kawa. Once Kawa receives the logs it will send them to your RunReveal Kawa source.
