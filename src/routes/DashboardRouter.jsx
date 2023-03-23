import { BrowserRouter, Switch, Route } from "react-router-dom";

// Helper Components
import Sidebar from "../components/Sidebar";
import Barcodes from "../source/Barcodes";
import Dashboard from "../source/Dashboard";
import Labels from "../source/Labels";
import Settings from "../source/Settings";
import Stats from "../source/Stats";
import Users from "../source/Users";
import Workers from "../source/Workers";
import Tickets from "../source/Ticket";
import Pricing from "../source/Pricing";
import GeneateLabels from "../source/GeneateLabel";

export default function AuthRouter() {
  document.body.classList.remove("d-flex-grid");
  document.body.classList.remove("bg-auth");

  return (
    <BrowserRouter>
      <Sidebar />
      <Switch>
        <Route path="/pricing/:userid" component={Pricing} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/tickets" component={Tickets} />
        <Route path="/users" component={Users} />
        <Route path="/website" component={Stats} />
        <Route path="/settings" component={Settings} />
        <Route path="/workers" component={Workers} />
        <Route path="/generate-label" component={GeneateLabels} />
        <Route path="/labels" component={Labels} />
        <Route path="/barcodes" component={Barcodes} />
        <Route path="/" component={Dashboard} />
      </Switch>
    </BrowserRouter>
  );
}
