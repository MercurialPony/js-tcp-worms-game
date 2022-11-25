# Project goal
Develop a custom protocol on top of TCP/IP and a client-server game using said protocol.
# Tech stack 
* Node.JS
* Electron.JS
* HTML, CSS
# Structure
* `app/` - client application
* `server/` - server application
# Protocol description
**Internet protocol used: TCP/IP.**  
Messages are sent and received in form of byte streams.
The first byte of every message must contain one byte denoting the message ID
which tells the receiving side how to handle the incoming message,
and two bytes containing the payload length.
The rest of the byte stream should contain the payload data itself.  

Example:
![Protocol Scheme](https://i.imgur.com/nMNnkSc.jpeg)

Data sent from the client must conform to one
of the following message templates:
![Client: Message Templates](https://i.imgur.com/RT4aF69.png)

Data sent from the server must conform to one
of the following message templates:
![Server: Message Templates](https://i.imgur.com/lkq1zsH.png)