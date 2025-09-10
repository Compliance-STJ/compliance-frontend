# Guia para configuração de CORS no Backend

Para permitir que o frontend se comunique diretamente com o backend Spring Boot, é necessário configurar o CORS (Cross-Origin Resource Sharing) no backend.

## Opção 1: Adicionar configuração de CORS com Java

Crie uma classe de configuração no backend:

```java
package com.sua.empresa.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Permite requisições de qualquer origem em ambiente de desenvolvimento
        // Para produção, você deve restringir isso às origens específicas do seu frontend
        config.setAllowCredentials(true);
        config.addAllowedOrigin("http://localhost:4200"); // Frontend Angular em desenvolvimento
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

## Opção 2: Adicionar configuração de CORS via anotação nos controladores

Você também pode adicionar a anotação `@CrossOrigin` diretamente nos seus controladores:

```java
package com.sua.empresa.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200") // Permite requisições do frontend Angular
public class StatusController {

    @GetMapping("/status")
    public String getStatus() {
        return "Sistema funcionando normalmente";
    }
}
```

## Opção 3: Configuração global via WebMvcConfigurer

Outra opção é configurar o CORS globalmente através do `WebMvcConfigurer`:

```java
package com.sua.empresa.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("http://localhost:4200")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}
```

## Verificação

Após implementar uma das opções acima, reinicie o servidor backend e teste a comunicação direta do frontend com o backend. O componente de status do backend deve funcionar corretamente sem erros de CORS.
