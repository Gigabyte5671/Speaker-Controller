# Speaker Controller
Automatically turns my desk speakers on/off when I change the audio output in Windows.


## Circuit Diagram
This is a rough diagram of the circuit I'm using to control the speakers:
![full circuit diagram](./images/circuit-1.svg)

In reality, all of the discreet components are part of [this board](https://www.jaycar.co.nz/arduino-compatible-5v-relay/p/XC4419), and connected to the Arduino like so:
![simple circuit diagram](./images/circuit-2.svg)


## Models
The [`models`](./models) directory contains some housing models that fit with [my particular power bar](https://www.kmart.co.nz/product/arlec-4-outlet-surge-protected-powerboard-42153580/).

You can also find the model source on OnShape [here](https://cad.onshape.com/documents/b996f80e98ba7dbd92c3a90e/w/50b2495923acaf03b7d63635/e/e429f6e0665596681b5c2419?renderMode=0&uiState=6615ad4f92329a0588dcb680).
