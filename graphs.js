// graphs.js - Generate performance graphs using QuickChart API (no native dependencies)
import axios from 'axios';

// Generate K/D/A trend graph using QuickChart
export async function generateKDAGraph(matchesData, playerName) {
  try {
    const kdaData = matchesData.map(match => match.kda);
    const labels = matchesData.map((_, i) => `M${i + 1}`);
    const backgroundColors = matchesData.map(m => m.win ? 'rgba(81, 207, 102, 0.7)' : 'rgba(255, 107, 107, 0.7)');

    const chart = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'K/D/A Trend',
            data: kdaData,
            borderColor: 'rgb(255, 107, 107)',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 6,
            pointBackgroundColor: backgroundColors,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `${playerName} - K/D/A Trend Over Last ${matchesData.length} Matches`,
            font: { size: 16, weight: 'bold' },
          },
          legend: {
            display: true,
            position: 'top',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'KDA Ratio' },
          },
          x: {
            title: { display: true, text: 'Match Number' },
          },
        },
      },
    };

    const chartJson = encodeURIComponent(JSON.stringify(chart));
    const chartUrl = `https://quickchart.io/chart?c=${chartJson}&w=800&h=400`;
    
    return chartUrl;
  } catch (error) {
    console.error('Error generating KDA graph:', error.message);
    throw new Error('Failed to generate KDA graph');
  }
}

// Generate champion performance comparison chart
export async function generateChampionChart(matchesData) {
  try {
    // Group by champion
    const champStats = {};
    matchesData.forEach(match => {
      if (!champStats[match.championName]) {
        champStats[match.championName] = { wins: 0, total: 0 };
      }
      champStats[match.championName].wins += match.win ? 1 : 0;
      champStats[match.championName].total += 1;
    });

    // Get top 5 champions
    const champList = Object.entries(champStats)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5);

    const labels = champList.map(([champ]) => champ);
    const winRates = champList.map(([, stats]) => ((stats.wins / stats.total) * 100).toFixed(0));
    const colors = winRates.map(wr => (wr >= 50 ? 'rgba(81, 207, 102, 0.7)' : 'rgba(255, 107, 107, 0.7)'));

    const chart = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Win Rate %',
            data: winRates,
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Champion Performance Breakdown (Top 5)',
            font: { size: 16, weight: 'bold' },
          },
          legend: {
            display: true,
            position: 'top',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: { display: true, text: 'Win Rate %' },
          },
        },
      },
    };

    const chartJson = encodeURIComponent(JSON.stringify(chart));
    const chartUrl = `https://quickchart.io/chart?c=${chartJson}&w=800&h=400`;
    
    return chartUrl;
  } catch (error) {
    console.error('Error generating champion chart:', error.message);
    throw new Error('Failed to generate champion chart');
  }
}

// Cleanup (not needed with online service)
export function cleanupGraphs() {
  // No cleanup needed - charts are generated online
}
