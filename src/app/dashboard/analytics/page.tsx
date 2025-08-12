
"use client";
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";
import { useFinancials } from '@/hooks/use-financials';
import { format, getYear, getMonth } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';

type YearType = 'calendar' | 'financial';

export default function AnalyticsPage() {
    const { monthlySummary, isDataLoaded } = useFinancials();
    const [yearType, setYearType] = useState<YearType>('calendar');
    const [selectedYear, setSelectedYear] = useState<string>(String(getYear(new Date())));

    const availableYears = useMemo(() => {
        if (!isDataLoaded) return [];
        const years = new Set(monthlySummary.map(d => String(getYear(new Date(d.month)))));
        return Array.from(years).sort((a,b) => Number(b) - Number(a));
    }, [monthlySummary, isDataLoaded]);

    const filteredData = useMemo(() => {
        if (!isDataLoaded) return [];

        return monthlySummary.filter(d => {
            const date = new Date(d.month);
            const month = getMonth(date); // 0-11
            const year = getYear(date);

            if (yearType === 'calendar') {
                return String(year) === selectedYear;
            } else { // financial
                const financialYear = month >= 3 ? year : year - 1;
                return String(financialYear) === selectedYear;
            }
        });
    }, [monthlySummary, yearType, selectedYear, isDataLoaded]);


    if (!isDataLoaded) {
        return <div className="flex h-[calc(100vh-8rem)] items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div></div>;
    }
    
    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <CardTitle>Financial Trends</CardTitle>
                            <CardDescription>
                                A line graph showing the trends of your Net Worth, Liquidity, and Reserves over time.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="grid gap-2">
                               <Label>Year Type</Label>
                               <Select value={yearType} onValueChange={(v) => setYearType(v as YearType)}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Select Year Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="calendar">Calendar Year</SelectItem>
                                        <SelectItem value="financial">Financial Year</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                               <Label>Select Year</Label>
                               <Select value={selectedYear} onValueChange={setSelectedYear}>
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue placeholder="Select Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableYears.map(y => (
                                            <SelectItem key={y} value={y}>
                                                {yearType === 'financial' ? `${y} - ${Number(y) + 1}` : y}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredData.length > 0 ? (
                        <ChartContainer config={{}} className="h-[400px] w-full">
                            <LineChart data={filteredData}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="month" 
                                    tickFormatter={(value) => format(new Date(value), "MMM")}
                                    padding={{ left: 20, right: 20 }}
                                />
                                <YAxis 
                                    tickFormatter={(value) => `₹${value / 1000}k`}
                                    width={80}
                                />
                                <RechartsTooltip 
                                    cursor={{fill: 'hsl(var(--muted))'}}
                                    content={<ChartTooltipContent 
                                        className="bg-background/80 backdrop-blur-sm"
                                        formatter={(value, name) => [`₹${Number(value).toLocaleString('en-IN')}`, name]}
                                        labelFormatter={(label) => format(new Date(label), "MMMM yyyy")}
                                    />}
                                />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Line dataKey="netWorth" type="monotone" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Net Worth" />
                                <Line dataKey="liquidity" type="monotone" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Liquidity" />
                                <Line dataKey="reserves" type="monotone" stroke="hsl(var(--chart-4))" strokeWidth={2} name="Reserves" />
                            </LineChart>
                        </ChartContainer>
                    ) : (
                         <div className="flex h-[400px] w-full items-center justify-center rounded-md border border-dashed">
                            <p className="text-muted-foreground">No data available for the selected year.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
