var inquirer = require('inquirer')

module.exports = function ask (prompts) {
  var questions = []
  for (const i in prompts) {
    prompts[i].name = i
    questions.push(prompts[i])
  }
  return inquirer.prompt(questions)
}
