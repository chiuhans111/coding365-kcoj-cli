const fs = require('fs')
const path = require('path')

var RE = {
    input: /(^\s*\n)*(-+\s*\n)?(^\s*\n)*^(((範例)|(sample|smaple))?\s*((輸入)|(input))\s*((範例)|(sample))?)[:：]?\s*$\n?(---+)?$(\n\s*$)*/gim,
    output: /(^\s*\n)*(-+\s*\n)?(^\s*\n)*^(((範例)|(sample|smaple))?\s*((輸出)|(output))\s*((範例)|(sample))?)[:：]?\s*$\n?(---+)?$(\n\s*$)*/gim,
}


/**@param {String} str */
exports.fromProblem = function (id, str) {
    var cachePath = path.resolve(__dirname, './cache/parsed' + id + '.json')

    // if (fs.existsSync(cachePath)) return JSON.parse(fs.readFileSync(cachePath).toString())

    str = str.replace(RE.input, '\n>>INPUT<<')
    str = str.replace(RE.output, '>>OUTPUT<<')
    //console.log(str)
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

    // fs.writeFileSync(cachePath, JSON.stringify(result, null, '    '))
    return result
}

exports.fromFile = function (filepath) {
    var tests = []
    var str = fs.readFileSync(path.resolve(filepath)).toString()
    str.replace(/'''([^]+)'''/, function (str2, code) {
        code.replace(/\r/g, '').replace(/^input:\n?([^]+?)\n*^output:\n?([^\n]*(\n[^\n]+)*)/gm, function (str, input, output) {
            
            input = input.replace(/\r/g, '')
            output = output.replace(/\r/g, '')
            tests.push({
                input: input + '\n', output: output + '\n'
            })
        })
    })
    return {
        tests
    }
}