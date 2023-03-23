import React, { PureComponent } from "react";
import Header from "../components/Header";
import axios from "axios";
import { server, config } from "../env";
import Loader from "../components/Loader";
import Alert from "../components/Alert";
import { Link } from "react-router-dom";

export default class Settings extends PureComponent {
  state = {
    loader: "",
    message: "",
  };

  update = async (e) => {
    e.preventDefault();

    this.setState({
      loader: <Loader />,
    });

    const params = {
      password: e.target.password.value,
    };

    await axios
      .post(server + "/api/admin/update-password", params, config)
      .then((rsp) => {
        this.setState({
          message: <Alert className="success" message={rsp.data.message} />,
        });
      })
      .catch((err) => {
        this.setState({
          message: (
            <Alert
              className="danger"
              message={
                err.response?.data.message || "Error while updating password"
              }
            />
          ),
        });
      });
    this.setState({
      loader: "",
    });
  };

  render() {
    const { loader, message } = this.state;

    return (
      <div className="main-content">
        <Header pretitle="Overview" title="Settings" />
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-5">
              <div className="card">
                <div className="card-body">
                  <form onSubmit={this.update}>
                    {message}
                    <div className="form-group">
                      <label htmlFor="password">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        placeholder="New Password"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <button type="submit" className="btn btn-primary">
                        Update Password {loader}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
