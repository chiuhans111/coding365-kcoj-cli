const fs = require('fs')
const path = require('path')

var RE = {
    input: /(^\s*\n)*(-+\s*\n)?(^\s*\n)*^(((範例)|(sample))?\s*((輸入)|(input))\s*((範例)|(sample))?)[:：]?\s*$\n?-*(\n\s*$)*/gim,
    output: /(^\s*\n)*(-+\s*\n)?(^\s*\n)*^(((範例)|(sample))?\s*((輸出)|(output))\s*((範例)|(sample))?)[:：]?\s*$\n?-*(\n\s*$)*/gim,
}


/**@param {String} str */
module.exports = function (id, str) {
    var cachePath = path.resolve(__dirname, './cache/parsed' + id + '.json')

    if (fs.existsSync(cachePath)) return JSON.parse(fs.readFileSync(cachePath).toString())

    str = str.replace(RE.input, '\n>>INPUT<<')
    str = str.replace(RE.output, '>>OUTPUT<<')
    console.log(str)
    var result = {
        id,
        desc: (str.match(/([^]*?)>>INPUT<</) || { 1: '無說明' })[1]
    }
    var tests = [];
    str.replace(/>>INPUT<<\n?([^]+?)\n*>>OUTPUT<<\n?([^\n]*(\n[^\n]+)*)/g, function (str, input, output) {
        tests.push({
            input: input + '\n', output: output + '\n'
        })
    })
    result.tests = tests

    fs.writeFileSync(cachePath, JSON.stringify(result, null, '    '))
    return result
}