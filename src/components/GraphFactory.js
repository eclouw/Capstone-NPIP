import React from "react";
import { Line, Bar } from "react-chartjs-2";

const GraphFactory = ({type, chartData}) =>{
    switch(type){
        case 'line':
            return <Line data = {chartData} options={{maintainAspectRatio: true}}/>
        case 'bar':
            return <Bar data = {chartData} options={{maintainAspectRatio: true}}/>
        default:
            throw new Error('Unknown graph type');
    }
}

export default GraphFactory;