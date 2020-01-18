const CryptoJS = require("crypto-js")
const SHA256 = require("crypto-js/sha256")




const compareTwoHash = (...messages) => {
    const hash1 = SHA256(messages[0]).toString()
    const hash2 = SHA256(messages[1]).toString()
    if (hash1 === hash2) {
        return true
    }

    return false

}

console.log(compareTwoHash('message', 'message'));