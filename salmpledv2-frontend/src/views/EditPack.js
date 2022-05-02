

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
    Nav,
    Alert,
} from 'react-bootstrap'

import * as yup from 'yup'

import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { authorized, unauthorized, nodeAuthorized, nodeUnauthorized, nodeNoAuthDownload } from '../utils/http';
import AsyncCreatableSelect from 'react-select/async-creatable';
import { useNavigate, useParams } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faListSquares, faPills } from '@fortawesome/free-solid-svg-icons';
import { useTable, useRowSelect } from 'react-table'
import Axios from 'axios'
import Waveform from '../components/Waveform'
import Loading from '../components/Loading'
import { Rename } from './EditPack/Rename'
import { Tag } from './EditPack/Tag'


const maxLength = 64;
const maxSize = 10;
function myValidator(file) {
    if (file.name.length > maxLength) {
        return {
            code: "name-too-large",
            message: `Name is larger than ${maxLength} characters`
        };
    }

    if (file.size > (maxSize * 1000 * 1000)) {
        return {
            code: "file too large",
            message: `File is larger than ${maxSize} MB`
        }
    }

    return null
}

function MyDropzone({ handleFileDrop }) {
    const onDrop = useCallback(acceptedFiles => {
        // Do something with the files
        handleFileDrop(acceptedFiles)
    }, [])
    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({

        onDrop,

    })

    const fileRejectionItems = fileRejections.map(({ file, errors }) => (
        <li className='text-danger' key={file.path}>
            {file.path} - {file.size} bytes
            <ul>
                {errors.map(e => (
                    <li key={e.code}>{e.message}</li>
                ))}
            </ul>
        </li>
    ));

    return (

        <div className='border m-2 p-5 bg-light text-center' {...getRootProps()}>
            <input {...getInputProps()} type="file" accept="audio/wav, audio/aiff" multiple />
            {
                isDragActive ?
                    <p>Drop the files here ...</p> :
                    <p>Drag 'n' drop some files here, or click to select files</p>
            }
            <hr className="bg-dark"></hr>
            {fileRejectionItems}
        </div>
    )
}

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
        useRowSelect,
        hooks => {

            hooks.visibleColumns.push(columns => [
                // Let's make a column for selection
                {
                    id: 'selection',
                    // The header can use the table's getToggleAllRowsSelectedProps method
                    // to render a checkbox
                    Header: ({ getToggleAllRowsSelectedProps }) => (
                        <div>
                            <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
                        </div>
                    ),
                    // The cell can use the individual row's getToggleRowSelectedProps method
                    // to the render a checkbox
                    Cell: ({ row }) => (
                        <div>
                            <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
                        </div>
                    ),
                },
                ...columns,
            ])
        }
    )

    useEffect(() => {
        setSelected(selectedFlatRows.map(r => r.original))

    }, [selectedFlatRows.length])

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
export const EditPack = (props) => {



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

        selected: [],

    })

    const [modal, setModal] = useState({
        rename: false,
        tag: false,
    })

    const [secondary, setSecondary] = useState({
        preview: false,
        url: '',
        downloadUrl: '',
        previewName: '',
        downloadUrlName: '',
        zipLoading: false,
    })

    const navigate = useNavigate()

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

    const handleFileDrop = async (acceptedFiles) => {
        console.log(acceptedFiles);
        let filelist = [];
        if (acceptedFiles.length < 1) return;
        try {

            const token = await getAccessTokenSilently();
            setState(p => Object.assign({}, p, { loading: true }))

            const fileList = [];
            for (var i = 0; i < acceptedFiles.length; i++) {
                let create = await nodeAuthorized(token).post(`/CreatePostObjectUrl`, {
                    packOwner: username,
                    packName: state.data.name,
                    fileName: acceptedFiles[i].name,
                })

                let url = create.data.s3_post.url
                let fields = create.data.s3_post.fields

                var formData = new FormData();
                for (var x in fields) {
                    formData.append(x, fields[x])
                }
                formData.append('file', acceptedFiles[i]);

                await Axios.post(url, formData);

                let transcode = await nodeAuthorized(token).post(`/TranscodeToMP3`, {
                    bucket: `salmpledv2`,
                    key: fields.key,
                })

                fileList.push({
                    name: acceptedFiles[i].name.replace(/\.[^/.]+$/, ""),
                    ckey: transcode.data.s3_response.key,
                    ukey: fields.key,
                    region: 'us-east-1',
                    bucket: fields.bucket,
                    packId: state.data.id,
                    mimeType: acceptedFiles[i].type

                })
            }

            let { data } = await authorized(token).post('/Sample/AddBulkSamples', {
                samples: fileList
            })

            let { result, err } = data
            console.log(result);
            setState(p => Object.assign({}, p, {
                data: {
                    ...p.data,
                    samples: [...p.data.samples, ...result]
                }
            }))

            let res = await nodeUnauthorized().post('/SQSProcessMP3', {
                mp3Keys: fileList.map((ele) => ele.ckey)
            })

            if(res.err) {
                alert(res.err)
            }else{
                console.log(res.result)
            }

            setState(p => Object.assign({}, p, { loading: false }))

            

        } catch (e) {
            alert(e);
        }



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

    const handleDownloadZip = async () => {
        const uKeyAndName = state.selected.map(ele => { return { uKey: ele.uKey, name: ele.name } })
        setSecondary(p => Object.assign({}, p, { zipLoading: true }))
        await nodeNoAuthDownload().post('/GetZipFile', {
            packName: state.data.name,
            uKeyAndName
        }).then(res => {
            const url = URL.createObjectURL(new Blob([res.data], { type: 'application/zip' }));
            console.log(url)
            setSecondary(p => Object.assign({}, p, { zipUrl: url, zipLoading: false }))
        })


    }


    const removeSelected = async () => {
        console.log(state.selected)
        const token = await getAccessTokenSilently();
        const ids = state.selected.map(ele => ele.id)
        let { data } = await authorized(token).post('/Sample/RemoveSelected', {
            ids,
        })

        let { result, err } = data;
        if (err) {
            alert(err)
        } else {
            setState(p => {
                return Object.assign({}, p, {
                    data: {
                        ...p.data,
                        samples: p.data.samples.filter((ele) => !ids.includes(ele.id))
                    }
                })
            })
        }
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

    const handleClose = () => {
        setSecondary(p => Object.assign({}, p, {
            preview: false,
            url: '',
        }))
    }


    const setSelected = (selected) => {
        console.log(selected)
        setState(p => Object.assign({}, p, {
            selected: selected,
        }))
    }

    const renameSelected = async (values, actions) => {

        var arr = [];

        var arr = state.selected.map((ele, index) => {
            const pad = state.selected.length > 1 ? String(index).padStart(2, '00') + '_' + values.name : values.name;
            return {
                name: pad,
                packId: state.data.id,
                id: ele.id,
            }
        })
        const token = await getAccessTokenSilently()
        let { data } = await authorized(token).post('/Sample/RenameSamples', {
            list: arr
        })

        let { result, err } = data

        console.log(result)

    }

    const tagSelected = async (values, actions) => {

        const token = await getAccessTokenSilently();
        console.log(values.tags)
        let { data } = await authorized(token).post('/Sample/AddTags', {

            sampleIds: state.selected.map(ele => ele.id),
            tags: values.tags.map(t => { return t.value.id ? { id: t.value.id, name: t.value.name } : { name: t.value } })

        })

        let { result, err } = data

    }
    return (
        <Container>
            {state.data && (
                <>
                    <div className='m-2 bg-light'>
                        <Nav fill variant="tabs" defaultActiveKey="current">
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

                    < div className='border bg-light m-2 p-5'>
                        <p> Pack Owner: {state.data.user.username}</p>
                        <p> Pack Name: {state.data.name}</p>
                        <p> Pack Description: {state.data.description}</p>
                        <p> Pack Genres: {
                            state.data.genres && (state.data.genres.map((ele, index) =>
                                <Badge key={index} className="p-2 m-2 rounded-pill bg-dark">
                                    {ele.name}
                                    <Button variant="dark" size="sm">
                                        <FontAwesomeIcon icon={faClose} />
                                    </Button>
                                </Badge>
                            ))

                        }
                        </p>
                        <> <p> Collaborators: </p>  <ul> {state.data.collaborators.map((ele, index) => <li key={index}>{ele.username}</li>)} </ul> </>
                    </div>



                    {
                        !state.loading ?
                            <MyDropzone handleFileDrop={handleFileDrop} />
                            :
                            <div className='card m-2'>
                                <Loading />
                            </div>
                    }
                    <div className='m-2 p-5 bg-light'>

                        <Button disabled={state.selected.length < 1} onClick={() => setModal(p => Object.assign({}, p, { rename: true }))} className='m-2 p-2' variant='dark'>
                            Rename Selected
                        </Button>
                        <Button disabled={state.selected.length < 1} onClick={() => setModal(p => Object.assign({}, p, { tag: true }))} className='m-2 p-2' variant='dark'>
                            Tag Selected
                        </Button>
                        <Button onClick={() => handleDownloadZip()} disabled={state.selected.length < 1} className='m-2 p-2' variant='dark'>
                            Download Selected
                        </Button>

                        <Button onClick={() => removeSelected()} disabled={state.selected.length < 1} className='m-2 p-2' variant='dark'>
                            Remove Selected
                        </Button>
                    </div>
                    {
                        !!secondary.zipUrl && (
                            <Alert variant="light" className="m-2 p-4" dismissible show={!!secondary.zipUrl} onClose={() => {
                                URL.revokeObjectURL(secondary.zipUrl);
                                setSecondary(p => Object.assign({}, p, { zipUrl: null }))
                            }
                            }>
                                <a href={secondary.zipUrl} download={`${state.data.name}.zip`}> Download Link For Selected Samples In Pack: {state.data.name} </a>
                            </Alert>)
                    }
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
                            setSelected={setSelected}
                            data={state.data.samples}
                            handlePreview={handlePreview}
                            handleDownload={handleDownload} />
                    </div>





                    <Rename show={modal.rename} selected={state.selected} myHandleSubmit={renameSelected} onHide={() => setModal(p => Object.assign({}, p, { rename: false }))} />
                    <Tag show={modal.tag} selected={state.selected} myHandleSubmit={tagSelected} onHide={() => setModal(p => Object.assign({}, p, { tag: false }))} />

                </>
            )
            }

        </Container >
    )
}

export default withAuthenticationRequired(EditPack, {
    onRedirecting: () => <p> You are not authorized </p>,
});


