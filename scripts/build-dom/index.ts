import * as docs from '@ionic/docs/core.json';
import {mkdirSync, writeFileSync, existsSync, readdirSync, readFileSync, lstatSync} from 'fs';

const components = docs.components;
const componentsDir = 'scripts/ionic/core/src/components/';

// コンポーネントディレクトリを作成
mkdirSync('./stories');

for (const c of components) {
  if (!c.tag || !c.usage.javascript || !existsSync(componentsDir + c.tag.replace('ion-', '') + '/test')) {
    continue;
  }
  const tag = c.tag.replace('ion-', '');
  const dir = readdirSync(componentsDir + tag + '/test');

  let render = `
        export default {
          title: '${c.tag}',
        };
        `;

  for (const t of dir) {
    if (!lstatSync(componentsDir + tag + '/test/' + t).isDirectory()) {
      continue;
    }

    const tests = readFileSync(componentsDir + tag + '/test/' + t + '/index.html', { encoding: 'UTF8' });
    let testsHtml = tests.match(/<ion-app[\s\S]*?<\/ion-app>/i);
    if (!testsHtml) {
      testsHtml = tests.match(/<body[\s\S]*?<\/body>/i);
      if (!testsHtml) {
        console.log('正規表現でとれなかった: ' + componentsDir + tag + '/test/' + t);
        continue;
      }
    }
    const testsHtmlString = testsHtml[0];

    // scriptがあった時の処理
    const script = testsHtmlString.match(/<script>[\s\S]*?<\/script>/i);
    let scriptTag;
    if (script && tag == 'action-sheet') {
      scriptTag = script[0].replace('<script>', '').replace('</script>', '');
    } else {
      scriptTag = '';
    }

    const testType = t.replace('-', '_');
    render = render + `
        export const ${testType} = () => \`${testsHtmlString.replace(/`/g, '\\`')}\`;
        `;
    render = render + scriptTag;
  }

  writeFileSync('stories/' + tag + '.stories.js', render, { encoding: 'UTF8' });


  //
  //
  // let usage = JSON.stringify(c.usage.javascript)
  //   .replace('```html', '')
  //   .replace('```', '');
  //
  // if (!usage.match(/ion-app/)) {
  //   usage = '"<ion-app>' + usage.slice( 1 ).slice( 0, -1 ) + '</ion-app>"'
  // }
  //
  // const render = `
  //   export default {
  //     title: '${c.tag}',
  //   };
  //   export const components = () => ${usage};
  //   `;
  //
  // writeFileSync('stories/' + c.tag + '.stories.js', render, { encoding: 'UTF8' });
}
