
const {createPostObjectUrl, transcodeToMP3, getUrl, getUncompressed, totalSize, getZipFile, testGetZip} = require('./S3Handler/S3Handler')

const S3Controller = {
    CreatePostObjectUrl: (clientData, callback) => {
        return createPostObjectUrl(clientData)
        .then(s3_post => {
            callback({s3_post})
        })
        .catch(error => {
            let err = error.message || error
            callback({err})
        })
    },
    TranscodeToMP3: (clientData, callback) => {
        transcodeToMP3(clientData).then(s3_response => {
            callback({s3_response})
        })
        .catch(error => {
            let err = error.message || error
            callback({err})
        })
    },
    GetUrl: (clientData, callback) => {
        getUrl(clientData).then(result => {
            callback({result})
        })
        .catch(error => {
            let err = error.message || error
            callback({err})
        })
    },
    GetUncompressed: (clientData, callback) => {
        getUncompressed(clientData).then(result => {
            callback({result})
        })
        .catch(error => {
            let err = error.message || error
            callback({err})
        })
    },TotalSize: (clientData, callback) => {
        totalSize(clientData).then(result => {
            callback({result})
        })
        .catch(error => {
            let err = error.message || error
            callback({err})
        })
    },
    GetZipFile: (clientData, res) => {
       getZipFile(clientData, res)
    },
    TestGetZip: (res)=> {
        testGetZip(res)
    }
}

module.exports = S3Controller