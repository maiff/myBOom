#!/usr/bin/env node

var download = require('download-git-repo')
var program = require('commander')
var chalk = require('chalk')
var ora = require('ora')
var inquirer = require('inquirer')
var path = require('path')
var home = require('user-home')
var exists = require('fs').existsSync
var rm = require('rimraf').sync
var generate = require('../lib/generate')
var tildify = require('tildify')
var logger = require('../lib/logger')

var localPath = require('../lib/local-path')

var isLocalPath = localPath.isLocalPath
var getTemplatePath = localPath.getTemplatePath

program
  .version('0.0.1')
  .usage('<template-name> <project-name>')
  .option('--offline', 'use cached template')

program.on('--help', function () {
  console.log('  Examples:')
  console.log()
  console.log(chalk.gray('    # create a new project with an official template'))
  console.log('    $ boom myExpress my-project')
  console.log()
  console.log(chalk.gray('    # create a new project straight from a github template (todo)'))
  console.log('    $ boom username/repo my-project')
  console.log()
})

program.parse(process.argv)
var template = program.args[0]
var hasSlash = template.indexOf('/') > -1
var rawName = program.args[1]
if (typeof template === 'undefined' || typeof rawName === 'undefined') {
   console.error(chalk.red('no template-name or project-name given!'))
   process.exit(1)
}
var tmp = path.join(home, '.boom-templates', template.replace(/\//g, '-'))
var to = path.resolve(rawName)

if (program.offline) {
  console.log(`> Use cached template at ${chalk.yellow(tildify(tmp))}`)
  template = tmp
}
if (exists(to)) {
  inquirer.prompt([{
    type: 'confirm',
    message: 'Target directory exists. Continue?',
    name: 'ok'
  }])
  .then(function (answers) {
    if (answers.ok) {
      run()
    }
  })
} else {
  run()
}

function run () {
  // check if template is local
  if (isLocalPath(template)) {
    var templatePath = getTemplatePath(template)
    if (exists(templatePath)) {
      generate(templatePath, to, function (err) {
        if (err) logger.fatal(err)
        console.log()
        logger.success('Generated "%s".', name)
      })
    } else {
      logger.fatal('Local template "%s" not found.', template)
    }
  } else {
    // checkVersion(function () {
      if (!hasSlash) {
        // use official templates
        var officialTemplate = 'maiff/' + template
        downloadAndGenerate(officialTemplate)
      } else {
        downloadAndGenerate(template)
      }
    // })
  }
}


function downloadAndGenerate (template) {
  var spinner = ora('downloading template')
  spinner.start()
  // Remove if local template exists
  if (exists(tmp)) rm(tmp)
  download(template, tmp, function (err) {
    spinner.stop()
    if (err) logger.fatal('Failed to download repo ' + template + ': ' + err.message.trim())

    generate(tmp, to, function (err) {
      if (err) logger.fatal(err)
      logger.success('Generated "%s".', name)
    })
  })
}






