---
title: Index-Only Scans and Visibility Maps Demystified
author: Sreekumar T
keywords: SQL, postgres, vacuum, index-only-scan, visibility-map, page, row, rowid, heap, ctid, postgres, transaction, tuples, query-plan,table, heap-fetches
---

# Index-Only Scans and Visibility Maps Demystified

While analyzing the SQL query which uses an index only scan, we would have noticed something called Heap Fetches mentioned in the plan node.  
This might be 0 or may have some whole number value to it.

Have you wondered what these Heap fetches mean and when this value is a non-zero number and when it is not?  

A heap is a datastructure which contains all the pages of the table (relation).
Each relation has a heap area of its own.  

These heap fetches are nothing but the total number of pages that are read from the heap area of the table.
Heap fetches involves disk I/O most of the time.

From earlier topic on 
<a href="https://glegshot.github.io/programmingdiaries/post/?note=postgres/pg1"> vacuum process on heap, we had discussed the ctid and pages and tuples</a>

Each row in the table have a ```ctid``` (row id) assigned to it, which points to the page and offset of the tuple in the heap.  

The ```ctid``` of these rows will be present in the index as well which will be traversed and picked from the index.  
If the  query is only fetching fields present in the index key ,it doesn't have to scan the heap for the fields selected and returns the value present in the index.  
Hence the name Index-only scan.  

Say, a record is updated or deleted or a new record is inserted, the page state will be changed.  
It's possible that the index is not updated with the latest value and can contain dead tuple which are no longer visible or the index tuple entry match might be not yet visible to current transaction as it is modified by another transaction.


To make sure the data which we fetch is consistent and visible, we need to scan the heap area and verify the data is visible to the transaction.   
This explains the Head Fetches value which indicates the total number of pages read from the disk for reverifying the matches in the index.

Let's have a hands on demo on this.  
We'll start by creating a sample data set with an index as well.


```
CREATE TABLE test_values(id bigint, value text);  

INSERT INTO test_values(id, value)   
SELECT a.id, 'Value '||id FROM generate_series(1,500) AS a(id);  

CREATE INDEX idx_id_value ON test_values(id,value);  

VACUUM test_values;  
```

We'll fetch a particular row and generate the execution plan as well  

```
EXPLAIN (ANALYZE)  
SELECT id FROM test_values WHERE id = 499;  

Plan:  
Index Only Scan using idx_id_value on test_values  (cost=0.27..4.29 rows=1 width=8) (actual time=0.060..0.061 rows=1 loops=1)  
  Index Cond: (id = 499)  
  Heap Fetches: 0  
Planning Time: 0.170 ms  
Execution Time: 0.076 ms  
```

Here as we can see the Heap Fetches is 0 even though rows = 1,this means that we are fetching row from index only without looking up the heap.  

But why didn't it fetch from heap?  

To explain that we need to know about the visiblity map of a table.  

Every table heap has a visiblity_map associated with it which contains the block no and two bits per row.  

We will use the pg_visibility module to inspect the visibility map.  


```
CREATE EXTENSION pg_visibility;  
SELECT * FROM pg_visibility_map('test_values');
```

| blkno        | all_visible          | all_frozen       |
| ------------ | -------------------- | ---------------- |
| 0            | true                 | false            |
| 1            | true                 | false            |
| 2            | true                 | false            |
| 3            | true                 | false            |


```blkno``` indicates the page number of the heap.  
```all_visible``` bit indicates all the tuples in the page is visible to all current and future transactions.  
```all_frozen``` bit in the visibility map indicates that every tuple in the page is frozen, i.e the page tuple space is compacted and no vacuum will be needed to modify the page until a new  tuple is inserted, updated, deleted, or locked on that page.  

Observe that the all_visible is set for all the pages.

The ```all_visible``` field is set only by vacuum and auto vacuum process, any other operation on the page such as insert, delete,update etc. will unset the bit indicating there are possible state change and hence need to be scanned to be sure the tuples are visible.

Once vacuum is done the all_visible flag is set to true and heap fetch will be 0 until the page is modified again.

So when say we execute the query for id = 499,  
the process looks up the visiblility_map and finds that the page is having ```all_visible``` bit set and it skips heap lookup for the index tuple match.

This is an important feature in postgres which helps to reduce significant I/O incurred for index operation which are heavy on random access I/O for huge result set.

We'll insert a new record and unset the all_visible bit for a page.

```
INSERT INTO test_values(id, values)  
VALUES(2001,'Value 2000');

SELECT * FROM pg_visibility_map('test_values');
```

| blkno        | all_visible          | all_frozen       |
| ------------ | -------------------- | ---------------- |
| 0            | true                 | false            |
| 1            | true                 | false            |
| 2            | true                 | false            |
| 3            | false                | false            |

The ```all_visible``` bit is unset for ```blkno``` 3,  
Inspecting the new inserted record ctid shows that it belongs to the page 3 as well hence explaining the particular page bit unset for all_visible flag.  

```
SELECT ctid,* FROM test_values WHERE id = 499;
```

| ctid         | id            | value         |
| ------------ | ------------- | ------------- |
| (3,27)       | 499           | Value 499     |

We will generate the plan once again and observe the execution plan.

```
EXPLAIN (ANALYZE)  
SELECT id FROM test_values WHERE id = 499;  

Plan:  

Index Only Scan using idx_id_value on test_values  (cost=0.27..4.29 rows=1 width=17) (actual time=0.026..0.026 rows=1 loops=1)  
  Index Cond: (id = 499)  
  Heap Fetches: 1  
Planning Time: 0.060 ms  
Execution Time: 0.038 ms  
```

With the bit for ```all_visible``` unset, the the Heap Fetches is 1 as the tuple found in index is present in the page 3 which has all_visible unset.

So that was about the heap fetches and visiblity map for index only scan.  
Hope you got some valuable insights from on visiblity map and it's utilization for index only scan.

You guy's are amazing and keep learning and keep growing.





