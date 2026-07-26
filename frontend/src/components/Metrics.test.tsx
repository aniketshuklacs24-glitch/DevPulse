import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Metrics from './Metrics';

// Mock recharts to avoid rendering issues in jsdom
vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('recharts')>();
  return {
    ...actual,
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
    ComposedChart: ({ children }: any) => <div data-testid="composed-chart">{children}</div>,
    XAxis: () => <div />,
    YAxis: () => <div />,
    Tooltip: () => <div />,
    Bar: () => <div />,
    Area: () => <div />,
    Line: () => <div />,
    CartesianGrid: () => <div />,
    Legend: () => <div />,
  };
});

describe('Metrics Component', () => {
  const mockAnalytics = [
    {
      prId: '101',
      title: 'refactor: Rewrite authentication hook flow',
      timeToMergeHours: 14,
      filesChanged: 8,
      linesAdded: 142,
      linesRemoved: 90,
      status: 'closed'
    },
    {
      prId: '102',
      title: 'feat: Add real-time visual code canvas',
      timeToMergeHours: 32,
      filesChanged: 15,
      linesAdded: 520,
      linesRemoved: 40,
      status: 'closed'
    }
  ];

  it('renders without crashing and displays analytics aggregates', () => {
    render(<Metrics analytics={mockAnalytics} />);
    expect(screen.getByText('Avg Time to Merge')).toBeInTheDocument();
    expect(screen.getByText('Total PRs Merged')).toBeInTheDocument();
    expect(screen.getByText('Total Files Modified')).toBeInTheDocument();
    expect(screen.getByText('Database Audit: Time to Merge (Hours)')).toBeInTheDocument();
  });
});
