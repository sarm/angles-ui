import { React, Component } from 'react';
import 'react-multi-carousel/lib/styles.css';
import './Default.css';

class AboutPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //
    };
  }

  render() {
    return (
      <div>
        <h1>About Angles</h1>
        <div>
          Angles is an open-source framework to store results for
          automated test runs from various frameworks.
        </div>
        <br />
        <div>
          <span>By providing a clearly defined </span>
          <a href="https://editor.swagger.io/?url=https://raw.githubusercontent.com/AnglesHQ/angles/master/swagger/swagger.json" rel="noreferrer" target="_blank">API</a>
          <span>
            &nbsp;any framework can be adapted to store its test result in Angles,
            using one of the clients provided (or by using the API directly)
          </span>
        </div>
        <br />
        <div>
          For more information about Angles go to page:
          <br />
          <a href="https://angleshq.github.io/" rel="noreferrer" target="_blank">https://angleshq.github.io/</a>
        </div>
      </div>
    );
  }
}

export default AboutPage;
