
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
import { Bar, BarChart, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";
import { useFinancials } from '@/hooks/use-financials';
import { format, getYear, getMonth, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';

type YearType = 'calendar' | 'financial';
const CHART_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];


export default function AnalyticsPage() {
    const { monthlySummary, isDataLoaded, monthlyData, currentMonth } = useFinancials();
    const [yearType, setYearType] = useState<YearType>('calendar');
    const [selectedYear, setSelectedYear] = useState<string>(String(getYear(new Date())));

    const currentMonthKey = useMemo(() => format(new Date(currentMonth.year, currentMonth.month - 1), "yyyy-MM-01"), [currentMonth]);
    const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey);


    const availableYears = useMemo(() => {
        if (!isDataLoaded) return [];
        const years = new Set(Object.keys(monthlyData).map(d => String(getYear(new Date(d)))));
        return Array.from(years).sort((a,b) => Number(b) - Number(a));
    }, [monthlyData, isDataLoaded]);
    
    // Set default year if availableYears is loaded
    useMemo(() => {
        if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
            setSelectedYear(availableYears[0]);
        }
    }, [availableYears, selectedYear]);

    const filteredData = useMemo(() => {
        if (!isDataLoaded) return [];

        const yearData = monthlySummary.filter(d => {
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

        // Add monthly expenses to the data
        return yearData.map(summary => {
            const monthData = monthlyData[summary.month];
            const totalExpenses = monthData?.transactions
                .filter(t => t.type === 'DR')
                .reduce((acc, t) => acc + t.amount, 0) || 0;
            return {
                ...summary,
                expenses: totalExpenses,
            };
        });

    }, [monthlySummary, yearType, selectedYear, isDataLoaded, monthlyData]);

    const availableMonthsForSelection = useMemo(() => {
        return Object.keys(monthlyData)
            .filter(monthKey => {
                 const date = new Date(monthKey);
                 const year = getYear(date);
                 return String(year) === selectedYear;
            })
            .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    }, [monthlyData, selectedYear]);
    
     useMemo(() => {
        if (availableMonthsForSelection.length > 0 && !availableMonthsForSelection.includes(selectedMonth)) {
            setSelectedMonth(availableMonthsForSelection[availableMonthsForSelection.length - 1]);
        }
     }, [availableMonthsForSelection, selectedMonth]);

    const categorySpendingData = useMemo(() => {
        if (!isDataLoaded || !monthlyData[selectedMonth]) return [];

        const spending = monthlyData[selectedMonth].transactions
            .filter(t => t.type === 'DR')
            .reduce((acc, t) => {
                const category = t.category || 'Other';
                acc[category] = (acc[category] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);

        return Object.entries(spending)
            .map(([category, total], index) => ({
                name: category,
                total,
                fill: CHART_COLORS[index % CHART_COLORS.length]
            }))
            .sort((a,b) => b.total - a.total);

    }, [selectedMonth, monthlyData, isDataLoaded]);


    if (!isDataLoaded) {
        return null;
    }
    
    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <CardTitle>Yearly Financial Trends</CardTitle>
                            <CardDescription>
                                Key financial metrics over the course of the selected year.
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
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                             <ChartContainer config={{}} className="h-[400px] w-full">
                                <p className="text-sm text-center font-medium text-muted-foreground pb-4">Net Worth, Liquidity & Reserves</p>
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
                                    <Line dataKey="netWorth" type="monotone" stroke="var(--color-netWorth)" strokeWidth={2} name="Net Worth" />
                                    <Line dataKey="liquidity" type="monotone" stroke="var(--color-liquidity)" strokeWidth={2} name="Liquidity" />
                                    <Line dataKey="reserves" type="monotone" stroke="var(--color-reserves)" strokeWidth={2} name="Reserves" />
                                </LineChart>
                            </ChartContainer>
                            <ChartContainer config={{}} className="h-[400px] w-full">
                                <p className="text-sm text-center font-medium text-muted-foreground pb-4">Total Monthly Expenses</p>
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
                                    <Line dataKey="expenses" type="monotone" stroke="var(--color-expenses)" strokeWidth={2} name="Expenses" />
                                </LineChart>
                            </ChartContainer>
                        </div>
                    ) : (
                         <div className="flex h-[400px] w-full items-center justify-center rounded-md border border-dashed">
                            <p className="text-muted-foreground">No data available for the selected year.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                             <CardTitle>Category Spending</CardTitle>
                             <CardDescription>
                                A breakdown of your expenses by category for a selected month.
                            </CardDescription>
                        </div>
                         <div className="grid gap-2">
                               <Label>Select Month</Label>
                               <Select value={selectedMonth} onValueChange={setSelectedMonth} disabled={availableMonthsForSelection.length === 0}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select Month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableMonthsForSelection.map(m => (
                                            <SelectItem key={m} value={m}>
                                                {format(parseISO(m), "MMMM yyyy")}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                    </div>
                </CardHeader>
                 <CardContent>
                    {categorySpendingData.length > 0 ? (
                        <ChartContainer config={{}} className="h-[400px] w-full">
                            <BarChart data={categorySpendingData} layout="vertical" margin={{left: 20, right: 20}}>
                                <CartesianGrid horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    tickLine={false} 
                                    axisLine={false}
                                    width={120}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                />
                                <RechartsTooltip 
                                    cursor={{fill: 'hsl(var(--muted))'}}
                                    content={<ChartTooltipContent 
                                        formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
                                    />}
                                />
                                <Bar dataKey="total" radius={4}>
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    ) : (
                        <div className="flex h-[400px] w-full items-center justify-center rounded-md border border-dashed">
                            <p className="text-muted-foreground">No spending data for this month.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
