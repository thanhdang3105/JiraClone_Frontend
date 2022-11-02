
export default function customFetch(url,options = {method: 'GET'}) {
    try {
        return new Promise(function(resolve,reject) {
            const authorization = localStorage.getItem('access_token')
            if(authorization) {
                Object.assign(options,{headers: {authorization: 'Bearer '+authorization}})
            }
            fetch(process.env.REACT_APP_SERVERURL+url,{...options,credentials: 'include'})
            .then(res => resolve(res))
            .catch(err => reject(err))
        })
    } catch (error) {
        return error
    }
}
