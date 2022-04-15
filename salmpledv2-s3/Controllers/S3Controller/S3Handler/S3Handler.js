
var AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const { s3Credentials } = require('./s3Credentials')
let ffmpeg = require('fluent-ffmpeg')
const { PassThrough } = require('stream')
const fs = require('fs');
const mime = require('mime')

var path = require('path')

const archiver = require('archiver')

var credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};

AWS.config.update({
  credentials: credentials,
  region: 'us-east-1',

})

var config = {
  accessKey: process.env.AWS_ACCESS_KEY_ID,
  secretKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1',
  bucket: 'salmpledv2',
}



const uploadStream = ({ Bucket, Key }) => {

  const pass = new PassThrough();
  return {
    writeStream: pass,
    promise: new AWS.S3.ManagedUpload({
      partSize: 10 * 1024 * 1024, queueSize: 1, //minium is 5MiB this is why nothing gets split in parts mp3 are really small
      params: { Bucket, Key, Body: pass }
    }
    ).on('httpUploadProgress', (progress) => {
      console.log('progress', progress)
      // { loaded: 6472, total: 345486, part: 3, key: 'large-file.dat' }
    }).promise(),
  };
}

const createPresignedPost = ({ key, contentType }) => {
  const s3 = new AWS.S3();
  const params = {
    Expires: 60,
    Bucket: config.bucket,
    Conditions: [["content-length-range", 100, 1024*1024*20],  // 100Byte - 20MB
    ["starts-with", "$Content-Type", "audio"]],
    Fields: {
      "Content-Type": contentType,
      key
    }
  };
  return new Promise(async (resolve, reject) => {
    s3.createPresignedPost(params, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
};

const S3Handler = {
  createPostObjectUrl: async (clientData) => {
    console.log(clientData)

    let { packOwner, packName, fileName } = clientData;
    let un = uuidv4()
    let newKey = `${packOwner}/${packName}/${un}${path.extname(fileName)}`
    let post = await createPresignedPost({
      key: newKey,
      contentType: mime.getType(fileName)
    });

    console.log(post)
    return post

  },
  transcodeToMP3: async (clientData) => {
    console.log(clientData)
    let { key, bucket } = clientData;
    return await new Promise((resolve, reject) => {

      const s3 = new AWS.S3();

      let readStream = s3.getObject({
        Bucket: config.bucket,
        Key: key,
      }).createReadStream()
      readStream.on('error', (err) => reject(err))

      let newKey = key.substr(0, key.lastIndexOf(".")) + ".mp3";
      const { writeStream, promise } = uploadStream(
        {
          Bucket: config.bucket,
          Key: newKey
        })
      const pipeline = ffmpeg(readStream).format('mp3')
        .on('error', (err) => reject(err))
        .on('progress', (p) => console.log(p))
        .pipe(writeStream)
        .on('error', (err) => reject(err))


      resolve(promise)

    })

  },
  getUrl: async (clientData) => {
    let { cKey } = clientData;
    console.log(cKey)
    const s3 = new AWS.S3();
    return await s3.getSignedUrlPromise('getObject', {
      Bucket: config.bucket,
      Key: cKey,
      Expires: 10 * 60,

    })
  },
  getUncompressed: async (clientData) => {
    let { uKey, name } = clientData;
    console.log(clientData)
    const s3 = new AWS.S3();
    return await s3.getSignedUrlPromise('getObject', {
      Bucket: config.bucket,
      Key: uKey,
      Expires: 10 * 60,
      ResponseContentDisposition: 'attachment; filename ="' + name + path.extname(uKey) + '"'

    })
  },
  totalSize: async (clientData) => {
    let { username } = clientData
    const s3 = new AWS.S3();
    var totalSize = 0, ContinuationToken
    do {
      var resp = await s3.listObjectsV2({
        Bucket: config.bucket,
        Prefix: username,
        ContinuationToken
      }).promise().catch(e => console.log(e))
      resp.Contents.forEach(o => totalSize += o.Size)
      ContinuationToken = resp.NextContinuationToken
    } while (ContinuationToken)

    return totalSize

  },
  getZipFile: (clientData, res) => {
    let { packName, uKeyAndName } = clientData
    console.log(clientData)
    const s3 = new AWS.S3();
    var archive = archiver('zip');

    archive.on('error', function (err) {
      res.status(500).send({ error: err.message });
    });

    //on stream closed we can end the request
    archive.on('end', function () {
      res.status(200)
      console.log('Archive wrote %d bytes', archive.pointer());
    });

    //set the archive name
    res.attachment(`${packName}.zip`);

    //this is the streaming magic
    archive.pipe(res);

    uKeyAndName.forEach((ele, index) => {
      let readStream = s3.getObject({
        Bucket: config.bucket,
        Key: ele.uKey,
      }).createReadStream()
      readStream.on('error', (err) => reject(err))
      archive.append(readStream, { name: ele.name + path.extname(ele.uKey) });
    })

    archive.finalize();

    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`GetZipUsed,${Math.round(used * 100) / 100} MB`);


  },
  testGetZip: (res) => {
    
    let clientData = {
      packName: "StressTest",
      uKeyAndName: [
        {
          uKey: 'marvinh/undefined/93f4974c-2dee-4c33-9257-7a833de06126.wav',
          name: '00_test_samples'
        },
        {
          uKey: 'marvinh/undefined/72a1eea0-12fe-4c08-afda-62668d96ca98.wav',
          name: '01_test_samples'
        },
        {
          uKey: 'marvinh/undefined/0b4c4503-2adf-47c8-9c02-39ae454fd637.wav',
          name: '02_test_samples'
        },
        {
          uKey: 'marvinh/null/f2ed8612-d16f-47aa-b293-efce17a3661f.wav',
          name: '03_test_samples'
        },
        {
          uKey: 'marvinh/null/69097957-0e84-48be-8345-f0805223a863.aif',
          name: '04_test_samples'
        },
        {
          uKey: 'marvinh/null/a94e7e81-d049-46fd-a6c2-12839f8a9b43.aif',
          name: '05_test_samples'
        },
        {
          uKey: 'marvinh/undefined/3086a730-5304-4176-a9a8-aea9eb79b237.wav',
          name: '06_test_samples'
        },
        {
          uKey: 'marvinh/undefined/36a43171-6910-4c62-aa6a-76bd6a360875.wav',
          name: '07_test_samples'
        },
        {
          uKey: 'marvinh/undefined/4493f3f9-91d9-4798-93c0-067dd6be642e.wav',
          name: '08_test_samples'
        },
        {
          uKey: 'marvinh/null/3a0a688b-9701-49a4-a2e2-80af3fad879e.wav',
          name: '09_test_samples'
        },
        {
          uKey: 'marvinh/Db Crash Pack/aa2c4201-9651-45ac-890d-740843c43c78.WAV',
          name: '10_test_samples'
        },
        {
          uKey: 'marvinh/undefined/ebc4baa0-90d6-43fb-bb42-797fac2c45db.wav',
          name: '11_test_samples'
        },
        {
          uKey: 'marvinh/undefined/4914d931-6b07-4b0d-a93b-6374f3f0e41f.wav',
          name: '12_test_samples'
        },
        {
          uKey: 'marvinh/undefined/c7f6c1eb-e7f6-4c65-a9d8-827767f5269e.wav',
          name: '13_test_samples'
        },
        {
          uKey: 'marvinh/undefined/724d8fca-3a9d-4be3-860b-c90db83704c1.wav',
          name: '14_test_samples'
        },
        {
          uKey: 'marvinh/null/596dd279-ee37-4bc2-944c-02b02e2a5520.aif',
          name: '15_test_samples'
        },
        {
          uKey: 'marvinh/null/fab74a45-fedc-4371-bb5d-606c54458b2c.aif',
          name: '16_test_samples'
        },
        {
          uKey: 'marvinh/null/3d037c2f-b232-47b5-9191-6d05c7d73eca.aif',
          name: '17_test_samples'
        },
        {
          uKey: 'marvinh/undefined/6c6d9562-e46f-4281-be02-296809a2bd5f.wav',
          name: '18_test_samples'
        },
        {
          uKey: 'marvinh/undefined/7e2cb51c-91ae-409a-9132-2f4d3e755ba6.wav',
          name: '19_test_samples'
        },
        {
          uKey: 'marvinh/undefined/4fa789e7-0f54-4e99-b0ec-270ec6310cd3.wav',
          name: '20_test_samples'
        }
      ]
    }

    getZipFile(clientData,res)
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`GetZipUsed,${Math.round(used * 100) / 100} MB`);
  }
}

module.exports = S3Handler