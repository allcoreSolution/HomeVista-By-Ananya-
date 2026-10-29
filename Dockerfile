FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

# EXPOSE jaan-boojh kar nahi hai: Render khud PORT env deta hai (default 10000)
# aur app server.port=${PORT:8080} se usi par sunta hai.
ENTRYPOINT ["java", "-jar", "app.jar"]
