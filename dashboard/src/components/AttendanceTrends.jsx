import React from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AttendanceTrends = ({ trendsData }) => {
  if (!trendsData || trendsData.length === 0) {
    return <div className="text-muted">No trend data available</div>;
  }

  const data = {
    labels: trendsData.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Total Attendance',
        data: trendsData.map(item => item.totalAttendees),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Attendance Trends - Last 10 Events',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div style={{ height: '400px' }}>
      <Line data={data} options={options} />
    </div>
  );
};

AttendanceTrends.propTypes = {
  trendsData: PropTypes.array.isRequired,
};

export default AttendanceTrends;
