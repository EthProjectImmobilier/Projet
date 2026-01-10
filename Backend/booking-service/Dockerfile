# Build stage
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace

# copy only necessary files to use Docker cache
COPY .mvn .mvn
COPY mvnw mvnw
COPY pom.xml pom.xml
COPY src src

RUN chmod +x mvnw && ./mvnw -B -DskipTests clean package

# Runtime stage
FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app

ARG JAR_FILE=target/*.jar
COPY --from=build /workspace/${JAR_FILE} /app/app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]