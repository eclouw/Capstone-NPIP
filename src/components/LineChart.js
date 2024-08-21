import React, { useState } from 'react';
import {Line} from 'react-chartjs-2';

import { Chart as ChartJS } from 'chart.js';



function LineChart({chartData}){

    
  return (
    <Line data={chartData}/>
  )
}

export default LineChart