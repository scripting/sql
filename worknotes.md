#### 7/12/22 by DW -- 0.4.15

Add a third callback param to runSqltext and queueQuery -- fields, which corresponds to the same value in the system routine.

Needed this because I need to <a href="https://github.com/mysqljs/mysql#getting-the-id-of-an-inserted-row">get the id</a> of an inserted row. 

Update: Turns out I didn't need the fields object to get the id, it's in result.insertId. 

But it might become useful, so I left it in.

