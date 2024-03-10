# Scheduled Queries

The `runreveal query schedule` command allows you to setup a named query to run at recurring intervals. The results of the scheduled query are saved and can be searched on like any regular event.

## Getting Started

### Saving Schedules

Before a schedule can be saved a [Named Query](named-queries.md#saving-a-query) must be created. After a query is created a schedule can be setup.

Run the `runreveal query schedule add` command to create a new schedule.

The following are the different flags that the command supports.

#### --query

This flag is required and must match the name of a saved query. Updating the query name will not break the link to its schedules.

#### --sch

The schedule flag is required and contains a cron string that represents the interval to run the query on. All schedules are run using the UTC timezone. Meaning the expression `0 0 * * *` would be scheduled to run every day at midnight in the UTC timezone.

The cron string is a 5 character segmented string. The cron expression must be surrounded by quotes when writing it on the command line.

For example, the string `*/5 * * * *` would run the query every 5 minutes. To verify your cron expression you can use any number of online cron generators, e.g. [Crontab guru](https://crontab.guru/).

The cron express also allows the use of certain tags to make writing the expressions easier.

* _@yearly_ or _@annually_ - every year
* _@monthly_ - every month
* _@daily_ - every day
* _@weekly_ - every week
* _@hourly_ - every hour
* _@5minutes_ - every 5 minutes
* _@10minutes_ - every 10 minutes
* _@15minutes_ - every 15 minutes
* _@30minutes_ - every 30 minutes

#### --desc

The description flag allows you to add a short description to the schedule. This description can be used to identify the schedule and what its used for.

```
$ runreveal query schedule --query source-count --sch "*/5 * * * *" \
--desc "Shows the aws logins from the last 5 minutes"
```

```
{
     "id:": "2ResIQ40QftGVNB34cijATHDCii",
     "workspaceID": "2Rer8nVThTWE4yaQ3ZPYnoXdUSi",
     "description": "Count of all runreveal source logs",
     "query": "source-count",
     "schedule": "*/5 * * * *",
     "enabled": true,
     "nextRunTime": "2023-06-25T10:25:00Z",
     "previousRunTime": null
 }
```

### Updating/Deleting Schedules

When updating or deleting a scheduled query you will need to provide the `schedule id` when running the command.

```
$ runreveal query schedule update [schid] --disable
$ runreveal query schedule del [schid]
```

When updating a query, you can provide the `--disable` flag to turn off scheduling. The scheduled query will still exist but will no longer be scheduled until the `--enable` flag is provided.

If deleting a named query, any schedules associated with that query will also be removed. The past executions of the query will still be available to access even after deleting it.

## Viewing Scheduled Query Results

When a scheduled query executes, information about the execution is saved, along with the query that was executed, and the results returned. These are all saved in a separate table next to your other event data. This means that you can write a query to access the rows,&#x20;

```sql
SELECT * FROM scheduled_query_runs ORDER BY executionTime DESC LIMIT 5
```

The cli also offers a way to view the formatted results of an execution. You can supply either the unique ID of a run to display the exact results, or the id of the schedule to display the latest result.

```
$ runreveal query schedule result --run [RUN ID]
$ runreveal query schedule result --sch [Schedule ID]
```

This will display the results in the same format as the `runreveal logs` command.

```
+------------+-------+
| SOURCETYPE | COUNT |
+------------+-------+
| cloudtrail | 25000 |
+------------+-------+

Ran Query: SELECT sourceType, count(*) count FROM runreveal_logs GROUP BY sourceType

Execution Time: 2023-06-24T12:01:05-04:00
Triggered Notification: true
Retrieved 1 rows in 7.407333ms
```

## Parameters

Same as the [#query-parameters](named-queries.md#query-parameters "mention") section in named queries, scheduled queries can also be saved with parameters. When saving a schedule pass in the `--param` flag with a key value pair.

Using parameters in a scheduled query allows you to create multiple dynamic schedules with just a single query. When updating that query, all schedules will use the new version.

Given the following query named `events` you can create multiple schedules for it.

```sql
SELECT eventName, COUNT(*) cnt FROM runreveal_logs
WHERE actor['email'] = @email
AND eventTime > subtractHours(now(), 1)
GROUP BY eventName ORDER BY cnt desc
```

{% code fullWidth="true" %}
```bash
> runreveal query schedule add --query events --sch @hourly --param email=user1@example.com
> runreveal query schedule add --query events --sch @hourly --param email=user2@example.com
> runreveal query schedule add --query events --sch @hourly --param email=user3@example.com
```
{% endcode %}
