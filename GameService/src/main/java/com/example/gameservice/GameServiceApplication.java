package com.example.gameservice;

import com.example.gameservice.util.PasswordHasher;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@SpringBootApplication
public class GameServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(GameServiceApplication.class, args);

        // 🧪 Test-Hash generieren (nur temporär)
      //  PasswordHasher.printHash("hey123");
    }
}
