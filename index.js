const { argv } = process

/**
 * 1. read the yaml file 
 * 2. for every item in yaml array:
 *  2.1. read the file from disk
 *  2.2. create new html file replacing contents with the file content and other metadata from the yaml item
 *  2.3. save new html file to disk
 *  2.4. update index.html page to reflect the yaml file
 * 3. run deploy script from deploy.js
 */
const { log } = console
const y2j = require('js-yaml')
const fs = require('fs')
const path = require('path')
const { pipe } = require('sanctuary')
const { marked } = require('marked')
const mkdirp = require('mkdirp')
const os = require('os')
const { execSync } = require('child_process')
const { config } = y2j.load(fs.readFileSync('./config.yaml', 'utf-8'))

const normalizePath = p => {
  return p[0] === '~' ? path.join(os.homedir(), p.slice(1)) : p
}
const { posts } = y2j.load(fs.readFileSync('./d.yaml', 'utf-8'))

const stringReplace = pattern => replaceWith => string => string.replaceAll(pattern, replaceWith)
const readFile = (p) => {
  try {
    return fs.readFileSync(p, 'utf-8')
  } catch (e) {
    throw new Error('i could not read this file: ' + p + '\ni think it does not exist at the path specified in your posts file')
  }
}
const getFileName = p => path.basename(p, path.extname(p))
const convertToHtml = markdownContent => {
  try {
    return marked.parse(markdownContent)
  } catch (e) {
    throw new Error('oh no, i could not parse the markdown content. check if your content has some stuff incompatible with marked markdown parser.')
  }
}
const generateNewHtmlFile = title => content => {
  try {
    const blogTemplateContents = fs.readFileSync(path.resolve(__dirname, config.defaultBlogTemplate), 'utf-8')
    const newHtmlFileContents = pipe([
      stringReplace('{title}')(title),
      stringReplace('{content}')(content)
    ])(blogTemplateContents)
    return newHtmlFileContents
  } catch (e) {
    throw new Error('i could not read the blog template file. either the file does not exist, or there is some other problem.')
  }
}
const writeToDisk = fileName => contents => {
  try {
    const _ = fs.writeFileSync(`./tmp/${fileName}.html`, contents, { encoding: 'utf-8' })
    return true
  } catch (e) {
    throw new Error('i could not write to disk. permissions or something.')
  }
}
const updateIndexPage = posts => {
  let html = '<ol>'
  let i = 0
  while (i < posts.length) {
    const post = posts[i]
    html += `<li><a href="./${getFileName(post.path)}.html">${post.title}</a></li>`
    i++
  }
  html += '</ol>'
  try {
    const homePageTemplate = fs.readFileSync(config.defaultHomeTemplate, 'utf-8')
    const newHomePage = stringReplace('{content}')(html)(homePageTemplate)
    const _ = fs.writeFileSync('./tmp/index.html', newHomePage, { encoding: 'utf-8' })
    return true
  } catch (e) {
    throw new Error('i could either not read the home page template or I could not write to the index.html file.')
  }
}

const cleanup = () => {
  execSync('rm -rf ./www/')
  mkdirp('./www')
  execSync('mv ./tmp ./www')
  execSync('cp -r ./assets ./www/assets')
  execSync('rm -rf ./tmp')
}

const main = () => {
  try {
    mkdirp.sync('./tmp')
    console.time('it took')
    let i = 0
    while (i < posts.length) {
      const post = posts[i]
      const _ = pipe([
        normalizePath,
        readFile,
        convertToHtml,
        generateNewHtmlFile(post.title),
        writeToDisk(getFileName(post.path))
      ])(post.path)
      i++
    }
    const _ = updateIndexPage(posts.sort((a, b) => a.date <= b.date ? 1 : -1))
    execSync('yarn build-css')
    cleanup()
    log('site generated')
    console.timeEnd('it took')
  } catch (e) {
    execSync('rm -rf ./tmp')
    console.log(e.toString())
  }
}

main()