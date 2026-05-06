package com.archiform.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    public String generateToken(String userId, String firmId, String role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationMs);
        return Jwts.builder()
                .subject(userId)
                .claim("firmId", firmId)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(getSigningKey())
                .compact();
    }

    public String getUserIdFromToken(String token) { return parseClaims(token).getSubject(); }
    public String getFirmIdFromToken(String token) { return parseClaims(token).get("firmId", String.class); }
    public String getRoleFromToken(String token) { return parseClaims(token).get("role", String.class); }

    public boolean validateToken(String token) {
        try { parseClaims(token); return true; }
        catch (ExpiredJwtException e) { log.warn("JWT expired: {}", e.getMessage()); }
        catch (UnsupportedJwtException e) { log.warn("JWT unsupported: {}", e.getMessage()); }
        catch (MalformedJwtException e) { log.warn("JWT malformed: {}", e.getMessage()); }
        catch (SecurityException e) { log.warn("JWT invalid signature: {}", e.getMessage()); }
        catch (IllegalArgumentException e) { log.warn("JWT empty: {}", e.getMessage()); }
        return false;
    }

    private Claims parseClaims(String token) {
        return Jwts.parser().verifyWith(getSigningKey()).build()
                .parseSignedClaims(token).getPayload();
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }
    
    public String getFirmId(String token) {
        return parseClaims(token).get("firmId", String.class);
    }
}
