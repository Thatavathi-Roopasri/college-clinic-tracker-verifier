# Configuration Guide - Multi-Portal Clinic Tracker

## 🚀 Setup & Configuration

### Prerequisites
- Java 21 or higher
- Maven 3.8.9 or higher
- MongoDB 4.4+ or MongoDB Atlas
- Git (for version control)

---

## 📋 Step-by-Step Setup

### 1. Environment Variables Setup

Create a `.env` file in the project root or set environment variables:

```bash
# MongoDB Connection
export MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/clinicdb?retryWrites=true&w=majority

# Server Configuration (optional)
export SERVER_PORT=8080
export SERVER_CONTEXT_PATH=/api
export SPRING_PROFILES_ACTIVE=production
```

**For Windows PowerShell:**
```powershell
$env:MONGO_URI='mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/clinicdb?retryWrites=true&w=majority'
$env:SERVER_PORT='8080'
```

---

### 2. Application Properties Configuration

Edit `src/main/resources/application.properties`:

```properties
# Server Configuration
server.port=8080
server.servlet.context-path=/api

# MongoDB Configuration
spring.data.mongodb.uri=${MONGO_URI:mongodb://localhost:27017/clinicdb}
spring.data.mongodb.auto-index-creation=true

# Logging Configuration
logging.level.root=INFO
logging.level.com.example.clinicserver=DEBUG
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} - %msg%n

# Jackson Configuration
spring.jackson.serialization.write-dates-as-timestamps=false
spring.jackson.time-zone=UTC

# Actuator (optional for monitoring)
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=when-authorized
```

---

### 3. MongoDB Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB (Windows)
choco install mongodb-community

# Start MongoDB service
net start MongoDB

# Connect to MongoDB
mongo mongodb://localhost:27017/clinicdb
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create new cluster
4. Get connection string
5. Update `MONGO_URI` environment variable

---

### 4. Build Configuration

Edit `pom.xml` if needed:

```xml
<!-- Build Properties -->
<properties>
  <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  <java.version>21</java.version>
  <maven.compiler.source>21</maven.compiler.source>
  <maven.compiler.target>21</maven.compiler.target>
</properties>
```

---

## 🔧 Build & Run

### Build the Project
```bash
cd server-java
mvn clean install
```

### Run the Application
```bash
# Option 1: Run JAR file
java -jar target/clinic-server-0.0.1-SNAPSHOT.jar

# Option 2: Run with Maven
mvn spring-boot:run

# Option 3: Run with custom port
java -Dserver.port=9090 -jar target/clinic-server-0.0.1-SNAPSHOT.jar

# Option 4: Run with environment variables
java -Dspring.data.mongodb.uri=mongodb://localhost:27017/clinicdb \
     -jar target/clinic-server-0.0.1-SNAPSHOT.jar
```

### Verify Server is Running
```bash
# Test basic endpoint
curl http://localhost:8080/api/portals

# Should return: []  (empty array, indicating server is running)
```

---

## 🗄️ MongoDB Collection Initialization

Run these commands to create indexes for optimal performance:

```javascript
// Connect to MongoDB
mongo mongodb+srv://username:password@cluster.mongodb.net/clinicdb

// Use clinicdb database
use clinicdb;

// ===== PORTALS COLLECTION =====
db.portals.createIndex({ "name": 1 }, { unique: true });
db.portals.createIndex({ "portalType": 1 });
db.portals.createIndex({ "active": 1 });
db.portals.createIndex({ "sectionIds": 1 });
db.portals.createIndex({ "userIds": 1 });
db.portals.createIndex({ "createdAt": 1 });

// ===== GATEPASSES COLLECTION =====
db.gatepasses.createIndex({ "passNumber": 1 }, { unique: true });
db.gatepasses.createIndex({ "userId": 1 });
db.gatepasses.createIndex({ "portalId": 1 });
db.gatepasses.createIndex({ "sectionId": 1 });
db.gatepasses.createIndex({ "status": 1 });
db.gatepasses.createIndex({ "expiresAt": 1 });
db.gatepasses.createIndex({ "userId": 1, "portalId": 1 });
db.gatepasses.createIndex({ "userId": 1, "status": 1 });
db.gatepasses.createIndex({ "issuedAt": 1 });

// ===== LETTERS COLLECTION =====
db.letters.createIndex({ "letterNumber": 1 }, { unique: true });
db.letters.createIndex({ "userId": 1 });
db.letters.createIndex({ "portalId": 1 });
db.letters.createIndex({ "sectionId": 1 });
db.letters.createIndex({ "status": 1 });
db.letters.createIndex({ "letterType": 1 });
db.letters.createIndex({ "expiresAt": 1 });
db.letters.createIndex({ "userId": 1, "portalId": 1 });
db.letters.createIndex({ "userId": 1, "status": 1 });
db.letters.createIndex({ "issuerUserId": 1 });
db.letters.createIndex({ "approverUserId": 1 });
db.letters.createIndex({ "issuedAt": 1 });

// Verify indexes
db.portals.getIndexes();
db.gatepasses.getIndexes();
db.letters.getIndexes();
```

---

## 🔐 Security Configuration

### CORS Configuration

Update `CorsConfig.java`:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000", "http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### Environment-Specific Configuration

Create `application-dev.properties`:
```properties
spring.data.mongodb.uri=mongodb://localhost:27017/clinicdb
logging.level.root=DEBUG
```

Create `application-prod.properties`:
```properties
spring.data.mongodb.uri=${MONGO_URI}
logging.level.root=INFO
```

Run with profile:
```bash
java -Dspring.profiles.active=prod -jar target/clinic-server-0.0.1-SNAPSHOT.jar
```

---

## 📊 Database Maintenance

### Backup MongoDB Data
```bash
# Backup to local directory
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/clinicdb" \
          --out=/path/to/backup

# Backup specific collection
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/clinicdb" \
          --collection=gatepasses \
          --out=/path/to/backup
```

### Restore MongoDB Data
```bash
# Restore from backup
mongorestore --uri="mongodb+srv://username:password@cluster.mongodb.net/clinicdb" \
             /path/to/backup

# Restore specific collection
mongorestore --uri="mongodb+srv://username:password@cluster.mongodb.net/clinicdb" \
             --collection=gatepasses \
             /path/to/backup/clinicdb/gatepasses.bson
```

### Database Cleanup

```javascript
// Remove expired gate passes
db.gatepasses.deleteMany({ "status": "expired", "expiresAt": { $lt: new Date() } });

// Remove expired letters
db.letters.deleteMany({ "status": "expired", "expiresAt": { $lt: new Date() } });

// Remove inactive portals
db.portals.deleteMany({ "active": false });

// Archive old data (e.g., data older than 6 months)
db.gatepasses.deleteMany({ "issuedAt": { $lt: new Date(new Date().getTime() - 180*24*60*60*1000) } });
```

---

## 🔍 Monitoring & Logging

### Enable Debug Logging
```properties
logging.level.com.example.clinicserver=DEBUG
logging.level.org.springframework.data.mongodb=DEBUG
logging.level.org.springframework.security=DEBUG
```

### Log Configuration
```properties
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n
logging.file.name=logs/clinic-server.log
logging.file.max-size=10MB
logging.file.max-history=10
```

### Health Check Endpoint
```bash
curl http://localhost:8080/api/actuator/health
```

---

## 🚀 Docker Configuration (Optional)

### Create Dockerfile
```dockerfile
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

COPY target/clinic-server-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENV MONGO_URI=mongodb://mongodb:27017/clinicdb
ENV SERVER_PORT=8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Create docker-compose.yml
```yaml
version: '3.8'

services:
  clinic-server:
    build: .
    ports:
      - "8080:8080"
    environment:
      MONGO_URI: mongodb://mongodb:27017/clinicdb
      SERVER_PORT: 8080
    depends_on:
      - mongodb

  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: clinicdb

volumes:
  mongodb_data:
```

### Run with Docker
```bash
# Build images
docker-compose build

# Run services
docker-compose up -d

# View logs
docker-compose logs -f clinic-server

# Stop services
docker-compose down
```

---

## 📝 Deployment Checklist

- [ ] Java 21 installed
- [ ] Maven installed and configured
- [ ] MongoDB connection verified
- [ ] Environment variables set
- [ ] Application properties configured
- [ ] Indexes created in MongoDB
- [ ] CORS configured for frontend URLs
- [ ] Build completes successfully
- [ ] Server starts without errors
- [ ] API endpoints respond correctly
- [ ] Database queries are optimized
- [ ] Logging is configured
- [ ] Backup strategy in place

---

## 🆘 Common Issues & Solutions

### Issue: "MongoDB connection timeout"
**Solution:**
- Verify MONGO_URI is correct
- Check MongoDB is running
- Check firewall allows MongoDB port
- Check network connectivity

### Issue: "Port 8080 already in use"
**Solution:**
```bash
# Find process using port
netstat -ano | findstr :8080

# Kill process
taskkill /PID <PID> /F

# Or use different port
java -Dserver.port=9090 -jar app.jar
```

### Issue: "Spring Boot fails to start"
**Solution:**
- Check Java version: `java -version` (should be 21+)
- Check Maven version: `mvn -version`
- Clear Maven cache: `mvn clean`
- Check application.properties syntax

### Issue: "Authentication failed for MongoDB"
**Solution:**
- Verify username and password
- Check if @ symbol is URL-encoded
- Verify database name is correct
- Check whitelist IP in MongoDB Atlas

---

## 📞 Support & Resources

- Spring Boot: https://spring.io/projects/spring-boot
- MongoDB: https://docs.mongodb.com/
- Maven: https://maven.apache.org/
- Java 21: https://openjdk.org/

---

**Configuration Complete! Your multi-portal clinic tracker is ready for deployment.**
