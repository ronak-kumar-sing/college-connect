// app/api/messages/conversations/[id]/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import Notification from '@/models/Notification';
import { withAuth } from '@/lib/middleware/auth';

// Get messages in a conversation
export const GET = withAuth(async (request: NextRequest, { userId }) => {
  try {
    await connectDB();

    // Extract the conversation ID from the URL path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const conversationId = pathSegments[pathSegments.indexOf('conversations') + 1];

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before'); // Message ID to load messages before

    // Verify user is participant in the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found or access denied' },
        { status: 404 }
      );
    }

    const skip = (page - 1) * limit;

    // Build query
    let query: any = {
      conversation: conversationId,
      deleted: false
    };

    if (before) {
      // Load messages before a specific message (for pagination)
      const beforeMessage = await Message.findById(before);
      if (beforeMessage) {
        query.createdAt = { $lt: beforeMessage.createdAt };
      }
    }

    // Get messages
    const messages = await Message.find(query)
      .populate('sender', 'name username')
      .populate('replyTo', 'content sender messageType')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    // Get total count for pagination
    const total = await Message.countDocuments({
      conversation: conversationId,
      deleted: false
    });

    // Format messages
    const formattedMessages = messages.map((message: any) => ({
      id: message._id.toString(),
      content: message.content,
      messageType: message.messageType,
      sender: {
        id: message.sender._id.toString(),
        name: message.sender.name,
        username: message.sender.username
      },
      attachments: message.attachments || [],
      readBy: message.readBy.map((read: any) => ({
        user: read.user.toString(),
        readAt: read.readAt
      })),
      edited: message.edited,
      editedAt: message.editedAt,
      replyTo: message.replyTo ? {
        id: message.replyTo._id.toString(),
        content: message.replyTo.content,
        sender: message.replyTo.sender.toString(),
        messageType: message.replyTo.messageType
      } : null,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt
    }));

    return NextResponse.json({
      messages: formattedMessages.reverse(), // Reverse to show oldest first
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
});

// Send a message in a conversation
export const POST = withAuth(async (request: NextRequest, { userId }) => {
  try {
    await connectDB();

    // Extract the conversation ID from the URL path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const conversationId = pathSegments[pathSegments.indexOf('conversations') + 1];

    const body = await request.json();
    const { content, messageType = 'text', attachments, replyTo } = body;

    // Validate content
    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    // Verify user is participant in the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    }).populate('participants', 'name username');

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found or access denied' },
        { status: 404 }
      );
    }

    // Create message
    const message = new Message({
      conversation: conversationId,
      sender: userId,
      content: content.trim(),
      messageType,
      attachments,
      replyTo,
      readBy: [{ user: userId, readAt: new Date() }] // Mark as read by sender
    });

    await message.save();

    // Update conversation's last message
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = message.createdAt;
    await conversation.save();

    // Create notifications for other participants
    const otherParticipants = conversation.participants.filter(
      (participant: any) => participant._id.toString() !== userId
    );

    const notifications = otherParticipants.map((participant: any) => ({
      recipient: participant._id,
      sender: userId,
      type: 'message',
      title: 'New Message',
      message: `${conversation.participants.find((p: any) => p._id.toString() === userId)?.name || 'Someone'} sent you a message`,
      data: {
        conversationId: conversationId,
        messageId: message._id.toString()
      },
      actionUrl: `/messages/${conversationId}`,
      priority: 'medium'
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    // Populate sender for response
    await message.populate('sender', 'name username');
    await message.populate('replyTo', 'content sender messageType');

    return NextResponse.json({
      message: {
        id: message._id.toString(),
        content: message.content,
        messageType: message.messageType,
        sender: {
          id: message.sender._id.toString(),
          name: message.sender.name,
          username: message.sender.username
        },
        attachments: message.attachments || [],
        readBy: message.readBy.map((read: any) => ({
          user: read.user.toString(),
          readAt: read.readAt
        })),
        replyTo: message.replyTo ? {
          id: message.replyTo._id.toString(),
          content: message.replyTo.content,
          sender: message.replyTo.sender.toString(),
          messageType: message.replyTo.messageType
        } : null,
        createdAt: message.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
});
