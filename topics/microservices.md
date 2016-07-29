# Microservices

Microservices is an architectural style for distributed systems.  Each service encapsulates everything required to satisy the context which it models. Each Microservice is its own consistency boundary from a data perspective, it must be consistent with the data it masters and eventually consistent with data it doesn't.  Access to any of the infrastructure a Microservice relies on must only be accessible by the Microservice itself.  All communication with Microservices should be done via an API which includes event subscriptions.  

A complimentary architecture to Microservices is a Hexaganol Architecture AKA Ports and Adapters AKA Onion Architecture (not the kind that makes you cry).  
- NOTES about helping to decouple from the infrastructure
- NOTES about separating the service from the API

Microservice must be able to be deployed independently of other microservices.  
