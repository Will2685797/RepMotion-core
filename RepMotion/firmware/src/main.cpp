#include <Arduino.h>

/*setup est une fonction executé une seule fois au démarrage.*/
void setup()
{
    Serial.begin(115200);
    delay(1000);

    Serial.println("RepMotion firmware boot");
    Serial.println("ESP32 ready");
}

void loop()
{
    Serial.println("RepMotion heartbeat");
    delay(1000);
}