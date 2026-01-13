pipeline {
  agent any

  stages {
    // stage('Gateway Service') {
    //   steps {
    //     build job: 'gateway-service-pipeline', wait: true
    //   }
    // }
    // stage('User Service') {
    //   steps {
    //     build job: 'user-service-pipeline', wait: true
    //   }
    // }
    // stage('Property Service') {
    //   steps {
    //     build job: 'property-service-pipeline', wait: true
    //   }
    // }
    // stage('Booking Service') {
    //   steps {
    //     build job: 'booking-service-pipeline', wait: true
    //   }
    // }
    // stage('Notification Service') {
    //   steps {
    //     build job: 'notification-service-pipeline', wait: true
    //   }
    // }

    // stage('Blockchain Layer') {
    //   steps {
    //     build job: 'blockchain-layer-pipeline', wait: true
    //   }
    // }

    stage('Rent Chain') {
      steps {
        build job: 'rent-chain-pipeline', wait: true
      }
    }

    
  }
}
