import axios from 'axios'

const instance = axios.create({
    baseURL: process.env.REACT_APP_NET_API,
})

const instance2 = axios.create({
    baseURL: process.env.REACT_APP_NODE_API
})

const instance3 = axios.create({
    baseURL: process.env.REACT_APP_NODE_API
})


export const nodeAuthorized = (token) => {
    instance2.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return instance2;
}

export const nodeNoAuthDownload = () => {
    instance3.defaults.responseType = "arraybuffer";
    return instance3;
}

export const authorized = (token) => {
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return instance;
}

export const unauthorized = () => {
    return instance
}

export const nodeUnauthorized = () => {
    return instance2
}
