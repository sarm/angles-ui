import React, { Component } from 'react'
import Moment from 'react-moment';
import axios from 'axios';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Table from 'react-bootstrap/Table';
import Alert from 'react-bootstrap/Alert';
import CardDeck from 'react-bootstrap/CardDeck';
import Card from 'react-bootstrap/Card';
import ImageCarousel from '../elements/ImageCarousel';
import ScreenshotDetailsTable from '../tables/ScreenshotDetailsTable';
import 'react-multi-carousel/lib/styles.css';
import './Default.css'
import { withRouter} from 'react-router-dom';

class ScreenshotView extends Component {

  constructor(props) {
    super(props);
    this.state = {
      buildScreenshots: this.props.buildScreenshots,
      currentScreenshot: null,
      currentBaseline: null,
    };
  }

  getScreenshotDetails = (screenshotId) => {
    return axios.get('/screenshot/' + screenshotId)
    .then((res) => {
      this.setState({ currentScreenshotDetails: res.data })
      if (this.state.currentScreenshotDetails != null && (this.state.currentScreenshotDetails.view !== null && this.state.currentScreenshotDetails.view !== "")) {
        // if there is a view, retrieve the history
        this.getScreenshotHistoryByView(this.state.currentScreenshotDetails.view, this.state.currentScreenshotDetails.platformId, 10);
        if (this.state.currentScreenshotDetails.platform)
          this.getBaseLineDetails(this.state.currentScreenshotDetails);
      } else if (this.state.currentScreenshotDetails != null) {
        this.handleSelect("image");
      }
    })
  }

  getScreenshotHistoryByView = (view, platformId, limit, offset) => {
    return axios.get('/screenshot/', {
      params: {
        view,
        platformId,
        limit,
        offset
      }
    })
    .then((res) => {
      this.setState({ currentScreenshotHistory: res.data });
    })

  }

  getScreenshot = (screenshotId) => {
    return axios.get('/screenshot/' + screenshotId + "/image", { responseType: 'arraybuffer' })
    .then((res) => {
      const base64 = btoa(
       new Uint8Array(res.data).reduce(
         (data, byte) => data + String.fromCharCode(byte),
         '',
       ),
     );
      this.setState({ currentScreenshot: "data:;base64," + base64 });
    }).catch((err) => {
      // failed to retrieve baseline.
      this.setState({ currentScreenshot: "ERROR" });
    })
  }

  getBaselineScreenshot = (screenshotId) => {
    return axios.get('/screenshot/' + screenshotId + "/image", { responseType: 'arraybuffer' })
    .then((res) => {
      const base64 = btoa(
       new Uint8Array(res.data).reduce(
         (data, byte) => data + String.fromCharCode(byte),
         '',
       ),
     );
      this.setState({ currentBaseline: "data:;base64," + base64 });
    }).catch((err) => {
      // failed to retrieve baseline.
      this.setState({ currentBaseline: "ERROR" });
    })
  }

  forceBaselineCompare(screenshotId) {
    return this.getBaselineCompare(screenshotId, false);
  }

  getBaselineCompare = (screenshotId, useCache) => {
    return axios.get(`/screenshot/${screenshotId}/baseline/compare/image/?useCache=${useCache}`, { responseType: 'arraybuffer' })
    .then((res) => {
      const base64 = btoa(
       new Uint8Array(res.data).reduce(
         (data, byte) => data + String.fromCharCode(byte),
         '',
       ),
     );
      this.setState({ currentBaselineCompare: "data:;base64," + base64 });
    })
    .catch((err) => {
      // failed to retrieve baseline.
      this.setState({ currentBaselineCompare: "ERROR" });
    })
  }

  getBaseLineDetails = (screenshot) => {
    let baselineQuery =  `/baseline/?view=${screenshot.view}&platformName=${screenshot.platform.platformName}`;
    if (screenshot.platform.deviceName) {
      baselineQuery = `${baselineQuery}&deviceName=${screenshot.platform.deviceName}`;
    } else {
      baselineQuery = `${baselineQuery}&browserName=${screenshot.platform.browserName}&screenHeight=${screenshot.height}&screenWidth=${screenshot.width}`;
    }
    axios.get(baselineQuery)
        .then((res) => {
          let baseline = res.data[0];
          // to handle better in the future
          this.setState({ currentBaseLineDetails: baseline });
          if (baseline && baseline.screenshot._id)
            this.getBaselineScreenshot(baseline.screenshot._id);
        })
  }

  updateBaseline(screenshot) {
    if (this.state.currentBaseLineDetails) {
     //if there is already a base line we need to update it.
      this.updateBaselineForView(this.state.currentBaseLineDetails._id, screenshot._id);
    } else {
      //create a new baseline
      this.setBaselineForView(screenshot);
    }
  }

  setBaselineForView(screenshot) {
    return axios.post('/baseline/', {
      view: screenshot.view,
      screenshotId: screenshot._id
    })
    .then((res) => {
      this.setState({ currentBaseLineDetails: res.data })
    })
  }

  updateBaselineForView(baselineId, screenshotId) {
    return axios.put(`/baseline/${baselineId}`, {
      screenshotId
    })
    .then((res) => {
      this.setState({ currentBaseLineDetails: res.data })
    })
  }

  isBaseline(screenshotId) {
    return (this.state.currentBaseLineDetails && this.state.currentBaseLineDetails.screenshot && this.state.currentBaseLineDetails.screenshot._id === screenshotId)
  }

  setTab = (key, evt) => {
    if (key === "baseline") {
    }
    this.handleSelect(key);
  }

  loadScreenshot = (screenshotId) => {
    if (this.state.currentScreenshotDetails === undefined || this.state.currentScreenshotDetails._id !== screenshotId) {
      this.setState({ currentScreenshot: undefined, currentBaseline: undefined, currentScreenshotHistory: undefined, currentBaselineCompare: undefined });
      this.getScreenshotDetails(screenshotId);
      this.getScreenshot(screenshotId);
    }
  }

  isSelectedId = (screenshotId) => {
    if (this.state.currentScreenshotDetails && this.state.currentScreenshotDetails._id === screenshotId) {
      return true;
    } else {
      return false;
    }
  }

  componentDidMount() {
    this.loadScreenshot(this.props.selectedScreenshotId);
    if (this.props.selectedTab) {
        console.log('Tab:' + this.props.selectedTab)
        this.handleSelect(this.props.selectedTab);
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.currentBaseLineDetails !== this.state.currentBaseLineDetails) {
      //if base line details have changed, load the new image
      if (this.state.currentBaseLineDetails && this.state.currentBaseLineDetails.screenshot) {
        this.getBaselineCompare(this.state.currentScreenshotDetails._id, true);
      } else {
        this.setState({currentBaselineCompare: undefined});
      }
    }
  }

  handleSelect(value) {
    if (["image", "history", "baseline", "sidebyside"].includes(value))
      this.setState({key: value});
  }

  render() {
    if (!this.state.buildScreenshots || !this.state.currentScreenshotDetails) {
      return <div className="alert alert-primary" role="alert">
        <span><i className="fas fa-spinner fa-pulse fa-2x"></i> Retrieving screenshot details.</span>
      </div>
    }
    return (
      <div >
        <ImageCarousel
          screenshots={this.state.buildScreenshots}
          selectedScreenshotDetails={this.state.currentScreenshotDetails}
          loadScreenshot={this.loadScreenshot}
        />
        {
          !this.state.currentScreenshotDetails.platform || !this.state.currentScreenshotDetails.view ?
          <Alert variant="info">To enable the "History" and "Compare with Baseline" tabs please provide a view and platform details when uploading the screenshots to angles.</Alert> :
            null
        }
        <Tabs id="image-tabs" activeKey={this.state.key} defaultActiveKey="image" onSelect={(key, evt) => this.setTab(key, evt)} >
            <Tab eventKey="image" title="Image">
              <div className="image-page-holder">
                <Table>
                  <tbody>
                    <tr>
                      <td className={"screenshot-details-td"}>
                      <div>
                        <ScreenshotDetailsTable currentScreenshotDetails={this.state.currentScreenshotDetails } isBaseline={ this.isBaseline(this.state.currentScreenshotDetails._id)} />
                      </div>
                      </td>
                      <td>
                        {
                          this.state.currentScreenshot ? (
                            this.state.currentScreenshot === "ERROR" ? (
                              <div className="alert alert-danger" role="alert">
                                  <span>Unable to retrieve image. Please refresh the page and try again.</span>
                              </div>
                            ) : <img className="screenshot" src={this.state.currentScreenshot} alt="Screenshot" /> ) :
                          <div className="alert alert-primary" role="alert">
                            <span><i className="fas fa-spinner fa-pulse fa-2x"></i> Retrieving screenshot.</span>
                          </div>
                        }
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="100%">
                        <span style={{ float: "left" }}>
                          {
                            this.state.currentScreenshotDetails.platform ?
                              !this.state.currentScreenshotDetails.platform || !this.state.currentScreenshotDetails.view ? (null) :
                                <button onClick={() => this.updateBaseline(this.state.currentScreenshotDetails) } disabled={ this.isBaseline(this.state.currentScreenshotDetails._id) } type="button" className="btn btn-outline-primary">{ !this.isBaseline(this.state.currentScreenshotDetails._id) ? ("Make Baseline Image"): "This is the Baseline Image"}</button> :
                              null
                          }
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </Tab>
            <Tab eventKey="history" disabled={ !this.state.currentScreenshotDetails.platform || !this.state.currentScreenshotDetails.view } title="History">
              <div className="image-page-holder">
                { this.state.currentScreenshotHistory != null ? (
                  <CardDeck className="card-deck-history">
                      { this.state.currentScreenshotHistory.map((screenshot, index) => {
                        return [
                          <Card key={index} className={`screenshotCard ${ this.isSelectedId(screenshot._id) ? "card-active" : ""}`}>
                            { this.isBaseline(screenshot._id) ? (<div className="card-img-overlay baseline-overlay"><p>baseline</p></div>) : null }
                            { !this.isSelectedId(screenshot._id) ? (
                              <a title={`Go to screenshot`} href={`/build?buildId=${screenshot.build}&loadScreenshotId=${screenshot._id}`}><Card.Img variant="top" src={"data:image/png;base64, " + screenshot.thumbnail} /></a>
                            ): <Card.Img variant="top" src={"data:image/png;base64, " + screenshot.thumbnail} /> }
                            <Card.Body>
                              <Card.Footer>
                              <div>
                                <Table className="table-screenshot-history-details" bordered size="sm">
                                  <tbody>
                                    <tr>
                                      <td><strong>View: </strong> {screenshot.view}</td>
                                    </tr>
                                    <tr>
                                      <td><strong>Date: </strong>
                                        <Moment format="DD-MM-YYYY HH:mm:ss">
                                          {screenshot.timestamp}
                                        </Moment>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td><strong>Resolution: </strong>{screenshot.width} x {screenshot.height}</td>
                                    </tr>
                                    <tr>
                                      <td><strong>Platform: </strong>{ screenshot.platform ? (screenshot.platform.platformName) : "" } { screenshot.platform && screenshot.platform.platformVersion ? (screenshot.platform.platformVersion) : "" } { screenshot.platform && screenshot.platform.browserName ? ( ` (${screenshot.platform.browserName}${ screenshot.platform.browserVersion ? (" " + screenshot.platform.browserVersion) : "" })` ) : "" }</td>
                                    </tr>
                                    {
                                      screenshot.platform && screenshot.platform.deviceName ? (
                                        <tr>
                                          <td><strong>Device: </strong>{ screenshot.platform.deviceName }</td>
                                        </tr>
                                      ) : null
                                    }
                                  </tbody>
                                </Table>
                              </div>
                              </Card.Footer>
                            </Card.Body>
                          </Card>
                        ]
                      })
                    }
                  </CardDeck>
                ):
                  <div className="alert alert-primary" role="alert">
                    <span><i className="fas fa-spinner fa-pulse fa-2x"></i>Loading history.</span>
                  </div>
                }
              </div>
            </Tab>
            <Tab eventKey="baseline" title="Overlay with Baseline" disabled={ !this.state.currentScreenshotDetails.platform || !this.state.currentScreenshotDetails.view }>
              <div className="image-page-holder">
              { this.state.currentBaseLineDetails ? (
                  this.isBaseline(this.state.currentScreenshotDetails._id) ?
                    "The current image is the baseline"
                  : this.state.currentBaselineCompare ? (
                    this.state.currentBaselineCompare !== "ERROR" ? (
                      <img className="screenshot" src={this.state.currentBaselineCompare} alt="Compare" />
                    ): <div className="alert alert-danger" role="alert">
                        <span>Failed to retrieve basedline compare.</span>
                       </div>
                  ) :
                  <div className="alert alert-primary" role="alert">
                    <span><i className="fas fa-spinner fa-pulse fa-2x"></i>Loading baseline compare.</span>
                  </div>
                )
              : "No Baseline selected yet for this view and deviceName or browser combination. To select a baseline, navigate to the image you want as a baseline and click on the \"Make Baseline Image\" button"
              }
              </div>
            </Tab>
            <Tab eventKey="sidebyside" title="Side by Side with Baseline" disabled={ !this.state.currentScreenshotDetails.platform || !this.state.currentScreenshotDetails.view }>
            <div className="image-page-holder">
              <Table>
                <tbody>
                <tr>
                  <td colSpan="100%" className={"sbs-header"}>
                    Original Image
                  </td>
                </tr>
                  <tr>
                    <td className={"screenshot-details-td"}>
                    <div>
                      <ScreenshotDetailsTable currentScreenshotDetails={this.state.currentScreenshotDetails } isBaseline={ this.isBaseline(this.state.currentScreenshotDetails._id)} />
                    </div>
                    </td>
                    <td>
                      {
                        this.state.currentScreenshot ? (
                          this.state.currentScreenshot === "ERROR" ? (
                            <div className="alert alert-danger" role="alert">
                                <span>Unable to retrieve image. Please refresh the page and try again.</span>
                            </div>
                          ) : <img className="screenshot" src={this.state.currentScreenshot} alt="Screenshot" /> ) :
                        <div className="alert alert-primary" role="alert">
                          <span><i className="fas fa-spinner fa-pulse fa-2x"></i> Retrieving screenshot.</span>
                        </div>
                      }
                    </td>
                  </tr>
                  {
                    this.state.currentBaseLineDetails ? ([
                      <tr key="title" className={"sbs-header"}>
                        <td colSpan="100%">
                          Baseline
                        </td>
                      </tr>,
                      <tr key="baseline-image">
                        <td className={"screenshot-details-td"}>
                        <div>
                          <ScreenshotDetailsTable currentScreenshotDetails={this.state.currentBaseLineDetails.screenshot } isBaseline={ this.isBaseline(this.state.currentScreenshotDetails._id)} />
                        </div>
                        </td>
                        <td>
                          {
                            this.state.currentBaseline ? (
                              this.state.currentBaseline === "ERROR" ? (
                                <div className="alert alert-danger" role="alert">
                                    <span>Unable to retrieve baseline image. Please refresh the page and try again.</span>
                                </div>
                              ) : <img className="screenshot" src={this.state.currentBaseline} alt="Baseline Screenshot" /> ) :
                            <div className="alert alert-primary" role="alert">
                              <span><i className="fas fa-spinner fa-pulse fa-2x"></i> Retrieving baseline screenshot.</span>
                            </div>
                          }
                        </td>
                      </tr>
                    ]) : null
                  }
                </tbody>
              </Table>
            </div>
            </Tab>
        </Tabs>
      </div>
    );
  }
}

export default withRouter(ScreenshotView);
