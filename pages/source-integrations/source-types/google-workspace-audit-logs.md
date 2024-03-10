# Google Workspace Audit Logs

Connecting GSuite requires a GSuite administrator who can add a GSuite app to your workspaces. The integration is seamless and uses Google OAuth2 to provide us with a token.

You will also need to have the `runreveal` CLI installed and a RunReveal account created before we can start receiving data from Google Workspace using this guide.

## Setup OAuth App in Google Workspace

1. Create a project in [Google Cloud Console.](https://developers.google.com/workspace/guides/create-project)
2. Select that project by selecting it from the drop-down menu at the top left of the console.
3. Enable the [Google Cloud Admin SDK](https://console.cloud.google.com/apis/library/admin.googleapis.com?supportedpurview=project) in Google Cloud Console by following [this link](https://console.cloud.google.com/apis/library/admin.googleapis.com?supportedpurview=project) and clicking "Enable".
4. Before we can create the OAuth App, we need to configure the project to have an [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent).  Open that link then follow along.
5. Select "Internal" as the User Type then hit "Create".
6. "App name" is for you, but we recommend `RunReveal` so that it can be easily identified.
7. "Support Email" should be someone in your org who can answer questions about access controls, typically the IT administrators or security team.
8. Under Authorized Domains, click \[+ADD DOMAIN] and enter `runreveal.com`.
9. For Developer contact information, enter your email or an appropriate IT admin in your org.
10. The remaining fields are optional.  Click "Save and Continue" when you're finished.
11. Click "Add or Remove Scopes".
12. Type "audit" into the filter bar at the top of the table and select the checkbox next to the scope ending in `admin.reports.audit.readonly` then click "Update" at the bottom.



    <figure><img src="../../.gitbook/assets/Screenshot 2023-07-09 at 5.37.19 PM.png" alt=""><figcaption><p>Check the box adjacent to the admin.reports.audit.readonly scope.</p></figcaption></figure>
13. If you don't see the scope (`admin.reports.audit.readonly`) return to step 3.
14. Click "Save and Continue".
15. Now click "[Credentials](https://console.cloud.google.com/apis/credentials?)" in the left navigation column (or click the link provided).
16. Click \[+Create Credentials] -> and select `OAuth Client ID` from the list.
17. Select `Web Application` for the "Application Type".
18. Name the app something recognizable, like `RunReveal`.
19. For the Authorized Redirect URIs, navigate to the GSuite source creator and fill in source name. The Redirect URI  you'll fill into the form under "Authorized redirect URIs".

<figure><img src="../../.gitbook/assets/image (15).png" alt=""><figcaption></figcaption></figure>

20. Click "Create"
21. Copy the OAuth "Client ID" and "Client Secret" into the RunReveal UI
22. Do the same now for "Client Secret".  Click "Create Source"
23. Your browser will now open the consent screen to grant access to runreveal.  View that page from a Google Workspace Administrators account for your organization.
24. Select the account to authenticate to RunReveal with.
25. On the next screen, click "Allow".  It takes a few moments, but when complete it should redirect you to our documentation.&#x20;

You're done!  Logs should now be flowing into your Google Workspace source in RunReveal.

## Query your logs

From the sources page, click "Query" on your GSuite source. You should start seeing logs within a minute. If you type in a query, try searching for `sourceType='gsuite'`



```
$ runreveal logs
rr> SELECT * FROM runreveal_logs WHERE sourceType = 'gsuite' LIMIT 1;
```
