'use client';

import { Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export function PlacementChart({ probability }) {
    const data = {
        labels: ['Placed', 'Not Placed'],
        datasets: [
            {
                data: [probability * 100, (1 - probability) * 100],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                ],
                borderColor: [
                    'rgba(16, 185, 129, 1)',
                    'rgba(239, 68, 68, 1)',
                ],
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#cbd5e1',
                    font: {
                        size: 14,
                    },
                },
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return context.label + ': ' + context.parsed.toFixed(1) + '%';
                    },
                },
            },
        },
    };

    return <Doughnut data={data} options={options} />;
}

export function SkillGapChart({ skillGaps }) {
    const labels = skillGaps.map((gap) => gap.area);
    const priorities = skillGaps.map((gap) => {
        switch (gap.priority) {
            case 'high':
                return 3;
            case 'medium':
                return 2;
            case 'low':
                return 1;
            default:
                return 0;
        }
    });

    const data = {
        labels,
        datasets: [
            {
                label: 'Priority Level',
                data: priorities,
                backgroundColor: priorities.map((p) => {
                    if (p === 3) return 'rgba(239, 68, 68, 0.8)';
                    if (p === 2) return 'rgba(245, 158, 11, 0.8)';
                    return 'rgba(99, 102, 241, 0.8)';
                }),
                borderColor: priorities.map((p) => {
                    if (p === 3) return 'rgba(239, 68, 68, 1)';
                    if (p === 2) return 'rgba(245, 158, 11, 1)';
                    return 'rgba(99, 102, 241, 1)';
                }),
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const priority = ['', 'Low', 'Medium', 'High'][context.parsed.y];
                        return 'Priority: ' + priority;
                    },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 3,
                ticks: {
                    stepSize: 1,
                    callback: function (value) {
                        return ['', 'Low', 'Medium', 'High'][value] || '';
                    },
                    color: '#cbd5e1',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
            },
            x: {
                ticks: {
                    color: '#cbd5e1',
                },
                grid: {
                    display: false,
                },
            },
        },
    };

    return <Bar data={data} options={options} />;
}
