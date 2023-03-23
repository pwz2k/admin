import { server, config } from "../env";
import axios from "axios";

export default class ApiRequests {
  async getTickets(page, search = "") {
    var data = [];
    var error = false;

    await axios
      .post(
        server + "/api/ticket/read",
        {
          page,
          search,
        },
        config
      )
      .then((res) => {
        data = res.data.payload;
      })
      .catch((err) => {
        error = true;
      });

    return { data, error };
  }

  async getTicket(id) {
    var data = {};
    var error = false;

    await axios
      .get(server + "/api/ticket/read/" + id, config)
      .then((res) => {
        data = res.data.payload;
      })
      .catch((err) => {
        error = true;
      });

    return { data, error };
  }

  async createTicket(data) {
    var error = false;

    await axios
      .post(server + "/api/ticket/create", data, config)
      .then((res) => {})
      .catch((err) => {
        error = true;
      });

    return error;
  }

  async sendTicketMessage(data) {
    var error = false;

    await axios
      .post(server + "/api/ticket/reply", data, config)
      .then((res) => {})
      .catch((err) => {
        error = true;
      });

    return error;
  }

  async setTicketStatus(data) {
    var error = false;

    var path = data.status === "open" ? "/open/" : "/close/";

    await axios
      .post(server + "/api/ticket/" + path + data.id, data, config)
      .then((res) => {})
      .catch((err) => {
        error = true;
      });

    return error;
  }

  async getPricing(id = null) {
    var data = [];
    var error = false;

    var path = !id ? "/api/pricing/read" : "/api/pricing/read/" + id;

    await axios
      .get(server + path, config)
      .then((res) => {
        data = res.data.payload || [];
      })
      .catch((err) => {
        error = true;
      });

    return { data, error };
  }

  async createPricing(data) {
    var error = false;

    await axios
      .post(server + "/api/pricing/create", data, config)
      .then((res) => {})
      .catch((err) => {
        error = true;
      });

    return error;
  }

  async updatePricing(data) {
    var error = false;

    await axios
      .put(server + "/api/pricing/update", data, config)
      .then((res) => {})
      .catch((err) => {
        error = true;
      });

    return error;
  }

  async deletePricing(id) {
    var error = false;

    await axios
      .delete(server + "/api/pricing/delete/" + id, config)
      .then((res) => {})
      .catch((err) => {
        error = true;
      });

    return error;
  }

  async createUserPricing(data) {
    var error = false;

    await axios
      .post(server + "/api/pricing/user/create", data, config)
      .then((res) => {})
      .catch((err) => {
        error = true;
      });

    return error;
  }

  async updateUserPricing(data) {
    var error = false;

    await axios
      .put(server + "/api/pricing/user/update", data, config)
      .then((res) => {})
      .catch((err) => {
        error = true;
      });

    return error;
  }

  async deleteUserPricing(id) {
    var error = false;

    await axios
      .delete(server + "/api/pricing/user/delete/" + id, config)
      .then((res) => {})
      .catch((err) => {
        error = true;
      });

    return error;
  }

  async readUsersSpending() {
    var data = [];
    var error = false;

    await axios
      .get(server + "/api/admin/user/readUsersSpending", config)
      .then((res) => {
        data = res.data.payload || [];
      })
      .catch((err) => {
        error = true;
      });

    return { data, error };
  }
}
