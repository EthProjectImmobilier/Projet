pipeline {
  agent any

  stages {
    stage('Gateway Service') {
      steps {
        build job: 'gateway-service-pipeline', wait: true
      }
    }
    stage('User Service') {
      steps {
        build job: 'user-service-pipeline', wait: true
      }
    }

    
  }
}
