# CloudTrail Format

The CloudTrail log format has a fairly well defined format and a more complete description of each field is available within AWS' docs:

{% embed url="https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-event-reference-record-contents.html" %}

Our CloudTrail format is defined as

<table><thead><tr><th width="436">Name</th><th>Type</th><th data-hidden>Description</th></tr></thead><tbody><tr><td>eventVersion</td><td>string</td><td></td></tr><tr><td>apiVersion</td><td>string</td><td></td></tr><tr><td>errorCode</td><td>string</td><td></td></tr><tr><td>errorMessage</td><td>string</td><td></td></tr><tr><td>userIdentity</td><td>UserIdentity</td><td></td></tr><tr><td>vpcEndpointID</td><td>string</td><td></td></tr><tr><td>eventType</td><td>string</td><td></td></tr><tr><td>eventName</td><td>string</td><td></td></tr><tr><td>eventTime</td><td>Time</td><td></td></tr><tr><td>eventSource</td><td>string</td><td></td></tr><tr><td>awsRegion</td><td>string</td><td></td></tr><tr><td>sourceIPAddress</td><td>string</td><td></td></tr><tr><td>userAgent</td><td>string</td><td></td></tr><tr><td>requestID</td><td>string</td><td></td></tr><tr><td>eventID</td><td>string</td><td></td></tr><tr><td>readOnly</td><td>bool</td><td></td></tr><tr><td>recipientAccountId</td><td>string</td><td></td></tr><tr><td>Resources</td><td>Array&#x3C;string></td><td></td></tr><tr><td>RequestParameters</td><td>Array&#x3C;string></td><td></td></tr><tr><td>ResponseElements</td><td>Array&#x3C;string></td><td></td></tr></tbody></table>

The userIdentity is the only type that is not a python primitive, and it can be accessed like any other nested data structure or map in python.

The UserIdentity fields are described in greater depth by AWS

{% embed url="https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-event-reference-user-identity.html" %}

Which can be described as:

<table><thead><tr><th width="285">User Identity Field Names</th><th width="209">Type</th></tr></thead><tbody><tr><td>Type</td><td></td></tr><tr><td>principalId</td><td></td></tr><tr><td>arn</td><td></td></tr><tr><td>accountId</td><td></td></tr><tr><td>accessKeyId</td><td></td></tr><tr><td>userName</td><td></td></tr><tr><td>sessionContext</td><td>SessionContext</td></tr><tr><td>invokedBy</td><td>string</td></tr></tbody></table>

SessionContext contains both a `SessionIssuer` and an `Attributes` object type.

<table><thead><tr><th width="247">Field Name</th><th width="245">Type</th></tr></thead><tbody><tr><td><strong>SessionIssuer</strong></td><td></td></tr><tr><td>accountId</td><td>string</td></tr><tr><td>arn</td><td>string</td></tr><tr><td>principalId</td><td>string</td></tr><tr><td>type</td><td>string</td></tr><tr><td>userName</td><td>string</td></tr><tr><td></td><td></td></tr><tr><td><strong>Attributes</strong></td><td></td></tr><tr><td>mfaAuthenticated</td><td>string</td></tr><tr><td>createdDate</td><td>Time</td></tr></tbody></table>

