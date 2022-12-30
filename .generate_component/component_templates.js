// component.tsx
exports.component = (name) => `import React from 'react';
import styles from './${name}.module.css'

export type ${name}Props = {}
const ${name} = ({}: ${name}Props) => {
  return <div data-testid="${name}-wrapper" classname={styles.${name}}>Hello 👋, I am a ${name} component.</div>;
};
export default ${name};
`;

// component.test.tsx
exports.test = (name) => `import React from 'react';
import { render, screen } from '@testing-library/react';
import {${name}} from './index';
describe('${name} Component', () => {
  test('it should exist', () => {
    render(<${name} />);
    expect(screen.getByTestId('${name}-wrapper')).toBeInTheDocument();
  });
});
`;

exports.index = (name) => `export {default as ${name}} from "./${name}"`;
