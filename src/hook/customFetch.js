
export default function customFetch(url,options = {method: 'GET'}) {
    try {
        return new Promise(function(resolve,reject) {
            Object.assign(options,{credentials: 'include',headers: {authorization: '123444'}})
            fetch(process.env.REACT_APP_SERVERURL+url,options)
            .then(res => resolve(res))
            .catch(err => reject(err))
        })
    } catch (error) {
        return error
    }
}
