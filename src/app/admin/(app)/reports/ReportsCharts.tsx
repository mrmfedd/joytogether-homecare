"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ReportsCharts({
  byService,
  byMonth,
}: {
  byService: { name: string; count: number }[];
  byMonth: { month: string; count: number }[];
}) {
  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-2">
      <div className="h-80 rounded-2xl border border-line bg-white p-4">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted">Leads by service</h2>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={byService}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" hide />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#0759AE" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="h-80 rounded-2xl border border-line bg-white p-4">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted">Leads by month</h2>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={[...byMonth].reverse()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#71C73C" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
