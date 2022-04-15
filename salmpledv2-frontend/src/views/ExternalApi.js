import React, { useState, useCallback } from "react";
import { Button, Alert } from "react-bootstrap";
import Highlight from "react-highlight";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { getConfig } from "../config";
import Loading from "../components/Loading";
import { authorized, nodeAuthorized } from "../utils/http"
import { useDropzone } from 'react-dropzone'
import Axios from "axios";


function MyDropzone({ handleFileDrop }) {
  const onDrop = useCallback(acceptedFiles => {
    // Do something with the files
    handleFileDrop(acceptedFiles)
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {
        isDragActive ?
          <p>Drop the files here ...</p> :
          <p>Drag 'n' drop some files here, or click to select files</p>
      }
    </div>
  )
}

export const ExternalApiComponent = () => {
  const { apiOrigin = "http://localhost:3010", audience } = getConfig();

  console.log(audience)
  const [state, setState] = useState({
    showResult: false,
    apiMessage: "",
    error: null,
  });

  const {
    user,
    getIdTokenClaims,
    getAccessTokenSilently,
    loginWithPopup,
    getAccessTokenWithPopup,
  } = useAuth0();

  const handleConsent = async () => {
    try {
      await getAccessTokenWithPopup();
      setState({
        ...state,
        error: null,
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }

    await callApi();
  };

  const handleLoginAgain = async () => {
    try {
      await loginWithPopup();
      setState({
        ...state,
        error: null,
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }

    await callApi();
  };

  const testRegister = async () => {
    const token = await getAccessTokenSilently();

    let { data } = await authorized(token).post('/User/PostRegisterUser', {
      subId: user.sub,
      username: user['https://myapp.example.com/username'],
      email: user.email,
    })

    console.log(data)

  }

  const getClaims = async () => {
    const token = await getAccessTokenSilently();

    let { data } = await authorized(token).post(`/User/claims`);

    console.log(data);
  }

  const createPack = async () => {
    const token = await getAccessTokenSilently();

    let { data } = await authorized(token).post(`/Pack/CreatePack`, {
      name: "Test Pack",
    })
    console.log(data);
  }

  const getPresignedUrlForUpload = async () => {
    const token = await getAccessTokenSilently();

    let { data } = await nodeAuthorized(token).post(`/CreatePostObjectUrl`, {
      packOwner: `marvinh`,
      packName: `Test Pack`,
      fileType: ``,
    })

    console.log(data)


  }

  const callApi = async () => {
    try {
      const token = await getAccessTokenSilently();

      const response = await fetch(`${apiOrigin}/api/public`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = await response.json();

      setState({
        ...state,
        showResult: true,
        apiMessage: responseData,
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }
  };

  const handle = (e, fn) => {
    e.preventDefault();
    fn();
  };

  const handleFileDrop = async (files) => {
    const token = await getAccessTokenSilently();

    try {
    let { data } = await nodeAuthorized(token).post(`/CreatePostObjectUrl`, {
      packOwner: `marvinh`,
      packName: `LargeFileReject`,
      fileName: files[0].name,
    })

    console.log(data)
    let { s3_post, err } = data
    let { url, fields } = s3_post
    var formData = new FormData()

    for (var x in fields) {
      console.log(x)
      formData.append(x, fields[x])
    }
   
    console.log(fields.Policy)

    formData.append('file', files[0])
   
      let res = await Axios.post(url, formData)
        .then((res) => console.log(res))
        .catch((err) => console.log(err))

      nodeAuthorized(token).post(`/TranscodeToMP3`, {
        bucket: 'salmpledv2',
        key: fields.key,
      }).then((res) => {
        console.log(res)
      })
        .catch((err) => {
          console.log(err)
        })

    } catch (err) {
      alert(err)
    }


  }

  return (
    <>
      <div className="mb-5">
        {state.error === "consent_required" && (
          <Alert color="warning">
            You need to{" "}
            <a
              href="#/"
              class="alert-link"
              onClick={(e) => handle(e, handleConsent)}
            >
              consent to get access to users api
            </a>
          </Alert>
        )}

        {state.error === "login_required" && (
          <Alert color="warning">
            You need to{" "}
            <a
              href="#/"
              class="alert-link"
              onClick={(e) => handle(e, handleLoginAgain)}
            >
              log in again
            </a>
          </Alert>
        )}

        <h1>External API</h1>
        <p className="lead">
          Ping an external API by clicking the button below.
        </p>

        <p>
          This will call a local API on port 3001 that would have been started
          if you run <code>npm run dev</code>. An access token is sent as part
          of the request's `Authorization` header and the API will validate it
          using the API's audience value.
        </p>

        {!audience && (
          <Alert color="warning">
            <p>
              You can't call the API at the moment because your application does
              not have any configuration for <code>audience</code>, or it is
              using the default value of <code>YOUR_API_IDENTIFIER</code>. You
              might get this default value if you used the "Download Sample"
              feature of{" "}
              <a href="https://auth0.com/docs/quickstart/spa/react">
                the quickstart guide
              </a>
              , but have not set an API up in your Auth0 Tenant. You can find
              out more information on{" "}
              <a href="https://auth0.com/docs/api">setting up APIs</a> in the
              Auth0 Docs.
            </p>
            <p>
              The audience is the identifier of the API that you want to call
              (see{" "}
              <a href="https://auth0.com/docs/get-started/dashboard/tenant-settings#api-authorization-settings">
                API Authorization Settings
              </a>{" "}
              for more info).
            </p>

            <p>
              In this sample, you can configure the audience in a couple of
              ways:
            </p>
            <ul>
              <li>
                in the <code>src/index.js</code> file
              </li>
              <li>
                by specifying it in the <code>auth_config.json</code> file (see
                the <code>auth_config.json.example</code> file for an example of
                where it should go)
              </li>
            </ul>
            <p>
              Once you have configured the value for <code>audience</code>,
              please restart the app and try to use the "Ping API" button below.
            </p>
          </Alert>
        )}

        <Button
          color="primary"
          className="mt-5"
          onClick={callApi}
          disabled={!audience}
        >
          Ping API
        </Button>

        <Button
          onClick={testRegister}
        >
          Test Register
        </Button>

        <Button
          onClick={getClaims}
        >
          Get Claims
        </Button>

        <Button
          onClick={createPack}
        >
          Create Pack
        </Button>

        <Button
          onClick={getPresignedUrlForUpload}
        >
          Presigned
        </Button>

      </div>

      <MyDropzone handleFileDrop={handleFileDrop} />

      <div className="result-block-container">
        {state.showResult && (
          <div className="result-block" data-testid="api-result">
            <h6 className="muted">Result</h6>
            <Highlight>
              <span>{JSON.stringify(state.apiMessage, null, 2)}</span>
            </Highlight>
          </div>
        )}
      </div>
    </>
  );
};

export default withAuthenticationRequired(ExternalApiComponent, {
  onRedirecting: () => <Loading />,
});
