package com.archiform.domain.analytics;

import java.io.Serializable;
import java.util.List;

public class DashboardMetrics implements Serializable {

    private Double estimatedOperatingProfit;
    private Double utilizationRate;
    private Double projectedOperatingProfit;
    private Double projectedFirmCapacity;
    private List<MonthlyRevenue> revenueByMonth;

    public DashboardMetrics() {}

    public Double getEstimatedOperatingProfit() { return estimatedOperatingProfit; }
    public void setEstimatedOperatingProfit(Double v) { this.estimatedOperatingProfit = v; }
    public Double getUtilizationRate() { return utilizationRate; }
    public void setUtilizationRate(Double v) { this.utilizationRate = v; }
    public Double getProjectedOperatingProfit() { return projectedOperatingProfit; }
    public void setProjectedOperatingProfit(Double v) { this.projectedOperatingProfit = v; }
    public Double getProjectedFirmCapacity() { return projectedFirmCapacity; }
    public void setProjectedFirmCapacity(Double v) { this.projectedFirmCapacity = v; }
    public List<MonthlyRevenue> getRevenueByMonth() { return revenueByMonth; }
    public void setRevenueByMonth(List<MonthlyRevenue> v) { this.revenueByMonth = v; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Double estimatedOperatingProfit, utilizationRate,
                       projectedOperatingProfit, projectedFirmCapacity;
        private List<MonthlyRevenue> revenueByMonth;
        public Builder estimatedOperatingProfit(Double v) { estimatedOperatingProfit=v; return this; }
        public Builder utilizationRate(Double v) { utilizationRate=v; return this; }
        public Builder projectedOperatingProfit(Double v) { projectedOperatingProfit=v; return this; }
        public Builder projectedFirmCapacity(Double v) { projectedFirmCapacity=v; return this; }
        public Builder revenueByMonth(List<MonthlyRevenue> v) { revenueByMonth=v; return this; }
        public DashboardMetrics build() {
            DashboardMetrics d = new DashboardMetrics();
            d.estimatedOperatingProfit=estimatedOperatingProfit;
            d.utilizationRate=utilizationRate;
            d.projectedOperatingProfit=projectedOperatingProfit;
            d.projectedFirmCapacity=projectedFirmCapacity;
            d.revenueByMonth=revenueByMonth;
            return d;
        }
    }

    public static class MonthlyRevenue implements Serializable {
        private String month;
        private double revenue, expenses, profit;

        public MonthlyRevenue() {}

        public String getMonth() { return month; }
        public void setMonth(String v) { this.month = v; }
        public double getRevenue() { return revenue; }
        public void setRevenue(double v) { this.revenue = v; }
        public double getExpenses() { return expenses; }
        public void setExpenses(double v) { this.expenses = v; }
        public double getProfit() { return profit; }
        public void setProfit(double v) { this.profit = v; }

        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private String month; private double revenue, expenses, profit;
            public Builder month(String v) { month=v; return this; }
            public Builder revenue(double v) { revenue=v; return this; }
            public Builder expenses(double v) { expenses=v; return this; }
            public Builder profit(double v) { profit=v; return this; }
            public MonthlyRevenue build() {
                MonthlyRevenue m = new MonthlyRevenue();
                m.month=month; m.revenue=revenue; m.expenses=expenses; m.profit=profit;
                return m;
            }
        }
    }
}
