initDashboardPageCharts = function() {
    if ($('#dailySalesChart').length != 0) {
        var dataDailySalesChart = {
            labels: {{ daily_sales_data.labels|safe }},
            series: [
                {{ daily_sales_data.series|safe }}
            ]
        };

        var optionsDailySalesChart = {
            lineSmooth: Chartist.Interpolation.cardinal({
                tension: 0
            }),
            low: 0,
            high: 50,
            chartPadding: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            },
        };

        var dailySalesChart = new Chartist.Line('#dailySalesChart', dataDailySalesChart, optionsDailySalesChart);
        md.startAnimationForLineChart(dailySalesChart);
    }
};

$(document).ready(function () {
    if ($('#dailySalesChart').length) {
        md.initDashboardPageCharts();
    } else {
        console.warn('dailySalesChart no encontrado. No se inicializa el gráfico.');
    }
});
