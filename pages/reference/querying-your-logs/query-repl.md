# Query REPL

The RunReveal client supports a read eval print loop (REPL) if you specify the `--repl` flag when running the logs subcommand.

```
$ runreveal logs --repl                                                                                                
rr> show tables
+-----------------+
| NAME            |
+-----------------+
| cloudtrail_logs |
| runreveal_logs  |
+-----------------+
Retreived 2 rows in 367.509083ms
rr> SELECT sourceType, COUNT(*) as count FROM runreveal_logs GROUP BY sourceType ORDER BY sourceType;
+------------+--------+
| SOURCETYPE |  COUNT |
+------------+--------+
| cloudtrail | 313381 |
| webhook    |     24 |
+------------+--------+
Retreived 2 rows in 126.661917ms
rr>  

```

##

## Natural Language Queries

You can query your logs using natural language, and use GPT-4 to convert your query to a SQL query.

```
rr> show me eventTime and eventName most recent log; \a
+----------------------+------------------------+
| eventTime            | eventName              |
+----------------------+------------------------+
| 2023-07-08T19:03:38Z | DescribeInstanceStatus |
+----------------------+------------------------+

Ran Query: SELECT eventTime, eventName FROM runreveal_logs ORDER BY receivedAt DESC LIMIT 1;

Retrieved 1 rows in 1.176173667s
```

## Printing Vertically

You may want to print your results vertically. Similarly to the natural language queries, this can be done by ending your query in a `\G`. Vertical and AI can be used together or separately.

```
rr> show me eventTime and eventName most recent log; \Ga
Row 0
 eventTime | 2023-07-08T19:02:14Z 
 eventName | AssumeRole           

Ran Query: SELECT eventTime, eventName FROM runreveal_logs ORDER BY receivedAt DESC LIMIT 1;

Retrieved 1 rows in 1.124499541s
```

