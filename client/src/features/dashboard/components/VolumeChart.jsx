import Chart from "react-apexcharts";
import { Box, Skeleton } from "@mui/material";
import { format, parseISO } from "date-fns";
import { formatCompactCurrency, formatCurrency } from "@/utils/format";

const VolumeChart = ({ data = [], loading }) => {
  if (loading && !data.length) return <Skeleton variant="rounded" height={300} />;

  const categories = data.map((d) => format(parseISO(d.date), "dd MMM"));
  const series = [
    { name: "Credits", data: data.map((d) => d.credit) },
    { name: "Debits", data: data.map((d) => d.debit) },
  ];

  const options = {
    chart: { type: "area", toolbar: { show: false }, fontFamily: "DM Sans, sans-serif", zoom: { enabled: false } },
    colors: ["#118D57", "#DC2626"],
    stroke: { curve: "smooth", width: 2.5 },
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.28, opacityTo: 0.02, stops: [0, 95] } },
    dataLabels: { enabled: false },
    grid: { borderColor: "#F0F3F9", strokeDashArray: 4 },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: "#64748B", fontSize: "12px" } },
    },
    yaxis: { labels: { formatter: (v) => formatCompactCurrency(v), style: { colors: "#64748B", fontSize: "12px" } } },
    legend: { position: "top", horizontalAlign: "right", fontSize: "13px", markers: { size: 6 } },
    tooltip: { y: { formatter: (v) => formatCurrency(v) } },
  };

  return (
    <Box sx={{ mx: -1 }}>
      <Chart type="area" height={300} options={options} series={series} />
    </Box>
  );
};

export default VolumeChart;
