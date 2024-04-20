---
title: Unveiling Vacuum Process Impact on Heap Space
author: Sreekumar T
keywords: SQL, postgres, vacuum, vacuum-full, lock, page, row, rowid, heap, ctid, postgres, transaction, tuples, visibility-map,auto-vacuum, garbage-collection, table
---

# Unveiling Vacuum Process Impact on Heap Space

While working on SQL, everyone would have heard about the vacuum process which is responsible mainly for the dead tuples (rows) tuples cleanup (garbage collection).

You might have also heard about different terms such as vacuum, vacuum full and auto-vacuum terms too in postgres.  
The vacuum process, apart from cleaning dead tuples ,performs various other activities as such such as setting visibility map,
cleaning up unused transactions etc.

Today ,we will have a demo on the effect of vacuum and vacuum full on the garbage collection process.  
Before jumping on to the topic,let's have some basic terminologies of database cleared up as a prerequisite.

1. Page  
In database, the data is stored as a consecutive byte blocks with a fixed size.  
Each of these block is called a page.Data is always read and written in these pages.  
In postgres, the default size is 8KB. 

2. Row  
A row is a data record within a table (relation).  
The rows are stored inside pages.  
Each page can have one more more rows prsent in it.  

3. RowID  
RowId a.k.a ```ctid``` in postgres, is an internal system maintained address provided to each row in a table.  
The ```ctid``` contains pair of two numeric values.  
First value indicates the page number and the secondary value indicates the tuple number within the page.  
The ```ctid``` value is sequential in nature. 

4. Heap  
Heap is a datastructure which contains all the pages of the table (relation).  
Each relation has a heap area of its own.

With these terminologies cleared up, let's start off with the topic.  

We can straightaway inspect the statistics of the number of active, dead tuples ,times vacuum and analyze process triggered on the table using the view ```pg_stat_all_tables```.  
However, we would be today focusing on a different approach to inspect the effect of vacuum on table.  


In postgres, whenever a data modification query (DELETE, UPDATE) is executed on a table, the existing tuple which is affected is marked for deletion (soft deleted) and a new record is inserted with updated value as applicable.

These dead tuples will be removed from the table when either vacuum is executed manually or via the automated process auto-vacuum.

Let's create a sample data first before proceeding ahead with demonstration.

```
CREATE TABLE test_data(id bigint, value text);  
INSERT INTO test_data(id, value)  
SELECT id, 'Value '|| id FROM generate_series(0,5) AS series(id);
```

Let's inspect the ```ctid``` values of the records

```
SELECT ctid, id, value FROM test_data;
```

| ctid        | id          | Value       |
| ----------- | ----------- | ----------- |
| (0,1)       | 1           | Value 1     |
| (0,2)       | 2           | Value 2     |
| (0,3)       | 3           | Value 3     |
| (0,4)       | 4           | Value 4     |
| (0,5)       | 5           | Value 5     |

Here the ```ctid (0,1)``` indicates the row with id = 1 is stored in page 0 and is tuple 1.

Now let's delete the record with id = 2 and observe the changes.

```
DELETE FROM test_data WHERE id = 2;  
SELECT ctid, id, value FROM test_data;
```

| ctid        | id          | Value       |
| ----------- | ----------- | ----------- |
| (0,1)       | 1           | Value 1     |
| (0,3)       | 3           | Value 3     |
| (0,4)       | 4           | Value 4     |
| (0,5)       | 5           | Value 5     |


The record is deleted and (0,2) tuple is not visible anymore.  
Now what happens to the tuple space for (0,2).

Let's check the ```pg_stat_all_tables``` for the record statistics on active and dead tuples.

```
SELECT relname, n_tup_ins, n_tup_upd, n_dead_tup, n_tup_del, vacuum_count,autovacuum_count
FROM pg_catalog.pg_stat_all_tables WHERE relname = 'test_data';
```

| relname     | n\_tup\_ins   | n\_tup\_upd   | n\_dead\_tup  | n\_tup\_del   | vacuum_count| autovacuum_count |
| ----------- | ----------- | ----------- | -----------       | -----------   | ----------- | ---------------- |
| test_data   | 5           | 0           | 1                 | 1             | 0           | 0                |


n_tup_ins has 5 tuples inserted in total.  
n_tup_upd indicates 0 record is updated.  
n_dead_tup indicates there is one dead tuple in the table.  
n_tup_del is 1 indicating 1 records have been deleted recently.  
vacuum_count,autovacuum_count  indicates how many times the vacuum or auto-vacuum has been executed.  

Now, let's insert a new record and observe the table for data.


```
INSERT INTO test_data(id, value)  
VALUES(6,'Value 6');  

SELECT ctid, id, value FROM test_data; 
```


| ctid        | id          | Value       |
| ----------- | ----------- | ----------- |
| (0,1)       | 1           | Value 1     |
| (0,3)       | 3           | Value 3     |
| (0,4)       | 4           | Value 4     |
| (0,5)       | 5           | Value 5     |
| (0,6)       | 6           | Value 6     |

We can see the new record is inserted at (0,6).  

Lets go ahead and  execute vacuum to clean up the dead tuples from the table.


```
VACUUM test_data;  

SELECT relname, n_tup_ins, n_tup_upd, n_dead_tup, n_tup_del, vacuum_count, autovacuum_count  
FROM pg_catalog.pg_stat_all_tables WHERE relname = 'test_data';
```

| relname     | n\_tup\_ins   | n\_tup\_upd   | n\_dead\_tup  | n\_tup\_del   | vacuum_count| autovacuum_count |
| ----------- | ----------- | ----------- | -----------       | -----------   | ----------- | ---------------- |
| test_data   | 6           | 0           | 0                 | 1             | 1           | 0                |

Notice that the vaccum_count is now 1 since we executed it once.  
Also n_dead_tup is 0 now.  

Let's inspect the test_data.

```
SELECT ctid, id, value FROM test_data;
```


| ctid        | id          | Value       |
| ----------- | ----------- | ----------- |
| (0,1)       | 1           | Value 1     |
| (0,3)       | 3           | Value 3     |
| (0,4)       | 4           | Value 4     |
| (0,5)       | 5           | Value 5     |
| (0,6)       | 6           | Value 6     |

No changes visible in ```ctid``` ,even though the dead tuple is cleared (0,2) is still missing.

The new record is inserted at (0,6), this means the (0,2) is not being utilized and is wasted space.

Lets try another insert and inspect the table to see what happens post the vaccum.


```
INSERT INTO test_data(id, value)  
VALUES(7,'Value 7');  
SELECT ctid, id, value FROM test_data; 
```


| ctid        | id          | Value       |
| ----------- | ----------- | ----------- |
| (0,1)       | 1           | Value 1     |
| (0,2)       | 7           | Value 7     |
| (0,3)       | 3           | Value 3     |
| (0,4)       | 4           | Value 4     |
| (0,5)       | 5           | Value 5     |
| (0,6)       | 6           | Value 6     |


Reading the table test_data we find that the new record is inserted at ```ctid(0,2)```.

As per postgres documentation,  
```
The standard form of VACUUM removes dead row versions in tables and indexes and marks the space available for future reuse.  
However, it will not return the space to the operating system  
The standard form of VACUUM can run in parallel with production database operations.  
(Commands such as SELECT, INSERT, UPDATE, and DELETE will continue to function normally, though you will not be able to modify 
the definition of a table with commands such as ALTER TABLE while it is being vacuumed.)
```


Now let's see how does VACUUM FULL is different with reclaiming space.  

Let's delete a record first.  


```
DELETE FROM test_data  
WHERE id = 3;
SELECT ctid, id, value FROM test_data; 
```

| ctid        | id          | Value       |
| ----------- | ----------- | ----------- |
| (0,1)       | 1           | Value 1     |
| (0,2)       | 7           | Value 7     |
| (0,4)       | 4           | Value 4     |
| (0,5)       | 5           | Value 5     |
| (0,6)       | 6           | Value 6     |


Let's execute the VACUUM FULL record and inspect the tuples post full vacuum.

```
VACUUM FULL test_data;
```

| ctid        | id          | Value       |
| ----------- | ----------- | ----------- |
| (0,1)       | 1           | Value 1     |
| (0,2)       | 7           | Value 7     |
| (0,3)       | 4           | Value 4     |
| (0,4)       | 5           | Value 5     |
| (0,5)       | 6           | Value 6     |

We can see the ```citd``` have been reset and is sequential in order now, the free storage is now compacted and size is reduced.  

As per postgres documentation,  
```
VACUUM FULL actively compacts tables by writing a complete new version of the table file with no dead space.  
This minimizes the size of the table, but can take a long time.  
It also requires extra disk space for the new copy of the table, until the operation completes.  
VACUUM FULL requires an ACCESS EXCLUSIVE lock on the table it is working on,  
and therefore cannot be done in parallel with other use of the table.
```

So that's the difference between vacuum and vacuum full in cleaning up the dead tuple.  

Hope you got some useful insights into vacuum process in postgres.  
Thank you for reading and keep growing :)  