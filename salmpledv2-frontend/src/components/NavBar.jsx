import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


import {
  Container,
  Nav,
  Navbar,
  Button
} from 'react-bootstrap'

import { useAuth0 } from "@auth0/auth0-react";

const NavBar = () => {

  const {
    user,
    isAuthenticated,
    loginWithRedirect,
    logout,
  } = useAuth0();

  const logoutWithRedirect = () =>
    logout({
      returnTo: window.location.origin,
    });

  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand> Salmpled </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Item>
              <NavLink
                className="nav-link"
                to="/"
              >
                Home
              </NavLink>
            </Nav.Item>
            <Nav.Item>
              <NavLink
                className="nav-link"
                to="/search"
              >
                Search
              </NavLink>
            </Nav.Item>
            {
              isAuthenticated && (
                <>
                  <Nav.Item>
                    <NavLink
                      className="nav-link"
                      to="/external-api"
                    >
                      External API
                    </NavLink>
                  </Nav.Item>
                  <Nav.Item>
                    <NavLink
                      className="nav-link"
                      to="/dashboard"
                    >
                      Dashboard
                    </NavLink>

                  </Nav.Item>
                  <Nav.Item>
                    <Button
                      variant="light"
                      onClick={() => logoutWithRedirect()}
                    >
                      Log Out
                    </Button>
                  </Nav.Item>
                </>
              )

            }
            {
              !isAuthenticated && (
                <Nav.Item>
                  <Button
                  variant="light"

                    onClick={() => loginWithRedirect()}
                  >
                    Log in
                  </Button>
                </Nav.Item>
              )
            }
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar >

  )
};

export default NavBar;
