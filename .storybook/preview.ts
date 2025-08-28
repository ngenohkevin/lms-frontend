import type { Preview } from '@storybook/nextjs-vite'
import '../src/app/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#FEFEFE',
        },
        {
          name: 'dark',
          value: '#000000',
        },
      ],
    },
    nextjs: {
      appDirectory: true,
    },
  },
};

export default preview;