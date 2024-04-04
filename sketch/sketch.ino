int relay = 9;

void setup() {
  pinMode(relay, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  if (Serial.available()) {
    char input = (char)Serial.read();
    if (input == '0') {
      input = '9';
      digitalWrite(relay, LOW);
    } else if (input == '1') {
      input = '9';
      digitalWrite(relay, HIGH);
    }
    delay(500);
  }
}
