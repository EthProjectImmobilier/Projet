package dapp.ma.bcback.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class UserClientConfig {

    @Bean
    public RequestInterceptor internalAuthInterceptor() {
        return new RequestInterceptor() {
            @Override
            public void apply(RequestTemplate template) {
                // Provide the required headers for internal requests
                template.header("X-Auth-User-Id", "1"); // or some internal service ID
                template.header("X-Auth-Roles", "ADMIN"); // if needed
            }
        };
    }
}

