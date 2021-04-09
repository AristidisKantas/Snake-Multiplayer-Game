module.exports = {
    makeId
}

function makeId(length) {
    var results = ''
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var charactersLength = characters.length

    for(var i = 0 ; i < length; i++){
        results += characters.charAt(Math.floor(Math.random() *charactersLength))
    }
    return results
}