import React, { Component } from 'react'
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

  render () {
    return [
      <tr key={"execution_" + this.props.index} className="test-row" onClick={(e)=>this.toggleActions(e)} >
        <td colSpan="100%" className={`${this.props.execution.status}`}>
          <span key={ this.state.open }>
            <i title="Click to display/hide test steps" className={ this.state.open ? ('fa fa-caret-down'): 'fas fa-caret-right' }></i>
          </span>
          <span>Test: {this.props.execution.title}</span>
        </td>
      </tr>,
      <tr key={"execution_actions_" + this.props.index} className="actions-row">
      { this.state.open ? (
          <td colSpan="100%" className="actions-wrapper">
            <table className="actions-table">
              <tbody>
                { this.props.execution.actions.map((action, index) => {
                  return [
                    <ActionComponent key={"action_" + index} action={action} index={index} screenshots={this.props.screenshots} />
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
