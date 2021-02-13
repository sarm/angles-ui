import React, { Component } from 'react'
import OverlayTrigger from 'react-bootstrap//OverlayTrigger'
import Tooltip from 'react-bootstrap//Tooltip'
import ActionComponent from './ActionComponent';
class ExecutionTable extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
      //this.calculateMetricsForBuilds(props.builds);
      this.toggleActions = this.toggleActions.bind(this);
  }

  toggleActions = (e) => {
    this.setState({open: !this.state.open})
  }

  getPlatformName = (execution) => {
    let platformsToDisplay = [];
    if (execution.platforms) {
      execution.platforms.forEach((platform) => {
        if (platform.deviceName) {
          platformsToDisplay.push(`${platform.deviceName} [${platform.platformName}${platform.platformVersion ? platform.platformVersion: null }]`);
        } else {
          platformsToDisplay.push(`${platform.browserName}${platform.browserVersion ? ' - ' + platform.browserVersion: null } [${platform.platformName}]`);
        }
      })
    }
    return platformsToDisplay.join(', ');
  }

  render () {
    return [
      <tr key={"execution_" + this.props.index} className="test-row" >
        <td colSpan="100%" className={`${this.props.execution.status}`}>
          <span key={ this.state.open } className="test-name" onClick={(e)=>this.toggleActions(e)}>
            <i title="Click to display/hide test steps" className={ this.state.open ? ('fa fa-caret-down'): 'fas fa-caret-right' }></i>
            <span>Test: {this.props.execution.title} </span>
          </span>
          <span>
            { this.props.execution.platforms && this.props.execution.platforms.length > 0 ? <span className="device-details">{this.getPlatformName(this.props.execution)}</span> : null }
          </span>
          <span className="history-link-execution">
            <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">See execution history for {this.props.execution.title}</Tooltip>}>
              <span className="d-inline-block">
                <a className="test-history-link" title={`See execution history for ${this.props.execution.title}`} href={`/history?executionId=${this.props.execution._id}`}>
                  <span><i className="fa fa-history" aria-hidden="true">history</i></span>
                </a>
              </span>
            </OverlayTrigger>
          </span>
        </td>
      </tr>,
      <tr key={"execution_actions_" + this.props.index} className="actions-row">
      { this.state.open ? (
          <td colSpan="100%" className="actions-wrapper">
            <table className="actions-table">
              <tbody>
                { this.props.execution.actions.map((action, index) => {
                  return [
                    <ActionComponent key={"action_" + index} action={action} index={index} screenshots={this.props.screenshots} openModal={this.props.openModal} />
                  ]
                })
              }
              </tbody>
            </table>
          </td>
      ) : null}
      </tr>
    ]
  }
};

export default ExecutionTable
