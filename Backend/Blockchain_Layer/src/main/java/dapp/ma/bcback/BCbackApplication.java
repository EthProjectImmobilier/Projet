package dapp.ma.bcback;

import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication(scanBasePackages = "dapp.ma.bcback")
@EnableRabbit
@EnableFeignClients
public class BCbackApplication {

    public static void main(String[] args) {
        SpringApplication.run(BCbackApplication.class, args);
    }
}