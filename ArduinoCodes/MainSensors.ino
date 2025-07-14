#include <WiFi.h>
#include <WebServer.h>
#include <LiquidCrystal_I2C.h>

const char* ssid = "**";
const char* password = "**";
int lcdColumns = 16;
int lcdRows = 2;
LiquidCrystal_I2C lcd(0x27, lcdColumns, lcdRows); 

// יצירת שרת מאזין על פורט 80
WebServer server(80);

// פינים לבקרת מנעול וצפצפה
const int buzzerPin = 15; 
// #define RELAY_PIN 23
int red =35;
int green =32;
int blue =34;

void handleAccess() {
  // קריאה של הפרמטרים
  String recognizedParam = server.hasArg("is_recognized") ? server.arg("is_recognized") : "0";
  String adminParam = server.hasArg("is_admin") ? server.arg("is_admin") : "0";

  int isRecognized = recognizedParam.toInt();
  int isAdmin = adminParam.toInt();

  Serial.printf("Received: is_recognized=%d, is_admin=%d\n", isRecognized, isAdmin);


  if (isRecognized) {
    // מזוהה – פתח מנעול
    Serial.println("Lock opened");
    lcd.setCursor(0, 0);
    lcd.print("open!");
    digitalWrite(green, HIGH);
    // digitalWrite(RELAY_PIN, HIGH); // פתיחת מנעול
    delay(5000);
    // digitalWrite(RELAY_PIN, LOW);  // סגירת מנעול
    lcd.setCursor(0, 0);
    lcd.print("closed");
    digitalWrite(green, LOW);
    digitalWrite(blue, HIGH);


  } else {
    // לא מזוהה
    digitalWrite(buzzerPin, HIGH);
    digitalWrite(red, HIGH);
    lcd.setCursor(0,0);
    lcd.print("undetected");
    digitalWrite(buzzerPin, LOW);
    digitalWrite(red, LOW);  
    lcd.setCursor(0,0);
    lcd.print("closed");
  }

  server.send(200, "text/plain", "ESP received access command");
}

void setup() {
  Serial.begin(115200);
  // התחברות לרשת
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi!");
  Serial.print("ESP IP Address: ");
  Serial.println(WiFi.localIP());
  delay(500);
  //lcd
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0,0);
  lcd.print("closed");
  //led
  pinMode(red, OUTPUT);
  pinMode(green, OUTPUT);
  pinMode(blue, OUTPUT);
  // meantime blue , open- green, undetected- red
  digitalWrite(blue, HIGH);
 
  //locker
  // pinMode(RELAY_PIN, OUTPUT);
  // digitalWrite(RELAY_PIN, LOW); 
  //buzzer
  pinMode(buzzerPin, OUTPUT);



  lcd.setCursor(0, 0);
  lcd.print(WiFi.localIP());
  delay(1000);

  lcd.print("closed");
  // רישום הנתיב /access
  server.on("/access", handleAccess);

  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
  server.handleClient();
}
