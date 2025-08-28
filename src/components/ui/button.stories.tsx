// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/react'
import { BookOpen, Download, Heart, Plus, Settings, Trash2 } from 'lucide-react'

import { Button } from './button'

// eslint-disable-next-line no-console
const action = (name: string) => () => console.log(`${name} clicked`)

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants, sizes, and states. Built with Radix UI primitives and styled with Tailwind CSS.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'The visual style variant of the button',
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'The size of the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    asChild: {
      control: 'boolean',
      description: 'Whether to render as a child element (using Slot)',
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

// Basic variants
export const Default: Story = {
  args: {
    children: 'Button',
    onClick: action('clicked'),
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
    onClick: action('delete-clicked'),
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
    onClick: action('outline-clicked'),
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
    onClick: action('secondary-clicked'),
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost',
    onClick: action('ghost-clicked'),
  },
}

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link',
    onClick: action('link-clicked'),
  },
}

// Sizes
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
    onClick: action('small-clicked'),
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
    onClick: action('large-clicked'),
  },
}

export const Icon: Story = {
  args: {
    size: 'icon',
    children: <Settings />,
    onClick: action('icon-clicked'),
  },
}

// With Icons
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <BookOpen className="mr-2 h-4 w-4" />
        Add Book
      </>
    ),
    onClick: action('with-icon-clicked'),
  },
}

export const IconOnly: Story = {
  args: {
    size: 'icon',
    variant: 'outline',
    children: <Plus className="h-4 w-4" />,
    onClick: action('icon-only-clicked'),
  },
}

// States
export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
    onClick: action('disabled-clicked'),
  },
}

export const Loading: Story = {
  args: {
    children: (
      <>
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current" />
        Loading...
      </>
    ),
    disabled: true,
    onClick: action('loading-clicked'),
  },
}

// Library Actions
export const LibraryActions: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button onClick={action('add-book')}>
        <Plus className="mr-2 h-4 w-4" />
        Add Book
      </Button>
      <Button variant="outline" onClick={action('download-report')}>
        <Download className="mr-2 h-4 w-4" />
        Download Report
      </Button>
      <Button variant="secondary" onClick={action('favorite')}>
        <Heart className="mr-2 h-4 w-4" />
        Add to Favorites
      </Button>
      <Button variant="destructive" onClick={action('delete')}>
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Common button variations used in the library management system.',
      },
    },
  },
}

// Button Group
export const ButtonGroup: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={action('option-1')}>
        Option 1
      </Button>
      <Button variant="outline" size="sm" onClick={action('option-2')}>
        Option 2
      </Button>
      <Button variant="outline" size="sm" onClick={action('option-3')}>
        Option 3
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons grouped together for related actions.',
      },
    },
  },
}