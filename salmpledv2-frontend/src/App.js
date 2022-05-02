import React from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom'
import { Container } from "react-bootstrap";

import Loading from "./components/Loading";
import NavBar from "./components/NavBar";
import Home from "./views/Home";
import Dashboard from "./views/Dashboard";
import ExternalApi from "./views/ExternalApi";
import { useAuth0 } from "@auth0/auth0-react";
import history from "./utils/history";
import CreateNewPack from "./views/CreateNewPack";
import EditPack from "./views/EditPack";
import Invite from "./views/Invite";
import Search from "./views/Search";
// styles
import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
// fontawesome
import initFontAwesome from "./utils/initFontAwesome";
import { PackHistory } from "./views/PackHistory";
initFontAwesome();

const App = () => {
  const { isLoading, error } = useAuth0();

  

  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (isLoading) {
    return <Loading />;
  }

  

  return (
    <Router history={history}>
      <div id="app" className="bg-dark min-vh-100">
        <NavBar />
        <Container fluid>
          <Routes>
            <Route path="/" exact element={<Home/>} />
            <Route path="/dashboard" exact element={<Dashboard/>} />
            <Route path="/external-api" exact element={<ExternalApi/>} />
            <Route path="/newpack" exact element={<CreateNewPack/>} />
            <Route path="/edit/:username/:pack" exact element={<EditPack/>} />
            <Route path="/history/:username/:pack" exact element={<PackHistory/>} />
            <Route path="/invite/:username/:pack" exact element={<Invite/>} />
            <Route path="/search" exact element={<Search/>} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
};

export default App;
