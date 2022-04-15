

import React from 'react'

import { Formik } from 'formik'

import {
    Form,
    Row,
    Col,
    Card,
    Button,
    Modal,
} from 'react-bootstrap'

import * as yup from 'yup'

import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import AsyncCreatableSelect from 'react-select/async-creatable';

const schema = yup.object().shape({
    name: yup.string()
        .min(4, "Minimum Of 4 Characters")
        .max(48, "Maximum of 64 Characters")
        .required("Sample name is required.")
        .trim()
        .matches(/^[A-Za-z0-9_]*[A-Za-z0-9][A-Za-z0-9_]*$/),
})



export const Rename = ({ myHandleSubmit, selected, show, onHide }) => {



    const RenameMessage = ({ values, selected }) => {

        if (selected && selected.length > 1) {
            return(
            <>

                
                    {selected.map((s, index) => {
                        const pad = String(index).padStart(2, '00') + '_' + values.name
                        return (<p key={index}>{s.name} -&gt; {pad}</p>)
                    })}
                
            </>)

        } else if (selected && selected.length == 1) {
            return <p> {selected[0].name}  -&gt; {values.name}</p>
        } else {
            return <p> Please make at least one selection </p>
        }
    }

    return (
        <Formik
            validationSchema={schema}
            validateOnChange={true}
            onSubmit={(values, actions) => {
                myHandleSubmit(values, actions)
            }}
            initialValues={{
                name: '',
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
                <Modal size="lg" className='m-2 p-2' show={show} onHide={onHide} >
                    <Form noValidate onSubmit={handleSubmit}>
                        <Modal.Header closeButton>
                            Sample Rename
                        </Modal.Header>
                        <Modal.Body>
                            <p className='font-weight-bold'> The following samples will be renamed to: </p>
                            <code>
                                <RenameMessage values={values} selected={selected} />
                            </code>

                            <Form.Group controlId="validationFormik01">
                                <Form.Label>Sample Name</Form.Label>
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

                            {/* <Form.Group>
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
                                 */}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button disabled={selected.length == 0}variant="dark" type="submit"> Submit </Button>
                        </Modal.Footer>
                    </Form>

                </Modal>

            )}
        </Formik>
    )
}

