import React, { Component } from 'react';
import BuildResultsPieChart from '../charts/BuildResultsPieChart';
import BuildFeaturePieChart from '../charts/BuildFeaturePieChart';
import SuiteTable from '../tables/SuiteTable';
import BuildSummary from '../tables/BuildSummary';
import BuildArtifacts from '../tables/BuildArtifacts';
// import charts from '../charts/Charts.css';
// import defaultCss from '../pages/Default.css';
// import tables from '../tables/Tables.css';

class BuildReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filterStates: [],
      filteredSuites: props.currentBuild.suites,
    };
  }

  filterBuilds = (filterStates) => {
    const filteredSuites = [];
    const { currentBuild } = this.state;
    currentBuild.suites.forEach((suite) => {
      const newSuite = { ...suite };
      newSuite.executions = suite.executions
        .filter((execution) => filterStates.length === 0
          || filterStates.includes(execution.status));
      filteredSuites.push(newSuite);
    });
    this.setState({ filteredSuites, filterStates });
  }

  render() {
    const {
      currentBuild,
      screenshots,
    } = this.props;

    const {
      filteredSuites,
      // eslint-disable-next-line no-unused-vars
      filterStates,
    } = this.state;
    return (
      // eslint-disable-next-line jsx-a11y/html-has-lang
      <html>
        <head>
          <title>Test Report</title>
          <style id="jss-server-side" />
          <link
            rel="stylesheet"
            href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"
            integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO"
            crossOrigin="anonymous"
          />
        </head>
        <body>
          <div>
            <div className="headingContainer">
              <h1>
                <span>{`Build: ${currentBuild.name}`}</span>
              </h1>
            </div>
            <BuildSummary build={currentBuild} screenshots={screenshots} />
            <BuildArtifacts build={currentBuild} />
            <div className="graphContainerParent">
              <BuildResultsPieChart build={currentBuild} filterBuilds={this.filterBuilds} />
              <BuildFeaturePieChart build={currentBuild} />
            </div>
            <br />
            <div>
              {
            filteredSuites.map((suite) => (
              suite.executions.length > 0 ? (
                <SuiteTable
                  key={`${suite.name}`}
                  suite={suite}
                  screenshots={screenshots}
                  openModal={this.openModal}
                  expandTests
                />
              ) : null
            ))
          }
            </div>
          </div>
        </body>
      </html>
    );
  }
}

export default BuildReport;
