import { storiesOf } from '@storybook/html';
import { withActions } from '@storybook/addon-actions';

storiesOf('Demo', module)
  .addDecorator(withActions({
  }))
  .add('heading', () => '<h1>Hello World</h1>')
  .add('button', () => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.innerText = 'Hello Button';
    btn.addEventListener('click', e => console.log(e));
    return btn;
  });
