import React, { PureComponent } from "react";
import Header from "../components/Header";
import axios from "axios";
import { server, config } from "../env";
import Loader from "../components/Loader";
import Alert from "../components/Alert";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default class GeneateLabels extends PureComponent {
  state = {
    labels: [],
    page: 1,
    search: "",
    totalPages: 1,
    loader: "",
    label: {},
    message: "",
    recycleLoader: "",

    date: new Date(),
    type: "priority",

    fromStreetNumber: "",
    fromStreetNumber2: "",
    fromZip: "",
    fromCity: "",
    fromState: "",
    fromCountry: "",

    toStreetNumber: "",
    toStreetNumber2: "",
    toZip: "",
    toCity: "",
    toState: "",
    toCountry: "",

    isFromAddressVerified: false,
    isToAddressVerified: false,
    isVerificationInitiated: false,

    addressMessage: "",
    generateButtonClicked: 0,
  };

  componentDidMount = () => {};

  generateLabel = async (e) => {
    e.preventDefault();
    if (this.state.generateButtonClicked > 0) {
      window.location.reload();
    }
    this.setState({
      loader: <Loader />,
      generateButtonClicked: this.state.generateButtonClicked + 1,
    });

    const form = new FormData(e.target);
    const data = {};
    form.forEach((value, key) => {
      data[key] = value;
    });
    data.date = this.state.date;

    // format date in MM-DD-YYYY format
    const date = new Date(data.date);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    data.date = month + "-" + day + "-" + year;

    await axios
      .post(server + "/api/label/generate", data, {
        headers: {
          "x-api-key": "jKEAjLXKjgRCbBN2SsWP5wpTMk4cBfMh",
        },
      })
      .then((res) => {
        this.setState({
          addressMessage: (
            <Alert className="success" message={res.data.message} />
          ),
        });
      })
      .catch((err) => {
        this.setState({
          addressMessage: (
            <Alert className="danger" message={err.response?.data?.message} />
          ),
        });
      });

    this.setState({
      loader: "",
    });
  };

  onChange = (e) => {
    this.setState({ isVerificationInitiated: true });
    const { name, value } = e.target;
    if (name === "toZip" || name === "fromZip") {
      var code = "";
      if (value.includes("-") && value.length > 5) {
        code = value;
      } else if (value.includes("-") && value.length <= 5) {
        code = value.replaceAll("-", "");
      } else if (!value.includes("-") && value.length > 5) {
        code = value.substring(0, 5) + "-" + value.substring(5, value.length);
      } else if (!value.includes("-") && value.length < 5) {
        code = value;
      } else {
        code = value;
      }

      this.setState({
        [name]: code,
      });
    } else {
      this.setState({
        [e.target.name]: e.target.value,
      });
    }
  };

  verifyAddress = async (
    street1,
    street2,
    city,
    state,
    zip,
    type = "from"
  ) => {};

  zipCodeLookup = async (city, state, street1, street2, type = "from") => {
    console.log(city, state, street1, street2);
    if (!city) return;
    if (!state) return;
    if (!street1) return;

    const obj = {};
    if (street1) obj.street1 = street1;
    if (street2) obj.street2 = street2;
    if (city) obj.city = city;
    if (state) obj.state = state;

    this.setState({
      message: <Alert className="info" message="Processing..." />,
    });

    var result = {};
    await axios
      .post(
        server + "/api/usps/zipcode",
        {
          ...obj,
        },
        config
      )
      .then((res) => {
        if (res.data.payload) {
          result = res.data.payload;
          this.setState({
            message: "",
          });
        } else {
          this.setState({
            message: <Alert className="danger" message="Invalid Address" />,
          });
        }
      })
      .catch((err) => {
        this.setState({
          message: <Alert className="danger" message="Invalid Address" />,
        });
      });

    const zip = result.zip;

    if (type === "from" && result) {
      this.setState({
        fromZip: zip?.endsWith("-") ? zip?.slice(0, 5) : zip,
      });
    }
    if (type === "to" && result) {
      this.setState({
        toZip: zip?.endsWith("-") ? zip?.slice(0, 5) : zip,
      });
    }
  };

  cityStateLookup = async (zip, type = "form") => {
    if (zip.length !== 5) return;

    var result;
    const obj = {
      zip: zip.replaceAll("-", ""),
    };

    await axios
      .post(
        server + "/api/usps/city-state",
        {
          ...obj,
        },
        config
      )
      .then((res) => {
        if (res.data.payload) {
          result = res.data.payload;
          console.log(res.data.payload);
        }
      })
      .catch((err) => {});

    if (type === "from") {
      this.setState({
        fromCity: result.city,
        fromState: result.state,
      });
    }
    if (type === "to") {
      this.setState({
        toCity: result.city,
        toState: result.state,
      });
    }
  };

  recycleLabel = async () => {
    this.setState({
      recycleLoader: <Loader />,
    });

    await axios
      .post(
        server + "/api/admin/recycle-label",
        {
          id: this.state.label.id,
        },
        config
      )
      .then((res) => {
        this.readLabels();
        var modalCloseButton = document.getElementById("closeRecycleModal");
        if (modalCloseButton) modalCloseButton.click();
      })
      .catch((err) => {
        console.log(err);
      });
    this.setState({
      recycleLoader: "",
    });
  };

  render() {
    const { date } = this.state;
    const { loader } = this.state;

    const {
      type,
      fromStreetNumber,
      fromStreetNumber2,
      fromZip,
      fromCity,
      fromState,
      fromCountry,

      toStreetNumber,
      toStreetNumber2,
      toZip,
      toCity,
      toState,
      toCountry,
    } = this.state;

    // const { isFromAddressVerified, isToAddressVerified } = this.state;
    const { isVerificationInitiated, addressMessage } = this.state;

    return (
      <div className="main-content">
        <Header pretitle="Overview" title="Labels" />
        <div className="container-fluid">
          <form onSubmit={this.generateLabel}>
            <span className={isVerificationInitiated ? "" : "d-none"}>
              {addressMessage}
            </span>

            {/* Top ROw */}
            <div className="card mb-4">
              <div className="card-body">
                <div className="row">
                  <div className="col-12 mb-3 text-center">
                    ** THIS IS NOT USPS VALIDATED **
                  </div>
                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <label htmlFor="">Type</label>
                      <select
                        name="type"
                        id="type"
                        className="form-control"
                        required
                        onChange={(e) =>
                          this.setState({
                            type: e.target.value,
                          })
                        }
                      >
                        <option value="priority">Priority</option>
                        <option value="express">Express</option>
                        <option value="firstclass">First Class</option>
                        <option value="signature">Signature</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <label htmlFor="">
                        Weight ({type === "firstclass" ? "oz" : "lb"})
                      </label>
                      <input
                        type="number"
                        name="weight"
                        id="weight"
                        className="form-control"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <label htmlFor="">Date</label>
                      <DatePicker
                        selected={date}
                        onChange={(date) => this.setState({ date })}
                        className="form-control"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              {/* from */}
              <div className="col-md-6">
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex flex-column w-100">
                      {/* from name */}
                      <div className="col-md-12">
                        <div className="form-group mb-3">
                          <label htmlFor="">From Name</label>
                          <input
                            type="text"
                            name="fromName"
                            id="fromName"
                            className="form-control"
                            required
                          />
                        </div>
                      </div>

                      {/* fromRefNumber */}
                      <div className="col-md-12">
                        <div className="form-group mb-3">
                          <label htmlFor="">From Reference Number</label>
                          <input
                            type="text"
                            name="fromRefNumber"
                            id="fromRefNumber"
                            className="form-control"
                          />
                        </div>
                      </div>

                      {/* fromStreetNumber */}
                      <div className="col-md-12">
                        <div className="form-group mb-3">
                          <label htmlFor="">From Street Number</label>
                          <input
                            type="text"
                            name="fromStreetNumber"
                            id="fromStreetNumber"
                            className="form-control"
                            value={fromStreetNumber}
                            onChange={(e) => {
                              this.onChange(e);
                              this.zipCodeLookup(
                                fromCity,
                                fromState,
                                e.target.value,
                                fromStreetNumber2,
                                fromZip,
                                "from"
                              );
                              this.verifyAddress(
                                e.target.value,
                                fromStreetNumber2,
                                fromCity,
                                fromState,
                                "from"
                              );
                            }}
                            required
                          />
                        </div>
                      </div>

                      {/* fromStreetNumber2 */}
                      <div className="col-md-12">
                        <div className="form-group mb-3">
                          <label htmlFor="">From Street Number 2</label>
                          <input
                            type="text"
                            name="fromStreetNumber2"
                            id="fromStreetNumber2"
                            className="form-control"
                            value={fromStreetNumber2}
                            onChange={(e) => {
                              this.onChange(e);
                              this.zipCodeLookup(
                                fromCity,
                                fromState,
                                fromStreetNumber,
                                e.target.value,
                                fromZip,
                                "from"
                              );
                              this.verifyAddress(
                                fromStreetNumber,
                                e.target.value,
                                fromCity,
                                fromState,
                                "from"
                              );
                            }}
                          />
                        </div>
                      </div>

                      {/* fromCity */}
                      <div className="col-md-12">
                        <div className="form-group mb-3">
                          <label htmlFor="">From City</label>
                          <input
                            type="text"
                            name="fromCity"
                            id="fromCity"
                            className="form-control"
                            value={fromCity}
                            onChange={(e) => {
                              this.onChange(e);
                              this.zipCodeLookup(
                                e.target.value,
                                fromState,
                                fromStreetNumber,
                                fromStreetNumber2,
                                "from"
                              );
                              this.verifyAddress(
                                fromStreetNumber,
                                fromStreetNumber2,
                                e.target.value,
                                fromState,
                                fromZip,
                                "from"
                              );
                            }}
                            required
                          />
                        </div>
                      </div>

                      {/* fromState */}
                      <div className="col-md-12">
                        <div className="form-group mb-3">
                          <label htmlFor="">From State</label>
                          <input
                            type="text"
                            name="fromState"
                            id="fromState"
                            className="form-control"
                            value={fromState}
                            onChange={(e) => {
                              this.onChange(e);
                              this.zipCodeLookup(
                                fromCity,
                                e.target.value,
                                fromStreetNumber,
                                fromStreetNumber2,
                                fromZip,
                                "from"
                              );
                              this.verifyAddress(
                                fromStreetNumber,
                                fromStreetNumber2,
                                fromCity,
                                e.target.value,
                                "from"
                              );
                            }}
                            maxLength={2}
                            required
                          />
                        </div>
                      </div>

                      {/* fromZip */}
                      <div className="col-md-12">
                        <div className="form-group mb-3">
                          <label htmlFor="">From Zip</label>
                          <input
                            type="text"
                            name="fromZip"
                            id="fromZip"
                            value={fromZip}
                            onChange={(e) => {
                              this.onChange(e);
                              this.cityStateLookup(e.target.value, "from");
                              this.verifyAddress(
                                fromStreetNumber,
                                fromStreetNumber2,
                                fromCity,
                                fromState,
                                e.target.value,
                                "from"
                              );
                            }}
                            className="form-control"
                            required
                          />
                        </div>
                      </div>

                      {/* fromCountry */}
                      <div className="col-md-12">
                        <div className="form-group mb-3">
                          <label htmlFor="">From Country</label>
                          <input
                            type="text"
                            name="fromCountry"
                            id="fromCountry"
                            className="form-control"
                            value={fromCountry}
                            onChange={this.onChange}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* to */}
              <div className="col-md-6">
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex flex-column w-100">
                      {/* toName */}
                      <div className="col-md-12">
                        <div className="form-group mb-3">
                          <label htmlFor="">To Name</label>
                          <input
                            type="text"
                            name="toName"
                            id="toName"
                            className="form-control"
                            required
                          />
                        </div>
                      </div>

                      {/* toRefNumber */}
                      <div className="col-md-12">
                        <div className="form-group mb-3">
                          <label htmlFor="">To Reference Number</label>
                          <input
                            type="text"
                            name="toRefNumber"
                            id="toRefNumber"
                            className="form-control"
                          />
                        </div>
                      </div>

                      {/* toStreetNumber */}
                      <div className="col-md-12">
                        <div className="form-group mb-3">
                          <label htmlFor="">To Street Number</label>
                          <input
                            type="text"
                            name="toStreetNumber"
                            id="toStreetNumber"
                            className="form-control"
                            value={toStreetNumber}
                            onChange={(e) => {
                              this.onChange(e);
                              this.zipCodeLookup(
                                toCity,
                                toState,
                                e.target.value,
                                toStreetNumber2,
                                "to"
                              );
                              this.verifyAddress(
                                e.target.value,
                                toStreetNumber2,
                                toCity,
                                toState,
                                toZip,
                                "to"
                              );
                            }}
                            required
                          />
                        </div>
                      </div>

                      {/* toStreetNumber2 */}
                      <div className="col-md-12">
                        <div className="form-group mb-3">
                          <label htmlFor="">To Street Number 2</label>
                          <input
                            type="text"
                            name="toStreetNumber2"
                            id="toStreetNumber2"
                            className="form-control"
                            value={toStreetNumber2}
                            onChange={(e) => {
                              this.onChange(e);
                              this.zipCodeLookup(
                                toCity,
                                toState,
                                toStreetNumber,
                                e.target.value,
                                "to"
                              );
                              this.verifyAddress(
                                toStreetNumber,
                                e.target.value,
                                toCity,
                                toState,
                                toZip,
                                "to"
                              );
                            }}
                          />
                        </div>
                      </div>

                      {/* toCity */}
                      <div className="col-md-12">
                        <div className="form-group mb-3">
                          <label htmlFor="">To City</label>
                          <input
                            type="text"
                            name="toCity"
                            id="toCity"
                            className="form-control"
                            value={toCity}
                            onChange={(e) => {
                              this.onChange(e);
                              this.zipCodeLookup(
                                e.target.value,
                                toState,
                                toStreetNumber,
                                toStreetNumber2,
                                "to"
                              );
                              this.verifyAddress(
                                toStreetNumber,
                                toStreetNumber2,
                                e.target.value,
                                toState,
                                toZip,
                                "to"
                              );
                            }}
                            required
                          />
                        </div>
                      </div>

                      {/* toState */}
                      <div className="col-md-12">
                        <div className="form-group mb-3">
                          <label htmlFor="">To State</label>
                          <input
                            type="text"
                            name="toState"
                            id="toState"
                            className="form-control"
                            value={toState}
                            onChange={(e) => {
                              this.onChange(e);
                              this.zipCodeLookup(
                                toCity,
                                e.target.value,
                                toStreetNumber,
                                toStreetNumber2,
                                "to"
                              );
                              this.verifyAddress(
                                toStreetNumber,
                                toStreetNumber2,
                                toCity,
                                e.target.value,
                                toZip,
                                "to"
                              );
                            }}
                            maxLength={2}
                            required
                          />
                        </div>
                      </div>

                      {/* toZip */}
                      <div className="col-md-12">
                        <div className="form-group mb-3">
                          <label htmlFor="">To Zip</label>
                          <input
                            type="text"
                            name="toZip"
                            id="toZip"
                            className="form-control"
                            value={toZip}
                            onChange={(e) => {
                              this.onChange(e);
                              this.cityStateLookup(e.target.value, "to");
                              this.verifyAddress(
                                toStreetNumber,
                                toStreetNumber2,
                                toCity,
                                toState,
                                e.target.value,
                                "to"
                              );
                            }}
                            required
                          />
                        </div>
                      </div>

                      {/* toCountry */}
                      <div className="col-md-12">
                        <div className="form-group mb-3">
                          <label htmlFor="">To Country</label>
                          <input
                            type="text"
                            name="toCountry"
                            id="toCountry"
                            className="form-control"
                            value={toCountry}
                            onChange={this.onChange}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="form-group text-end mb-3">
                <button type="submit" className="btn btn-primary">
                  Generate Label {loader}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
