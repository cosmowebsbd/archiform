package com.archiform.graphql;

import com.archiform.domain.time.TimeEntry;
import com.archiform.domain.time.TimeEntryService;
import com.archiform.dto.time.TimeEntryInput;
import com.archiform.exception.UnauthorizedException;
import graphql.schema.DataFetchingEnvironment;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
@Controller
public class TimeController {
    private final TimeEntryService timeEntryService;
    public TimeController(TimeEntryService timeEntryService) { this.timeEntryService = timeEntryService; }

    @QueryMapping
    public List<TimeEntry> timeEntries(@Argument String projectId, @Argument String staffId,
                                        @Argument LocalDate from, @Argument LocalDate to, DataFetchingEnvironment env) {
        return timeEntryService.getTimeEntries(extractFirmId(env),
                projectId != null ? UUID.fromString(projectId) : null,
                staffId   != null ? UUID.fromString(staffId)   : null, from, to);
    }
    @MutationMapping
    public TimeEntry logTime(@Argument TimeEntryInput input, DataFetchingEnvironment env) {
        return timeEntryService.logTime(input, extractFirmId(env));
    }
    @MutationMapping
    public TimeEntry updateTimeEntry(@Argument String id, @Argument TimeEntryInput input, DataFetchingEnvironment env) {
        return timeEntryService.updateTimeEntry(UUID.fromString(id), input, extractFirmId(env));
    }
    @MutationMapping
    public Boolean deleteTimeEntry(@Argument String id, DataFetchingEnvironment env) {
        return timeEntryService.deleteTimeEntry(UUID.fromString(id), extractFirmId(env));
    }
    private UUID extractFirmId(DataFetchingEnvironment env) {
        Object v = env.getGraphQlContext().get("firmId");
        if (v == null) throw new UnauthorizedException();
        return UUID.fromString(v.toString());
    }
    
    @QueryMapping
    public List<Map<String, Object>> weeklyTimesheet(
            @Argument String weekStart,
            DataFetchingEnvironment env) {
        UUID firmId = UUID.fromString(
                env.getGraphQlContext().get("firmId").toString());
        LocalDate date = LocalDate.parse(weekStart);
        return timeEntryService.getWeeklyTimesheet(firmId, date);
    }
}
