import type { Meta, StoryObj } from '@storybook/react'
import { GlassCard } from './glass-card'
import { BookOpen, Users, BarChart3, Settings } from 'lucide-react'
import { Button } from './button'

const meta = {
  title: 'UI/GlassCard',
  component: GlassCard,
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'gradient',
      values: [
        {
          name: 'gradient',
          value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
        {
          name: 'light',
          value: '#f5f5f7',
        },
        {
          name: 'dark',
          value: '#1a1a1a',
        },
      ],
    },
    docs: {
      description: {
        component: 'A glass morphism card component with backdrop blur and subtle transparency effects. Perfect for creating layered, modern interfaces.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof GlassCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2">Glass Card</h3>
        <p className="text-sm text-text-secondary">
          This is a glass morphism card with backdrop blur effects.
        </p>
      </div>
    ),
  },
}

export const WithIcon: Story = {
  args: {
    children: (
      <div className="p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
          <BookOpen className="h-6 w-6" />
        </div>
        <h3 className="mb-2 font-semibold text-text-primary">Book Management</h3>
        <p className="text-sm text-text-secondary">
          Comprehensive catalog with advanced search, categories, and availability tracking.
        </p>
      </div>
    ),
  },
}

export const StatCard: Story = {
  args: {
    children: (
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-secondary">Total Books</p>
            <p className="text-2xl font-bold text-text-primary">1,245</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>
      </div>
    ),
  },
}

export const ActionCard: Story = {
  args: {
    children: (
      <div className="p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10 text-warning">
          <Users className="h-6 w-6" />
        </div>
        <h3 className="mb-2 font-semibold text-text-primary">Student Management</h3>
        <p className="text-sm text-text-secondary mb-4">
          Organize students by year with bulk import and easy account creation.
        </p>
        <Button variant="outline" size="sm">
          Manage Students
        </Button>
      </div>
    ),
  },
}

export const HoverEffect: Story = {
  args: {
    className: "group hover-lift transition-all duration-300 cursor-pointer",
    children: (
      <div className="p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-info/10 text-info group-hover:bg-info/20 transition-colors">
          <BarChart3 className="h-6 w-6" />
        </div>
        <h3 className="mb-2 font-semibold text-text-primary">Analytics & Reports</h3>
        <p className="text-sm text-text-secondary">
          Year-based reporting with visual dashboards and exportable data.
        </p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Glass card with hover effects and transitions.',
      },
    },
  },
}

export const Dashboard: Story = {
  render: () => (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl">
      <GlassCard className="group hover-lift transition-all duration-300">
        <div className="p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="mb-2 font-semibold text-text-primary">Book Management</h3>
          <p className="text-sm text-text-secondary">
            Comprehensive catalog with advanced search and categories.
          </p>
        </div>
      </GlassCard>

      <GlassCard className="group hover-lift transition-all duration-300">
        <div className="p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-success/10 text-success">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="mb-2 font-semibold text-text-primary">Student Management</h3>
          <p className="text-sm text-text-secondary">
            Organize students by year with bulk import capabilities.
          </p>
        </div>
      </GlassCard>

      <GlassCard className="group hover-lift transition-all duration-300">
        <div className="p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10 text-warning">
            <BarChart3 className="h-6 w-6" />
          </div>
          <h3 className="mb-2 font-semibold text-text-primary">Analytics & Reports</h3>
          <p className="text-sm text-text-secondary">
            Year-based reporting with visual dashboards.
          </p>
        </div>
      </GlassCard>

      <GlassCard className="group hover-lift transition-all duration-300">
        <div className="p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-info/10 text-info">
            <Settings className="h-6 w-6" />
          </div>
          <h3 className="mb-2 font-semibold text-text-primary">Advanced Features</h3>
          <p className="text-sm text-text-secondary">
            Notifications, reservations, and fine management.
          </p>
        </div>
      </GlassCard>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Dashboard layout showcasing multiple glass cards with different features.',
      },
    },
  },
}