# Multi-stage Dockerfile for property-service (Maven + runtime)
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace

# copy only what we need for the build to leverage cache
COPY .mvn .mvn
COPY mvnw mvnw
COPY pom.xml pom.xml
COPY src src

RUN chmod +x mvnw && ./mvnw -B -DskipTests clean package

FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app

# copy jar produced by the build stage
ARG JAR_FILE=target/*.jar
COPY --from=build /workspace/${JAR_FILE} /app/app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
