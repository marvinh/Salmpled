import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";

import Highlight from "react-highlight";
import Loading from "../components/Loading";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { useMediaQuery } from 'react-responsive'
import classnames from 'classnames'

import {
  Button
} from 'react-bootstrap'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router";
import { authorized, nodeUnauthorized } from "../utils/http";
import { Link } from "react-router-dom";

export const DashboardComponent = (props) => {
  const { user, getAccessTokenSilently } = useAuth0();
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' })

  const navigate = useNavigate()

  const handleCreateNewPack = () => {
    navigate("/newpack");
  }
  const [totalSize, setTotalSize] = useState(0)

  const [collab, setCollab] = useState([])

  const [yours, setYours] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      let { data } = await nodeUnauthorized().post("/TotalSize", {
        username: user["https://myapp.example.com/username"]
      })

      let { result, err } = data

      const gb = result / parseFloat(1e+9)
      setTotalSize(p => gb)
    }

    fetchData();
  }, [])

  useEffect(() => {

    const fetchData = async () => {
      const token = await getAccessTokenSilently()
      let { data } = await authorized(token).post("/Pack/YourSamplePacks")

      let { result, err } = data

      setYours(p => Object.assign([], p, result))


    }

    fetchData();
  }, [])

  useEffect(() => {

    const fetchData = async () => {
      const token = await getAccessTokenSilently()
      let { data } = await authorized(token).post("/Pack/CollabPacks")

      let { result, err } = data

      setCollab(p => Object.assign([], p, result))

    }

    fetchData();
  }, [])

  return (
    <Container fluid>
      <div className={classnames("d-flex", "min-vh-100", { 'flex-column': isTabletOrMobile })}>
        <div className={classnames("bg-dark", { "w-25": !isTabletOrMobile })} style={{ background: "#000" }}>
          <div className="text-center mt-4 mb-4">
            <Button size="sm" variant="light" onClick={handleCreateNewPack}>
              <FontAwesomeIcon className="me-2" icon="fa-plus" />
              Create New Sample Pack
            </Button>
            <Row>
              <Highlight className="json">{JSON.stringify(user, null, 2)}</Highlight>
            </Row>
          </div>
        </div>
        <div className={classnames("bg-light", { "w-75": !isTabletOrMobile })}>
          <p className="h4 m-2 p-2"> Media Memory Usage: {totalSize} GB</p>
          <p className="h4 m-2 p-2"> Your Sample Packs: </p>
          <ul>
            {
              yours ?
                yours.map((ele, index) => {
                  return <li key={index}><Button variant="link" onClick={() => navigate(`/edit/${ele.user.username}/${ele.slug}`)}> {ele.name}</Button></li>
                })
                :
                <Loading />
            }

          </ul>
          <p className="h4 m-2 p-2"> Your Collaborations: </p>
          <ul>
            {
              collab ?
                collab.map((ele, index) => {
                  return <li key={index}><Button variant="link" onClick={() => navigate(`/edit/${ele.user.username}/${ele.slug}`)}> {ele.name}</Button></li>
                })
                :
                <Loading />
            }
          </ul>
        </div>
      </div>

    </Container>
  );
};

export default withAuthenticationRequired(DashboardComponent, {
  onRedirecting: () => <Loading />,
});
