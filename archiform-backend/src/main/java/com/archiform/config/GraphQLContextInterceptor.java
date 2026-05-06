package com.archiform.config;

import com.archiform.security.JwtTokenProvider;
import org.springframework.graphql.server.WebGraphQlInterceptor;
import org.springframework.graphql.server.WebGraphQlRequest;
import org.springframework.graphql.server.WebGraphQlResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Mono;

@Component
public class GraphQLContextInterceptor implements WebGraphQlInterceptor {

    private final JwtTokenProvider tokenProvider;

    public GraphQLContextInterceptor(JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Override
    public Mono<WebGraphQlResponse> intercept(WebGraphQlRequest request, Chain chain) {
        String authHeader = request.getHeaders().getFirst("Authorization");
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (tokenProvider.validateToken(token)) {
                String firmId = tokenProvider.getFirmIdFromToken(token);
                String userId = tokenProvider.getUserIdFromToken(token);
                String role   = tokenProvider.getRoleFromToken(token);
                request.configureExecutionInput((executionInput, builder) ->
                        builder.graphQLContext(ctx -> {
                            ctx.put("firmId", firmId);
                            ctx.put("userId", userId);
                            ctx.put("role", role);
                        }).build());
            }
        }
        return chain.next(request);
    }
}
