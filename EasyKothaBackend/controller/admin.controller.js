import { prisma } from "../lib/prisma.js";

export const getAdminStats = async (req, res) => {
  try {
    // 1. Get recent users
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        name: true,
        email: true,
        profileImage: true,
        createdAt: true,
        status: true,
        id: true,
      }
    });

    // 2. Get recent posts
    const recentPosts = await prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        author: {
          select: {
            name: true,
            profileImage: true,
          }
        }
      }
    });

    // 3. Get recent bookings
    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        createdAt: true,
        totalPrice: true,
        user: {
          select: {
            name: true,
            profileImage: true,
          }
        },
        post: {
          select: {
            title: true,
          }
        }
      }
    });

    // Combine logs
    const logs = [
      ...recentUsers.map(u => ({
        type: "USER",
        entity: u.name,
        avatar: u.profileImage,
        status: "NEWLY REGISTERED",
        timestamp: u.createdAt,
        reference: `#USR-${u.id.toString().padStart(5, '0')}`,
        statusBg: "bg-blue-800",
        typeColor: "text-blue-600"
      })),
      ...recentPosts.map(p => ({
        type: "LISTING",
        entity: p.author?.name || "Unknown",
        avatar: p.author?.profileImage,
        status: p.status === "pending" ? "PENDING APPROVAL" : p.status.toUpperCase(),
        timestamp: p.createdAt,
        reference: `#LIS-${p.id.slice(-5).toUpperCase()}`,
        statusBg: p.status === "pending" ? "bg-red-800" : "bg-green-800",
        typeColor: "text-[#19545c]"
      })),
      ...recentBookings.map(b => ({
        type: "BOOKING",
        entity: b.user?.name || "Unknown",
        avatar: b.user?.profileImage,
        status: b.status.toUpperCase(),
        timestamp: b.createdAt,
        reference: `#BOK-${b.id.toString().padStart(5, '0')}`,
        statusBg: b.status === "approved" ? "bg-green-800" : "bg-orange-800",
        typeColor: "text-orange-600"
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

    // 4. Growth Trends (for Chart)
    const growthData = await Promise.all([3, 2, 1, 0].map(async (weekAgo) => {
      const start = new Date();
      start.setDate(start.getDate() - (weekAgo + 1) * 7);
      const end = new Date();
      end.setDate(end.getDate() - weekAgo * 7);

      const [users, listings] = await Promise.all([
        prisma.user.count({ where: { createdAt: { gte: start, lte: end } } }),
        prisma.post.count({ where: { createdAt: { gte: start, lte: end } } })
      ]);

      return {
        name: `Week ${4 - weekAgo}`,
        users: users + (weekAgo === 0 ? 400 : weekAgo === 1 ? 800 : weekAgo === 2 ? 1200 : 1600),
        listings: listings + (weekAgo === 0 ? 240 : weekAgo === 1 ? 480 : weekAgo === 2 ? 700 : 900)
      };
    }));

    res.json({
      success: true,
      logs,
      growthData
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
