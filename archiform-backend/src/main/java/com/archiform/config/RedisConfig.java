/*
 * package com.archiform.config;
 * 
 * import com.fasterxml.jackson.databind.ObjectMapper; import
 * com.fasterxml.jackson.databind.SerializationFeature; import
 * com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator; import
 * com.fasterxml.jackson.databind.jsontype.PolymorphicTypeValidator; import
 * com.fasterxml.jackson.datatype.jsr310.JavaTimeModule; import
 * org.springframework.cache.CacheManager; import
 * org.springframework.context.annotation.Bean; import
 * org.springframework.context.annotation.Configuration; import
 * org.springframework.data.redis.cache.RedisCacheConfiguration; import
 * org.springframework.data.redis.cache.RedisCacheManager; import
 * org.springframework.data.redis.connection.RedisConnectionFactory; import
 * org.springframework.data.redis.core.RedisTemplate; import
 * org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
 * import org.springframework.data.redis.serializer.RedisSerializationContext;
 * import org.springframework.data.redis.serializer.StringRedisSerializer;
 * import java.time.Duration; import java.util.HashMap; import java.util.Map;
 * 
 * @Configuration public class RedisConfig {
 * 
 * public static final String CACHE_DASHBOARD = "dashboard"; public static final
 * String CACHE_PROJECTS = "projects"; public static final String CACHE_STAFF =
 * "staff"; public static final String CACHE_UTILIZATION = "utilization"; public
 * static final String CACHE_INVOICES = "invoices";
 * 
 * private ObjectMapper redisObjectMapper() { PolymorphicTypeValidator ptv =
 * BasicPolymorphicTypeValidator .builder() .allowIfBaseType(Object.class)
 * .build();
 * 
 * ObjectMapper mapper = new ObjectMapper(); mapper.registerModule(new
 * JavaTimeModule());
 * mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
 * mapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
 * mapper.activateDefaultTyping(ptv, ObjectMapper.DefaultTyping.NON_FINAL);
 * return mapper; }
 * 
 * @Bean public RedisTemplate<String, Object>
 * redisTemplate(RedisConnectionFactory factory) { RedisTemplate<String, Object>
 * template = new RedisTemplate<>(); template.setConnectionFactory(factory);
 * GenericJackson2JsonRedisSerializer serializer = new
 * GenericJackson2JsonRedisSerializer(redisObjectMapper());
 * template.setKeySerializer(new StringRedisSerializer());
 * template.setHashKeySerializer(new StringRedisSerializer());
 * template.setValueSerializer(serializer);
 * template.setHashValueSerializer(serializer); template.afterPropertiesSet();
 * return template; }
 * 
 * @Bean public CacheManager cacheManager(RedisConnectionFactory factory) {
 * GenericJackson2JsonRedisSerializer serializer = new
 * GenericJackson2JsonRedisSerializer(redisObjectMapper());
 * 
 * RedisCacheConfiguration def = RedisCacheConfiguration.defaultCacheConfig()
 * .entryTtl(Duration.ofMinutes(15))
 * .serializeKeysWith(RedisSerializationContext.SerializationPair
 * .fromSerializer(new StringRedisSerializer()))
 * .serializeValuesWith(RedisSerializationContext.SerializationPair
 * .fromSerializer(serializer)) .disableCachingNullValues();
 * 
 * Map<String, RedisCacheConfiguration> configs = new HashMap<>();
 * configs.put(CACHE_DASHBOARD, def.entryTtl(Duration.ofMinutes(15)));
 * configs.put(CACHE_PROJECTS, def.entryTtl(Duration.ofMinutes(5)));
 * configs.put(CACHE_STAFF, def.entryTtl(Duration.ofMinutes(10)));
 * configs.put(CACHE_UTILIZATION, def.entryTtl(Duration.ofMinutes(15)));
 * configs.put(CACHE_INVOICES, def.entryTtl(Duration.ofMinutes(5)));
 * 
 * return RedisCacheManager.builder(factory) .cacheDefaults(def)
 * .withInitialCacheConfigurations(configs) .build(); } }
 */