

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
import { unauthorized } from '../../utils/http';
const schema = yup.object().shape({
    name: yup.string()
        .min(4, "Minimum Of 4 Characters")
        .max(48, "Maximum of 64 Characters")
        .required("Sample name is required.")
        .trim()
        .matches(/^[A-Za-z0-9_]*[A-Za-z0-9][A-Za-z0-9_]*$/),
})



export const Tag = ({ myHandleSubmit, selected, show, onHide }) => {


    const promiseOptions =  async (input) => {
        console.log(input)
        let {data} = await unauthorized().post('/Tag/TagOptions', {
            name: input
        })
        let {result, err} = data

        const options = result.map((ele) => {
            return {value: {id:ele.id, name: ele.name}, label: ele.name}
        })

        console.log(result)
        
        return options
        
    }


    const Message = ({ selected }) => {

        if (selected && selected.length > 0) {
            return(
            <>
                    {selected.map((s, index) => {
                        
                        return (<p key={index}>{s.name}</p>)
                    })}
                
            </>)
        } else {
            return <p> Please make at least one selection </p>
        }
    }

    return (
        <Formik
            
            validateOnChange={true}
            onSubmit={(values, actions) => {
                myHandleSubmit(values, actions)
            }}
            initialValues={{
                tags: []
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
                            <p className='font-weight-bold'> Adding Tags to the following sample(s): </p>
                            <code>
                                <Message selected={selected} />
                            </code>

                            

                            <Form.Group>
                                <Form.Label>Add Tags Or Create Tags</Form.Label>
                                <AsyncCreatableSelect
                                    cacheOptions
                                    defaultOptions
                                    isMulti
                                    value={values.tags}
                                    onChange={e => setFieldValue('tags',e)}
                                    loadOptions={promiseOptions}
                                />
                                </Form.Group>
                                
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

