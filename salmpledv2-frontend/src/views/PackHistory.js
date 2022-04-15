


import React, { useEffect, useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Formik } from 'formik'

import {
    Form,
    Row,
    Col,
    Card,
    Button,
    Container,
    Badge,
    ButtonToolbar,
    Nav
} from 'react-bootstrap'

import * as yup from 'yup'

import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { authorized, unauthorized, nodeAuthorized, nodeUnauthorized } from '../utils/http';
import AsyncCreatableSelect from 'react-select/async-creatable';
import { useNavigate, useParams } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faPills } from '@fortawesome/free-solid-svg-icons';
import { useTable, useRowSelect } from 'react-table'
import Axios from 'axios'
import Waveform from '../components/Waveform'
import Loading from '../components/Loading'
import { Rename } from './EditPack/Rename'
import { Tag } from './EditPack/Tag'

import { formatDistance } from "date-fns"
import { diff, addedDiff, deletedDiff, updatedDiff, detailedDiff } from 'deep-object-diff';


export const PackHistory = (props) => {

    const {
        user,
        getIdTokenClaims,
        getAccessTokenSilently,
        loginWithPopup,
        getAccessTokenWithPopup,
    } = useAuth0();
    const { username, pack } = useParams()

    const [state, setState] = useState({
        loading: false,
        data: null,
    })

    const [modal, setModal] = useState({
        rename: false,
        tag: false,
    })


    

    const navigate = useNavigate()

    const [options, setOptions] = useState([])

    const [on, setOn] = useState(new Date())
    useEffect(() => {

        const fetchData = async () => {
            const token = await getAccessTokenSilently()
            const { data } = await authorized(token).post('Pack/HistoryOptions', {
                slug: pack,
                username: username,
            })

            let { result, err } = data;

            setOptions(p => Object.assign([], p, result))
        }

        fetchData();
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            const token = await getAccessTokenSilently()
            const {data} =  await authorized(token).post('/Pack/Compare', {
                slug: pack,
                username: username,
                on: on
            })
            const {result, err} = data;
            setState(p => {
                return Object.assign({}, p, {data: result})
            })
            console.log(result)

        }
        fetchData()
        console.log(on)
       
    }, [on])


    
       
    
    return (
        <Container>
            <div className='m-2 bg-light'>
                <Nav fill variant="tabs" defaultActiveKey="history">
                    <Nav.Item>
                        <Nav.Link eventKey="current" onClick={() => navigate(`/edit/${username}/${pack}`)}>Edit Pack </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="history" onClick={() => navigate(`/history/${username}/${pack}`)}>History</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="invite" onClick={() => navigate(`/invite/${username}/${pack}`)}>Add Collaborators</Nav.Link>
                    </Nav.Item>
                </Nav>
            </div>
            <div className='m-2 bg-light p-5'>
                
                <p className='h4'> Compare Current Pack to A Point in Time </p>

                <Form.Select aria-label="Default select example"
                value={on}
                onChange={(e) => setOn(p=>e.target.value)}
                >
                    <option>Select A Point in Time</option>
                    { 
                        options.map((o,i) => <option key={i} value={o}> {new Date(o).toUTCString()}</option>)
                    }
                </Form.Select>

                {/* { 
                state.data ?
                     <ReactDiffViewer oldValue={state.data.compare} newValue={state.data.current} splitView={true} />
                    :
                <></>
                } */}

                <p className='h5'> Current Data </p>
                <code>
                {
                    state.data ?
                     JSON.stringify(detailedDiff(state.data.compare, state.data.current))
                    :
                    <>
                    </>
                }
                </code>
                <p className='h5'> Old Data </p>
                <code >
                {
                    state.data ?
                     JSON.stringify(detailedDiff(state.data.current, state.data.compare))
                    :
                    <>
                    </>
                }
                </code>
                
            </div>
        </Container>
    )
}

export default withAuthenticationRequired(PackHistory, {
    onRedirecting: () => <Loading />,
});
