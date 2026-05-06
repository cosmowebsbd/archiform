package com.archiform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
public class ArchiformApplication {
    public static void main(String[] args) {
        SpringApplication.run(ArchiformApplication.class, args);
    }
}
