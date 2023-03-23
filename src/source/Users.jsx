import React, { PureComponent } from "react";
import Header from "../components/Header";
import axios from "axios";
import { server, config } from "../env";
import Loader from "../components/Loader";
import Alert from "../components/Alert";
import Modal from "../components/Modal";
import { Link } from "react-router-dom";
import { hideModal } from "../tools/helper";

export default class Users extends PureComponent {
  state = {
    users: [],
    page: 1,
    totalPages: 1,

    loader: "",
    message: "",
    pager: {
      page: 1,
      search: "",
    },
    user: {},
  };

  componentDidMount = () => {
    this.readUsers();
  };

  readUsers = async (
    search = this.state.pager.search,
    page = this.state.pager.page
  ) => {
    await axios
      .post(
        server + "/api/admin/user/readAll",
        {
          search,
          page,
        },
        config
      )
      .then((res) => {
        this.setState({
          users: res.data.payload.users,
          pager: res.data.payload.pager,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  blockUnblockUser = async (userId) => {
    await axios
      .post(
        server + "/api/admin/user/change-status",
        {
          userId,
        },
        config
      )
      .then((rsp) => {
        this.readUsers();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  newUser = async (e) => {
    e.preventDefault();

    this.setState({
      loader: <Loader />,
    });

    const params = {
      username: e.target.username.value,
      email: e.target.email.value,
      password: e.target.password.value,
    };

    await axios
      .post(server + "/api/admin/user/create", params, config)
      .then((rsp) => {
        this.setState({
          message: (
            <Alert className="success" message="User Created Successfully" />
          ),
        });
        this.readUsers();
        hideModal("newUser");
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          message: <Alert className="danger" message="Error Creating User" />,
        });
      });
    this.setState({
      loader: "",
    });
  };

  updateUser = async (e) => {
    e.preventDefault();

    this.setState({
      loader: <Loader />,
    });

    await axios
      .post(server + "/api/admin/user/update", this.state.user, config)
      .then((rsp) => {
        this.setState({
          message: (
            <Alert className="success" message="User updated successfully" />
          ),
        });
        hideModal("updateUser");
        this.readUsers();
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          message: <Alert className="danger" message="Error updating user" />,
        });
      });
    this.setState({
      loader: "",
    });
  };

  render() {
    const { users, user } = this.state;
    const { loader, message } = this.state;

    return (
      <div className="main-content">
        <Header pretitle="Overview" title="Users" />
        <div className="container-fluid">
          <div className="d-flex justify-content-end mb-3 w-100">
            <button
              className="btn btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#newUser"
            >
              + New User
            </button>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="card">
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
                            Username
                          </Link>
                        </th>
                        <th>
                          <Link to="#" className="text-muted">
                            Email
                          </Link>
                        </th>
                        <th>
                          <Link to="#" className="text-muted">
                            Balance
                          </Link>
                        </th>
                        <th>
                          <Link to="#" className="text-muted">
                            Status
                          </Link>
                        </th>
                        <th>
                          <Link to="#" className="text-muted">
                            Date
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
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td>${user.balance.toFixed(2)}</td>
                          <td>
                            {user.isActive ? (
                              <span className="badge bg-success">Active</span>
                            ) : (
                              <span className="badge bg-danger">Blocked</span>
                            )}
                          </td>
                          <td>{new Date(user.createdAt).toDateString()}</td>
                          <td>
                            <Link
                              className="btn btn-success btn-sm me-2"
                              to={"/pricing/" + user.id}
                            >
                              <i className="fe fe-dollar-sign"></i>
                            </Link>
                            <button
                              className="btn btn-warning btn-sm me-2"
                              onClick={() => this.setState({ user: user })}
                              data-bs-toggle="modal"
                              data-bs-target="#updateUser"
                            >
                              <div className="fe fe-edit"></div>
                            </button>
                            {user.isActive ? (
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => this.blockUnblockUser(user.id)}
                              >
                                Block
                              </button>
                            ) : (
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => this.blockUnblockUser(user.id)}
                              >
                                Unblock
                              </button>
                            )}
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

        <Modal id="newUser" title="New User">
          <div className="modal-body">
            <form onSubmit={this.newUser}>
              {message}
              <div className="form-group">
                <label htmlFor="">Username</label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="">Password</label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <button type="submit" className="btn btn-primary">
                  Add User {loader}
                </button>
              </div>
            </form>
          </div>
        </Modal>

        <Modal id="updateUser" title="Update User">
          <div className="modal-body">
            {user && (
              <form onSubmit={this.updateUser}>
                {message}
                <div className="form-group">
                  <label htmlFor="">Username</label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    className="form-control"
                    value={user.username}
                    onChange={(e) =>
                      this.setState({
                        user: { ...user, username: e.target.value },
                      })
                    }
                    required
                  />
                </div>
                {/* <div className="form-group">
                  <label htmlFor="">Email</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="form-control"
                    value={user.email}
                    onChange={(e) =>
                      this.setState({
                        user: { ...user, email: e.target.value },
                      })
                    }
                    required
                  />
                </div> */}
                <div className="form-group">
                  <label htmlFor="">Balance (USD)</label>
                  <br />
                  <small>
                    This will replace the current balance of the user
                  </small>
                  <input
                    type="number"
                    name="balance"
                    id="number"
                    className="form-control"
                    value={user.balance}
                    step="0.01"
                    onChange={(e) =>
                      this.setState({
                        user: { ...user, balance: parseFloat(e.target.value) },
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="">
                    Password (Leave empty for old password)
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    className="form-control"
                    onChange={(e) =>
                      this.setState({
                        user: { ...user, password: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <button type="submit" className="btn btn-primary">
                    Update User {loader}
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
