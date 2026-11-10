import { barHeights } from './bars';
import './BarChart.css';

export interface Bar {
  /** Under the bar, e.g. a short date */
  label: string;
  value: number;
}

interface BarChartProps {
  bars: Bar[];
  /** Describes the chart for screen readers */
  title: string;
  height?: number;
}

/**
 * A small bar chart in plain HTML and CSS, without a chart library: enough for
 * counters on a dashboard. Each bar shows its value on hover and is read out.
 */
const BarChart = ({ bars, title, height = 120 }: BarChartProps) => {
  const heights = barHeights(bars.map((bar) => bar.value));

  return (
    <figure className="bar-chart" aria-label={title}>
      <ul className="bar-chart-bars" style={{ height }}>
        {bars.map((bar, index) => (
          <li key={`${bar.label}-${index}`} className="bar-chart-item">
            <span className="bar-chart-value">{bar.value || ''}</span>
            <span
              className="bar-chart-bar"
              style={{ height: `${heights[index]}%` }}
              title={`${bar.label}: ${bar.value}`}
            />
            <span className="bar-chart-label" aria-label={`${bar.label}: ${bar.value}`}>
              {bar.label}
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
};

export default BarChart;
