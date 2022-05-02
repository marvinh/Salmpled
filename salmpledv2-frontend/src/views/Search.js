


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

import {Alert} from 'react-bootstrap';

import AsyncSelect from 'react-select/async';

const IndeterminateCheckbox = React.forwardRef(
    ({ indeterminate, ...rest }, ref) => {
        const defaultRef = React.useRef()
        const resolvedRef = ref || defaultRef

        React.useEffect(() => {
            resolvedRef.current.indeterminate = indeterminate
        }, [resolvedRef, indeterminate])

        return (
            <>
                <input type="checkbox" ref={resolvedRef} {...rest} />
            </>
        )
    }
)

const SampleTable = ({ data, handlePreview, setSelected, handleDownload }) => {
    const columns = React.useMemo(
        () => [
            {
                Header: '',
                accessor: 'id',
                Cell: () => (<></>)
            },
            {
                Header: 'Preview',
                accessor: 'cKey',
                Cell: ({ cell }) => (
                    <Button size="sm" variant="dark" value={cell.row.values.name} onClick={
                        () => {
                            handleDownload(cell.row.values.uKey, cell.row.values.name)
                            handlePreview(cell.row.values.cKey, cell.row.values.name)
                        }
                    }>
                        Preview
                    </Button>
                )
            },
            {
                Header: 'Download',
                accessor: 'uKey',
                Cell: ({ cell }) => (
                    <Button size="sm" variant="dark" value={cell.row.values.name} onClick={
                        () => {
                            handleDownload(cell.row.values.uKey, cell.row.values.name)
                            handlePreview(cell.row.values.cKey, cell.row.values.name)
                        }
                    }>
                        Download
                    </Button>
                )
            },
            {
                Header: 'Name',
                accessor: 'name', // accessor is the "key" in the data
            },
            {
                Header: 'Tempo',
                accessor: 'tempo',
            },
            {
                Header: 'Created By',
                accessor: 'createdBy',
            },
            {
                Header: 'Created Date',
                accessor: 'createdDate'
            },
            {
                Header: 'Updated By',
                accessor: 'updatedBy',
            },
            {
                Header: 'Updated Date',
                accessor: 'updatedDate',
            },
            {
                Header: 'Tags',
                accessor: 'tags',
                Cell: ({ cell }) => (
                    <p> {
                        cell.row.values.tags
                            .map((e, i) => {

                                return <span className="badge badge-pill p-2 m-2 bg-dark" size="sm" key={i} > {e.name}
                                    <Button variant="dark" size="sm">
                                        <FontAwesomeIcon icon={faClose} />
                                    </Button>
                                </span>
                            })
                    }</p>
                )
            }
        ],
        []
    )





    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        selectedFlatRows,
        state: { selectedRowIds },
    } = useTable({ columns, data },
        // useRowSelect,
        // hooks => {

        //     hooks.visibleColumns.push(columns => [
        //         // Let's make a column for selection
        //         {
        //             id: 'selection',
        //             // The header can use the table's getToggleAllRowsSelectedProps method
        //             // to render a checkbox
        //             Header: ({ getToggleAllRowsSelectedProps }) => (
        //                 <div>
        //                     <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
        //                 </div>
        //             ),
        //             // The cell can use the individual row's getToggleRowSelectedProps method
        //             // to the render a checkbox
        //             Cell: ({ row }) => (
        //                 <div>
        //                     <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
        //                 </div>
        //             ),
        //         },
        //         ...columns,
        //     ])
        // }
    )

    // useEffect(() => {
    //     setSelected(selectedFlatRows.map(r => r.original))

    // }, [selectedFlatRows.length])

    return (

        <table className='table table-responsive-sm table-sm bg-light'{...getTableProps()}>
            <thead>
                {// Loop over the header rows
                    headerGroups.map(headerGroup => (
                        // Apply the header row props
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {// Loop over the headers in each row
                                headerGroup.headers.map(column => (
                                    // Apply the header cell props
                                    <th {...column.getHeaderProps()}>
                                        {// Render the header
                                            column.render('Header')}
                                    </th>
                                ))}
                        </tr>
                    ))}
            </thead>
            {/* Apply the table body props */}
            <tbody {...getTableBodyProps()}>
                {// Loop over the table rows
                    rows.map(row => {
                        // Prepare the row for display
                        prepareRow(row)
                        return (
                            // Apply the row props
                            <tr {...row.getRowProps()}>
                                {// Loop over the rows cells
                                    row.cells.map(cell => {
                                        // Apply the cell props
                                        return (
                                            <td {...cell.getCellProps()}>
                                                {// Render the cell contents
                                                    cell.render('Cell')}
                                            </td>
                                        )
                                    })}
                            </tr>
                        )
                    })}
            </tbody>

        </table>
    )
}

const Search = (props) => {

    // const {
    //     user,
    //     getIdTokenClaims,
    //     getAccessTokenSilently,
    //     loginWithPopup,
    //     getAccessTokenWithPopup,
    // } = useAuth0();
    const { username, pack } = useParams()

    const [state, setState] = useState({
        loading: false,
        data: null,
        entity: '',
        type: '',
    })

    const [secondary, setSecondary] = useState({
        preview: false,
        url: '',
        previewName: '',
    })

    const handleClose = () => {
        setSecondary(p => Object.assign({}, p, {
            preview: false,
            url: '',
        }))
    }


    const navigate = useNavigate()







    const promiseOptions = async (input) => {
        console.log(input)
        let { data } = await unauthorized().post('/Pack/Search', {
            keyword: input
        })
        let { result, err } = data

        // const options = result.map((ele) => {
        //     return { value: { id: ele.id, name: ele.username }, label: ele.username }
        // })

        console.log("result", result);

        let options = []

        if (err) {
            alert(err)
        } else {


            if (result.genres.length > 0) {
                let count = result.genres[0].packCount;
                let name = result.genres[0].genreName;
                options = [...options, ({
                    value: { type: "pack", entity: 'genre' ,keyword: input }, label: `Found ${count} Packs for Genre ${name}`
                })]
            }else {
                options = [...options, ({
                    value: {type: "pack", entity: 'genre' ,keyword: input}, label: `Found 0 Packs for Genre ${input}`
                })]
            }

            if (result.tags.length > 0) {
                let count = result.tags[0].sampleCount;
                let name = result.tags[0].tagName;
                options= [...options,{
                    value: { type: "sample", entity: 'tag' ,keyword: input }, label: `Found ${count} Samples for Tag ${name}`
                }]
               
            } else {
                options= [...options,{
                    value: { type: "sample", entity: 'tag' ,keyword: input }, label: `Found 0 Samples for Tag ${input}`
                }]
            }

            if (result.packs && result.packs.packCount > 0) {
                let count = result.packs.packCount;
                let name = input
                options= [...options,{
                    value: { type: "pack", entity: 'pack', keyword: input }, label: `Found ${count} Packs Matching Name ${name}`
                }]
            }else {
                options= [...options,{
                    value: { type: "pack", entity: 'pack' ,keyword: input }, label: `Found 0 Packs Matching Name ${input}`
                }]
            }

            if (result.samples && result.samples.sampleCount) {
                let count = result.samples.sampleCount;
                let name = input
                options= [...options, {
                    value: { type: "sample", entity: 'sample' ,keyword: input }, label: `Found ${count} Samples Matching Name ${name}`
                }]
            } else {
                options= [...options, {
                    value: { type: "sample", entity: 'sample', keyword: input }, label: `Found 0 Samples Matching Name ${input}`
                }]
            }


        }



        console.log("options", options);

        return options

    }


    const handlePreview = async (cKey, name) => {
        let { data } = await nodeUnauthorized().post('/GetUrl', {
            cKey
        })

        let { result, err } = data;
        console.log(data)

        setSecondary(p => Object.assign({}, p, {
            preview: true,
            url: result,
            previewName: name,
        }))

    }

    const handleDownload = async (uKey, name) => {
        let { data } = await nodeUnauthorized().post('/GetUncompressed', {
            uKey,
            name
        })

        let { result, err } = data;
        console.log(data)
        setSecondary(p => Object.assign({}, p, { downloadUrl: result, downloadUrlName: name }))

    }


    const myHandleChange = async (e) => {
        let {value} = e
        let { entity, type, keyword} = value

        let {data} = await unauthorized().post('/Pack/SearchResults', {
            entity,
            type,
            keyword,
        })

        let {result, err} = data

        console.log(type)
        setState(p => Object.assign({}, p, {data: result, entity: entity, type: type}))

    }

    return (
        <Container>


            <div className='mt-4 m-2 bg-light shadow p-4' style={{zIndex: 10}}>
                <p className='h4'> Sample And Pack Search </p>

                <Form.Group className='m-4'>
                    <Form.Label>Sample And Pack Search</Form.Label>
                    <AsyncSelect
                        loadOptions={promiseOptions}
                        onChange={(e) => {
                            myHandleChange(e)
                        }}
                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                    />
                </Form.Group>
            </div>

            {
                state.data ?
                state.type === 'pack' ?
                <div className="bg-light">
                <h4> Genre Search and Pack Name Search results TODO</h4>
                </div>
                :
                <>
                                        {
                        !!secondary.url && (
                            <Waveform style={{ position: "fixed", zIndex: 100, }} previewName={secondary.previewName} handleClose={handleClose} show={!!secondary.preview} url={secondary.url} />
                        )
                    }
                    {
                        !!secondary.downloadUrl && (
                            <Alert variant="light" className="m-2 p-4" dismissible show={secondary.downloadUrl} onClose={() => setSecondary(p => Object.assign({}, p, { downloadUrl: '' }))} >
                                <a href={secondary.downloadUrl}> Download Link For: {secondary.downloadUrlName} </a>
                            </Alert>
                        )
                    }

                    <div className='table-responsive-sm m-2 max-vh-50' style={{ overflowY: "auto", maxHeight: "33vh" }}>
                        <SampleTable
                            data={state.data}
                            handlePreview={handlePreview}
                            handleDownload={handleDownload} />
                    </div>
                </>
                :
                <>
                </>
            }


        </Container>
    )
}

export default Search



