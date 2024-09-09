import React, { useState } from 'react';
import {Bar} from 'react-chartjs-2';

import { Chart as ChartJS } from 'chart.js';


//Bar chart from Chart.js
function BarChart({chartData}){
  return (
    <Bar data={chartData} options={{ maintainAspectRatio: false }}/>
  )
}

export default BarChart