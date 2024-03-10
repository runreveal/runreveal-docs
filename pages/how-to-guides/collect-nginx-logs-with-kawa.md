# Collect Nginx logs with Kawa

[Kawa](https://github.com/runreveal/kawa) is an open source log collection agent that is easy-to-use, efficient, and performant.

We can use Kawa to collect nginx logs to be visualized in RunReveal.  In this guide, we'll install, configure and run Kawa on the machine running nginx (or a host that is visible on the network from the host running nginx).

First, login to RunReveal and create a Kawa source.  This will give us a webhookURL to send our data to as a Kawa destination.

<figure><img src="../.gitbook/assets/Screenshot 2023-08-02 at 10.22.31 AM.png" alt=""><figcaption></figcaption></figure>

Next, download a Kawa release for the operating system and architecture of the host you'll be running the daemon on from the releases page [here](https://github.com/runreveal/kawa/releases). ([https://github.com/runreveal/kawa/releases](https://github.com/runreveal/kawa/releases)) Extract the package to a directory of your choosing.

We'll use the sample configuration in the examples directory which already has the syslog listener for which we'll be sending our logs, copied here for convenience with comments omitted.  Replace `{{YOUR-KAWA-WEBHOOKURL}}` with the webhook given in the UI.

```
{
  "sources": [
    {
      "type": "syslog",
      "addr": "0.0.0.0:5514",
      "contentType": "application/json; rrtype=nginx-json",
    },
  ],
  "destinations": [
    {
      "type": "runreveal",
      "webhookURL": "{{YOUR-KAWA-WEBHOOKURL}}",
    },
  ],
}
```

We can run Kawa pointing at the configuration like so (assuming you download it to the same directory as the binary).

```
./kawa run --config=./config.json
```

With that running, it's time to tell nginx where to send logs.  Download this nginx configuration file and put it in your nginx's \`conf.d\` directory to enable writing nginx logs in structured JSON format.

```
curl -o /etc/nginx/conf.d/log_json.conf https://raw.githubusercontent.com/runreveal/kawa/main/examples/nginx_json.conf
```

Now, add this `access_log` line to the `server` block for the sites that you wish to receive access logs from.  If you're not running Kawa on the same host as nginx, replace the localhost address `127.0.0.1` with the host IP you've configured Kawa to listen on.

<pre><code><strong>server {
</strong><strong>    access_log syslog:server=127.0.0.1:5514 json_combined;
</strong><strong>    # ... other config ...
</strong>}
</code></pre>

Test your nginx config and reload the nginx process:

```
sudo nginx -s reload
```

You should now be getting logs in your RunReveal workspace!  Let's run some queries on RunReveal once you've gotten some traffic to the site you've configured.

<figure><img src="../.gitbook/assets/runreveal.com_dash_search.png" alt=""><figcaption></figcaption></figure>

That's it!  If you encounter any problems setting this up, please feel free to reach out on our discord, via the chat bubble on the website, or via contact@runreveal.com.