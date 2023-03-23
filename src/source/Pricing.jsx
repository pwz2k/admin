import React, { PureComponent } from "react";
import Header from "../components/Header";
import axios from "axios";
import { server, config } from "../env";
import Loader from "../components/Loader";
import Alert from "../components/Alert";
import Modal from "../components/Modal";
import { Link } from "react-router-dom";
import { hideModal } from "../tools/helper";
import ApiRequests from "../tools/ApiRequests";
const apiRequests = new ApiRequests();

export default class Pricing extends PureComponent {
  state = {
    userId: parseInt(window.location.href.split("/").pop()),
    pricing: [],
    pricingObj: {},

    loader: {
      create: "",
      update: "",
    },
    message: {
      create: "",
      update: "",
    },

    ticket: {},
  };

  componentDidMount = () => {
    if (this.state.userId) {
      this.readPricing(this.state.userId);
    } else {
      this.readPricing();
    }
  };

  readPricing = async (id = this.state.userId) => {
    const { data } = await apiRequests.getPricing(id);
    this.setState({
      pricing: Object.keys(data).length > 0 ? data : [],
    });
  };

  addPricing = async (e) => {
    e.preventDefault();
    this.setState({
      loader: { ...this.state.loader, create: <Loader /> },
    });

    const form = e.target;
    const userId = this.state.userId;
    const data = {
      type: form.type.value,
      fromWeight: form.fromWeight.value,
      toWeight: form.toWeight.value,
      price: parseFloat(form.price.value),
      userId: userId,
    };

    var error = "";

    if (userId) error = await apiRequests.createUserPricing(data);
    else error = await apiRequests.createPricing(data);

    if (!error) {
      this.setState({
        message: {
          ...this.state.message,
          create: (
            <Alert className="success" message="Pricing created sucessfully." />
          ),
        },
      });
    } else {
      this.setState({
        message: {
          ...this.state.message,
          create: (
            <Alert className="danger" message="Error while creating price." />
          ),
        },
      });
    }
    this.setState({
      loader: { ...this.state.loader, create: "" },
    });
    this.readPricing();
    hideModal("newPricing");
  };

  updatePricing = async (e) => {
    e.preventDefault();
    this.setState({
      loader: { ...this.state.loader, update: <Loader /> },
    });

    const form = e.target;
    const userId = this.state.userId;
    const data = {
      id: this.state.pricingObj?.id,
      type: form.type.value,
      fromWeight: form.fromWeight.value,
      toWeight: form.toWeight.value,
      price: parseFloat(form.price.value),
    };

    var error = "";

    if (userId) error = await apiRequests.updateUserPricing(data);
    else error = await apiRequests.updatePricing(data);

    if (!error) {
      this.setState({
        message: {
          ...this.state.message,
          update: (
            <Alert className="success" message="Pricing updated sucessfully." />
          ),
        },
      });
    } else {
      this.setState({
        message: {
          ...this.state.message,
          update: (
            <Alert className="danger" message="Error while updating price." />
          ),
        },
      });
    }
    this.setState({
      loader: { ...this.state.loader, update: "" },
    });
    this.readPricing();
    hideModal("updatePrice");
  };

  deletePricing = async (id) => {
    const userId = this.state.userId;
    if (userId) await apiRequests.deleteUserPricing(id);
    else await apiRequests.deletePricing(id);
    this.readPricing();
  };

  render() {
    const { pricing, pricingObj, userId } = this.state;
    const { loader, message } = this.state;

    return (
      <div className="main-content">
        <Header pretitle="Overview" title="Pricing" />
        <div className="container-fluid">
          <div className="d-flex justify-content-end mb-3 w-100">
            <button
              className="btn btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#newPricing"
            >
              + New Pricing
            </button>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="card">
                {userId ? (
                  <div className="card-header">USER - {userId}</div>
                ) : (
                  ""
                )}
                <div className="table-responsive">
                  <table className="table table-sm table-nowrap card-table">
                    <thead>
                      <tr>
                        <th>
                          <Link to="#" className="text-muted">
                            ID
                          </Link>
                        </th>
                        <th>
                          <Link to="#" className="text-muted">
                            TYPE
                          </Link>
                        </th>
                        <th>
                          <Link to="#" className="text-muted">
                            FROM WEIGHT
                          </Link>
                        </th>
                        <th>
                          <Link to="#" className="text-muted">
                            TO WEIGHT
                          </Link>
                        </th>
                        <th>
                          <Link to="#" className="text-muted">
                            PRICE
                          </Link>
                        </th>
                        <th>
                          <Link to="#" className="text-muted">
                            Actions
                          </Link>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="list">
                      {pricing.map((pricingObj) => (
                        <tr key={pricingObj.id}>
                          <td>{pricingObj.id}</td>
                          <td>{pricingObj.type.toUpperCase()}</td>
                          <td>{pricingObj.fromWeight} lb</td>
                          <td>{pricingObj.toWeight} lb</td>
                          <td>${pricingObj.price?.toFixed(2)}</td>
                          <td>
                            <button
                              className="btn btn-warning btn-sm me-2"
                              onClick={() =>
                                this.setState({ pricingObj: pricingObj })
                              }
                              data-bs-toggle="modal"
                              data-bs-target="#updatePrice"
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger btn-sm me-2"
                              onClick={() => this.deletePricing(pricingObj.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Modal id="newPricing" title="New Price">
          <div className="modal-body">
            <form onSubmit={this.addPricing}>
              {message.create}
              <div className="form-group">
                <label htmlFor="">Type</label>
                <select name="type" id="type" className="form-control" required>
                  <option value="priority">Priority</option>
                  <option value="express">Express</option>
                  <option value="firstclass">First Class</option>
                  <option value="signature">Signature</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="">From Weight</label>
                <input
                  type="number"
                  step="0.01"
                  name="fromWeight"
                  id="fromWeight"
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="">To Weight</label>
                <input
                  type="number"
                  step="0.01"
                  name="toWeight"
                  id="toWeight"
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="">Price (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  id="price"
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <button type="submit" className="btn btn-primary">
                  Add Price {loader.create}
                </button>
              </div>
            </form>
          </div>
        </Modal>

        <Modal id="updatePrice" title="Update Price">
          <div className="modal-body">
            {pricingObj && (
              <form onSubmit={this.updatePricing}>
                {message.update}
                <div className="form-group">
                  <label htmlFor="">Type</label>
                  <select
                    name="type"
                    id="type"
                    className="form-control"
                    value={pricingObj.type}
                    onChange={(e) =>
                      this.setState({
                        pricingObj: {
                          ...pricingObj,
                          type: e.target.value,
                        },
                      })
                    }
                    required
                  >
                    <option value="priority">Priority</option>
                    <option value="express">Express</option>
                    <option value="firstclass">First Class</option>
                    <option value="signature">Signature</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="">From Weight</label>
                  <input
                    type="number"
                    step="0.01"
                    name="fromWeight"
                    id="fromWeight"
                    className="form-control"
                    defaultValue={pricingObj.fromWeight}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="">To Weight</label>
                  <input
                    type="number"
                    step="0.01"
                    name="toWeight"
                    id="toWeight"
                    className="form-control"
                    defaultValue={pricingObj.toWeight}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="">Price (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    id="price"
                    className="form-control"
                    defaultValue={pricingObj.price}
                    required
                  />
                </div>

                <div className="form-group">
                  <button type="submit" className="btn btn-primary">
                    Update Price {loader.update}
                  </button>
                </div>
              </form>
            )}
          </div>
        </Modal>
      </div>
    );
  }
}
