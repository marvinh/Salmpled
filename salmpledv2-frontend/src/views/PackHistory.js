


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


        }
        fetchData()
        console.log(on)
       
       
    }, [on])

    const lhs = {
        foo: {
          bar: {
            a: ['a', 'b'],
            b: 2,
            c: ['x', 'y'],
            e: 100 // deleted
          }
        },
        buzz: 'world'
      };
      
      const rhs = {
        foo: {
          bar: {
            a: ['a'], // index 1 ('b')  deleted
            b: 2, // unchanged
            c: ['x', 'y', 'z'], // 'z' added
            d: 'Hello, world!' // added
          }
        },
        buzz: 'fizz' // updated
      };

      function replacer(key, value) {
        if (value == undefined) {
          return null;
        }
        return value;
      }

    const Difference = () => {
        if(state.data) {
            console.log(state.data.deleted.asOf.length);
            console.log(state.data.deleted.prev.length)
            var deletedAsOf = state.data.deleted.asOf.reduce((a, v) => ({ ...a, [v.id]: v}), {})
            var deletedPrev = state.data.deleted.prev.reduce((a, v) => ({ ...a, [v.id]: v}), {})

            var updatedAsOf = state.data.updated.asOf.reduce((a, v) => ({ ...a, [v.id]: v}), {})
            var updatedPrev = state.data.updated.prev.reduce((a, v) => ({ ...a, [v.id]: v}), {})

            console.log(deletedAsOf,deletedPrev);

            var added = addedDiff(updatedPrev,updatedAsOf)
            var currentUpdated = updatedDiff(updatedPrev, updatedAsOf)
            var originalUpdated = updatedDiff(updatedAsOf, updatedPrev)

            var deleted = deletedDiff(deletedAsOf,deletedPrev);
        
            
            return (
            <>
            <p className='h4'> Added </p>
            <code>
            {
                JSON.stringify(added)

            }
            </code>
            <p className='h4'> Updated </p>
            <p className='h6'> Current </p>
            <code>
            {
                
                JSON.stringify(currentUpdated)

            }
            </code>
            <p className='h6'> Previous </p>
            <code>
            {
                
                JSON.stringify(originalUpdated)

            }
            </code>
            <p className='h4'> Deleted </p>
            <code>
            {
                JSON.stringify(deleted,replacer)

            }
            </code>
            </>
            )

        }else{
            return(
                <>
                </>
            )
        }
                            
    }
       
    

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
                
                <p className='h4'> Version History </p>

                <Form.Select aria-label="Default select example"
                value={on}
                onChange={(e) => setOn(p=>e.target.value)}
                >
                    
                    { 

                        options.map((o,i) => <option key={i} value={options[i].date}> {new Date(o.date).toUTCString()} By {o.updatedBy}</option>)
                    }
                </Form.Select>

                <Difference/>

               
                
            </div>
        </Container>
    )
}

export default withAuthenticationRequired(PackHistory, {
    onRedirecting: () => <Loading />,
});
