import React, { Component } from 'react'
import Chart from "chart.js";
import './Charts.css'
import { getBuildDurationInSeconds } from '../../utility/TimeUtilities'
import moment from 'moment'

class ExecutionsTimeLineChart extends Component {

    lineChartRef = React.createRef();
    lineChart;

    constructor(props) {
      super(props);
      this.state = {
         //
      };
    }

    renderExecutionsLineChart = (lineChart, executions) => {
      if (lineChart !== undefined && lineChart.config != null) {
        let graphData = lineChart.config.data;
        graphData.labels = [];
        graphData.datasets = [];
        graphData.datasets.push({ label: 'Time', data: [], borderColor: '#0099e6'})
        if (Array.isArray(executions)) {
          executions.map((execution, index) => {
            graphData.labels.push(moment.utc(moment(execution.start)).format("DD-MM-YYYY HH:mm:ss"));
            graphData.datasets[0].data.push(getBuildDurationInSeconds(execution));
            return graphData;
          });
        }
        lineChart.update();
      }
    }

    updateExecutionLineChart = () => {
      if (this.lineChart.options === {}) {}
      this.lineChart.options = {
        title: {
          display: true,
          text: 'Execution time in seconds'
        },
        elements: {
            line: {
                tension: 0
            }
        },
        animation: false,
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }],
          xAxes: [
            {
              ticks: {
                reverse: true,
                maxRotation: 90,
                minRotation: 30
              },
            }
          ]
        }
      }
      this.lineChart.update();
    }

    componentDidUpdate(prevProps) {
      if (this.lineChart === undefined || this.lineChart.data.datasets.length === 0 || prevProps.builds !== this.props.builds) {
        this.renderExecutionsLineChart(this.lineChart, this.props.executions);
        this.updateExecutionLineChart();
      }
    }

    componentDidMount() {
      const executionTimesLineChart = this.lineChartRef.current.getContext("2d");
      const config = {
          type: "line",
          data: {},
          options: {
            elements: {
                line: {
                    tension: 0
                }
            }
          }
      };
      this.lineChart = new Chart(executionTimesLineChart, config);
      // to trigger componentDidUpdate
      this.setState({});
    }

    render() {
        return (
          <div className="graphContainer">
            <canvas
              id="executionTimesLineChart"
              ref={this.lineChartRef}
            />
          </div>
        )
    }
}

export default ExecutionsTimeLineChart;
