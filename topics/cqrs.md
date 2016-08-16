## Command query responsibility segregation (CQRS)

CQRS separates the responsibility of handling queries from the responsibility of handling commands.  

MOVE THIS TO ANOTHER SECTION
## Definitions of terms

- Database
- Query Service
- Command Service
- API
- Consumer

Both the Query Service and the Command Service have a separate API.  A Service could be fronted with multiple different APIs hosted on different endpoints.

## Separate handlers in the same process with a single database

The command service contains the logic to update the database in a consistent manner.  The query service contains the logic in order to read the database and return the data in the relevant shape.

![](images/cqrs-no-message-bus.png)

## Separate processes with a single database

A modification to the above pattern is using a different process for the Query Service and the Command Service.  This separation could be done for performance reasons in that you query service could have different throughput requirements than your command service.   With this approach you could scale the two different services independently to match the required throughput for each.  This assumes that you have a suitable setup for your database so that you do not end up with unbalanced resources and overload the database itself.

![](images/cqrs-no-message-bus-separate-processes.png)

## Separate processes with a database cluster with read replicas

One variation of this setup is when the database supports clustering and you can ensure your query service instances connect to read only replicates where your command service will be writing to the master database.  This is a common depoyment scenario for many different types of databases and relies on the database itself replicating the data from master to the replicas.

![](images/cqrs-no-message-bus-read-replicas.png)

All of the examples so far need to use the same database technology and the Query Service needs to contain the relevant logic to satisfy the different queries which it will handle.

The complexity of the query logic will differ greatly and depend on the complexity, construction and technology of the database which it will read from.

> Example:
>
> In a previous company I worked for there was a monolithic MSSQL database which was so coupled it ...  Talk about the horror of what a search query would have to go through

> Example:
>
> May be give an example of how a column store could give rise to query performance but not be so great for a write store.


## Separate processes with a separate database for the QueryStore and Write Store

In this setup an Event Broker is introduced so that when the Command Service processes and command and updates the write store, one or more events can be published which reflect the changes and allows subscribers to be notified of these changes.  One of the subscribers to these events would be the Query Service which would process the events and update the Read store with a read optimized structure of the data in the event.  With this example the same event will be stored in a write optimized version inside the read store and in a read optimized view in the read store.

The same technology could be used for the read and write stores or different technologies could be selected which allow for further optimizations either in the READ or the WRITE context.  For example the Write store may choose a relational database which is ACID compliant so that it can maintain data consistency where as the read store may choose a document store and creae documents which contain information from many different events inside a single document.

The owness is on the Query Service here to transform the data on write and update the read store so that there are no service transformations required on read, making the reads quicker and less expensive on CPU etc...

```
+-----------------------+
| Databases             |   +----------------------------------+
|   +---------------+   |   | Process                          |
|   |Query Store    |   |   |   +-----------------+ +-----+    |
|   |               |   |   |   |                 | |     |    |
|   |  Reads Data   | <--------->  Query Service  | | API | <---------+
|   |               |   |   |   |                 | |     |    |      |
|   |  Updates Data | <------------------^--------+ +-----+    |      |
|   |               |   |   +----------------------------------+      |
|   |               |   |                | Subscribes to Change Event |
|   |               |   |   +----------------------------------+      |
|   +---------------+   |   | Process    |                     |      |  -------------+
|                       |   |   +--------+-----------------+   |      |  |            |
|                       |   |   |                          |   |      +--+  CONSUMER  |
|   +---------------+   |   |   |       Event Broker       |   |      |  |            |
|   |Write Store    |   |   |   |                          |   |      |  +------------+
|   |               |   |   |   +--------^-----------------+   |      |
|   |               |   |   +----------------------------------+      |
|   |               |   |                | Publishes Change Event     |
|   |               |   |   +----------------------------------+      |
|   |               |   |   | Process    |                     |      |
|   |               |   |   |   +--------+--------+ +-----+    |      |
|   |               |   |   |   |                 | |     |    |      |
|   |               | <---------+ Command Service | | API | <---------+
|   +---------------+   |   |   |                 | |     |    |
|                       |   |   +-----------------+ +-----+    |
+-----------------------+   +----------------------------------+
```

The application architecture will determine the structure of the write store e.g.  
- Using Active Record then a relational data strore would fit well
- Using Event Sourcing then an Event Store would fit which could take the form of flat files, key/value store etc...


This is only related to the segregation of the responsibilities it does not have any bearing on the architecture of the query or the command service only that they are separate.
