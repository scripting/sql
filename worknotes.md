#### 6/27/24 by DW

There was breakage in transition from mysql to mysql2. Apparently when you have a value of type JSON in a cell, when a query returns that value, it is parsed when you receive it. In mysql it came back as a string. This was a breaking change and should have been flagged in red somewhere so you didn't have to find out about it 3 months later with deeply buried bugs. Luckily they provide a flag to turn this bug off. 

Look in `start` for the change. 

#### 4/12/24 by DW

Added a dependency for <a href="https://www.npmjs.com/package/mysql2">mysql2</a>.

Instead of initializing mysql at the top, we do it after we are started.

The caller can choose to use mysql2 by passing as an option, flUseMySql2, set true.

I tested it on one of my test FeedLand servers and it appears to work. 

#### 5/26/23 by DW

Escape single quotes in JSON objects. 

#### 5/25/23 by DW

When encoding an object that is not a date type, jsonStringify it. 

#### 1/9/23 by DW

New config option -- config.flQueueAllRequests, default false.

If true, all runSqltext requests go through queueQuery, so in theory we should never go over the connection limit.

When running a query now, if running the query now would exceed the capacity of the connection pool, add it to the queue and leave.

#### 1/8/23 by DW

Support for a new option to log queries, flLogQueries. 

#### 7/12/22 by DW -- 0.4.15

Add a third callback param to runSqltext and queueQuery -- fields, which corresponds to the same value in the system routine.

Needed this because I need to <a href="https://github.com/mysqljs/mysql#getting-the-id-of-an-inserted-row">get the id</a> of an inserted row. 

Update: Turns out I didn't need the fields object to get the id, it's in result.insertId. 

But it might become useful, so I left it in.

