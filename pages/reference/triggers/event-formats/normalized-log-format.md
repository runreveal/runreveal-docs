# Normalized Log format

🚧  Note: This portion of our product is under construction and improving in the near term. Write to us if you have suggestions. If you run into issues, [join our discord](https://discord.gg/n3y6WwPCg7)! 🚧

The normalized log format has only a few high signal and common audit log columns.

<table><thead><tr><th width="186.33333333333331">Name</th><th width="162">Format</th><th>Description</th></tr></thead><tbody><tr><td>ID</td><td>string</td><td>Unique event identifier</td></tr><tr><td>EventName</td><td>string</td><td>The action that the actor took within the service</td></tr><tr><td>ActorIP</td><td>string</td><td>The IP of the actor</td></tr><tr><td>Actor</td><td>dict</td><td>Dictionary containing Email if the actors email is set.</td></tr><tr><td>Src</td><td>dict</td><td>Dictionary containing IP, ASNumber, ASOrganization, and ASCountryCode the event contains an IP address</td></tr><tr><td>Dst</td><td>dict</td><td>Dictionary containing IP, ASNumber, ASOrganization, and ASCountryCode the event contains an IP address</td></tr><tr><td>ReadOnly</td><td>bool</td><td>True if this was a read only event. False if it was state changing.</td></tr></tbody></table>

Soon to come:

* Event Time - The timestamp that the event happened at.
* Service Identifier - A descriptor of the service that sent the event.
* Resource - The resource that action was taken on.
