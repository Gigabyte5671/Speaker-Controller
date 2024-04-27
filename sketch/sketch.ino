int relay = 9;
int missedHeartbeats = 0;
int maxMissedHeartbeats = 20;

void setup() {
  pinMode(relay, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  missedHeartbeats++;
  if (Serial.available()) {
    char input = (char)Serial.read();
    if (input == '0') {
      digitalWrite(relay, LOW);
    } else if (input == '1') {
      digitalWrite(relay, HIGH);
    } else if (input == '2') {
      missedHeartbeats = 0;
    }
    input = ' ';
  }
  if (missedHeartbeats > maxMissedHeartbeats) {
    digitalWrite(relay, LOW);
  }
  delay(250);
}
