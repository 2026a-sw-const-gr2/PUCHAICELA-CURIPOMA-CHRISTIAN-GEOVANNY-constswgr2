# Taller Práctico: Desarmando Gigantes
## Ingeniería Inversa en la Práctica – Caso de Estudio: Spotify

**Carrera:** Ingeniería de Sistemas / Software  
**Materia:** Construcción y Evolución de Software  
**Capítulo 1:** Ingeniería inversa, mantenimiento y evolución  
**Tópico:** 1.1 ¿Qué es Ingeniería Inversa? Técnicas, herramientas y futuro.

---

### Fase 1: Calentamiento y Contextualización

Definiciones fundamentales aplicadas al ciclo de vida del desarrollo de software:

* **Ingeniería Inversa:** Consiste en partir del producto final (el sistema compilado o en producción) y analizarlo para extraer su diseño, arquitectura, flujos de datos y lógica de negocio, sin poseer el código fuente original. Representa la transición heurística del "qué hace" al "cómo está construido".
* **Mantenimiento de Software:** Abarca las modificaciones correctivas, adaptativas, perfectivas y preventivas. La ingeniería inversa es vital en este rubro, particularmente al interactuar con sistemas *legacy*, ya que permite comprender las dependencias subyacentes antes de inyectar modificaciones, mitigando el riesgo de fallos en cascada.
* **Evolución del Software:** Para evitar la obsolescencia, los sistemas deben migrar hacia arquitecturas modernas (ej. de monolitos a microservicios). La ingeniería inversa facilita la extracción de las reglas de negocio críticas del sistema heredado, garantizando una transición segura hacia nuevas tecnologías.

---

### Fase 2: Investigación Asistida por IA - "Antes, Ahora y Mañana"

**Resumen Ejecutivo de la Evolución Tecnológica:**

* **El Antes (Años 90 - Sistemas Legacy):** El análisis se limitaba a binarios y ejecutables locales. Se empleaban **desensambladores** (ej. IDA Pro) para traducir código máquina a lenguaje ensamblador, y **depuradores** (ej. OllyDbg) para inspeccionar el comportamiento en memoria. Era un procedimiento manual de muy bajo nivel.
* **El Ahora (Cloud, Microservicios y Ofuscación):** La lógica de negocio ha migrado hacia servidores distribuidos. Actualmente, se implementan técnicas de **API Sniffing** (ej. Burp Suite, Wireshark) para interceptar y analizar el tráfico HTTP/HTTPS. A nivel local, se aplican descompiladores de bytecode (ej. JADX) para mitigar arquitecturas con código altamente **ofuscado**.
* **El Mañana (Inteligencia Artificial):** Los Grandes Modelos de Lenguaje (LLMs) procesan código ensamblador o bytecode ofuscado, traduciéndolo a pseudocódigo de alto nivel. Adicionalmente, las redes neuronales automatizan el reconocimiento de patrones, detectando vulnerabilidades de forma masiva y autónoma.

---

### Fase 3: El Caso de Estudio - "Hacking Hipotético" a Spotify

**Objetivo de Análisis:** El algoritmo de recomendación y la sincronización en tiempo real (playlist "Descubrimiento Semanal" y transiciones de audio sin latencia).

**Estrategia y Técnicas de Ingeniería Inversa:**

1. **Caja Negra (Análisis de Comportamiento):** Aislamiento de una cuenta de prueba para registrar variaciones empíricas en las recomendaciones tras inyectar eventos específicos (saltos de pista, retroalimentación positiva).
2. **Análisis de Tráfico de Red (API Sniffing):** Configuración de un proxy MITM (Man-In-The-Middle) para interceptar los *payloads* JSON de telemetría, revelando los metadatos enviados al motor de Machine Learning.
3. **Ingeniería Inversa Local (Análisis de Almacenamiento):** Exploración de las bases de datos locales (SQLite) y la jerarquía de caché en un dispositivo con privilegios de superusuario para deducir los métodos de fragmentación y encriptación de audio *offline*.

**Arquitectura Hipotética Deducida:**

```plantuml
@startuml
!theme mars
skinparam componentStyle uml2

package "Cliente (App Spotify)" {
  [Interfaz de Usuario] as UI
  [Gestor de Caché Local\n(SQLite/Audio Encriptado)] as Cache
  [Motor de Reproducción] as Player
}

cloud "Infraestructura Cloud (Spotify Backend)" {
  [API Gateway] as Gateway
  
  package "Microservicios" {
    [Servicio de Autenticación] as Auth
    [Gestor de Streaming\n(Content Delivery Network)] as CDN
    [Recolector de Telemetría\n(User Events)] as Telemetry
  }
  
  package "IA & Datos" {
    [Motor de Recomendación\n(Machine Learning)] as ML
    database "Base de Datos\nUsuarios & Metadatos" as DB
  }
}

UI --> Gateway : Solicitudes HTTP/JSON
Player <--> Cache : Lee fragmentos locales
Cache <-- CDN : Descarga chunks de audio
Gateway --> Auth : Valida Token
Gateway --> Telemetry : Envía métricas (skips, likes)
Telemetry --> DB : Almacena comportamiento
ML --> DB : Analiza patrones
ML --> Gateway : Retorna "Descubrimiento Semanal"
@enduml