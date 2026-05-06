package com.archiform.domain.analytics;

import com.archiform.domain.invoice.InvoiceRepository;
import com.archiform.domain.project.ProjectRepository;
import com.archiform.domain.staff.StaffMember;
import com.archiform.domain.staff.StaffRepository;
import com.archiform.domain.time.TimeEntryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class AnalyticsService {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsService.class);

    private final StaffRepository staffRepository;
    private final TimeEntryRepository timeEntryRepository;
    private final InvoiceRepository invoiceRepository;
    private final ProjectRepository projectRepository;

    public AnalyticsService(StaffRepository staffRepository, TimeEntryRepository timeEntryRepository,
                             InvoiceRepository invoiceRepository, ProjectRepository projectRepository) {
        this.staffRepository = staffRepository;
        this.timeEntryRepository = timeEntryRepository;
        this.invoiceRepository = invoiceRepository;
        this.projectRepository = projectRepository;
    }

   // @Cacheable(value = RedisConfig.CACHE_DASHBOARD, key = "#firmId")
    @Transactional(readOnly = true)
    public DashboardMetrics getDashboardMetrics(UUID firmId) {
        log.debug("DB query: dashboard metrics for firm {}", firmId);
        LocalDate now = LocalDate.now();
        LocalDate threeMonthsAgo = now.minusMonths(3).withDayOfMonth(1);

        Double utilizationRate = calculateUtilizationRate(firmId, threeMonthsAgo, now);
        BigDecimal paidInvoices = invoiceRepository.sumPaidByFirmId(firmId);
        Double estimatedProfit = paidInvoices.doubleValue() * 0.35;
        Double projectedProfit = estimatedProfit * 1.12;
        Double projectedCapacity = utilizationRate != null ? Math.min(utilizationRate * 1.05, 100.0) : null;

        return DashboardMetrics.builder()
                .estimatedOperatingProfit(estimatedProfit)
                .utilizationRate(utilizationRate)
                .projectedOperatingProfit(projectedProfit)
                .projectedFirmCapacity(projectedCapacity)
                .revenueByMonth(buildMonthlyRevenue(firmId, now))
                .build();
    }

    //@Cacheable(value = RedisConfig.CACHE_UTILIZATION, key = "#firmId")
    @Transactional(readOnly = true)
    public Double calculateUtilizationRate(UUID firmId, LocalDate from, LocalDate to) {
        List<StaffMember> staff = staffRepository.findByFirmIdAndActiveTrueOrderByCreatedAtAsc(firmId);
        if (staff.isEmpty()) return null;
        long days = from.until(to, java.time.temporal.ChronoUnit.DAYS);
        long workingDays = (long)(days * 5.0 / 7.0);
        double maxHours = workingDays * 8.0 * staff.size();
        if (maxHours == 0) return null;
        BigDecimal logged = timeEntryRepository.sumHoursByFirmAndDateRange(firmId, from, to);
        if (logged == null || logged.compareTo(BigDecimal.ZERO) == 0) return 0.0;
        return Math.min(round(logged.doubleValue() / maxHours * 100.0, 1), 100.0);
    }

    private List<DashboardMetrics.MonthlyRevenue> buildMonthlyRevenue(UUID firmId, LocalDate now) {
        List<DashboardMetrics.MonthlyRevenue> result = new ArrayList<>();
        List<StaffMember> staff = staffRepository.findByFirmIdAndActiveTrueOrderByCreatedAtAsc(firmId);
        double avgRate = staff.stream().mapToDouble(s -> s.getHourlyRate().doubleValue()).average().orElse(100.0);
        for (int i = 6; i >= 0; i--) {
            LocalDate start = now.minusMonths(i).withDayOfMonth(1);
            LocalDate end   = start.plusMonths(1).minusDays(1);
            BigDecimal hours = timeEntryRepository.sumHoursByFirmAndDateRange(firmId, start, end);
            double revenue  = (hours != null ? hours.doubleValue() : 0) * avgRate;
            double expenses = revenue * 0.62;
            result.add(DashboardMetrics.MonthlyRevenue.builder()
                    .month(start.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH))
                    .revenue(round(revenue, 0)).expenses(round(expenses, 0))
                    .profit(round(revenue - expenses, 0)).build());
        }
        return result;
    }

    private double round(double value, int places) {
        return BigDecimal.valueOf(value).setScale(places, RoundingMode.HALF_UP).doubleValue();
    }
}
