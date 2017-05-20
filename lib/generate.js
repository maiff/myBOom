var ask = require('./ask')
var getOptions = require('./getOpt')
module.exports = function generate (dir, to, fn) {
  let opt = getOptions(dir)
  ask(opt.prompts).then((answer) => {
    console.log(answer)
  }).then(_ => {
    ask(opt.functions)
  })
  // console.log(getOptions(dir), typeof getOptions(dir))
}