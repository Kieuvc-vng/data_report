import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface DonutChartProps {
  data: Array<{ name: string; count: number }>;
  colors: string[];
  title?: string;
}

export function DonutChart({ data, colors, title }: DonutChartProps) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-gray-600">No data available</p>;
  }

  return (
    <div className="w-full flex flex-col items-center">
      {title && <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="count"
            label={({ count, percent }) => `${(percent * 100).toFixed(0)}%`}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`${value} candidates`, 'Count']}
            labelFormatter={(label) => {
              const item = data.find((d) => d.count === label);
              return item ? item.name : label;
            }}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '8px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Custom Legend */}
      <div className="mt-4 w-full grid grid-cols-2 gap-2 text-xs">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors[idx % colors.length] }}
            />
            <span className="text-gray-700">
              {item.name} <span className="text-gray-500">({item.count})</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
