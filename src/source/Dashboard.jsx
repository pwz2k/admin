import React, { PureComponent } from "react";
import Header from "../components/Header";
import { Link } from "react-router-dom";
import TopCard from "../components/TopCard";
import axios from "axios";
import { server, config } from "../env";
import { LineChart } from "../tools/helper";
import ApiRequests from "../tools/ApiRequests";

const apiRequests = new ApiRequests();

export default class Dashboard extends PureComponent {
  state = {
    stats: {
      barcodes: 0,
      labels: 0,
    },
    chart: [],
    users: [],
  };

  componentDidMount = async () => {
    this.readUsersSpending();
    await axios(server + "/api/admin/access", config)
      .then((rsp) => {
        if (!rsp.data.payload.superAccess) {
          this.props.history.push("/barcodes");
        }
      })
      .catch((err) => {
        console.log(err);
      });
    this.readStats();
  };

  readStats = async (filter = "t") => {
    const e = document.getElementById("labels");
    var canvas = document.createElement("CANVAS");
    while (e.firstChild) {
      e.removeChild(e.firstChild);
    }
    e.appendChild(canvas);
    canvas.classList.add("chart-canvas");
    await axios(server + "/api/admin/dashboard?filter=" + filter, config).then(
      (rsp) => {
        this.setState({
          stats: rsp.data.payload.stats,
          chart: rsp.data.payload.chart,
        });
        const data = {
          labels: rsp.data.payload.chart.map((e) => e.label).reverse(),
          datasets: [
            {
              label: "Earned",
              data: rsp.data.payload.chart.map((e) => e.count).reverse(),
            },
          ],
        };
        LineChart(canvas, data);
      }
    );
  };

  readUsersSpending = async () => {
    const { data } = await apiRequests.readUsersSpending();
    this.setState({
      users: data,
    });
  };

  render() {
    const { stats, users } = this.state;
    return (
      <div className="main-content">
        <Header pretitle="Overview" title="Dashboard" />
        <div className="container-fluid">
          <div className="row">
            <TopCard
              title="Total Labels"
              value={stats.labels}
              icon="fe-tag"
              col={6}
            />
            <TopCard
              title="Available Barcodes"
              value={stats.barcodes}
              icon="fe-code"
              col={6}
            />
          </div>
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h4 className="card-header-title">Labels generated</h4>
                  <ul className="nav nav-tabs nav-tabs-sm card-header-tabs">
                    <li className="nav-item">
                      <Link
                        href="#"
                        className="nav-link active"
                        data-bs-toggle="tab"
                        onClick={() => this.readStats("t")}
                      >
                        Today
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        href="#"
                        className="nav-link"
                        data-bs-toggle="tab"
                        onClick={() => this.readStats("w")}
                      >
                        Week
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        href="#"
                        className="nav-link"
                        data-bs-toggle="tab"
                        onClick={() => this.readStats("m")}
                      >
                        Month
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        href="#"
                        className="nav-link"
                        data-bs-toggle="tab"
                        onClick={() => this.readStats("y")}
                      >
                        Year
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="card-body">
                  <div className="chart" id="labels"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h4 className="card-header-title">Users Leaderboard</h4>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm table-nowrap card-table">
                  <thead>
                    <tr>
                      <th>
                        <Link to="#" className="text-muted">
                          USER ID
                        </Link>
                      </th>
                      <th>
                        <Link to="#" className="text-muted">
                          USERNAME
                        </Link>
                      </th>
                      <th>
                        <Link to="#" className="text-muted">
                          EMAIL
                        </Link>
                      </th>
                      <th>
                        <Link to="#" className="text-muted">
                          BALANCE
                        </Link>
                      </th>
                      <th>
                        <Link to="#" className="text-muted">
                          Spending
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
                        <td>${user.balance?.toFixed(2)}</td>
                        <td>${user.spent?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
