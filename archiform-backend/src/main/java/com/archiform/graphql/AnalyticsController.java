package com.archiform.graphql;

import com.archiform.domain.analytics.AnalyticsService;
import com.archiform.domain.analytics.DashboardMetrics;
import com.archiform.exception.UnauthorizedException;
import graphql.schema.DataFetchingEnvironment;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import java.util.UUID;

@Controller
public class AnalyticsController {
    private final AnalyticsService analyticsService;
    public AnalyticsController(AnalyticsService analyticsService) { this.analyticsService = analyticsService; }

    @QueryMapping
    public DashboardMetrics dashboard(DataFetchingEnvironment env) {
        Object firmId = env.getGraphQlContext().get("firmId");
        if (firmId == null) throw new UnauthorizedException();
        return analyticsService.getDashboardMetrics(UUID.fromString(firmId.toString()));
    }
}
