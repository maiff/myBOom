var Handlebars = require('handlebars')
var ask = require('./ask')
var fs = require('fs-extra')
var path = require('path')
var getOptions = require('./getOpt')
var rm = require('rimraf').sync

module.exports = function generate (dir, to, fn) {
  fs.copySync(path.join(dir, 'template'), to) // copy template
  var opt = getOptions(dir)
  var basicAnswer
  ask(opt.prompts).then((answer) => {
    basicAnswer = answer
  }).then(_ => {
    return ask(opt.functions)
  }).then((answer) => {
    //answer obj 
    // 1.collect dep and ccompile package.json
    compiler(path.join(to, 'package.json'), Object.assign(answer, basicAnswer))
    // 2.filter file
    filter(opt.functions, answer, to)
    // 3.compliter sub (tips:after only deal with dep, compile the sub)
    compileSub(opt.functions, answer, to)
  })
  .catch((err) => console.log(err))
}


function filter (functions, answer, to) {
  Object.keys(functions).forEach((key) => {
    if (!answer[key]) rm(path.join(to, functions[key]["filterFile"]))
  })
}

function compileSub (functions, answer, to) {
  function askAndCompiler (index) {
    let key = Object.keys(functions)[index]
    if (answer[key]) ask(functions[key]["prompts"]).then((answer) => {
      compiler(path.join(to, functions[key]["promptsFile"]), answer)
      index++
      askAndCompiler(index)
    })
  }
  askAndCompiler(0)
}

function compiler (path, answer) {
  var str = fs.readFileSync(path).toString()
  var template = Handlebars.compile(str)
  var result = template(answer)
  fs.writeFileSync(path, result)
}

