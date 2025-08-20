"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ApiKeySection from "@/app/karmapurge/contents/ApiKeySection";
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "@/components/ui/accordion";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis } from "recharts";

export default function AccountTab({ session, subscriptionType }) {
	const [visitorCount, setVisitorCount] = useState(0);
	const [humanCount, setHumanCount] = useState(0);
	const [botCount, setBotCount] = useState(0);
	const [blockedCount, setBlockedCount] = useState(0);
	const [chartData, setChartData] = useState([]);
	const [activeChart, setActiveChart] = useState("desktop");
	const [total, setTotal] = useState({ desktop: 0, mobile: 0 });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const username = session?.user?.username;

	useEffect(() => {
		async function fetchAccountStats() {
			if (!username) return;
			setLoading(true);
			setError("");
			try {
				const res = await fetch(
					`/api/account?username=${encodeURIComponent(username)}`
				);
				const data = await res.json();
				console.log("API data:", data);

				setVisitorCount(data.totalVisitors || 0);
				setHumanCount(data.humanCount || 0);
				setBotCount(data.botCount || 0);
				setBlockedCount(data.blockedCount || 0);

				setChartData([
					{
						link: "Humans",
						desktop: data.humansByDevice?.desktop || 0,
						mobile: data.humansByDevice?.mobile || 0,
					},
					{
						link: "Bots",
						desktop: data.botsByDevice?.desktop || 0,
						mobile: data.botsByDevice?.mobile || 0,
					},
					{
						link: "Blocked",
						desktop: data.blockedByDevice?.desktop || 0,
						mobile: data.blockedByDevice?.mobile || 0,
					},
				]);

				const deviceTotals = (data.devices || []).reduce(
					(acc, d) => {
						const name = (d.device || "").toLowerCase();
						const count = d.count || 0;
						if (name === "desktop") acc.desktop += count;
						if (name === "mobile") acc.mobile += count;
						return acc;
					},
					{ desktop: 0, mobile: 0 }
				);
				setTotal(deviceTotals);
			} catch (err) {
				console.error(err);
				setError("Failed to fetch account data");
			}
			setLoading(false);
		}
		fetchAccountStats();
	}, [username]);

	const chartConfig = {
		desktop: {
			label: "Desktop",
			color: "var(--chart-2)",
		},
		mobile: {
			label: "Mobile",
			color: "var(--chart-1)",
		},
	};

	return (
		<motion.div className="flex flex-col items-center justify-center gap-6 p-6 bg-gradient-to-br from-black/30 to-red-700/50 rounded-xl shadow-lg ring-1 font-semibold">
			<div className="flex">
				<Accordion
					type="single"
					collapsible
					className="w-full flex items-center"
				>
					<AccordionItem value="apikey">
						<AccordionTrigger className="text-cyan-400 hover:text-cyan-300 cursor-pointer">
							<div className="flex items-center gap-1">
								<p className="text-cyan-400 text-lg tracking-wider flex gap-2 items-center">
									<span className="font-semibold">
										{session?.user?.username?.toUpperCase()}
									</span>
									<span className="text-amber-500">
										({subscriptionType?.toUpperCase()})
									</span>
								</p>
							</div>
						</AccordionTrigger>
						<AccordionContent>
							<ApiKeySection username={username} />
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</div>

			<Card className="w-full">
				<CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
					<div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
						<CardTitle>Visitors Stats</CardTitle>
						<CardDescription>
							Total visitors, humans, bots, and blocked visitors.
						</CardDescription>
					</div>
					<div className="flex">
						{["desktop", "mobile"].map((key) => {
							return (
								<button
									key={key}
									data-active={activeChart === key}
									className={`relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6 sm:-mt-6 md:-mt-6 lg:-mt-6 xl:-mt-6
                                    data-[active=true]:bg-black/80
                                    ${
																			key === "mobile"
																				? "data-[active=true]:rounded-r-xl"
																				: ""
																		}`}
									onClick={() => setActiveChart(key)}
								>
									<span className="text-muted-foreground text-xs">
										{chartConfig[key].label}
									</span>
									<span className="text-lg leading-none font-bold sm:text-3xl">
										{total[key].toLocaleString()}
									</span>
								</button>
							);
						})}
					</div>
				</CardHeader>
				<CardContent className="px-2 sm:p-6">
					<ChartContainer
						config={chartConfig}
						className="aspect-auto h-[250px] w-full"
					>
						<BarChart
							accessibilityLayer
							data={chartData}
							margin={{ left: 12, right: 12 }}
						>
							<CartesianGrid vertical={false} />
							<XAxis
								dataKey="link"
								tickLine={true}
								axisLine={false}
								tickMargin={8}
								minTickGap={32}
							/>
							<ChartTooltip
								content={
									<ChartTooltipContent className="w-[150px]" nameKey="views" />
								}
							/>
							<Bar
								dataKey={activeChart}
								fill={chartConfig[activeChart].color}
							/>
						</BarChart>
					</ChartContainer>
				</CardContent>
			</Card>

			{error && (
				<span className="text-red-500 text-sm font-medium mt-2">{error}</span>
			)}
		</motion.div>
	);
}
