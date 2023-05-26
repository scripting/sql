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

