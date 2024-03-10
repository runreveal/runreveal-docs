# Named Queries

The `runreveal query` command can be used to store and interact with named sql queries across your workspace. Under the hood, RunReveal's storage layer is Clickhouse and a full reference of the syntax is available within the [Clickhouse Docs](https://clickhouse.com/docs/en/sql-reference).

## Getting Started

### Saving a Query

In order to share and use a query it must be saved. A named query has two parts. The name, which must be unique across all named queries in your workspace, and the query itself. There are two ways to supply your query to the command.

The first way you can supply the query is on the command line.

```
$ runreveal query add --name "unique-name" --query "SHOW TABLES"
```

The second way to supply your query is by passing a file that contains it.

```
$ cat ./query.sql
SELECT sourceType, COUNT(*) from runreveal_logs GROUP BY sourceType;

$ runreveal query add --name "source-count" --file "./query.sql"
{
     "id": "2QWcmll9YxLiAF6Tnb5HWih0K7g",
     "workspace_id": "2QVnlfZHrjLqWIi3JFDdKgmuC5A",
     "name": "source-count",
     "query": "SELECT sourceType, COUNT(*) from runreveal_logs GROUP BY sourceType;"
 }
```

If you would like to see what queries have been added to your workspace you can use the list subcommand.

```
$ runreveal query list
[
     {
         "id": "2QVpwozmwoPSWiK02T3F3LpwnRA",
         "workspace_id": "2QVnlfZHrjLqWIi3JFDdKgmuC5A",
         "name": "tables",
         "query": "SHOW tables"
     },
     {
         "id": "2QWcmll9YxLiAF6Tnb5HWih0K7g",
         "workspace_id": "2QVnlfZHrjLqWIi3JFDdKgmuC5A",
         "name": "source-count",
         "query": "SELECT sourceType, COUNT(*) from runreveal_logs GROUP BY sourceType;\n"
     }
 ]
```

### Updating and Deleting Queries

When updating a query you can update the name of the query and/or the query itself. Update has the same flags as the add subcommand with one difference, you must pass the `id` of the query you are updating as an argument.

```
$ runreveal query update 2QVpwozmwoPSWiK02T3F3LpwnRA --name show-tables    
```

When deleting a query you can either pass the query `name` or the `id` of the query you wish to delete.

```
$ runreveal query del show-tables
[
     {
         "id": "2QWcmll9YxLiAF6Tnb5HWih0K7g",
         "workspace_id": "2QVnlfZHrjLqWIi3JFDdKgmuC5A",
         "name": "source-count",
         "query": "SELECT sourceType, COUNT(*) from runreveal_logs GROUP BY sourceType;\n"
     }
 ]
```

## Query Parameters

Sometimes you might want to save a query that allows you to update the search criteria without updating the query. That is where query parameters are useful. Consider the following query,

```sql
SELECT eventName, COUNT(*) cnt FROM runreveal_logs
WHERE actor['email'] = 'mallory@runreveal.com'
AND eventTime > subtractHours(now(), 1)
GROUP BY eventName ORDER BY cnt desc
```

This will get a count of each event performed by mallory in the past hour. When saving the query you can substitute values with parameters to allow the query to be run dynamically. Parameters start with an `@` and are not surrounded by quotes. All parameters are passed to the database as a string which means you might have to convert to a different type. This query could be rewritten with parameters as,

```sql
SELECT eventName, COUNT(*) cnt FROM runreveal_logs
WHERE actor['email'] = @email
AND eventTime > subtractHours(now(), toInt32(@hour))
GROUP BY eventName ORDER BY cnt desc
```

{% hint style="info" %}
Note the cast `toInt32` for the parameter `@hour`. This is because the parameters passed to Clickhouse are strings, while sometimes you may need to use a different type when running a query. Refer to the Clickhouse [Type Conversion](https://clickhouse.com/docs/en/sql-reference/functions/type-conversion-functions) documents for functions related to converting.
{% endhint %}

The query now has two parameters that can be passed to it when run. Assuming we gave this query the name `events` we could run it by passing the `--param` flag and a name value pair. To run this query with the saved name `events` execute,

{% code fullWidth="true" %}
```bash
$ runreveal logs --name events --param email=mallory@runreveal.com --param hour=1
```
{% endcode %}

Below are more examples of queries and the parameters needed to run them.

***

This is an example of how to search a field given a list of values.

```sql
SELECT eventName, COUNT(*) cnt FROM runreveal_logs
WHERE actor['email'] IN splitByChar(',', @emails)
AND eventTime > subtractHours(now(), 15)
GROUP BY eventName ORDER BY cnt desc
```

{% code fullWidth="true" %}
```bash
$ runreveal logs --name query --param emails=user1@example.com,user2@example.com
```
{% endcode %}

***

This example shows how to search using a date.

```sql
SELECT eventName, COUNT(*) cnt FROM runreveal_logs
WHERE eventTime BETWEEN @from AND @to
GROUP BY eventName ORDER BY cnt desc
```

{% code fullWidth="true" %}
```bash
$ runreveal logs --name query --param from="2023-07-01 00:00:00" --param to="2023-07-03 00:00:00"
```
{% endcode %}

***

The query shows how to dynamically check a boolean field. Booleans can be passed as 0 or 1 where 0=FALSE and 1=TRUE

```sql
SELECT COUNT(*) cnt FROM runreveal_logs WHERE readOnly = @ro
```

{% code fullWidth="true" %}
```
$ runreveal logs --name query --param ro=0
```
{% endcode %}
