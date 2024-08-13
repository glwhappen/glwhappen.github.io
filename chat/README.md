用node red 搭建的后台，非常简单

```json
[{"id":"231ffac1bcc55890","type":"websocket in","z":"69058845e3bf8b4d","name":"","server":"aeee53cf5d098699","client":"","x":1310,"y":180,"wires":[["78f9b70f2b0107a4"]]},{"id":"78f9b70f2b0107a4","type":"websocket out","z":"69058845e3bf8b4d","name":"","server":"aeee53cf5d098699","client":"","x":1510,"y":180,"wires":[]},{"id":"aeee53cf5d098699","type":"websocket-listener","path":"/ws/chat","wholemsg":"false"}]
```