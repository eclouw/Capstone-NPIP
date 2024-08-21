import React, { useState } from 'react';
import {Pie} from 'react-chartjs-2';

import { Chart as ChartJS } from 'chart.js';


//Piechart from Chart.js
function PieChart({chartData}){

    
  return (
    <Pie data={chartData}/>
  )
}

export default PieChart