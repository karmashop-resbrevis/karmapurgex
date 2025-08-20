import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import crypto from "crypto";

export async function GET(req) {
    const { searchParams } = new URL(
        req.url,
        process.env.NEXT_PUBLIC_APP_URL || "https://karmapurge.shop"
    );
    const username = searchParams.get("username");

    if (!username) {
        return NextResponse.json({ error: "Missing username" }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();

        let userProfile = await db.collection("user_profiles").findOne({ username });
        let apiKey = userProfile?.apiKey;
        if (!apiKey) {
            apiKey = crypto.randomBytes(32).toString("hex");
            await db.collection("user_profiles").updateOne(
                { username },
                { $set: { apiKey } },
                { upsert: true }
            );
        }

        const result = await db
            .collection("visitors")
            .aggregate([
                {
                    $lookup: {
                        from: "shortlinks",
                        localField: "shortlinkId",
                        foreignField: "_id",
                        as: "shortlink",
                    },
                },
                { $unwind: "$shortlink" },
                { $match: { "shortlink.owner": username } },
                {
                    $group: {
                        _id: null,
                        totalVisitors: { $sum: 1 },
                        blockedCount: {
                            $sum: {
                                $cond: [{ $eq: ["$isBlocked", true] }, 1, 0],
                            },
                        },
                        botCount: {
                            $sum: {
                                $cond: [{ $eq: ["$isBot", true] }, 1, 0],
                            },
                        },
                        humanCount: {
                            $sum: {
                                $cond: [{ $eq: ["$isBot", false] }, 1, 0],
                            },
                        },
                    },
                },
            ])
            .toArray();

        const stats =
            result[0] || { totalVisitors: 0, humanCount: 0, botCount: 0, blockedCount: 0 };

        const deviceStats = await db
            .collection("visitors")
            .aggregate([
                {
                    $lookup: {
                        from: "shortlinks",
                        localField: "shortlinkId",
                        foreignField: "_id",
                        as: "shortlink",
                    },
                },
                { $unwind: "$shortlink" },
                { $match: { "shortlink.owner": username } },
                {
                    $group: {
                        _id: "$device",
                        count: { $sum: 1 },
                    },
                },
                { $sort: { count: -1 } },
            ])
            .toArray();

        const devices = deviceStats.map((d) => ({
            device: d._id || "Unknown",
            count: d.count,
        }));

        const perLinkStats = await db
            .collection("visitors")
            .aggregate([
                {
                    $lookup: {
                        from: "shortlinks",
                        localField: "shortlinkId",
                        foreignField: "_id",
                        as: "shortlink",
                    },
                },
                { $unwind: "$shortlink" },
                { $match: { "shortlink.owner": username } },
                {
                    $group: {
                        _id: "$shortlink.shortlinkKey",
                        total: { $sum: 1 },
                        humans: {
                            $sum: {
                                $cond: [{ $eq: ["$isBot", false] }, 1, 0],
                            },
                        },
                        bots: {
                            $sum: {
                                $cond: [{ $eq: ["$isBot", true] }, 1, 0],
                            },
                        },
                        blocked: {
                            $sum: {
                                $cond: [{ $eq: ["$isBlocked", true] }, 1, 0],
                            },
                        },
                    },
                },
                { $sort: { total: -1 } },
            ])
            .toArray();

        const chartStats = await db
            .collection("visitors")
            .aggregate([
                {
                    $lookup: {
                        from: "shortlinks",
                        localField: "shortlinkId",
                        foreignField: "_id",
                        as: "shortlink",
                    },
                },
                { $unwind: "$shortlink" },
                { $match: { "shortlink.owner": username } },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$visitedAt" } },
                            device: "$device",
                        },
                        count: { $sum: 1 },
                    },
                },
                {
                    $group: {
                        _id: "$_id.date",
                        counts: {
                            $push: { device: "$_id.device", count: "$count" },
                        },
                    },
                },
                { $sort: { _id: 1 } },
            ])
            .toArray();

        const chartData = chartStats.map((day) => {
            const row = { date: day._id, desktop: 0, mobile: 0 };
            for (const c of day.counts) {
                const device = (c.device || "").toLowerCase();
                if (device === "desktop") row.desktop = c.count;
                if (device === "mobile") row.mobile = c.count;
            }
            return row;
        });

        const typeByDevice = await db
            .collection("visitors")
            .aggregate([
                {
                    $lookup: {
                        from: "shortlinks",
                        localField: "shortlinkId",
                        foreignField: "_id",
                        as: "shortlink",
                    },
                },
                { $unwind: "$shortlink" },
                { $match: { "shortlink.owner": username } },
                {
                    $group: {
                        _id: {
                            device: "$device",
                            isBlocked: { $ifNull: ["$isBlocked", false] },
                            isBot: { $ifNull: ["$isBot", false] },
                        },
                        count: { $sum: 1 },
                    },
                },
            ])
            .toArray();

        const humansByDevice = { desktop: 0, mobile: 0 };
        const botsByDevice = { desktop: 0, mobile: 0 };
        const blockedByDevice = { desktop: 0, mobile: 0 };

        for (const row of typeByDevice) {
            const device = (row._id.device || "").toLowerCase();
            if (device !== "desktop" && device !== "mobile") continue;

            if (row._id.isBot) {
                botsByDevice[device] += row.count;
            }
            if (!row._id.isBot) {
                humansByDevice[device] += row.count;
            }
            if (row._id.isBlocked) {
                blockedByDevice[device] += row.count;
            }
        }

        return NextResponse.json({
            apiKey,
            ...stats,
            devices,
            perLinkStats,
            chartData,
            humansByDevice,
            botsByDevice,
            blockedByDevice,
        });
    } catch (err) {
        console.error("Error in /api/account:", err);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
}
