import path from 'path';
import cheerio from 'cheerio';
import {
  opendir,
  readFile,
  writeFile
} from 'fs/promises';

const EXT = /.*\.html$/;
// const EXT = /.*sha1\.html$/;

try {
  const dir = await opendir('./');
  for await (const dirent of dir){
    if (dirent.isFile() && dirent.name.match(EXT)) {
      doProcess(dirent.name);
    }
  }
} catch (err) {
  console.error(err);
}

async function doProcess(filename) {
  const filepath = path.resolve(process.cwd(), filename);
  let content = await readFile(filepath, 'utf8');

  // console.log(filename);
  const regxp = /(href|src)=(\"|\')\/(.*)(\"|\')/g;

  content = content.replace(regxp, '$1=$2$3$4');

  const $ = cheerio.load(content);

  let baseTag = $('base');
  if (baseTag.length) {
    baseTag[0].attribs.href = '/online-tools/';
    console.log($.html())
  } else {
    $('head').prepend($('<base href="/online-tools/">'))
  }

  let badScript = $('script:not([src])');
  if (badScript.length) {
    badScript.remove()
  }

  writeFile(filepath, 'utf8', $.html());
}
