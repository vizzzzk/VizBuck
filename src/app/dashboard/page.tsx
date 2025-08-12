"use client";

import { DollarSign, IndianRupee, Banknote, Landmark, Wallet, CreditCard, CandlestickChart, ArrowUpRight, ArrowDownRight, PlusCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const incomeData = [
  { name: 'Salary', value: 150000, fill: "hsl(var(--chart-1))" },
  { name: 'Bonus', value: 25000, fill: "hsl(var(--chart-2))" },
  { name: 'Other', value: 10000, fill: "hsl(var(--chart-3))" },
];

const liquidityData = [
    { name: 'Bank Accounts', value: 250000, fill: "hsl(var(--chart-1))" },
    { name: 'Cash', value: 15000, fill: "hsl(var(--chart-2))" },
    { name: 'Credit Cards', value: -50000, fill: "hsl(var(--chart-4))" },
    { name: 'Receivables', value: 20000, fill: "hsl(var(--chart-5))" },
];

const reservesData = [
    { name: 'Fixed Deposits', value: 500000 },
    { name: 'Stocks', value: 750000 },
    { name: 'Crypto', value: 125000 },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-2xl font-bold">Financial Overview</h2>
            <div className="flex items-center gap-2">
                 <Select defaultValue="2024">
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                    </SelectContent>
                </Select>
                 <Select defaultValue="july">
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="january">January</SelectItem>
                        <SelectItem value="february">February</SelectItem>
                        <SelectItem value="march">March</SelectItem>
                        <SelectItem value="april">April</SelectItem>
                        <SelectItem value="may">May</SelectItem>
                        <SelectItem value="june">June</SelectItem>
                        <SelectItem value="july">July</SelectItem>
                        <SelectItem value="august">August</SelectItem>
                        <SelectItem value="september">September</SelectItem>
                        <SelectItem value="october">October</SelectItem>
                        <SelectItem value="november">November</SelectItem>
                        <SelectItem value="december">December</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹15,10,000</div>
            <p className="text-xs text-muted-foreground text-green-500 flex items-center">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              +5.2% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opening Balance</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹2,15,000</div>
             <p className="text-xs text-muted-foreground">As of 1st July</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closing Balance</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹2,35,000</div>
            <p className="text-xs text-muted-foreground">As of 31st July</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹1,85,000</div>
            <p className="text-xs text-muted-foreground">
              For July 2024
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Liquidity Breakdown</CardTitle>
            <CardDescription>
              Snapshot of your current liquid assets and liabilities.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
             <ChartContainer config={{}} className="h-[250px] w-full">
               <PieChart>
                 <ChartTooltip
                    content={<ChartTooltipContent hideLabel />}
                 />
                 <Pie
                    data={liquidityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    labelLine={false}
                    label={({
                        cx,
                        cy,
                        midAngle,
                        innerRadius,
                        outerRadius,
                        value,
                        index,
                    }) => {
                        const RADIAN = Math.PI / 180
                        const radius = 25 + innerRadius + (outerRadius - innerRadius)
                        const x = cx + radius * Math.cos(-midAngle * RADIAN)
                        const y = cy + radius * Math.sin(-midAngle * RADIAN)

                        return (
                        <text
                            x={x}
                            y={y}
                            textAnchor={x > cx ? 'start' : 'end'}
                            dominantBaseline="central"
                            className="fill-foreground text-xs"
                        >
                           {liquidityData[index].name}
                        </text>
                        )
                    }}
                >
                    {liquidityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                 </Pie>
                 <ChartLegend content={<ChartLegendContent />} />
               </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
         <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Reserves & Investments</CardTitle>
            <CardDescription>
              Long-term assets and investments.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {reservesData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-md">
                            {item.name === 'Fixed Deposits' && <Landmark className="w-5 h-5 text-muted-foreground" />}
                            {item.name === 'Stocks' && <CandlestickChart className="w-5 h-5 text-muted-foreground" />}
                            {item.name === 'Crypto' && <DollarSign className="w-5 h-5 text-muted-foreground" />}
                        </div>
                        <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold text-lg">₹{item.value.toLocaleString('en-IN')}</span>
                </div>
             ))}
          </CardContent>
        </Card>
      </div>
      
       <div className="grid gap-6 md:grid-cols-1">
         <Card>
          <CardHeader>
            <CardTitle>Income Sources</CardTitle>
            <CardDescription>
              Breakdown of your income for the selected period.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={{}} className="h-[250px] w-full">
              <BarChart data={incomeData} layout="vertical" accessibilityLayer margin={{ left: 20 }}>
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  width={80}
                />
                <XAxis type="number" hide />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={false}
                />
                 <Bar dataKey="value" layout="vertical" fill="hsl(var(--primary))" radius={4}>
                    {incomeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                 </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
       </div>
    </div>
  );
}
