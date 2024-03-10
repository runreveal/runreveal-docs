# Grafana Live Threat Monitoring

We can help you use your logs for live monitoring of you runreveal logs. We'll show you how to get the default RunReveal Threat Monitoring dashboard set up, and how to build custom dashboards.&#x20;

<figure><img src="../.gitbook/assets/image (5) (4).png" alt=""><figcaption></figcaption></figure>

## 1. Installing the plugin

Go to [the RunReveal Grafana Plugin](https://grafana.com/grafana/plugins/runreveal-runreveal-datasource/) and install it to your grafana instance by clicking "Install plugin" under the Installation tab.&#x20;

<figure><img src="../.gitbook/assets/Screenshot 2023-07-04 at 8.31.45 AM.png" alt=""><figcaption></figcaption></figure>

## 2. Add RunReveal Datasource

We still need to configure the RunReveal to authenticate with our API. Under `Home > Connections > Data sources`, search for RunReveal.

<figure><img src="../.gitbook/assets/Screenshot 2023-07-04 at 8.36.50 AM.png" alt=""><figcaption></figcaption></figure>

Next you'll need an API token. There's two different ways to get an API token.

* **Generate via the CLI**I. Run the below command, paste the token into the Session Token section of the grafana dashboard, and click "Save & test".

<figure><img src="../.gitbook/assets/image (2) (2).png" alt=""><figcaption></figcaption></figure>

* **Generate in the RunReveal UI**I. f you haven't set up your CLI interface, you can generate this same token in the UI under the "Settings" panel. Click "Generate Token" next to the API Tokens heading and copy/paste into the Session Token field in grafana.

<figure><img src="../.gitbook/assets/Screenshot 2023-07-24 at 8.56.45 AM.png" alt=""><figcaption></figcaption></figure>

## 3. Live threat monitoring dashboards

From the data sources screen, select the "Dashboards" tab. On the Dashboards tab, click "Import"

<figure><img src="../.gitbook/assets/image (2) (3).png" alt=""><figcaption></figcaption></figure>

You'll then see "RunReveal Default Dashboard" within your dashboards

<figure><img src="../.gitbook/assets/image (6) (1) (1).png" alt=""><figcaption></figcaption></figure>

This dashboard is maintained by us to help you quickly get up and running. If you'd like to see a revision history or see the detailed JSON specification of the dashboard that was just installed, [this link has more information](https://grafana.com/grafana/dashboards/19069-runreveal-default-dashboard/?tab=revisions).

## 4. Custom dashboards

Within a grafana dashboard you can make a new panel and select the `runreveal_source` datasource. Once you do that, you can make dashboards and panels using the same interface that the `runreveal logs` search interface works with.

<figure><img src="../.gitbook/assets/image (5) (3).png" alt=""><figcaption></figcaption></figure>

Remember, Grafana works really well with timeseries data, and the RunReveal search interface supports the macros `$__fromTime` `$__toTime` and `$__timeInterval`&#x20;

|                               |                                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------ |
| $\_\_fromTime                 | Replaced by the starting time of the range of the panel casted to DateTime                 |
| $\_\_toTime                   | Replaced by the ending time of the range of the panel casted to DateTime                   |
| $\_\_timeInterval(columnName) | Replaced by a function calculating the interval based on window size, useful when grouping |
