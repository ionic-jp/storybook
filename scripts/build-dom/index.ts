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
import { storiesOf } from '@storybook/html';
import { withActions } from '@storybook/addon-actions';
storiesOf('${c.tag}', module)
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
    let testsHtmlString = testsHtml[0];

    // scriptがあった時の処理
    const script = tests.match(/<script>[\s\S]*?<\/script>/i);
    let scriptTag = '';
    if (script && !['back-button'].includes(tag)) {
      const scriptCode = script[0]
        .replace('<script>', '')
        .replace('</script>', '')
        .replace(/\${/g, '\\${');
      testsHtmlString = testsHtmlString.replace(/<script>[\s\S]*?<\/script>/i, '');
      scriptTag = `
      (function () {
        console.log('load scripts');
        const script = document.createElement('script');
        script.innerHTML = \`${scriptCode.replace(/`/g, '\\`')}\`;
        document.getElementById('root').appendChild(script);
      }());
      `
    } else {
      scriptTag = '';
    }

    const testType = t.replace('-', '_');
    render = render + `.add('${testType}', () => {
      ${scriptTag}
      return \`${testsHtmlString.replace(/`/g, '\\`')}\`
     })`;
  }

  writeFileSync('stories/' + tag + '.stories.ts', render, { encoding: 'UTF8' });
}
