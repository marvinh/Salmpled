

import React from 'react'

import { Formik } from 'formik'

import {
    Form,
    Row,
    Col,
    Card,
    Button,
} from 'react-bootstrap'

import * as yup from 'yup'

import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { authorized,unauthorized } from '../utils/http';
import AsyncCreatableSelect from 'react-select/async-creatable';
import { useNavigate } from 'react-router';




export const CreateNewPack = (props) => {



    const {
        user,
        getIdTokenClaims,
        getAccessTokenSilently,
        loginWithPopup,
        getAccessTokenWithPopup,
    } = useAuth0();

    const navigate = useNavigate();
    
    const schema = yup.object().shape({
        name: yup.string().min(4, "Minimum Of 4 Characters").max(64, "Maximum of 64 Characters").required("Sample Pack name is required.")
            .trim()
            .matches(/^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$/)
            .test( "name", "Sample Pack name must be unique to your account",  async (value) => {
                if (!value) {
                    console.log("returns false")

                    return false;
                }
                try {
                    const token = await getAccessTokenSilently()

                    let { data } = await authorized(token).post("/Pack/NameAvailable", {
                        name: value
                    })

                    let { result, err } = data
                    console.log("", value, result)
                    if (err) {
                         return false;
                    } else {
                        return true;
                    }

                } catch (err) {
                    return false;
                }

            }),

    })

    const myHandleSubmit = async (values, actions) => {
        console.log(values)

        const token = await getAccessTokenSilently();
        
        const genres = values.genres.map(ele => {
            if(ele.value.id) {
                return {id: ele.value.id, name: ele.value.name}
            }else{
                return {name: ele.value}
            }
        })
        let {data} = await authorized(token).post('/Pack/CreatePack',{
            name: values.name,
            description: values.description,
            genres: genres,
        })

        let {result, err} = data

        if(err) {
            alert(err)
        }else {
            navigate(`/edit/${result.user.username}/${result.slug}`)
        }

        
        console.log(result)
    }

    const promiseOptions =  async (input) => {
        console.log(input)
        let {data} = await unauthorized().post('/Genre/GenreOptions', {
            name: input
        })
        let {result, err} = data

        const options = result.map((ele) => {
            return {value: {id:ele.id, name: ele.name}, label: ele.name}
        })

        console.log(result)
        
        return options
        
    }
    return (
        <Formik
            validationSchema={schema}
            validateOnBlur={true}
            validateOnChange={false}
            onSubmit={(values, actions) => {
                myHandleSubmit(values, actions)
            }}
            initialValues={{
                name: '',
                description: '',
                genres: []
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
                <Row className='d-flex justify-content-center mt-4'>
                    <Card as={Col} sm="12" md="8" lg="4">
                        <Card.Header>
                            <p className="h4"> Create A New Sample Pack </p>
                        </Card.Header>
                        <Form noValidate onSubmit={handleSubmit}>
                            <Card.Body>
                                <Form.Group controlId="validationFormik01">
                                    <Form.Label>Sample Pack Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={values.name}
                                        onChange={handleChange}
                                        isValid={touched.name && !errors.name}
                                        isInvalid={!!errors.name}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.name}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group controlId="validationFormik02">
                                    <Form.Label>Sample Pack Description (Optional)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        as="textarea"
                                        rows={6}
                                        name="description"
                                        value={values.description}
                                        onChange={handleChange}
                                        isValid={touched.description && !errors.description}
                                        isInvalid={!!errors.description}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.description}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group>
                                <Form.Label>Select or Create Genres (Optional)</Form.Label>
                                <AsyncCreatableSelect
                                    cacheOptions
                                    defaultOptions
                                    isMulti
                                    value={values.genres}
                                    onChange={e => setFieldValue('genres',e)}
                                    loadOptions={promiseOptions}
                                />
                                </Form.Group>
                                <div className="d-flex justify-content-end m-2">
                                    <Button variant="dark" type="submit"> Submit </Button>
                                </div>
                            </Card.Body>
                        </Form>
                    </Card>
                </Row>

            )}
        </Formik>
    )
}

export default withAuthenticationRequired(CreateNewPack, {
    onRedirecting: () => <p> You are not authorized </p>,
});


