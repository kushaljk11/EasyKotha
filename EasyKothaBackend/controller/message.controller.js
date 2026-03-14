import { prisma } from "../lib/prisma.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const myId = Number(req.user.id);

    const conversations = await prisma.message.findMany({
      where: {
        OR: [{ senderId: myId }, { receiverId: myId }],
      },
      select: {
        senderId: true,
        receiverId: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const chattedUserIds = new Set();
    for (const convo of conversations) {
      if (convo.senderId !== myId) chattedUserIds.add(convo.senderId);
      if (convo.receiverId !== myId) chattedUserIds.add(convo.receiverId);
    }

    if (chattedUserIds.size === 0) return res.status(200).json([]);

    const users = await prisma.user.findMany({
      where: { id: { in: [...chattedUserIds] } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        city: true,
        district: true,
        profileImage: true,
        createdAt: true,
      },
    });

    // Keep legacy keys for old chat UI while preserving Prisma fields.
    const normalizedUsers = users.map((user) => ({
      ...user,
      _id: user.id,
      fullName: user.name,
      profilePic: user.profileImage,
    }));

    return res.status(200).json(normalizedUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = Number(req.user.id);

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: myId, receiverId: Number(userToChatId) },
          { senderId: Number(userToChatId), receiverId: myId },
        ],
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = Number(req.user.id);

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await prisma.message.create({
      data: {
        senderId,
        receiverId: Number(receiverId),
        text,
        image: imageUrl,
      },
    });

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};