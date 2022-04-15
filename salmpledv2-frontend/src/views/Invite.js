


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


import AsyncSelect from 'react-select/async';

export const Invite = (props) => {

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


    const navigate = useNavigate()

    const [collaborators, setCollaborators] = useState([])

    useEffect(() => {


        const fetchData = async () => {
            let { data } = await unauthorized().post('/Pack/GetPack', {
                username: username,
                slug: pack,
            })
            let { result, err } = data;

            setState(p => Object.assign({}, p, { data: result }))
        }

        fetchData();


    }, [])



    const promiseOptions = async (input) => {
        console.log(input)
        let { data } = await unauthorized().post('/User/UserSearch', {
            keyword: input
        })
        let { result, err } = data

        const options = result.map((ele) => {
            return { value: { id: ele.id, name: ele.username }, label: ele.username }
        })



        return options

    }

    const myHandleSubmit = async (values, actions) => {
        const ids = values.collaborators.map(ele => ele.value.id)

        let {data} = await unauthorized().post('/User/AddCollab', {
            userIds: ids,
            packId: state.data.id
        })

        let {result , err} = data

        if(err)
        {
            alert(err)
        }else{
            navigate(`/edit/${username}/${pack}`)
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
            { state.data ?
            <div className='mt-4 m-2 bg-light shadow p-4'>
            <p className='h4'> Invite Users To Collaborate On: {state.data.name}</p>


            <Formik

                validateOnChange={true}
                onSubmit={(values, actions) => {
                    myHandleSubmit(values, actions)

                }}
                initialValues={{
                    collaborators: []
                }}
            >
                {({
                    handleSubmit,
                    handleChange,
                    handleBlur,
                    values,
                    touched,
                    isValid,
                    errors,
                    setFieldValue
                }) => (

                    <Form noValidate onSubmit={handleSubmit}>

                           


                            <Form.Group className='m-4'>
                                <Form.Label>User Search</Form.Label>
                                <AsyncSelect
                                    isMulti
                                    value={values.collaborators}
                                    onChange={e => setFieldValue('collaborators', e)}
                                    loadOptions={promiseOptions}
                                />
                            </Form.Group>

                    
                        <Button className="m-4" variant="dark" type="submit"> Submit </Button>

                    </Form>

                )}
            </Formik>
            </div>
            :
            <Loading/>
            }

        </Container>
    )
}

export default withAuthenticationRequired(Invite, {
    onRedirecting: () => <Loading />,
});
